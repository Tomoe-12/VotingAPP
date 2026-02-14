import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

const projectId = process.env.BUILD_ADMIN_PROJECT_ID;
const clientEmail = process.env.ADMIN_CLIENT_EMAIL;
const privateKey = process.env.ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");
const storageBucket =
  process.env.ADMIN_STORAGE_BUCKET ||
  process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;

if (!projectId || !clientEmail || !privateKey) {
  throw new Error("Missing Firebase Admin credentials in environment variables.");
}

if (!storageBucket) {
  throw new Error("Missing Firebase Admin storage bucket configuration.");
}

const app = getApps().length
  ? getApps()[0]
  : initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
      storageBucket,
    });

export const adminStorage = getStorage(app);
export const adminDb = getFirestore(app);
