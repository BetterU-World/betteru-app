import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { readUploadedFile } from "@/lib/uploads";
import { binaryResponse } from "@/lib/http/binaryResponse";
import { requireDbUser } from "@/lib/auth/requireUser";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const dbUser = await requireDbUser();

    const { id } = await context.params;

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
    if (avatarFile.userId !== dbUser.id) {
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      );
    }

    // Read file from disk
    const fileBuffer = await readUploadedFile(avatarFile.path);

    // Return file with standardized helper
    const filename = `avatar${getExtensionFromMimeType(avatarFile.mimeType)}`;
    const res = binaryResponse(fileBuffer, avatarFile.mimeType, filename);
    res.headers.set("Cache-Control", "private, max-age=3600");
    return res;
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
