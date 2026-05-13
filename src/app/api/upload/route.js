import { handleUpload } from '@vercel/blob/client';
import { NextResponse } from 'next/server';

const PASSWORD = process.env.UPLOAD_PASSWORD || 'sanfrancisco2026';

export async function POST(request) {
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
          maximumSizeInBytes: 25 * 1024 * 1024, // 25MB — fotos de celu tranqui
        };
      },
      onUploadCompleted: async ({ blob }) => {
        console.log('Upload completed:', blob.url);
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
