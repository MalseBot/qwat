import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const fileName = formData.get('fileName') as string;
    
    if (!file || !fileName) {
      return NextResponse.json(
        { error: 'File or fileName is missing' },
        { status: 400 }
      );
    }

    // Create a safe file name
    const safeFileName = `${fileName.replace(/[^a-zA-Z0-9_]/g, '_')}.jpg`;
    
    // Create directory if it doesn't exist
    const uploadDir = join(process.cwd(), 'public', 'recruits');
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }
    
    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Write file to disk
    const filePath = join(uploadDir, safeFileName);
    await writeFile(filePath, buffer);
    
    // Return the relative path to be stored in the database
    const imagePath = `/recruits/${safeFileName}`;
    
    return NextResponse.json({ 
      success: true, 
      imagePath 
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}