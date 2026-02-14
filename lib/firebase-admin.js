"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminDb = exports.adminStorage = void 0;
const app_1 = require("firebase-admin/app");
const firestore_1 = require("firebase-admin/firestore");
const storage_1 = require("firebase-admin/storage");
const projectId = process.env.ADMIN_PROJECT_ID;
const clientEmail = process.env.ADMIN_CLIENT_EMAIL;
const privateKey = process.env.ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");
const storageBucket = process.env.ADMIN_STORAGE_BUCKET ||
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
if (!projectId || !clientEmail || !privateKey) {
    throw new Error("Missing Firebase Admin credentials in environment variables.");
}
if (!storageBucket) {
    throw new Error("Missing Firebase Admin storage bucket configuration.");
}
const app = (0, app_1.getApps)().length
    ? (0, app_1.getApps)()[0]
    : (0, app_1.initializeApp)({
        credential: (0, app_1.cert)({
            projectId,
            clientEmail,
            privateKey,
        }),
        storageBucket,
    });
exports.adminStorage = (0, storage_1.getStorage)(app);
exports.adminDb = (0, firestore_1.getFirestore)(app);
