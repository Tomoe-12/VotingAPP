import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase-admin";

const resolveCanonicalToken = async (rawToken: string) => {
  const db = adminDb;
  const aliasSnap = await db.collection("tokenAliases").doc(rawToken).get();
  if (aliasSnap.exists) {
    const canonical = aliasSnap.data()?.canonical?.trim();
    if (canonical) return canonical;
  }
  const tokenSnap = await db.collection("voterTokens").doc(rawToken).get();
  if (tokenSnap.exists) return rawToken;
  throw new Error("Invalid voter token.");
};

export async function POST(request: Request) {
  try {
    const { token, candidateId, category } = await request.json();
    const db = adminDb;

    const canonicalToken = await resolveCanonicalToken(token);
    const tokenRef = db.collection("voterTokens").doc(canonicalToken);
    
    await db.runTransaction(async (t) => {
      const tokenSnap = await t.get(tokenRef);
      const data = tokenSnap.data();
      const usedField = category === "king" ? "usedKing" : "usedQueen";
      const lastField = category === "king" ? "lastKingCandidateId" : "lastQueenCandidateId";

      if (data?.[usedField]) throw new Error(`Already voted for ${category}.`);

      const candidateRef = db.collection("candidates").doc(candidateId);
      t.update(candidateRef, { votes: FieldValue.increment(1) });
      t.update(tokenRef, { [usedField]: true, [lastField]: candidateId });
    });

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json({ ok: false, reason: error.message }, { status: 400 });
  }
}