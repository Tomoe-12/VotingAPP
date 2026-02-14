import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export async function POST(request: Request) {
  try {
    const { token } = await request.json();
    const db = adminDb;
    
    // Alias check
    const aliasSnap = await db.collection("tokenAliases").doc(token).get();
    const canonicalToken = aliasSnap.exists ? aliasSnap.data()?.canonical?.trim() : token;

    const tokenSnap = await db.collection("voterTokens").doc(canonicalToken).get();
    if (!tokenSnap.exists) {
      return NextResponse.json({ ok: false, reason: "Invalid token" }, { status: 404 });
    }

    const data = tokenSnap.data();
    return NextResponse.json({
      ok: true,
      usedKing: !!data?.usedKing,
      usedQueen: !!data?.usedQueen,
      lastKingCandidateId: data?.lastKingCandidateId ?? null,
      lastQueenCandidateId: data?.lastQueenCandidateId ?? null,
    });
  } catch (error: any) {
    return NextResponse.json({ ok: false, reason: error.message }, { status: 500 });
  }
}