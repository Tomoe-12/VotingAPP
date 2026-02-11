import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { password } = (await request.json()) as { password?: string };
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

  return NextResponse.json({ ok: true });
}
