import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  updateDoc,
  increment,
  getDoc,
  Firestore,
} from 'firebase/firestore';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  User,
  Auth,
} from 'firebase/auth';
import firebaseConfig from '../firebase-applet-config.json';
import { Halte, CustomBus, LiveDisruption, SavedRoute } from './types';

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Use the provisioned database ID
export const db: Firestore = firebaseConfig.firestoreDatabaseId
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

export const auth: Auth = getAuth(app);

// Firestore collection names
export const COLLECTIONS = {
  HALTES: 'custom_haltes',
  BUSSEN: 'custom_bussen',
  DISRUPTIONS: 'live_disruptions',
  STATION_STATS: 'station_stats',
  SAVED_ROUTES: 'user_saved_routes',
  USER_PREFERENCES: 'user_preferences',
};

// ----------------------------------------------------
// Authentication Helpers
// ----------------------------------------------------

export async function loginWithGoogle(): Promise<User> {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  const result = await signInWithPopup(auth, provider);
  return result.user;
}

export async function loginWithEmail(email: string, pass: string): Promise<User> {
  const result = await signInWithEmailAndPassword(auth, email, pass);
  return result.user;
}

export async function registerWithEmail(email: string, pass: string, displayName?: string): Promise<User> {
  const result = await createUserWithEmailAndPassword(auth, email, pass);
  if (displayName && result.user) {
    try {
      await updateProfile(result.user, { displayName });
    } catch (err) {
      console.warn('Kon weergavenaam niet direct bijwerken:', err);
    }
  }
  return result.user;
}

export async function logoutUser(): Promise<void> {
  await signOut(auth);
}

export function subscribeToAuth(onUser: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, onUser);
}

// ----------------------------------------------------
// Saved Routes per User
// ----------------------------------------------------

export function subscribeToUserSavedRoutes(
  userId: string,
  onUpdate: (routes: SavedRoute[]) => void,
  onError?: (err: Error) => void
): () => void {
  if (!userId) {
    onUpdate([]);
    return () => {};
  }
  try {
    const q = query(
      collection(db, COLLECTIONS.SAVED_ROUTES),
      where('userId', '==', userId)
    );
    return onSnapshot(
      q,
      (snapshot) => {
        const items: SavedRoute[] = [];
        snapshot.forEach((d) => {
          items.push({ ...(d.data() as SavedRoute), id: d.id });
        });
        // Sort descending by creation date in memory
        items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        onUpdate(items);
      },
      (error) => {
        console.warn('Fout bij synchroniseren van opgeslagen routes:', error);
        if (onError) onError(error);
      }
    );
  } catch (err: any) {
    console.warn('Kon niet abonneren op opgeslagen routes:', err);
    return () => {};
  }
}

