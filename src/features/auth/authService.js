import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "firebase/auth";
import { 
  doc, 
  setDoc, 
  getDoc, 
  query, 
  collection, 
  where, 
  getDocs 
} from "firebase/firestore";
import { auth, db } from "../../lib/firebase";

// Helper to format phone as email for Firebase Auth
const phoneToEmail = (phone) => {
  // 1. Remove all non-digit characters
  let clean = String(phone).replace(/\D/g, '');
  
  // 2. Normalize Bangladesh numbers (8801... -> 01...)
  if (clean.startsWith('880')) {
    clean = clean.substring(2); 
  }
  
  // 3. Handle cases where the leading 0 might be missing
  if (clean.length === 10 && (clean.startsWith('1') || clean.startsWith('3') || clean.startsWith('4') || clean.startsWith('5') || clean.startsWith('6') || clean.startsWith('7') || clean.startsWith('8') || clean.startsWith('9'))) {
    clean = '0' + clean;
  }

  return `${clean}@tournament.com`;
};

export const registerPlayer = async (data) => {
  const { phone, password, fullName, jerseyNumber, jerseySize, paidAmount } = data;
  const email = phoneToEmail(phone);

  // 0. Check if phone/email already exists (optional but cleaner)
  try {
    const q = query(collection(db, "users"), where("phone", "==", phone));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      throw new Error("This phone number is already registered.");
    }
  } catch (e) {
    if (e.message.includes("phone number")) throw e;
    // Otherwise it might be a missing index error, we'll let Auth handle it then
  }
  
  // 1. Create user in Firebase Auth
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;
  
  // 2. Create user profile in Firestore
  const profileData = {
    uid: user.uid,
    fullName,
    phone,
    jerseyNumber: parseInt(jerseyNumber),
    jerseySize,
    paidAmount: parseFloat(paidAmount) || 0,
    role: 'player',
    createdAt: new Date().toISOString(),
    status: 'active'
  };
  
  await setDoc(doc(db, "users", user.uid), profileData);
  return { user, profile: profileData };
};

export const loginWithPhone = async (phone, password) => {
  const email = phoneToEmail(phone);
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;
  
  const docSnap = await getDoc(doc(db, "users", user.uid));
  if (docSnap.exists()) {
    return { user, profile: docSnap.data() };
  }
  throw new Error("User profile not found");
};

export const logoutUser = () => signOut(auth);

export const getProfile = async (uid) => {
  const docSnap = await getDoc(doc(db, "users", uid));
  return docSnap.exists() ? docSnap.data() : null;
};
