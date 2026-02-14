import { FieldValue } from "firebase-admin/firestore";
import { HttpsError, onCall } from "firebase-functions/v2/https";
import { logger } from "firebase-functions/v2";
import { adminDb } from "../../lib/firebase-admin";

type TokenAlias = {
  canonical?: string;
};

const resolveCanonicalToken = async (rawToken: string) => {
  const db = adminDb;
  const aliasSnap = await db.collection("tokenAliases").doc(rawToken).get();
  if (aliasSnap.exists) {
    const aliasData = aliasSnap.data() as TokenAlias | undefined;
    const canonical = aliasData?.canonical?.trim();
    if (canonical) {
      return canonical;
    }
  }

  // Fallback: allow direct canonical tokens if they exist in voterTokens.
  const tokenSnap = await db.collection("voterTokens").doc(rawToken).get();
  if (tokenSnap.exists) {
    return rawToken;
  }

  throw new HttpsError("permission-denied", "Invalid voter token.");
};

export const castVote = onCall(
  { secrets: ["ALLOWED_ORIGINS", "ADMIN_PRIVATE_KEY", "ADMIN_CLIENT_EMAIL", "ADMIN_PROJECT_ID", "ADMIN_STORAGE_BUCKET"], 
  cors: ["https://paohwelcome.site"], },// မင်းရဲ့ domain ကို ဒီမှာ အသေထည့်ပါ},
  async (request) => {
    // Debug logic: လာတဲ့ origin နဲ့ ငါတို့ သတ်မှတ်ထားတဲ့ origin ကို log ထုတ်ကြည့်မယ်
    // index.ts ထဲက logic ကို အခုလို ပြင်ကြည့်ပါ
    const allowedOrigins = (process.env.ALLOWED_ORIGINS || "").split(",");
    const requestOrigin = request.rawRequest.headers.origin || "";

    if (!allowedOrigins.includes(requestOrigin)) {
      logger.error("Domain mismatch", { requestOrigin, allowedOrigins });
      throw new HttpsError("permission-denied", "This domain is not allowed.");
    }

    try {
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

      const db = adminDb;
      const canonicalToken = await resolveCanonicalToken(token);
      const tokenRef = db.collection("voterTokens").doc(canonicalToken);
      const candidateRef = db.collection("candidates").doc(candidateId);

      await db.runTransaction(async (transaction) => {
        const tokenSnap = await transaction.get(tokenRef);
        if (!tokenSnap.exists) {
          throw new HttpsError("permission-denied", "Invalid voter token.");
        }

        const tokenData = tokenSnap.data() as
          | {
              usedKing?: boolean;
              usedQueen?: boolean;
            }
          | undefined;
        if (category === "king" && tokenData?.usedKing) {
          throw new HttpsError(
            "failed-precondition",
            "King vote already used.",
          );
        }
        if (category === "queen" && tokenData?.usedQueen) {
          throw new HttpsError(
            "failed-precondition",
            "Queen vote already used.",
          );
        }

        const candidateSnap = await transaction.get(candidateRef);
        if (!candidateSnap.exists) {
          throw new HttpsError("not-found", "Candidate not found.");
        }

        const candidateData = candidateSnap.data() as
          | { category?: string }
          | undefined;
        if (candidateData?.category !== category) {
          throw new HttpsError(
            "invalid-argument",
            "Candidate category mismatch.",
          );
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
          token: canonicalToken,
          rawToken: token,
          candidateId,
          category,
          createdAt: FieldValue.serverTimestamp(),
        });
      });

      return { ok: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logger.error("castVote failed", { message });
      if (error instanceof HttpsError) {
        throw error;
      }
      throw new HttpsError("internal", "Unable to cast vote.");
    }
  },
);

export const getTokenStatus = onCall(
  {
    secrets: ["ALLOWED_ORIGINS", "ADMIN_PROJECT_ID", "ADMIN_STORAGE_BUCKET", "ADMIN_CLIENT_EMAIL", "ADMIN_PRIVATE_KEY"],
    cors: true,
  },
  async (request) => {
    const allowedOrigins = (process.env.ALLOWED_ORIGINS || "").split(",");
    const requestOrigin = request.rawRequest.headers.origin || "";

    if (!allowedOrigins.includes(requestOrigin)) {
      logger.error("Domain mismatch in getTokenStatus", { requestOrigin, allowedOrigins });
      throw new HttpsError("permission-denied", "This domain is not allowed.");
    }
    try {
      const { token } = request.data as { token?: string };

      if (!token) {
        throw new HttpsError("invalid-argument", "token is required.");
      }

      const db = adminDb;
      const canonicalToken = await resolveCanonicalToken(token);
      const tokenSnap = await db
        .collection("voterTokens")
        .doc(canonicalToken)
        .get();
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
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logger.error("getTokenStatus failed", { message });
      if (error instanceof HttpsError) {
        throw error;
      }
      throw new HttpsError("internal", "Unable to load token status.");
    }
  },
);