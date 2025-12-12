import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  saveUploadedFile,
  deleteUploadedFile,
  ALLOWED_AVATAR_TYPES,
  MAX_AVATAR_SIZE,
  isValidFileType,
  isValidFileSize,
} from "@/lib/uploads";

export async function POST(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    if (!isValidFileType(file.type, ALLOWED_AVATAR_TYPES)) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPEG, PNG, and WebP images are allowed" },
        { status: 400 }
      );
    }

    // Validate file size
    if (!isValidFileSize(file.size, MAX_AVATAR_SIZE)) {
      return NextResponse.json(
        { error: "File size must be less than 2MB" },
        { status: 400 }
      );
    }

    // Check if user already has an avatar
    const existingAvatar = await prisma.avatarFile.findUnique({
      where: { userId: user.id },
    });

    // If exists, delete the old file from disk
    if (existingAvatar) {
      await deleteUploadedFile(existingAvatar.path);
    }

    // Save new file
    const savedFile = await saveUploadedFile(file, "avatars");

    // Upsert avatar file record
    const avatarFile = await prisma.avatarFile.upsert({
      where: { userId: user.id },
      update: {
        path: savedFile.path,
        mimeType: savedFile.mimeType,
        size: savedFile.size,
      },
      create: {
        userId: user.id,
        path: savedFile.path,
        mimeType: savedFile.mimeType,
        size: savedFile.size,
      },
    });

    return NextResponse.json({
      id: avatarFile.id,
      message: "Avatar uploaded successfully",
    });
  } catch (error) {
    console.error("Avatar upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload avatar" },
      { status: 500 }
    );
  }
}
