import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import { join } from "path";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the user from database
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const formData = await request.formData();
    const entryId = formData.get("entryId") as string;
    const files = formData.getAll("files") as File[];

    if (!entryId) {
      return NextResponse.json({ error: "Entry ID is required" }, { status: 400 });
    }

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    // Verify the diary entry exists and belongs to the user
    const entry = await prisma.diaryEntry.findFirst({
      where: {
        id: entryId,
        userId: user.id,
      },
    });

    if (!entry) {
      return NextResponse.json({ error: "Diary entry not found" }, { status: 404 });
    }

    const uploadedMedia = [];

    for (const file of files) {
      // Validate file type (image or video)
      const isImage = file.type.startsWith("image/");
      const isVideo = file.type.startsWith("video/");

      if (!isImage && !isVideo) {
        continue; // Skip invalid files
      }

      // Validate file size (max 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        continue; // Skip files that are too large
      }

      // Determine media type
      const mediaType = isImage ? "IMAGE" : "VIDEO";

      // Generate unique filename
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(7);
      const fileExtension = file.name.split(".").pop();
      const filename = `diary-${user.id}-${timestamp}-${random}.${fileExtension}`;

      // Convert file to buffer
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Write file to public/uploads
      const uploadPath = join(process.cwd(), "public", "uploads", filename);
      await writeFile(uploadPath, buffer);

      // Create DiaryMedia record
      const url = `/uploads/${filename}`;
      const media = await prisma.diaryMedia.create({
        data: {
          entryId,
          userId: user.id,
          type: mediaType,
          url,
        },
      });

      uploadedMedia.push(media);
    }

    return NextResponse.json({ media: uploadedMedia });
  } catch (error) {
    console.error("Diary media upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload diary media" },
      { status: 500 }
    );
  }
}
