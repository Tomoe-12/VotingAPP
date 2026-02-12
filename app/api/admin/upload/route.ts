import { NextResponse } from "next/server";
import { adminStorage } from "@/lib/firebase-admin";

const normalizeFileName = (name: string) =>
  name.replace(/[^a-zA-Z0-9._-]/g, "_");

export async function POST(request: Request) {
  const { dataUrl, fileName, prefix, password } =
    (await request.json()) as {
      dataUrl?: string;
      fileName?: string;
      prefix?: string;
      password?: string;
    };

  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    return NextResponse.json(
      { ok: false, reason: "Admin password is not configured." },
      { status: 500 },
    );
  }

  if (!password || password !== adminPassword) {
    return NextResponse.json(
      { ok: false, reason: "Invalid password." },
      { status: 401 },
    );
  }

  if (!dataUrl || !fileName || !prefix) {
    return NextResponse.json(
      { ok: false, reason: "Missing upload data." },
      { status: 400 },
    );
  }

  const match = dataUrl.match(/^data:(.+);base64,(.*)$/);
  if (!match) {
    return NextResponse.json(
      { ok: false, reason: "Invalid data URL." },
      { status: 400 },
    );
  }

  const contentType = match[1];
  const base64Data = match[2];

  if (!contentType.startsWith("image/")) {
    return NextResponse.json(
      { ok: false, reason: "Only image uploads are allowed." },
      { status: 400 },
    );
  }

  const safeName = normalizeFileName(fileName);
  const path = `${prefix}/${Date.now()}-${safeName}`;
  const buffer = Buffer.from(base64Data, "base64");

  const bucket = adminStorage.bucket();
  const file = bucket.file(path);

  await file.save(buffer, {
    contentType,
    resumable: false,
    metadata: {
      cacheControl: "public, max-age=31536000",
    },
  });

  const [signedUrl] = await file.getSignedUrl({
    action: "read",
    expires: "01-01-2500",
  });

  return NextResponse.json({ ok: true, url: signedUrl, path });
}
