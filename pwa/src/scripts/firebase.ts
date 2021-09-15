import * as admin from "firebase-admin";
import { name } from "../../package.json";

export const app = admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  databaseURL: `https://${name}.firebaseio.com`,
});

export const firestore = app.firestore();
