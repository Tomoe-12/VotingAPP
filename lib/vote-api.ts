import { httpsCallable } from "firebase/functions";
import { functions } from "@/lib/firebase-client";
import type { CandidateCategory } from "@/lib/voting-data";

export interface CastVoteRequest {
  token: string;
  candidateId: string;
  category: CandidateCategory;
}

export interface CastVoteResponse {
  ok: boolean;
  reason?: string;
}

export interface TokenStatusResponse {
  ok: boolean;
  reason?: string;
  usedKing?: boolean;
  usedQueen?: boolean;
  lastKingCandidateId?: string | null;
  lastQueenCandidateId?: string | null;
}

export async function castVote(payload: CastVoteRequest) {
  try {
    const callable = httpsCallable(functions, "castVote");
    const result = await callable(payload);
    return result.data as CastVoteResponse;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to cast your vote.";
    const code = typeof (error as { code?: string })?.code === "string" ? (error as { code?: string }).code : undefined;
    return {
      ok: false,
      reason: code ? `${message} (${code})` : message,
    };
  }
}

export async function getTokenStatus(token: string) {
  try {
    const callable = httpsCallable(functions, "getTokenStatus");
    const result = await callable({ token });
    return result.data as TokenStatusResponse;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load token status.";
    const code = typeof (error as { code?: string })?.code === "string" ? (error as { code?: string }).code : undefined;
    return {
      ok: false,
      reason: code ? `${message} (${code})` : message,
    };
  }
}
