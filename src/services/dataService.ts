// 실제 Firestore 데이터베이스 서비스
import {
	collection,
	doc,
	addDoc,
	updateDoc,
	deleteDoc,
	getDoc,
	getDocs,
	query,
	where,
	orderBy,
	limit,
	onSnapshot,
	Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import { Transaction, Group, User, Category } from "../types";

// 거래 내역 관련 서비스
export const transactionService = {
	// 거래 내역 추가
	async create(
		transaction: Omit<Transaction, "id" | "createdAt" | "updatedAt">
	): Promise<string> {
		try {
			console.log("transactionService: 거래 내역 추가 시작");
			console.log(
				"transactionService: 입력 데이터:",
				JSON.stringify(transaction, null, 2)
			);
			console.log("transactionService: db 객체 타입:", typeof db);
			console.log(
				"transactionService: collection 함수 타입:",
				typeof collection
			);

			const transactionsCollection = collection(db, "transactions");
			console.log("transactionService: 컬렉션 참조 생성 완료");

			const transactionData = {
				...transaction,
				date: Timestamp.fromDate(transaction.date),
				createdAt: Timestamp.now(),
				updatedAt: Timestamp.now(),
			};
			console.log(
				"transactionService: Firestore용 데이터 변환 완료:",
				JSON.stringify(transactionData, null, 2)
			);

			console.log("transactionService: addDoc 호출 직전");
			const docRef = await addDoc(transactionsCollection, transactionData);
			console.log("transactionService: addDoc 호출 완료, 문서 ID:", docRef.id);

			return docRef.id;
		} catch (error) {
			console.error("transactionService: 거래 내역 추가 오류:", error);
			console.error(
				"transactionService: 오류 상세 정보:",
				error.message,
				error.stack
			);
			throw new Error("거래 내역을 저장할 수 없습니다.");
		}
	},

	// 그룹별 거래 내역 조회
	async getByGroup(
		groupId: string,
		limitCount: number = 50
	): Promise<Transaction[]> {
		try {
			// 임시로 orderBy 제거 (인덱스 생성 전까지)
			const q = query(
				collection(db, "transactions"),
				where("groupId", "==", groupId),
				limit(limitCount)
			);

			const querySnapshot = await getDocs(q);
			return querySnapshot.docs.map((doc) => ({
				id: doc.id,
				...doc.data(),
				date: doc.data().date.toDate(),
				createdAt: doc.data().createdAt.toDate(),
				updatedAt: doc.data().updatedAt.toDate(),
			})) as Transaction[];
		} catch (error) {
			console.error("거래 내역 조회 오류:", error);
			throw new Error("거래 내역을 불러올 수 없습니다.");
		}
	},

	// 월별 거래 내역 조회
	async getByMonth(
		groupId: string,
		year: number,
		month: number
	): Promise<Transaction[]> {
		try {
			const startDate = new Date(year, month - 1, 1);
			const endDate = new Date(year, month, 0, 23, 59, 59);

			// 임시로 범위 쿼리 제거 (인덱스 생성 전까지)
			// 모든 거래 내역을 가져온 후 클라이언트에서 필터링
			const q = query(
				collection(db, "transactions"),
				where("groupId", "==", groupId)
			);

			const querySnapshot = await getDocs(q);
			const allTransactions = querySnapshot.docs.map((doc) => ({
				id: doc.id,
				...doc.data(),
				date: doc.data().date.toDate(),
				createdAt: doc.data().createdAt.toDate(),
				updatedAt: doc.data().updatedAt.toDate(),
			})) as Transaction[];

			// 클라이언트에서 날짜 필터링
			return allTransactions
				.filter(
					(transaction) =>
						transaction.date >= startDate && transaction.date <= endDate
				)
				.sort((a, b) => b.date.getTime() - a.date.getTime()); // 최신순 정렬
		} catch (error) {
			console.error("월별 거래 내역 조회 오류:", error);
			throw new Error("월별 거래 내역을 불러올 수 없습니다.");
		}
	},

	// 거래 내역 수정
	async update(id: string, updates: Partial<Transaction>): Promise<void> {
		try {
			const docRef = doc(db, "transactions", id);
			await updateDoc(docRef, {
				...updates,
				updatedAt: Timestamp.now(),
			});
		} catch (error) {
			console.error("거래 내역 수정 오류:", error);
			throw new Error("거래 내역을 수정할 수 없습니다.");
		}
	},

	// 거래 내역 삭제
	async delete(id: string): Promise<void> {
		try {
			await deleteDoc(doc(db, "transactions", id));
		} catch (error) {
			console.error("거래 내역 삭제 오류:", error);
			throw new Error("거래 내역을 삭제할 수 없습니다.");
		}
	},

	// 실시간 거래 내역 구독
	subscribeToGroup(
		groupId: string,
		callback: (transactions: Transaction[]) => void
	) {
		const q = query(
			collection(db, "transactions"),
			where("groupId", "==", groupId),
			orderBy("date", "desc"),
			limit(100)
		);

		return onSnapshot(q, (querySnapshot) => {
			const transactions = querySnapshot.docs.map((doc) => ({
				id: doc.id,
				...doc.data(),
				date: doc.data().date.toDate(),
				createdAt: doc.data().createdAt.toDate(),
				updatedAt: doc.data().updatedAt.toDate(),
			})) as Transaction[];

			callback(transactions);
		});
	},
};

// 그룹 관련 서비스
export const groupService = {
	// 그룹 생성
	async create(group: Omit<Group, "id" | "createdAt">): Promise<string> {
		try {
			console.log("dataService.create 호출됨:", group);
			const docRef = await addDoc(collection(db, "groups"), {
				...group,
				createdAt: Timestamp.now(),
			});
			console.log("Firestore 문서 생성 성공:", docRef.id);

			// 그룹 생성 후 기본 카테고리 생성
			await categoryService.createDefaultCategories(docRef.id);

			return docRef.id;
		} catch (error) {
			console.error("그룹 생성 오류:", error);
			throw new Error("그룹을 생성할 수 없습니다.");
		}
	},

	// 그룹 조회
	async getById(id: string): Promise<Group | null> {
		try {
			const docRef = doc(db, "groups", id);
			const docSnap = await getDoc(docRef);

			if (docSnap.exists()) {
				return {
					id: docSnap.id,
					...docSnap.data(),
					createdAt: docSnap.data().createdAt.toDate(),
				} as Group;
			}
			return null;
		} catch (error) {
			console.error("그룹 조회 오류:", error);
			throw new Error("그룹 정보를 불러올 수 없습니다.");
		}
	},

	// 사용자가 속한 그룹 목록 조회
	async getByUser(userId: string): Promise<Group[]> {
		try {
			console.log("groupService: getByUser 호출됨, userId:", userId);
			console.log("groupService: db 객체:", typeof db);
			console.log("groupService: collection 함수:", typeof collection);

			// 임시로 orderBy 제거 (인덱스 생성 전까지)
			const q = query(
				collection(db, "groups"),
				where("members", "array-contains", userId)
			);
			console.log("groupService: 쿼리 생성 완료");

			console.log("groupService: getDocs 호출 직전");
			const querySnapshot = await getDocs(q);
			console.log(
				"groupService: getDocs 호출 완료, 문서 수:",
				querySnapshot.docs.length
			);

			const groups = querySnapshot.docs.map((doc) => ({
				id: doc.id,
				...doc.data(),
				createdAt: doc.data().createdAt.toDate(),
			})) as Group[];

			console.log("groupService: 반환할 그룹 목록:", groups);
			return groups;
		} catch (error) {
			console.error("groupService: 사용자 그룹 조회 오류:", error);
			console.error(
				"groupService: 오류 상세 정보:",
				error.message,
				error.stack
			);
			throw new Error("그룹 목록을 불러올 수 없습니다.");
		}
	},

	// 그룹에 멤버 추가
	async addMember(groupId: string, userId: string): Promise<void> {
		try {
			const docRef = doc(db, "groups", groupId);
			const docSnap = await getDoc(docRef);

			if (docSnap.exists()) {
				const currentMembers = docSnap.data().members || [];
				if (!currentMembers.includes(userId)) {
					await updateDoc(docRef, {
						members: [...currentMembers, userId],
					});
				}
			}
		} catch (error) {
			console.error("멤버 추가 오류:", error);
			throw new Error("멤버를 추가할 수 없습니다.");
		}
	},

	// 그룹에서 멤버 제거
	async removeMember(groupId: string, userId: string): Promise<void> {
		try {
			const docRef = doc(db, "groups", groupId);
			const docSnap = await getDoc(docRef);

			if (docSnap.exists()) {
				const currentMembers = docSnap.data().members || [];
				await updateDoc(docRef, {
					members: currentMembers.filter((member: string) => member !== userId),
				});
			}
		} catch (error) {
			console.error("멤버 제거 오류:", error);
			throw new Error("멤버를 제거할 수 없습니다.");
		}
	},

	// 참여 코드로 그룹 찾기
	async findByInviteCode(inviteCode: string): Promise<Group | null> {
		try {
			const q = query(
				collection(db, "groups"),
				where("inviteCode", "==", inviteCode)
			);

			const querySnapshot = await getDocs(q);
			if (querySnapshot.empty) {
				return null;
			}

			const doc = querySnapshot.docs[0];
			return {
				id: doc.id,
				...doc.data(),
				createdAt: doc.data().createdAt.toDate(),
			} as Group;
		} catch (error) {
			console.error("참여 코드로 그룹 찾기 오류:", error);
			throw new Error("그룹을 찾을 수 없습니다.");
		}
	},
};

// 사용자 관련 서비스
export const userService = {
	// 사용자 정보 조회
	async getById(id: string): Promise<User | null> {
		try {
			const docRef = doc(db, "users", id);
			const docSnap = await getDoc(docRef);

			if (docSnap.exists()) {
				return {
					uid: docSnap.id,
					...docSnap.data(),
				} as User;
			}
			return null;
		} catch (error) {
			console.error("사용자 조회 오류:", error);
			throw new Error("사용자 정보를 불러올 수 없습니다.");
		}
	},

	// 여러 사용자 정보 조회
	async getByIds(ids: string[]): Promise<User[]> {
		try {
			const users: User[] = [];

			for (const id of ids) {
				const user = await this.getById(id);
				if (user) users.push(user);
			}

			return users;
		} catch (error) {
			console.error("사용자 목록 조회 오류:", error);
			throw new Error("사용자 목록을 불러올 수 없습니다.");
		}
	},
};

// 카테고리 관련 서비스
export const categoryService = {
	// 그룹별 카테고리 목록 조회
	async getByGroup(groupId: string): Promise<Category[]> {
		try {
			console.log("categoryService: getByGroup 호출됨, groupId:", groupId);
			console.log("categoryService: db 객체:", typeof db);
			console.log("categoryService: collection 함수:", typeof collection);

			const q = query(
				collection(db, "categories"),
				where("groupId", "==", groupId)
			);
			console.log("categoryService: 쿼리 생성 완료");

			console.log("categoryService: getDocs 호출 직전");
			const querySnapshot = await getDocs(q);
			console.log(
				"categoryService: getDocs 호출 완료, 문서 수:",
				querySnapshot.docs.length
			);

			const categories = querySnapshot.docs.map((doc) => ({
				id: doc.id,
				...doc.data(),
				createdAt: doc.data().createdAt.toDate(),
			})) as Category[];

			console.log("categoryService: 반환할 카테고리 목록:", categories);
			return categories;
		} catch (error) {
			console.error("categoryService: 카테고리 조회 오류:", error);
			console.error(
				"categoryService: 오류 상세 정보:",
				error.message,
				error.stack
			);
			throw new Error("카테고리를 불러올 수 없습니다.");
		}
	},

	// 카테고리 생성
	async create(category: Omit<Category, "id" | "createdAt">): Promise<string> {
		try {
			const docRef = await addDoc(collection(db, "categories"), {
				...category,
				createdAt: Timestamp.now(),
			});
			return docRef.id;
		} catch (error) {
			console.error("카테고리 생성 오류:", error);
			throw new Error("카테고리를 생성할 수 없습니다.");
		}
	},

	// 카테고리 수정
	async update(id: string, updates: Partial<Category>): Promise<void> {
		try {
			const docRef = doc(db, "categories", id);
			await updateDoc(docRef, {
				...updates,
				updatedAt: Timestamp.now(),
			});
		} catch (error) {
			console.error("카테고리 수정 오류:", error);
			throw new Error("카테고리를 수정할 수 없습니다.");
		}
	},

	// 카테고리 삭제
	async delete(id: string): Promise<void> {
		try {
			const docRef = doc(db, "categories", id);
			await deleteDoc(docRef);
		} catch (error) {
			console.error("카테고리 삭제 오류:", error);
			throw new Error("카테고리를 삭제할 수 없습니다.");
		}
	},

	// 테스트용 기본 카테고리 생성 (그룹 생성 시 호출)
	async createDefaultCategories(groupId: string): Promise<void> {
		try {
			const defaultCategories = [
				{ name: "커피", icon: "☕", color: "#8B4513", isDefault: true },
				{ name: "점심", icon: "🍱", color: "#FF6B35", isDefault: true },
				{ name: "저녁", icon: "🍽️", color: "#FF8C42", isDefault: true },
				{ name: "간식", icon: "🍪", color: "#FFB347", isDefault: true },
				{ name: "교통", icon: "🚇", color: "#4ECDC4", isDefault: true },
			];

			for (const category of defaultCategories) {
				await this.create({
					...category,
					groupId,
				});
			}
		} catch (error) {
			console.error("기본 카테고리 생성 오류:", error);
		}
	},
};
