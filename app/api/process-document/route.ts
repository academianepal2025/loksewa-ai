import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateText } from '@/lib/ai';

import pdfParse from 'pdf-parse';

export async function POST(request: Request) {
  const supabase = await createClient();
  let latestDocumentId = '';

  try {
    const body = await request.json();
    const { documentId, language } = body;
    
    if (!documentId) {
      return NextResponse.json({ success: false, message: 'Missing documentId' }, { status: 400 });
    }
    
    latestDocumentId = documentId;

    // 1. Fetch document record
    const { data: document, error: fetchError } = await supabase
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .single();

    if (fetchError || !document) {
      return NextResponse.json({ success: false, message: 'Document not found' }, { status: 404 });
    }

    // 2. Update processing_status to 'processing'
    await supabase
      .from('documents')
      .update({ processing_status: 'processing' })
      .eq('id', documentId);

    // 3. Download file from Supabase storage using the file_url
    const { data: fileBlob, error: downloadError } = await supabase.storage
      .from('user-documents')
      .download(document.file_url);

    if (downloadError || !fileBlob) {
      throw new Error(`Failed to download file from storage: ${downloadError?.message}`);
    }

    const arrayBuffer = await fileBlob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Data = buffer.toString('base64');

    // 4. Validate magic bytes (Content-based verification)
    const magicBytes = buffer.subarray(0, 8);
    const isPDF = magicBytes[0] === 0x25 && magicBytes[1] === 0x50 && magicBytes[2] === 0x44 && magicBytes[3] === 0x46;
    const isJPEG = magicBytes[0] === 0xFF && magicBytes[1] === 0xD8;
    const isPNG = magicBytes[0] === 0x89 && magicBytes[1] === 0x50 && magicBytes[2] === 0x4E && magicBytes[3] === 0x47;

    if (!isPDF && !isJPEG && !isPNG) {
      await supabase.from('documents').update({ processing_status: 'failed' }).eq('id', documentId);
      return NextResponse.json({ success: false, message: 'Invalid file format. Only PDF, JPG, and PNG files are accepted.' }, { status: 400 });
    }

    // Determine MIME type based on actual magic bytes, not just filename extension
    let mimeType = isPDF ? 'application/pdf' : isJPEG ? 'image/jpeg' : 'image/png';
    let isImage = !isPDF;
    const fileName = document.file_name.toLowerCase();

    let extractedText = '';

    // Attempt Native PDF Parsing FIRST (Lightning Fast)
    if (!isImage) {
      try {
        console.log('[DEBUG] Attempting native PDF extraction for:', fileName);
        const parseWithTimeout = Promise.race([
          pdfParse(buffer),
          new Promise<any>((_, reject) =>
            setTimeout(() => reject(new Error('PDF parse timeout')), 15000)
          )
        ]);
        const data = await parseWithTimeout;
        extractedText = data.text || '';
      } catch (err) {
        console.warn('[DEBUG] Native PDF parsing failed or timed out. Falling back to Gemini API.');
      }
    }

    // Fallback to Gemini if:
    // 1. It's an image
    // 2. Native parsing returned < 100 chars (likely a scanned PDF)
    // 3. Native parsing returned text but ZERO Devanagari characters (likely garbled legacy fonts like Preeti)
    const hasDevanagari = /[\u0900-\u097F]/.test(extractedText);
    const isGarbled = extractedText.length > 50 && !hasDevanagari;

    if (isImage || extractedText.trim().length < 100 || isGarbled) {
      console.log(`[DEBUG] Extraction fallback triggered. isImage: ${isImage}, length: ${extractedText.length}, isGarbled: ${isGarbled}`);
      console.log(`[DEBUG] Buffer size: ${buffer.length} bytes`);

      const systemPrompt = `You are a high-accuracy document OCR engine. 
Extract EVERY WORD of text from this document exactly as it appears.
Rules:
- Preserve the original language (Nepali/Devanagari and English).
- Do not translate or summarize.
- Output the text exactly as it is written.
- If you see Nepali text, output it in proper Unicode Devanagari.
- If the document is partially empty, extract what you can find.`;

      const contents = [
        {
          role: 'user',
          parts: [
            { text: "Please transcribe all the text from this document. If it is in Nepali, use Devanagari script." },
            {
              inlineData: {
                data: base64Data,
                mimeType: mimeType,
              },
            },
          ],
        },
      ];

      try {
        console.log('[DEBUG] Sending to gemini-2.5-flash-lite for visual extraction...');
        // We use gemini-2.5-flash-lite as it is highly cost-effective and falls back to standard flash if needed
        const aiResponse = await generateText(systemPrompt, contents, 'gemini-2.5-flash-lite', { userId: document.user_id, feature: 'document_processing' });
        console.log(`[DEBUG] Gemini response length: ${aiResponse?.length || 0}`);
        
        if (aiResponse && aiResponse.trim().length > 10) {
          extractedText = aiResponse;
        } else {
           console.warn('[DEBUG] Gemini returned an empty or extremely short response.');
        }
      } catch (geminiError: any) {
        console.error("Gemini Extraction Error:", geminiError);
        // Fallback to whatever pdf-parse found if Gemini fails
        if (extractedText.trim().length === 0) throw geminiError;
      }
    }

    // 7. Clean extracted text: remove excessive whitespace, normalize line breaks
    let cleanedText = extractedText
      .replace(/[\t ]+/g, ' ') 
      .replace(/\r\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    console.log(`[DEBUG] Final cleaned text length: ${cleanedText.length}`);
    if (cleanedText.length > 0) {
      console.log(`[DEBUG] Sample text: ${cleanedText.substring(0, 50)}...`);
    }

    if (!cleanedText || cleanedText.length < 5) {
      const dbgInfo = `Extracted length: ${extractedText.length}, Buffer size: ${buffer.length}`;
      throw new Error(`No readable text could be extracted. ${dbgInfo}. The document might be an encrypted PDF, a low-quality scan, or completely blank.`);
    }

    // 8. Update documents table: set parsed_text = cleaned text, processing_status = 'ready'
    const { error: updateError } = await supabase
      .from('documents')
      .update({ 
        parsed_text: cleanedText,
        processing_status: 'ready' 
      })
      .eq('id', documentId);

    if (updateError) {
      throw new Error(`Failed to save parsed text: ${updateError.message}`);
    }

    // 9. Call POST /api/embed-document (Trigger and continue)
    const embedUrl = new URL('/api/embed-document', request.url);
    fetch(embedUrl.toString(), {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Cookie': request.headers.get('cookie') || '' 
      },
      body: JSON.stringify({ 
        documentId, 
        userId: document.user_id, 
        examId: document.exam_id,
        parsedText: cleanedText,
        docType: document.doc_type
      }),
    }).catch((err) => console.error('Failed to trigger background embedding API:', err));

    // 10. If this is a syllabus, automatically trigger syllabus analysis
    if (document.doc_type === 'syllabus') {
      const analyzeUrl = new URL('/api/analyze-syllabus', request.url);
      fetch(analyzeUrl.toString(), {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Cookie': request.headers.get('cookie') || '' 
        },
        body: JSON.stringify({ 
          examId: document.exam_id, 
          userId: document.user_id, 
          language: language || 'en' 
        }),
      }).catch((err) => console.error('Failed to trigger background syllabus analysis:', err));
    }

    return NextResponse.json({ success: true, message: 'Document processed successfully' });
    
  } catch (error: any) {
    console.error('Process Document Route Error:', error);
    
    // 10. On any error: set processing_status = 'failed', log error message
    if (latestDocumentId) {
      await supabase
        .from('documents')
        .update({ processing_status: 'failed' })
        .eq('id', latestDocumentId);
    }

    const status = error.status || 500;
    return NextResponse.json({ success: false, message: error.message }, { status });
  }
}
