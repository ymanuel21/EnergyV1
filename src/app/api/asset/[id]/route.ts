import { NextResponse } from 'next/server';
import { getPrisma } from '@/lib/db';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const prisma = await getPrisma();

    const asset = await prisma.asset.findUnique({ where: { id } });

    if (!asset) {
      return new NextResponse('Not found', { status: 404 });
    }

    // Parse the data URL: "data:image/webp;base64,ABC123..."
    const match = asset.data.match(/^data:([^;]+);base64,(.+)$/);
    if (!match) {
      return new NextResponse('Invalid data', { status: 500 });
    }

    const mimeType = match[1];
    const base64 = match[2];
    const buffer = Buffer.from(base64, 'base64');

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': mimeType,
        'Content-Length': String(buffer.length),
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error: any) {
    console.error('Asset serve failed:', error.message);
    return new NextResponse('Error', { status: 500 });
  }
}
