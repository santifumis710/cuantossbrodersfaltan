import { list } from '@vercel/blob';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { blobs } = await list({ prefix: 'broders/' });

    const photos = blobs.map(blob => {
      // Extract tuesday number from path: broders/martes-{N}/{timestamp}.jpg
      const match = blob.pathname.match(/martes-(\d+)/);
      const tuesdayNumber = match ? parseInt(match[1]) : 0;

      // For private stores, we proxy the image through our API
      // The browser can't access private blob URLs directly
      const proxyUrl = `/api/image?url=${encodeURIComponent(blob.url)}`;

      return {
        url: proxyUrl,
        blobUrl: blob.url, // Keep original for delete operations
        tuesdayNumber,
        uploadedAt: blob.uploadedAt,
        pathname: blob.pathname,
      };
    });

    // Sort by tuesday number desc, then by upload date desc
    photos.sort((a, b) => {
      if (b.tuesdayNumber !== a.tuesdayNumber) {
        return b.tuesdayNumber - a.tuesdayNumber;
      }
      return new Date(b.uploadedAt) - new Date(a.uploadedAt);
    });

    return NextResponse.json({ photos });
  } catch (error) {
    console.error('List error:', error);
    return NextResponse.json({ photos: [] });
  }
}
