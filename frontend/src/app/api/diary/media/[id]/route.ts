import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { readUploadedFile } from "@/lib/uploads";
import { decryptBuffer } from "@/lib/encryption";
import { binaryResponse } from "@/lib/http/binaryResponse";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id: mediaId } = await params;
    const media = await prisma.diaryMedia.findUnique({ where: { id: mediaId } });
    if (!media) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Resolve attachment via stored id in url field
    const attachmentId = media.url;
    const attachment = await prisma.diaryAttachment.findUnique({ where: { id: attachmentId } });
    if (!attachment) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Ownership check: media.userId must match attachment.userId
    if (media.userId !== attachment.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Clerk ownership check via entry
    const entry = await prisma.diaryEntry.findUnique({ where: { id: attachment.diaryEntryId } });
    if (!entry || !entry.userId) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const userId = entry.userId;
    const dbUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!dbUser || dbUser.clerkId !== clerkUserId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const data = await readUploadedFile(attachment.path);

    // If encrypted, decrypt server-side
    if (attachment.mimeType === "application/vnd.betteru.encrypted") {
      const blobStr = data.toString("utf8");
      try {
        const decrypted = decryptBuffer(blobStr);
        const res = binaryResponse(decrypted, "application/octet-stream");
        res.headers.set("Cache-Control", "no-store");
        return res;
      } catch {
        return NextResponse.json({ error: "Decryption failed" }, { status: 500 });
      }
    }

    // Unencrypted: stream with recorded MIME
    const res = binaryResponse(data, attachment.mimeType);
    res.headers.set("Cache-Control", "no-store");
    return res;
  } catch (e) {
    return NextResponse.json({ error: "Failed to fetch media" }, { status: 500 });
  }
}
