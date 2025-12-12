import { NextResponse } from "next/server";

export function binaryResponse(buffer: Buffer, contentType: string, filename?: string): NextResponse {
  const headers: Record<string, string> = {
    "Content-Type": contentType,
    "Content-Length": buffer.byteLength.toString(),
  };
  if (filename) {
    headers["Content-Disposition"] = `inline; filename="${filename}"`;
  }
  return new NextResponse(new Uint8Array(buffer), { headers });
}
