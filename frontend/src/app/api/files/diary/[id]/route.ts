import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { readUploadedFile } from "@/lib/uploads";
import { binaryResponse } from "@/lib/http/binaryResponse";
import { requireDbUser } from "@/lib/auth/requireUser";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireDbUser();

    const { id } = await params;

    // Find diary attachment
    const attachment = await prisma.diaryAttachment.findUnique({
      where: { id },
      include: {
        diaryEntry: true,
      },
    });

    if (!attachment) {
      return NextResponse.json(
        { error: "Attachment not found" },
        { status: 404 }
      );
    }

    // Check ownership - user can only access their own attachments
    if (attachment.userId !== user.id || attachment.diaryEntry.userId !== user.id) {
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      );
    }

    // Read file from disk
    const fileBuffer = await readUploadedFile(attachment.path);

    // Determine if video or image for Content-Disposition
    const isVideo = attachment.mimeType.startsWith("video/");
    const disposition = isVideo ? "inline" : "inline";

    const filename = `attachment${getExtensionFromMimeType(attachment.mimeType)}`;
    const res = binaryResponse(fileBuffer, attachment.mimeType, filename);
    res.headers.set("Cache-Control", "private, max-age=3600");
    return res;
  } catch (error) {
    console.error("Diary attachment serving error:", error);
    return NextResponse.json(
      { error: "Failed to serve attachment" },
      { status: 500 }
    );
  }
}

function getExtensionFromMimeType(mimeType: string): string {
  const extensions: { [key: string]: string } = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "video/mp4": ".mp4",
    "video/quicktime": ".mov",
  };
  return extensions[mimeType] || "";
}
