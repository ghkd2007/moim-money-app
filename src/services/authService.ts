// 실제 Firebase Authentication 서비스
import {
	createUserWithEmailAndPassword,
	signInWithEmailAndPassword,
	signOut,
	onAuthStateChanged,
	User,
	updateProfile,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "./firebase";

export interface AuthUser {
	uid: string;
	email: string | null;
	displayName: string | null;
	photoURL: string | null;
}

// 회원가입
export const register = async (
	email: string,
	password: string,
	displayName: string
): Promise<AuthUser> => {
	try {
		const userCredential = await createUserWithEmailAndPassword(
			auth,
			email,
			password
		);
		const user = userCredential.user;

		// 프로필 업데이트
		await updateProfile(user, {
			displayName: displayName,
		});

		// Firestore에 사용자 정보 저장
		await setDoc(doc(db, "users", user.uid), {
			uid: user.uid,
			email: user.email,
			displayName: displayName,
			photoURL: user.photoURL,
			createdAt: new Date(),
			updatedAt: new Date(),
		});

		return {
			uid: user.uid,
			email: user.email,
			displayName: displayName,
			photoURL: user.photoURL,
		};
	} catch (error: any) {
		console.error("회원가입 오류:", error);
		throw new Error(getAuthErrorMessage(error.code));
	}
};

// 로그인
export const login = async (
	email: string,
	password: string
): Promise<AuthUser> => {
	try {
		const userCredential = await signInWithEmailAndPassword(
			auth,
			email,
			password
		);
		const user = userCredential.user;

		return {
			uid: user.uid,
			email: user.email,
			displayName: user.displayName,
			photoURL: user.photoURL,
		};
	} catch (error: any) {
		console.error("로그인 오류:", error);
		throw new Error(getAuthErrorMessage(error.code));
	}
};

// 로그아웃
export const logout = async (): Promise<void> => {
	try {
		await signOut(auth);
	} catch (error: any) {
		console.error("로그아웃 오류:", error);
		throw new Error("로그아웃 중 오류가 발생했습니다.");
	}
};

// 인증 상태 변경 리스너
export const onAuthChange = (callback: (user: AuthUser | null) => void) => {
	return onAuthStateChanged(auth, (user: User | null) => {
		if (user) {
			callback({
				uid: user.uid,
				email: user.email,
				displayName: user.displayName,
				photoURL: user.photoURL,
			});
		} else {
			callback(null);
		}
	});
};

// 현재 사용자 정보 가져오기
export const getCurrentUser = (): AuthUser | null => {
	const user = auth.currentUser;
	if (user) {
		return {
			uid: user.uid,
			email: user.email,
			displayName: user.displayName,
			photoURL: user.photoURL,
		};
	}
	return null;
};

// 사용자 프로필 업데이트
export const updateUserProfile = async (
	displayName?: string,
	photoURL?: string
): Promise<void> => {
	const user = auth.currentUser;
	if (!user) throw new Error("로그인된 사용자가 없습니다.");

	try {
		await updateProfile(user, {
			displayName: displayName || user.displayName,
			photoURL: photoURL || user.photoURL,
		});

		// Firestore도 업데이트
		await setDoc(
			doc(db, "users", user.uid),
			{
				displayName: displayName || user.displayName,
				photoURL: photoURL || user.photoURL,
				updatedAt: new Date(),
			},
			{ merge: true }
		);
	} catch (error: any) {
		console.error("프로필 업데이트 오류:", error);
		throw new Error("프로필 업데이트 중 오류가 발생했습니다.");
	}
};

// Firebase Auth 오류 메시지 한국어 변환
const getAuthErrorMessage = (errorCode: string): string => {
	switch (errorCode) {
		case "auth/user-not-found":
			return "존재하지 않는 이메일입니다.";
		case "auth/wrong-password":
			return "비밀번호가 올바르지 않습니다.";
		case "auth/email-already-in-use":
			return "이미 사용 중인 이메일입니다.";
		case "auth/weak-password":
			return "비밀번호는 6자리 이상이어야 합니다.";
		case "auth/invalid-email":
			return "올바르지 않은 이메일 형식입니다.";
		case "auth/too-many-requests":
			return "너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요.";
		case "auth/network-request-failed":
			return "네트워크 연결을 확인해주세요.";
		default:
			return "인증 중 오류가 발생했습니다.";
	}
};
