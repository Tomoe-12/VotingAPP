import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

const MAX_BATCH_SIZE = 500;

export async function POST(request: Request) {
  const { password, prefix, start, end } = (await request.json()) as {
    password?: string;
    prefix?: string;
    start?: number;
    end?: number;
  };

  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    return NextResponse.json(
      { ok: false, reason: "Admin password is not configured." },
      { status: 500 },
    );
  }

  if (!password || password !== adminPassword) {
    return NextResponse.json({ ok: false, reason: "Invalid password." }, { status: 401 });
  }

  const safePrefix = (prefix ?? "").trim();
  if (!safePrefix) {
    return NextResponse.json(
      { ok: false, reason: "prefix is required." },
      { status: 400 },
    );
  }

  if (!Number.isInteger(start) || !Number.isInteger(end)) {
    return NextResponse.json(
      { ok: false, reason: "start and end must be integers." },
      { status: 400 },
    );
  }

  if (start < 1 || end < start) {
    return NextResponse.json(
      { ok: false, reason: "Invalid range." },
      { status: 400 },
    );
  }

  const padLength = String(end).length;
  const tokens: string[] = [];
  for (let i = start; i <= end; i += 1) {
    tokens.push(`${safePrefix}${String(i).padStart(padLength, "0")}`);
  }

  let created = 0;
  for (let i = 0; i < tokens.length; i += MAX_BATCH_SIZE) {
    const batch = adminDb.batch();
    const slice = tokens.slice(i, i + MAX_BATCH_SIZE);
    for (const token of slice) {
      const ref = adminDb.collection("voterTokens").doc(token);
      batch.set(ref, { usedKing: false, usedQueen: false }, { merge: true });
      created += 1;
    }
    await batch.commit();
  }

  return NextResponse.json({ ok: true, created });
}
