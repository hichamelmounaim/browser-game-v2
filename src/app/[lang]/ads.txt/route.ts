import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function generateStaticParams() {
  return [
    { lang: 'en' },
    { lang: 'fr' },
    { lang: 'es' }
  ];
}

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'public', 'ads.txt');
    const content = fs.readFileSync(filePath, 'utf8');
    return new NextResponse(content, {
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  } catch (error) {
    return new NextResponse('File not found', { status: 404 });
  }
}
