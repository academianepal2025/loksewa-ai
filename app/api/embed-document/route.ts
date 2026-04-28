import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateEmbedding } from '@/lib/ai';

// Simple text chunker: 400 words max, 50 word overlap
function createChunks(text: string, maxWords = 400, overlap = 50) {
  const words = text.trim().split(/\s+/);
  const chunks: string[] = [];
  
  if (words.length === 0 || text === '') return chunks;

  let i = 0;
  while (i < words.length) {
    const chunkWords = words.slice(i, i + maxWords);
    chunks.push(chunkWords.join(' '));
    i += maxWords - overlap;
  }
  
  return chunks;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { documentId, userId, examId, parsedText, docType } = body;

    // 1. Validation
    if (!documentId || !userId || !examId || !parsedText) {
      return NextResponse.json({ success: false, message: 'Missing required parameters or empty parsedText' }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not defined in environment variables');
    }

    const supabase = await createClient();

    // 3. Split text into chunks
    const chunks = createChunks(parsedText, 400, 50);
    if (chunks.length === 0) {
      return NextResponse.json({ success: true, chunks_created: 0, message: 'No viable text to chunk' });
    }

    // 4. Group into batches for bulk insertion
    const BATCH_SIZE = 5;
    const allInsertedChunks = [];
    let globalChunkIndex = 0;

    for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
      const batch = chunks.slice(i, i + BATCH_SIZE);
      
      const batchPromises = batch.map(async (chunkText, batchIdx) => {
        const currentIndex = globalChunkIndex + batchIdx;
        
        // 5a. Call Gemini embedding API via centralized utility
        const embedding = await generateEmbedding(chunkText);
        
        // Return formatted object for the DB
        return {
          document_id: documentId,
          exam_id: examId,
          chunk_text: chunkText,
          chunk_index: currentIndex,
          doc_type: docType,
          embedding: embedding
        };
      });

      // Wait for all embeddings in this batch to finish
      const resolvedBatch = await Promise.all(batchPromises);
      
      // 5b. Insert batch into Supabase document_chunks table
      const { error: insertError } = await supabase
        .from('document_chunks')
        .insert(resolvedBatch);

      if (insertError) {
        console.error(`Error inserting chunk batch ${i} to ${i + BATCH_SIZE}:`, insertError);
      } else {
        allInsertedChunks.push(...resolvedBatch);
      }

      globalChunkIndex += batch.length;
    }

    console.log(`Successfully embedded ${allInsertedChunks.length} chunks for document: ${documentId}`);

    return NextResponse.json({ 
      success: true, 
      chunks_created: allInsertedChunks.length 
    });

  } catch (error: any) {
    console.error('Embed Document Route Error:', error);
    const status = error.status || 500;
    return NextResponse.json({ success: false, message: error.message }, { status });
  }
}
