// Firebase 설정 및 초기화
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// import { getStorage } from "firebase/storage"; // Storage는 나중에 필요할 때 추가
import { getFunctions } from "firebase/functions";

// Firebase 설정 객체 (실제 프로젝트 설정값)
const firebaseConfig = {
	apiKey: "AIzaSyB4FV6SmSdEHg5zHsNpn2qff5do6nhiqqc",
	authDomain: "moim-money-app.firebaseapp.com",
	projectId: "moim-money-app",
	storageBucket: "moim-money-app.firebasestorage.app",
	messagingSenderId: "126606816398",
	appId: "1:126606816398:web:b055b5e03f39fd2c0505df",
	measurementId: "G-DP4JT94814", // Analytics용 (선택사항)
};

// Firebase 앱 초기화
const app = initializeApp(firebaseConfig);

// Firebase Auth 초기화 (크로스 플랫폼 호환)
export const auth = getAuth(app);

// Firebase 서비스 인스턴스 생성
export const db = getFirestore(app);
// export const storage = getStorage(app); // Storage는 나중에 필요할 때 추가
export const functions = getFunctions(app);

export default app;
