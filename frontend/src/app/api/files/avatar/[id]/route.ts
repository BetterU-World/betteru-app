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

    // Find avatar file
    const avatarFile = await prisma.avatarFile.findUnique({
      where: { id },
    });

    if (!avatarFile) {
      return NextResponse.json(
        { error: "Avatar not found" },
        { status: 404 }
      );
    }

    // Check ownership - user can only access their own avatar
    if (avatarFile.userId !== user.id) {
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      );
    }

    // Read file from disk
    const fileBuffer = await readUploadedFile(avatarFile.path);

    // Return file with appropriate headers
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": avatarFile.mimeType,
        "Content-Length": avatarFile.size.toString(),
        "Content-Disposition": `inline; filename="avatar${getExtensionFromMimeType(avatarFile.mimeType)}"`,
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (error) {
    console.error("Avatar file serving error:", error);
    return NextResponse.json(
      { error: "Failed to serve avatar" },
      { status: 500 }
    );
  }
}

function getExtensionFromMimeType(mimeType: string): string {
  const extensions: { [key: string]: string } = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
  };
  return extensions[mimeType] || "";
}
