import { NextRequest } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

const UPLOAD_DIR = path.resolve(
  process.cwd(),
  "public/uploads/medical-documents"
);
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
];

export interface UploadedFile {
  filename: string;
  path: string;
  size: number;
  mimeType: string;
}

export async function ensureUploadDir(): Promise<void> {
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
}

export async function uploadFile(
  file: File,
  fileType: string
): Promise<UploadedFile> {
  if (!file) {
    throw new Error('No file provided');
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error(
      `File type not allowed. Allowed types: ${ALLOWED_TYPES.join(', ')}`
    );
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`);
  }

  await ensureUploadDir();

  // Generate unique filename
  const timestamp = Date.now();
  const random = crypto.randomBytes(8).toString('hex');
  const extension = file.name.split('.').pop() || 'bin';
  const filename = `${fileType}-${timestamp}-${random}.${extension}`;
  const filePath = path.join(UPLOAD_DIR, filename);

  // Convert File to Buffer and write
  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(filePath, buffer);

  return {
    filename,
    path: `/uploads/medical-documents/${filename}`,
    size: file.size,
    mimeType: file.type,
  };
}

export async function deleteFile(filename: string): Promise<void> {
  try {
    const filePath = path.join(UPLOAD_DIR, filename);
    // Prevent directory traversal attacks
    if (!filePath.startsWith(UPLOAD_DIR)) {
      throw new Error('Invalid file path');
    }
    await fs.unlink(filePath);
  } catch (error) {
    console.error('[v0] Error deleting file:', error);
  }
}

export function extractFilenameFromPath(filePath: string): string {
  return path.basename(filePath);
}
