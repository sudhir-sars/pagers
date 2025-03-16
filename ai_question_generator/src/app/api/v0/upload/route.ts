import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';

export async function POST(request: NextRequest) {
  const data = await request.formData();
  const file = data.get('file') as File;

  if (!file) {
    return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
  }

  if (file.type !== 'text/markdown') {
    return NextResponse.json({ error: 'Only .md files are supported' }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const fileId = Date.now().toString();
  const path = join(process.cwd(), 'public/uploads', `${fileId}.md`);
  await writeFile(path, buffer);

  return NextResponse.json({ fileId });
}