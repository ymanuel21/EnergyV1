import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Read file as base64
    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString('base64');
    const mimeType = file.type || 'image/png';
    const dataUrl = `data:${mimeType};base64,${base64}`;

    // Store in database
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const adapter = new PrismaPg(pool);
    const prisma = new PrismaClient({ adapter });

    const asset = await prisma.asset.create({
      data: {
        data: dataUrl,
        mimeType,
        size: file.size,
      },
    });

    await prisma.$disconnect();

    // Return permanent URL
    const url = `/api/asset/${asset.id}`;
    return NextResponse.json({ url, id: asset.id });
  } catch (error: any) {
    console.error('Upload failed:', error.message);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
