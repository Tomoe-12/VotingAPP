
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

// Firebase Functions အစား API Route (/api/vote) ကို လှမ်းခေါ်ခြင်း
export async function castVote(payload: CastVoteRequest): Promise<CastVoteResponse> {
  try {
    const response = await fetch("/api/vote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    return await response.json();
  } catch (error) {
    console.error("Cast vote error:", error);
    return { ok: false, reason: "Unable to cast your vote (Connection failed)." };
  }
}

// Firebase Functions အစား API Route (/api/token-status) ကို လှမ်းခေါ်ခြင်း
export async function getTokenStatus(token: string): Promise<TokenStatusResponse> {
  try {
    const response = await fetch("/api/token-status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        return { ok: false, reason: errorData.reason || "Invalid token" };
    }

    return await response.json();
  } catch (error) {
    console.error("Get token status error:", error);
    return { ok: false, reason: "Unable to load token status (Connection failed)." };
  }
}