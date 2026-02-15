import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase-admin";

const MAX_ALIAS_ATTEMPTS = 5;
const ALIAS_LENGTH = 16;
const ALIAS_CHARS =
  "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

const generateAliasToken = () => {
  let token = "";
  for (let i = 0; i < ALIAS_LENGTH; i += 1) {
    token += ALIAS_CHARS[Math.floor(Math.random() * ALIAS_CHARS.length)];
  }
  return token;
};

const ensureAliasAvailable = async (token: string) => {
  const snap = await adminDb.collection("tokenAliases").doc(token).get();
  return !snap.exists;
};

async function generateUniqueAlias(): Promise<string | null> {
  for (let attempt = 0; attempt < MAX_ALIAS_ATTEMPTS; attempt += 1) {
    const candidate = generateAliasToken();
    const available = await ensureAliasAvailable(candidate);
    if (available) {
      return candidate;
    }
  }
  return null;
}

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
    return NextResponse.json(
      { ok: false, reason: "Invalid password." },
      { status: 401 },
    );
  }

  if (
    !prefix ||
    !prefix.trim() ||
    start === undefined ||
    end === undefined ||
    start > end
  ) {
    return NextResponse.json(
      { ok: false, reason: "Invalid prefix or range." },
      { status: 400 },
    );
  }

  const aliasCollection = adminDb.collection("tokenAliases");
  const batch = adminDb.batch();
  const generatedLinks: string[] = [];
  const origin = request.headers.get("origin") || "";

  for (let i = start; i <= end; i += 1) {
    const canonicalToken = `${prefix.trim()}${i
      .toString()
      .padStart(4, "0")}`;
    const tokenSnap = await adminDb
      .collection("voterTokens")
      .doc(canonicalToken)
      .get();

    if (tokenSnap.exists) {
      const aliasToken = await generateUniqueAlias();
      if (aliasToken) {
        const aliasRef = aliasCollection.doc(aliasToken);
        batch.set(aliasRef, {
          canonical: canonicalToken,
          createdAt: FieldValue.serverTimestamp(),
        });
        generatedLinks.push(`${origin}/?id=${aliasToken}`);
      }
    }
  }

  try {
    await batch.commit();
    return NextResponse.json({ ok: true, links: generatedLinks });
  } catch (error) {
    console.error("Failed to commit batch", error);
    return NextResponse.json(
      { ok: false, reason: "Failed to create alias tokens." },
      { status: 500 },
    );
  }
}
