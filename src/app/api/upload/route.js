import { handleUpload } from '@vercel/blob/client';
import { NextResponse } from 'next/server';

const PASSWORD = process.env.UPLOAD_PASSWORD || 'sanfrancisco2026';

export async function POST(request) {
  // Check if BLOB token is configured
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { error: 'Falta configurar BLOB_READ_WRITE_TOKEN en Vercel. Andá a Storage → Blob → Connect to Project.' },
      { status: 500 }
    );
  }

  const body = await request.json();

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        const payload = JSON.parse(clientPayload || '{}');

        if (!payload.password || payload.password !== PASSWORD) {
          throw new Error('Contraseña incorrecta');
        }

        return {
          allowedContentTypes: [
            'image/jpeg',
            'image/png',
            'image/webp',
            'image/heic',
            'image/heif',
          ],
          maximumSizeInBytes: 25 * 1024 * 1024,
        };
      },
      onUploadCompleted: async ({ blob }) => {
        // No-op: just log
        console.log('Upload completed:', blob.url);
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    console.error('Upload API error:', error);
    return NextResponse.json(
      { error: error.message || 'Error desconocido al subir la foto' },
      { status: 400 }
    );
  }
}
