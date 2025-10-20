// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import type { User } from 'firebase/auth';
import type { UserData } from '../types';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA6AKhNe3hnVb-qcQx5XuDp2pwDjXhn4sw",
  authDomain: "better-double.firebaseapp.com",
  projectId: "better-double",
  storageBucket: "better-double.firebasestorage.app",
  messagingSenderId: "1074072347503",
  appId: "1:1074072347503:web:dde19a2ea0bb2d05d03e9a",
  measurementId: "G-8W31EW3GH3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
export const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

/**
 * 認証状態を監視し、ユーザー情報を取得します。
 * @param callback ユーザー状態が変化したときに呼び出される関数
 * @returns 監視を停止するためのunsubscribe関数
 */
export const onAuth = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

// --- Authentication Functions ---
export const signUpWithEmail = (email: string, password: string) => 
  createUserWithEmailAndPassword(auth, email, password);

export const signInWithEmail = (email: string, password: string) =>
  signInWithEmailAndPassword(auth, email, password);

export const signInWithGoogle = () => signInWithPopup(auth, googleProvider);

export const logout = () => signOut(auth);


/**
 * Firestoreからユーザーデータを読み込みます。
 * データが存在しない場合は、新規ユーザーとして初期データを作成します。
 * @param userId ユーザーID
 * @returns ユーザーデータ
 */
export const loadUserData = async (userId: string): Promise<UserData> => {
  const userDocRef = doc(db, 'users', userId);
  const docSnap = await getDoc(userDocRef);

  if (docSnap.exists()) {
    return docSnap.data() as UserData;
  } else {
    // 新規ユーザーのための初期データ
    const newUserData: UserData = {
      userId: userId,
      partnerCode: null,
      goals: [],
      habits: [],
      angerLogs: [],
      datePlans: [],
      todayMood: 'okay',
      sharedMemos: [],
      wishes: [],
      appreciationLogs: [],
      instructionManual: [],
      weeklyReflections: [],
      values: [],
    };
    await saveUserData(userId, newUserData);
    return newUserData;
  }
};

/**
 * Firestoreからパートナーのデータを読み込みます。
 * @param partnerId パートナーのユーザーID
 * @returns パートナーのデータ、または存在しない/権限がない場合はnull
 */
export const loadPartnerData = async (partnerId: string): Promise<UserData | null> => {
  try {
    const userDocRef = doc(db, 'users', partnerId);
    const docSnap = await getDoc(userDocRef); // This call is subject to security rules

    if (docSnap.exists()) {
      return docSnap.data() as UserData;
    } else {
      return null;
    }
  } catch (error) {
    // 権限エラー(パートナーがまだ連携を完了していない場合など)を捕捉し、コンソールに警告を出力してnullを返す
    console.warn(`Could not load partner data for ${partnerId}. This is expected if the partner has not connected back yet.`, error);
    return null;
  }
};


/**
 * Firestoreにユーザーデータを保存します。
 * @param userId ユーザーID
 * @param data 保存するユーザーデータ
 */
export const saveUserData = async (userId: string, data: UserData): Promise<void> => {
  const userDocRef = doc(db, 'users', userId);
  await setDoc(userDocRef, data, { merge: true });
};


/**
 * パートナーと連携します。
 * 自分のデータにパートナーコードを設定します。
 * @param userId 自分のユーザーID
 * @param partnerCode パートナーのユーザーID
 * @returns 連携結果
 */
export const connectPartner = async (userId: string, partnerCode: string): Promise<{ success: boolean; message: string }> => {
  try {
    // セキュリティルールにより、パートナーのドキュメントを直接読み取ることはできません。
    // そのため、自分のデータにパートナーコードを設定する処理のみを行います。
    // 相手がこちらのコードを入力した時点で、双方向の連携が完了します。
    const userData = await loadUserData(userId);
    
    userData.partnerCode = partnerCode;
    await saveUserData(userId, userData);
    
    return { 
      success: true, 
      message: 'パートナーコードを保存しました。相手があなたのコードを入力すると、連携が完了しデータ共有が始まります。' 
    };

  } catch (error) {
    console.error("Error connecting partner:", error);
    return { success: false, message: '連携処理中にエラーが発生しました。' };
  }
};