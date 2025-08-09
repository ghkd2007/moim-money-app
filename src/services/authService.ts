// 인증 서비스
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  updateProfile,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { User } from '../types';

/**
 * 이메일과 비밀번호로 회원가입
 * @param email 이메일
 * @param password 비밀번호
 * @param displayName 사용자 이름
 * @returns 생성된 사용자 정보
 */
export const registerWithEmail = async (
  email: string, 
  password: string, 
  displayName: string
): Promise<User> => {
  try {
    // Firebase Auth로 사용자 생성
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;
    
    // 사용자 프로필 업데이트
    await updateProfile(firebaseUser, { displayName });
    
    // Firestore에 사용자 정보 저장
    const user: User = {
      id: firebaseUser.uid,
      email: firebaseUser.email!,
      displayName,
      photoURL: firebaseUser.photoURL || undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    await setDoc(doc(db, 'users', firebaseUser.uid), user);
    
    return user;
  } catch (error) {
    console.error('회원가입 오류:', error);
    throw error;
  }
};

/**
 * 이메일과 비밀번호로 로그인
 * @param email 이메일
 * @param password 비밀번호
 * @returns 사용자 정보
 */
export const loginWithEmail = async (email: string, password: string): Promise<User> => {
  try {
    // Firebase Auth로 로그인
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;
    
    // Firestore에서 사용자 정보 가져오기
    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
    
    if (userDoc.exists()) {
      return userDoc.data() as User;
    } else {
      // Firestore에 사용자 정보가 없는 경우 생성
      const user: User = {
        id: firebaseUser.uid,
        email: firebaseUser.email!,
        displayName: firebaseUser.displayName || '사용자',
        photoURL: firebaseUser.photoURL || undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      await setDoc(doc(db, 'users', firebaseUser.uid), user);
      return user;
    }
  } catch (error) {
    console.error('로그인 오류:', error);
    throw error;
  }
};

/**
 * 로그아웃
 */
export const logout = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('로그아웃 오류:', error);
    throw error;
  }
};

/**
 * 현재 로그인된 사용자 정보 가져오기
 * @returns 사용자 정보 또는 null
 */
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) return null;
    
    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
    
    if (userDoc.exists()) {
      return userDoc.data() as User;
    }
    
    return null;
  } catch (error) {
    console.error('사용자 정보 가져오기 오류:', error);
    return null;
  }
};

/**
 * Firebase User를 앱 User 타입으로 변환
 * @param firebaseUser Firebase 사용자 객체
 * @returns 앱 사용자 타입
 */
export const convertFirebaseUser = (firebaseUser: FirebaseUser): User => {
  return {
    id: firebaseUser.uid,
    email: firebaseUser.email!,
    displayName: firebaseUser.displayName || '사용자',
    photoURL: firebaseUser.photoURL || undefined,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
};
