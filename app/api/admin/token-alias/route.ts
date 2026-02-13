import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase-admin";

const MAX_ALIAS_ATTEMPTS = 5;
const ALIAS_LENGTH = 16;
const ALIAS_CHARS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

const generateAliasToken = () => {
  let token = "";
  for (let i = 0; i < ALIAS_LENGTH; i += 1) {
    token += ALIAS_CHARS[Math.floor(Math.random() * ALIAS_CHARS.length)];
  }
  return token;
};

export async function POST(request: Request) {
  const { password, canonicalToken, aliasToken } = (await request.json()) as {
    password?: string;
    canonicalToken?: string;
    aliasToken?: string;
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

  if (!canonicalToken || !canonicalToken.trim()) {
    return NextResponse.json(
      { ok: false, reason: "canonicalToken is required." },
      { status: 400 },
    );
  }

  const cleanedCanonical = canonicalToken.trim();
  const tokenSnap = await adminDb
    .collection("voterTokens")
    .doc(cleanedCanonical)
    .get();

  if (!tokenSnap.exists) {
    return NextResponse.json(
      { ok: false, reason: "Canonical token not found." },
      { status: 404 },
    );
  }

  const aliasCollection = adminDb.collection("tokenAliases");
  const requestedAlias = aliasToken?.trim();

  const ensureAliasAvailable = async (token: string) => {
    const snap = await aliasCollection.doc(token).get();
    return !snap.exists;
  };

  let finalAlias = requestedAlias || "";

  if (finalAlias) {
    const available = await ensureAliasAvailable(finalAlias);
    if (!available) {
      return NextResponse.json(
        { ok: false, reason: "Alias already exists." },
        { status: 409 },
      );
    }
  } else {
    for (let attempt = 0; attempt < MAX_ALIAS_ATTEMPTS; attempt += 1) {
      const candidate = generateAliasToken();
      const available = await ensureAliasAvailable(candidate);
      if (available) {
        finalAlias = candidate;
        break;
      }
    }

    if (!finalAlias) {
      return NextResponse.json(
        { ok: false, reason: "Unable to generate alias token." },
        { status: 500 },
      );
    }
  }

  await aliasCollection.doc(finalAlias).set({
    canonical: cleanedCanonical,
    createdAt: FieldValue.serverTimestamp(),
  });

  return NextResponse.json({ ok: true, aliasToken: finalAlias });
}
