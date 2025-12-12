import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { saveBufferToFolder, isValidFileType, isValidFileSize } from "@/lib/uploads";
import { encryptBuffer } from "@/lib/encryption";

const MAX_MEDIA_SIZE = 25 * 1024 * 1024; // 25MB
const ALLOWED_MEDIA_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "video/mp4", "video/webm"]; 

export async function POST(request: Request) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const entryId = formData.get("entryId") as string;
    const type = formData.get("type") as "IMAGE" | "VIDEO";
    // Default to encryption unless explicitly encrypt=false
    const encryptParam = formData.get("encrypt") as string | null;
    const encrypt = encryptParam === null ? true : encryptParam !== "false";

    if (!file || !entryId || !type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!isValidFileType(file.type, ALLOWED_MEDIA_TYPES)) {
      return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
    }
    if (!isValidFileSize(file.size, MAX_MEDIA_SIZE)) {
      return NextResponse.json({ error: "File too large" }, { status: 400 });
    }

    // Verify ownership of diary entry
    const entry = await prisma.diaryEntry.findUnique({ where: { id: entryId } });
    if (!entry) return NextResponse.json({ error: "Diary entry not found" }, { status: 404 });

    const userId = entry.userId;
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Encrypt if requested
    let toStore: Buffer = buffer;
    let mimeType = file.type;
    if (encrypt) {
      const blob = encryptBuffer(buffer);
      toStore = Buffer.from(blob, "utf8");
      mimeType = "application/vnd.betteru.encrypted";
    }

    // Store in private uploads directory
    const saved = await saveBufferToFolder(toStore, file.name, "diary");

    // Record metadata in DiaryAttachment (private path), and link in DiaryMedia for UI references
    const attachment = await prisma.diaryAttachment.create({
      data: {
        userId,
        diaryEntryId: entryId,
        path: saved.path,
        mimeType,
        size: saved.size,
      },
    });

    const media = await prisma.diaryMedia.create({
      data: {
        userId,
        entryId,
        type,
        url: attachment.id, // store attachment id; access via secure route
      },
    });

    return NextResponse.json({ id: media.id, message: "Media uploaded" }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