export async function saveUserRouteToFirestore(
  route: Omit<SavedRoute, 'id' | 'createdAt'>
): Promise<string> {
  const newId = `route_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const routeRef = doc(db, COLLECTIONS.SAVED_ROUTES, newId);
  const data: SavedRoute = {
    ...route,
    id: newId,
    createdAt: new Date().toISOString(),
  };
  await setDoc(routeRef, data);
  return newId;
}

export async function deleteUserRouteFromFirestore(routeId: string): Promise<void> {
  const routeRef = doc(db, COLLECTIONS.SAVED_ROUTES, routeId);
  await deleteDoc(routeRef);
}

// ----------------------------------------------------
// User Preferences (Favorite Stops) Sync
// ----------------------------------------------------

export async function saveUserFavoritesToFirestore(userId: string, favorites: string[]): Promise<void> {
  if (!userId) return;
  const prefRef = doc(db, COLLECTIONS.USER_PREFERENCES, userId);
  await setDoc(
    prefRef,
    {
      favorites,
      updatedAt: new Date().toISOString(),
    },
    { merge: true }
  );
}

export async function getUserFavoritesFromFirestore(userId: string): Promise<string[] | null> {
  if (!userId) return null;
  try {
    const prefRef = doc(db, COLLECTIONS.USER_PREFERENCES, userId);
    const snap = await getDoc(prefRef);
    if (snap.exists()) {
      const data = snap.data();
      return Array.isArray(data.favorites) ? data.favorites : null;
    }
  } catch (err) {
    console.warn('Kon favorieten niet ophalen uit Firestore:', err);
  }
  return null;
}

// ----------------------------------------------------
// Realtime listener for custom haltes
// ----------------------------------------------------
export function subscribeToCustomHaltes(
  onUpdate: (haltes: Halte[]) => void,
  onError?: (err: Error) => void
) {
  try {
    const q = query(collection(db, COLLECTIONS.HALTES));
    return onSnapshot(
      q,
      (snapshot) => {
        const items: Halte[] = [];
        snapshot.forEach((d) => {
          items.push({ ...(d.data() as Halte), id: d.id });
        });
        onUpdate(items);
      },
      (error) => {
        console.warn('Firestore haltes sync warning:', error);
        if (onError) onError(error);
      }
    );
  } catch (err: any) {
    console.warn('Could not subscribe to haltes in Firestore:', err);
    return () => {};
  }
}

// Realtime listener for custom buses
export function subscribeToCustomBussen(
  onUpdate: (buses: CustomBus[]) => void,
  onError?: (err: Error) => void
) {
  try {
    const q = query(collection(db, COLLECTIONS.BUSSEN));
    return onSnapshot(
      q,
      (snapshot) => {
        const items: CustomBus[] = [];
        snapshot.forEach((d) => {
          items.push({ ...(d.data() as CustomBus), id: d.id });
        });
        onUpdate(items);
      },
      (error) => {
        console.warn('Firestore bussen sync warning:', error);
        if (onError) onError(error);
      }
    );
  } catch (err: any) {
    console.warn('Could not subscribe to bussen in Firestore:', err);
    return () => {};
  }
}

// Realtime listener for live disruptions / passenger alerts
export function subscribeToDisruptions(
  onUpdate: (disruptions: LiveDisruption[]) => void,
  onError?: (err: Error) => void
) {
  try {
    const q = query(collection(db, COLLECTIONS.DISRUPTIONS), orderBy('timestamp', 'desc'));
    return onSnapshot(
      q,
      (snapshot) => {
        const items: LiveDisruption[] = [];
        snapshot.forEach((d) => {
          items.push({ ...(d.data() as LiveDisruption), id: d.id });
        });
        onUpdate(items);
      },
      (error) => {
        console.warn('Firestore disruptions sync warning:', error);
        if (onError) onError(error);
      }
    );
  } catch (err: any) {
    console.warn('Could not subscribe to disruptions:', err);
    return () => {};
  }
}

// Save Halte to Firestore
export async function saveHalteToFirestore(halte: Halte): Promise<void> {
  const halteDocRef = doc(db, COLLECTIONS.HALTES, halte.id);
  await setDoc(halteDocRef, {
    ...halte,
    custom: true,
    updatedAt: new Date().toISOString(),
  });
}

// Delete Halte from Firestore
export async function deleteHalteFromFirestore(halteId: string): Promise<void> {
  const halteDocRef = doc(db, COLLECTIONS.HALTES, halteId);
  await deleteDoc(halteDocRef);
}

// Save Custom Bus to Firestore
export async function saveBusToFirestore(bus: CustomBus): Promise<void> {
  const busDocRef = doc(db, COLLECTIONS.BUSSEN, bus.id);
  await setDoc(busDocRef, {
    ...bus,
    updatedAt: new Date().toISOString(),
  });
}

// Delete Custom Bus from Firestore
export async function deleteBusFromFirestore(busId: string): Promise<void> {
  const busDocRef = doc(db, COLLECTIONS.BUSSEN, busId);
  await deleteDoc(busDocRef);
}

// Post a Live Disruption to Firestore
export async function addDisruptionToFirestore(disruption: Omit<LiveDisruption, 'id'>): Promise<string> {
  const newId = `disruption_${Date.now()}`;
  const ref = doc(db, COLLECTIONS.DISRUPTIONS, newId);
  await setDoc(ref, {
    ...disruption,
    id: newId,
  });
  return newId;
}

// Upvote / Confirm Disruption
export async function upvoteDisruptionInFirestore(disruptionId: string): Promise<void> {
  const ref = doc(db, COLLECTIONS.DISRUPTIONS, disruptionId);
  await updateDoc(ref, {
    upvotes: increment(1),
  });
}

// Save User Site Settings (Theme, colors, density)
export async function saveUserSettingsToFirestore(userId: string, settings: any): Promise<void> {
  const prefDocRef = doc(db, 'user_preferences', userId);
  await setDoc(
    prefDocRef,
    {
      siteSettings: settings,
      updatedAt: new Date().toISOString(),
    },
    { merge: true }
  );
}

// Fetch User Site Settings from Firestore
export async function getUserSettingsFromFirestore(userId: string): Promise<any | null> {
  try {
    const prefDocRef = doc(db, 'user_preferences', userId);
    const snap = await getDoc(prefDocRef);
    if (snap.exists() && snap.data()?.siteSettings) {
      return snap.data().siteSettings;
    }
  } catch (err) {
    console.warn('Could not load user settings from Firestore:', err);
  }
  return null;
}

