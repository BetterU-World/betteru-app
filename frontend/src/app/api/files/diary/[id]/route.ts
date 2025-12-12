import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { readUploadedFile } from "@/lib/uploads";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { id } = params;

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

    // Return file with appropriate headers
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": attachment.mimeType,
        "Content-Length": attachment.size.toString(),
        "Content-Disposition": `${disposition}; filename="attachment${getExtensionFromMimeType(attachment.mimeType)}"`,
        "Cache-Control": "private, max-age=3600",
      },
    });
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
