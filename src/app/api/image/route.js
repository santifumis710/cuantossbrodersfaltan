import { get } from '@vercel/blob';
import { NextResponse } from 'next/server';

// Proxy route to serve private blob images
// Private blobs can't be accessed directly by the browser
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');

    if (!url) {
      return new NextResponse('Falta el parámetro url', { status: 400 });
    }

    // Fetch the blob from private store
    const blobResponse = await fetch(url, {
      headers: {
        Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}`,
      },
    });

    if (!blobResponse.ok) {
      return new NextResponse('No se pudo obtener la imagen', { status: 404 });
    }

    const contentType = blobResponse.headers.get('content-type') || 'image/jpeg';
    const body = blobResponse.body;

    return new NextResponse(body, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Image proxy error:', error);
    return new NextResponse('Error al cargar la imagen', { status: 500 });
  }
}
