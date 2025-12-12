import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";

// Allowed MIME types
export const ALLOWED_AVATAR_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export const ALLOWED_DIARY_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "video/mp4",
  "video/quicktime",
] as const;

// Size limits
export const MAX_AVATAR_SIZE = 2 * 1024 * 1024; // 2MB
export const MAX_DIARY_SIZE = 10 * 1024 * 1024; // 10MB

// Upload folders
type UploadFolder = "avatars" | "diary";

interface SavedFile {
  path: string;
  size: number;
  mimeType: string;
}

/**
 * Saves an uploaded file to disk with a random filename
 * @param file - The file to save
 * @param folder - The folder to save to (avatars or diary)
 * @returns Object containing the saved file path, size, and MIME type
 */
export async function saveUploadedFile(
  file: File,
  folder: UploadFolder
): Promise<SavedFile> {
  // Generate random filename
  const fileId = randomUUID();
  const extension = path.extname(file.name) || "";
  const filename = `${fileId}${extension}`;

  // Ensure upload directory exists
  const uploadDir = path.join(process.cwd(), "uploads", folder);
  await fs.mkdir(uploadDir, { recursive: true });

  // Full file path
  const filePath = path.join(uploadDir, filename);

  // Convert file to buffer and write to disk
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  await fs.writeFile(filePath, buffer);

  // Return relative path from uploads directory
  const relativePath = path.join(folder, filename);

  return {
    path: relativePath,
    size: file.size,
    mimeType: file.type,
  };
}

// Save an arbitrary buffer to disk in a given folder with random name
export async function saveBufferToFolder(
  buffer: Buffer,
  originalName: string,
  folder: UploadFolder
): Promise<SavedFile> {
  const fileId = randomUUID();
  const extension = path.extname(originalName) || "";
  const filename = `${fileId}${extension}`;
  const uploadDir = path.join(process.cwd(), "uploads", folder);
  await fs.mkdir(uploadDir, { recursive: true });
  const filePath = path.join(uploadDir, filename);
  await fs.writeFile(filePath, buffer);
  const relativePath = path.join(folder, filename);
  return {
    path: relativePath,
    size: buffer.byteLength,
    mimeType: "application/octet-stream",
  };
}

/**
 * Deletes a file from disk
 * @param relativePath - The relative path from the uploads directory
 */
export async function deleteUploadedFile(relativePath: string): Promise<void> {
  try {
    const fullPath = path.join(process.cwd(), "uploads", relativePath);
    await fs.unlink(fullPath);
  } catch (error) {
    // Log error but don't throw - file might already be deleted
    console.error("Error deleting file:", error);
  }
}

/**
 * Reads a file from disk
 * @param relativePath - The relative path from the uploads directory
 * @returns Buffer containing the file data
 */
export async function readUploadedFile(relativePath: string): Promise<Buffer> {
  const fullPath = path.join(process.cwd(), "uploads", relativePath);
  return await fs.readFile(fullPath);
}

/**
 * Validates file type
 * @param mimeType - The MIME type to validate
 * @param allowedTypes - Array of allowed MIME types
 * @returns true if valid, false otherwise
 */
export function isValidFileType(
  mimeType: string,
  allowedTypes: readonly string[]
): boolean {
  return allowedTypes.includes(mimeType);
}

/**
 * Validates file size
 * @param size - The file size in bytes
 * @param maxSize - Maximum allowed size in bytes
 * @returns true if valid, false otherwise
 */
export function isValidFileSize(size: number, maxSize: number): boolean {
  return size > 0 && size <= maxSize;
}
