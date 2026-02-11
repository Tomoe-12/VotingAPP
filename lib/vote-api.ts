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
  const callable = httpsCallable(functions, "castVote");
  const result = await callable(payload);
  return result.data as CastVoteResponse;
}

export async function getTokenStatus(token: string) {
  const callable = httpsCallable(functions, "getTokenStatus");
  const result = await callable({ token });
  return result.data as TokenStatusResponse;
}
