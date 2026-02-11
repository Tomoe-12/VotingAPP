import { initializeApp } from "firebase-admin/app";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { HttpsError, onCall } from "firebase-functions/v2/https";

initializeApp();

export const castVote = onCall(async (request) => {
  const { token, candidateId, category } = request.data as {
    token?: string;
    candidateId?: string;
    category?: "king" | "queen";
  };

  if (!token || !candidateId || !category) {
    throw new HttpsError(
      "invalid-argument",
      "token, candidateId, and category are required.",
    );
  }

  const db = getFirestore();
  const tokenRef = db.collection("voterTokens").doc(token);
  const candidateRef = db.collection("candidates").doc(candidateId);

  await db.runTransaction(async (transaction) => {
    const tokenSnap = await transaction.get(tokenRef);
    if (!tokenSnap.exists) {
      throw new HttpsError("permission-denied", "Invalid voter token.");
    }

    const tokenData = tokenSnap.data() as {
      usedKing?: boolean;
      usedQueen?: boolean;
    } | undefined;
    if (category === "king" && tokenData?.usedKing) {
      throw new HttpsError("failed-precondition", "King vote already used.");
    }
    if (category === "queen" && tokenData?.usedQueen) {
      throw new HttpsError("failed-precondition", "Queen vote already used.");
    }

    const candidateSnap = await transaction.get(candidateRef);
    if (!candidateSnap.exists) {
      throw new HttpsError("not-found", "Candidate not found.");
    }

    const candidateData = candidateSnap.data() as { category?: string } | undefined;
    if (candidateData?.category !== category) {
      throw new HttpsError("invalid-argument", "Candidate category mismatch.");
    }

    transaction.update(candidateRef, { votes: FieldValue.increment(1) });
    if (category === "king") {
      transaction.update(tokenRef, {
        usedKing: true,
        usedAtKing: FieldValue.serverTimestamp(),
        lastKingCandidateId: candidateId,
      });
    } else {
      transaction.update(tokenRef, {
        usedQueen: true,
        usedAtQueen: FieldValue.serverTimestamp(),
        lastQueenCandidateId: candidateId,
      });
    }
    transaction.set(db.collection("votes").doc(), {
      token,
      candidateId,
      category,
      createdAt: FieldValue.serverTimestamp(),
    });
  });

  return { ok: true };
});

export const getTokenStatus = onCall(async (request) => {
  const { token } = request.data as { token?: string };

  if (!token) {
    throw new HttpsError("invalid-argument", "token is required.");
  }

  const db = getFirestore();
  const tokenSnap = await db.collection("voterTokens").doc(token).get();
  if (!tokenSnap.exists) {
    throw new HttpsError("permission-denied", "Invalid voter token.");
  }

  const data = tokenSnap.data() as {
    usedKing?: boolean;
    usedQueen?: boolean;
    lastKingCandidateId?: string | null;
    lastQueenCandidateId?: string | null;
  };

  return {
    ok: true,
    usedKing: Boolean(data.usedKing),
    usedQueen: Boolean(data.usedQueen),
    lastKingCandidateId: data.lastKingCandidateId ?? null,
    lastQueenCandidateId: data.lastQueenCandidateId ?? null,
  };
});
