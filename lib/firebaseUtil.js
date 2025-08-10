// firebaseStorageUtils.js
import { db } from "./firebase";
import { collection, getDocs } from 'firebase/firestore';

import { doc, setDoc, getDoc, updateDoc, arrayUnion, serverTimestamp } from "firebase/firestore";

export async function fetchMonthlyBookings(hallId, year, month) {

    //const querySnapshot = await getDocs(collection(db, hallId));
    const monthColRef = collection(db, hallId, year, month);

    // Grab all docs in that sub-collection
    const snapshot = await getDocs(monthColRef);

    // Map into an array of { id, ...data }
    const bookings = snapshot.docs.map(doc => {
        const data = doc.data();
        return { id: doc.id, ...data };
    });

    return bookings;
}

export async function createBooking(hallId, booking) {
    // parse year/month from the start date
    const [year, month] = booking.start.split("-");

    // drop the id field so it doesn’t appear twice
    const { id, ...data } = booking;

    try {
        let docRef;
        if (id) {
            // use custom ID
            docRef = doc(db, hallId, year, month, id);
            await setDoc(docRef, data);
        } else {
            // auto-generate ID
            const monthCol = collection(db, hallId, year, month);
            docRef = await addDoc(monthCol, data);
        }
        return docRef.id;
    } catch (err) {
        throw err;
    }
}

export async function cancelBooking(hallId, booking) {
    const { id, start } = booking;
    const [year, month] = start.split("-");

    const ref = doc(db, hallId, year, month, id);

    // Fetch current data
    const snapshot = await getDoc(ref);
    if (!snapshot.exists()) {
        throw new Error(`Booking ${id} not found`);
    }
    const currentData = snapshot.data();

    // Archive with a client timestamp
    const archiveEntry = {
        ...currentData,
        canceledAt: new Date(), // client-side timestamp
    };

    // Perform the update
    await updateDoc(ref, {
        bookingHistory: arrayUnion(archiveEntry),
        title: "",
        start: "",
        end: "",
        color: "",
        details: "",
        isBooked: false,
    });

}

// utils/firebaseUtil.js
import {
  ref,
  listAll,
  getDownloadURL,
  uploadBytes,
  deleteObject,
  getMetadata,
} from "firebase/storage";
import { storage } from "./firebase"; // adjust if your path differs

class FirebaseStorageService {
  constructor(storageInstance) {
    this.storage = storageInstance;
  }

  async list(prefix) {
    const folderRef = ref(this.storage, prefix.replace(/^\/+/, ""));
    const { items } = await listAll(folderRef);

    const files = await Promise.all(
      items.map(async (itemRef) => {
        const [url, meta] = await Promise.all([
          getDownloadURL(itemRef),
          getMetadata(itemRef).catch(() => null),
        ]);
        return {
          path: itemRef.fullPath,
          name: itemRef.name,
          url,
          contentType: meta?.contentType ?? null,
          size: meta?.size ?? null,
          updated: meta?.updated ?? null,
        };
      })
    );

    return files;
  }

  async getUrl(path) {
    return getDownloadURL(ref(this.storage, path));
  }

  async upload(path, data, options) {
    await uploadBytes(ref(this.storage, path), data, options);
    return this.getUrl(path);
  }

  async remove(path) {
    return deleteObject(ref(this.storage, path));
  }
}

export const storageService = new FirebaseStorageService(storage);
export default FirebaseStorageService;