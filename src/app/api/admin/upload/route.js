import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { verifyToken } from '@/lib/auth';

export async function POST(request) {
  try {
    // Verify admin authorization
    const token = request.headers.get('authorization')?.split(' ')[1];
    const decoded = await verifyToken(token);
    
    if (!token || decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('image');

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create unique filename
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    const filename = `person-${uniqueSuffix}${getExtension(file.name)}`;

    // Save to public/uploads/people directory
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'people');
    const filepath = join(uploadDir, filename);
    
    await writeFile(filepath, buffer);

    return NextResponse.json({ 
      imageUrl: `/uploads/people/${filename}`
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}

function getExtension(filename) {
  const ext = filename.split('.').pop();
  return ext ? `.${ext}` : '';
} 