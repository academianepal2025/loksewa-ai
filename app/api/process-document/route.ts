import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateText } from '@/lib/ai';

export async function POST(request: Request) {
  const supabase = await createClient();
  let latestDocumentId = '';

  try {
    const body = await request.json();
    const { documentId } = body;
    
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

    const fileName = document.file_name.toLowerCase();

    // Determine MIME type
    let mimeType = 'application/pdf';
    if (fileName.endsWith('.jpg') || fileName.endsWith('.jpeg')) {
      mimeType = 'image/jpeg';
    } else if (fileName.endsWith('.png')) {
      mimeType = 'image/png';
    } else if (!fileName.endsWith('.pdf')) {
      throw new Error('Unsupported file format. Please upload PDF, JPG, JPEG, or PNG.');
    }

    const systemPrompt = `Extract ALL the text content from this document. 
Rules:
- Output ONLY the extracted text, nothing else.
- Preserve the original language (Nepali, English, or mixed).
- Preserve paragraph structure and line breaks.
- If the document uses Devanagari/Nepali script, output proper Unicode Devanagari text.
- Do not add any commentary, headers, or formatting markers.
- Do not translate anything. Extract as-is.`;

    const contents = [
      {
        role: 'user',
        parts: [
          { text: "Please extract text from this document." },
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType,
            },
          },
        ],
      },
    ];

    const extractedText = await generateText(systemPrompt, contents);

    // 7. Clean extracted text: remove excessive whitespace, normalize line breaks
    let cleanedText = extractedText
      .replace(/[^\S\r\n]+/g, ' ') // Replace multiple spaces/tabs with a single space
      .replace(/\n{3,}/g, '\n\n')  // Replace 3+ consecutive newlines with exactly 2 newlines
      .trim();

    if (!cleanedText) {
      throw new Error('No text could be extracted from the document.');
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
