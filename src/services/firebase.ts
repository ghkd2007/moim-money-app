// Firebase 설정 및 초기화
import { initializeApp } from "firebase/app";
import {
	getAuth,
	initializeAuth,
	getReactNativePersistence,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

// Firebase 설정 객체
const firebaseConfig = {
	apiKey: "AIzaSyB4FV6SmSdEHg5zHsNpn2qff5do6nhiqqc",
	authDomain: "moim-money-app.firebaseapp.com",
	projectId: "moim-money-app",
	storageBucket: "moim-money-app.firebasestorage.app",
	messagingSenderId: "126606816398",
	appId: "1:126606816398:web:b055b5e03f39fd2c0505df",
	measurementId: "G-DP4JT94814",
};

// Firebase 앱 초기화
const app = initializeApp(firebaseConfig);

// Firebase Auth 초기화 (플랫폼별 설정)
let auth;
if (Platform.OS === "web") {
	// 웹 환경에서는 기본 getAuth 사용
	auth = getAuth(app);
} else {
	// 모바일 환경에서는 AsyncStorage 지속성 사용
	try {
		auth = initializeAuth(app, {
			persistence: getReactNativePersistence(AsyncStorage),
		});
	} catch (error) {
		// 이미 초기화된 경우 기존 인스턴스 사용
		auth = getAuth(app);
	}
}

export { auth };

// Firebase 서비스 인스턴스 생성
export const db = getFirestore(app);
export const functions = getFunctions(app);

export default app;
