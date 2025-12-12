import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  saveUploadedFile,
  ALLOWED_DIARY_TYPES,
  MAX_DIARY_SIZE,
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
    const diaryEntryId = formData.get("diaryEntryId") as string;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!diaryEntryId) {
      return NextResponse.json(
        { error: "Diary entry ID is required" },
        { status: 400 }
      );
    }

    // Verify diary entry exists and belongs to user
    const diaryEntry = await prisma.diaryEntry.findFirst({
      where: {
        id: diaryEntryId,
        userId: user.id,
      },
    });

    if (!diaryEntry) {
      return NextResponse.json(
        { error: "Diary entry not found or access denied" },
        { status: 404 }
      );
    }

    // Validate file type
    if (!isValidFileType(file.type, ALLOWED_DIARY_TYPES)) {
      return NextResponse.json(
        {
          error:
            "Invalid file type. Only JPEG, PNG, WebP images and MP4, QuickTime videos are allowed",
        },
        { status: 400 }
      );
    }

    // Validate file size
    if (!isValidFileSize(file.size, MAX_DIARY_SIZE)) {
      return NextResponse.json(
        { error: "File size must be less than 10MB" },
        { status: 400 }
      );
    }

    // Save file
    const savedFile = await saveUploadedFile(file, "diary");

    // Create diary attachment record
    const attachment = await prisma.diaryAttachment.create({
      data: {
        userId: user.id,
        diaryEntryId,
        path: savedFile.path,
        mimeType: savedFile.mimeType,
        size: savedFile.size,
      },
    });

    return NextResponse.json({
      id: attachment.id,
      mimeType: attachment.mimeType,
      size: attachment.size,
      createdAt: attachment.createdAt,
    });
  } catch (error) {
    console.error("Diary attachment upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload attachment" },
      { status: 500 }
    );
  }
}
