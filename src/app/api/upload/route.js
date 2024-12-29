import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const type = formData.get('type'); // 'thumbnail' or 'video'

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = file.name.replace(/\.[^/.]+$/, '') + '-' + uniqueSuffix + path.extname(file.name);
    
    // Define upload directory based on type
    const uploadDir = type === 'thumbnail' ? 'public/thumbnails' : 'public/videos';
    const filePath = path.join(process.cwd(), uploadDir, filename);

    // Save the file
    await writeFile(filePath, buffer);
    
    // Return the public URL
    const publicPath = `/${type === 'thumbnail' ? 'thumbnails' : 'videos'}/${filename}`;
    
    return NextResponse.json({ url: publicPath });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
} 