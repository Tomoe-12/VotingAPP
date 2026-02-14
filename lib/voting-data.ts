import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  serverTimestamp,
  setDoc,
  writeBatch,
} from "firebase/firestore";
import { db } from "@/lib/firebase-client";

export type CandidateCategory = "king" | "queen";

export interface CandidateRecord {
  id: string;
  name: string;
  category: CandidateCategory;
  images: string[];
  votes: number;
  age?: number;
  height?: string;
  major?: string;
  year?: string;
  hobbies?: string;
  hometown?: string;
}

export type VotingStatus = "not-started" | "active" | "ended";

export function subscribeCandidates(
  onChange: (candidates: CandidateRecord[]) => void,
) {
  const ref = collection(db, "candidates");
  return onSnapshot(ref, (snapshot) => {
    const items = snapshot.docs.map((docSnap) => {
      const data = docSnap.data() as Omit<CandidateRecord, "id">;
      return { id: docSnap.id, ...data };
    });
    onChange(items);
  });
}

export function subscribeVotingStatus(onChange: (status: VotingStatus) => void) {
  const ref = doc(db, "config", "voting");
  return onSnapshot(ref, (snapshot) => {
    const data = snapshot.data() as { status?: VotingStatus } | undefined;
    onChange(data?.status ?? "not-started");
  });
}

export async function setVotingStatus(status: VotingStatus) {
  const ref = doc(db, "config", "voting");
  await setDoc(ref, { status }, { merge: true });
}

export async function addCandidate(
  candidate: Omit<CandidateRecord, "id" | "votes">,
) {
  return addDoc(collection(db, "candidates"), {
    ...candidate,
    votes: 0,
    createdAt: serverTimestamp(),
  });
}

export async function removeCandidate(id: string) {
  return deleteDoc(doc(db, "candidates", id));
}

// export async function resetCandidateVotes() {
//   const snapshot = await getDocs(collection(db, "candidates"));
//   const batch = writeBatch(db);
//   snapshot.docs.forEach((docSnap) => {
//     batch.update(docSnap.ref, { votes: 0 });
//   });
//   await batch.commit();
// }

export async function resetAllVotingData() {
  const batch = writeBatch(db);
  
  // ၁။ Candidate Votes များကို Reset လုပ်ခြင်း
  const candidateSnap = await getDocs(collection(db, "candidates"));
  candidateSnap.docs.forEach((docSnap) => {
    batch.update(docSnap.ref, { votes: 0 });
  });

  // ၂။ Voter Tokens များကို Reset လုပ်ခြင်း (usedKing, usedQueen ကို false ပြန်လုပ်ခြင်း)
  const tokenSnap = await getDocs(collection(db, "voterTokens"));
  tokenSnap.docs.forEach((docSnap) => {
    batch.update(docSnap.ref, {
      usedKing: false,
      usedQueen: false,
      lastKingCandidateId: null,
      lastQueenCandidateId: null,
    });
  });

  await batch.commit();
}

export async function clearVotes() {
  const snapshot = await getDocs(collection(db, "votes"));
  const batch = writeBatch(db);
  snapshot.docs.forEach((docSnap) => {
    batch.delete(docSnap.ref);
  });
  await batch.commit();
}
