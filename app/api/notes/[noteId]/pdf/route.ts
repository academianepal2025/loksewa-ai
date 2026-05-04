import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import html_to_pdf from 'html-pdf-node';
import { marked } from 'marked';

export async function GET(request: Request, { params }: { params: Promise<{ noteId: string }> }) {
  const supabase = await createClient();

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const resolvedParams = await params;
    const { noteId } = resolvedParams;

    const { data: note, error } = await supabase
      .from('study_notes')
      .select('topic, notes_content, user_id')
      .eq('id', noteId)
      .single();

    if (error || !note || note.user_id !== user.id || !note.notes_content) {
      return new NextResponse('Note not found', { status: 404 });
    }

    const markdown = note.notes_content.full_markdown;
    // @ts-ignore
    const htmlContent = marked.parse(markdown);

    const htmlTemplate = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 40px;
          }
          h1, h2, h3, h4, h5 {
            color: #111;
            margin-top: 1.5em;
            margin-bottom: 0.5em;
            font-weight: 600;
          }
          h2 {
            border-bottom: 2px solid #ea580c; /* LoksewaAI Orange */
            padding-bottom: 8px;
            margin-top: 2em;
          }
          h3 {
            color: #ea580c;
          }
          p { margin-bottom: 1em; }
          ul, ol { margin-bottom: 1em; padding-left: 2em; }
          li { margin-bottom: 0.5em; }
          strong { color: #000; font-weight: bold; }
          hr {
            border: 0;
            border-top: 1px solid #ddd;
            margin: 2em 0;
          }
          .header {
            text-align: center;
            margin-bottom: 40px;
            padding-bottom: 20px;
            border-bottom: 1px solid #eee;
          }
          .header-title {
            font-size: 24px;
            font-weight: bold;
            color: #ea580c;
            margin-bottom: 5px;
          }
          .header-subtitle {
            font-size: 14px;
            color: #666;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          .footer {
            margin-top: 50px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            text-align: center;
            font-size: 12px;
            color: #999;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="header-title">LoksewaAI Study Notes</div>
          <div class="header-subtitle">${note.topic}</div>
        </div>
        
        <div class="content">
          ${htmlContent}
        </div>

        <div class="footer">
          Generated automatically by LoksewaAI • Study Smart, Achieve More
        </div>
      </body>
      </html>
    `;

    const options = { format: 'A4', margin: { top: '20px', bottom: '20px', left: '20px', right: '20px' } };
    const file = { content: htmlTemplate };

    const pdfBuffer = await html_to_pdf.generatePdf(file, options) as any;

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="LoksewaAI_Notes_${note.topic.replace(/\\s+/g, '_')}.pdf"`,
      },
    });

  } catch (error: any) {
    console.error('PDF Generation Error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
