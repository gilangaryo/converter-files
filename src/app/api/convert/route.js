import { NextRequest, NextResponse } from 'next/server';
import convert from 'heic-convert';
import sharp from 'sharp';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const format = formData.get('format') || 'jpeg';
    const quality = parseInt(formData.get('quality')) || 90;

    if (!file || !format) {
      return NextResponse.json({ error: 'File and format are required' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const inputBuffer = Buffer.from(bytes);
    const ext = file.name.split('.').pop().toLowerCase();

    let outputBuffer;

    if (ext === 'heic' || ext === 'heif') {
      try {
        const jpegBuffer = await convert({
          buffer: inputBuffer,
          format: 'JPEG',
          quality: 1
        });

        outputBuffer = await sharp(jpegBuffer)[
          format === 'jpg' ? 'jpeg' : format
        ]({ quality }).toBuffer();
      } catch (err) {
        console.error('HEIC decode error:', err);
        return NextResponse.json({ error: 'Failed to decode HEIC/HEIF' }, { status: 500 });
      }
    } else {
      try {
        outputBuffer = await sharp(inputBuffer)[
          format === 'jpg' ? 'jpeg' : format
        ]({ quality }).toBuffer();
      } catch (err) {
        console.error('Other format conversion error:', err);
        return NextResponse.json({ error: 'Failed to convert image' }, { status: 500 });
      }
    }

    const filename = `converted.${format}`;
    const contentType = `image/${format === 'jpg' ? 'jpeg' : format}`;

    return new NextResponse(outputBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });

  } catch (err) {
    console.error('API error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}