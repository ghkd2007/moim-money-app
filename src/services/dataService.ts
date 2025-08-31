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
	setDoc,
} from "firebase/firestore";
import { db } from "./firebase";
import {
	Transaction,
	Group,
	User,
	Category,
	Budget,
	CategoryBudget,
	BudgetSummary,
} from "../types";

// 거래 내역 관련 서비스
export const transactionService = {
	// 거래 내역 추가
	async create(
		transaction: Omit<Transaction, "id" | "createdAt" | "updatedAt">
	): Promise<string> {
		try {
			const transactionsCollection = collection(db, "transactions");
			const transactionData = {
				...transaction,
				date: Timestamp.fromDate(transaction.date),
				createdAt: Timestamp.now(),
				updatedAt: Timestamp.now(),
			};

			const docRef = await addDoc(transactionsCollection, transactionData);
			return docRef.id;
		} catch (error) {
			console.error("거래 내역 추가 오류:", error);
			throw new Error("거래 내역을 저장할 수 없습니다.");
		}
	},

	// 그룹별 거래 내역 조회 - 클라이언트에서 정렬
	async getByGroup(
		groupId: string,
		limitCount: number = 50
	): Promise<Transaction[]> {
		try {
			const q = query(
				collection(db, "transactions"),
				where("groupId", "==", groupId),
				limit(limitCount)
			);

			const querySnapshot = await getDocs(q);
			const transactions = querySnapshot.docs.map((doc) => ({
				id: doc.id,
				...doc.data(),
				date: doc.data().date.toDate(),
				createdAt: doc.data().createdAt.toDate(),
				updatedAt: doc.data().updatedAt.toDate(),
			})) as Transaction[];

			// 유효한 거래 내역만 필터링 (amount가 0보다 큰 경우만)
			const validTransactions = transactions.filter(
				(transaction) =>
					transaction.amount > 0 &&
					transaction.amount !== null &&
					transaction.amount !== undefined
			);

			// 클라이언트에서 날짜순 정렬 (최신순)
			return validTransactions.sort(
				(a, b) => b.date.getTime() - a.date.getTime()
			);
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



			const q = query(
				collection(db, "transactions"),
				where("groupId", "==", groupId)
			);

			const querySnapshot = await getDocs(q);


			const allTransactions = querySnapshot.docs.map((doc) => {
				const data = doc.data();
				const transaction = {
					id: doc.id,
					...data,
					date:
						data.date instanceof Timestamp
							? data.date.toDate()
							: new Date(data.date),
					createdAt:
						data.createdAt instanceof Timestamp
							? data.createdAt.toDate()
							: new Date(data.createdAt),
					updatedAt:
						data.updatedAt instanceof Timestamp
							? data.updatedAt.toDate()
							: new Date(data.updatedAt),
				};
				// console.log(`거래 내역: ${transaction.id}, 날짜: ${transaction.date.toISOString()}, 카테고리: ${transaction.categoryId}`);
				return transaction;
			}) as Transaction[];

			// 클라이언트에서 날짜 필터링
			const filteredTransactions = allTransactions.filter((transaction) => {
				const isInRange =
					transaction.date >= startDate && transaction.date <= endDate;
				// console.log(`날짜 필터링: ${transaction.date.toISOString()} - ${isInRange ? "포함" : "제외"}`);
				return isInRange;
			});

			// console.log(`필터링된 거래 내역 수: ${filteredTransactions.length}`);

			// 최신순 정렬
			return filteredTransactions.sort(
				(a, b) => b.date.getTime() - a.date.getTime()
			);
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

	// 실시간 거래 내역 구독 - 클라이언트에서 정렬
	subscribeToGroup(
		groupId: string,
		callback: (transactions: Transaction[]) => void
	) {
		const q = query(
			collection(db, "transactions"),
			where("groupId", "==", groupId),
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

			// 유효한 거래 내역만 필터링
			const validTransactions = transactions.filter(
				(transaction) =>
					transaction.amount > 0 &&
					transaction.amount !== null &&
					transaction.amount !== undefined
			);

			// 클라이언트에서 날짜순 정렬 (최신순)
			const sortedTransactions = validTransactions.sort(
				(a, b) => b.date.getTime() - a.date.getTime()
			);

			callback(sortedTransactions);
		});
	},
};

// 그룹 관련 서비스
export const groupService = {
	// 그룹 생성
	async create(group: Omit<Group, "id" | "createdAt">): Promise<string> {
		try {
			const docRef = await addDoc(collection(db, "groups"), {
				...group,
				createdAt: Timestamp.now(),
			});

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
			const q = query(
				collection(db, "groups"),
				where("members", "array-contains", userId)
			);

			const querySnapshot = await getDocs(q);
			const groups = querySnapshot.docs.map((doc) => ({
				id: doc.id,
				...doc.data(),
				createdAt: doc.data().createdAt.toDate(),
			})) as Group[];

			return groups;
		} catch (error) {
			console.error("사용자 그룹 조회 오류:", error);
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
			const q = query(
				collection(db, "categories"),
				where("groupId", "==", groupId)
			);

			const querySnapshot = await getDocs(q);
			const categories = querySnapshot.docs.map((doc) => ({
				id: doc.id,
				...doc.data(),
				createdAt: doc.data().createdAt.toDate(),
			})) as Category[];

			return categories;
		} catch (error) {
			console.error("카테고리 조회 오류:", error);
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

// 예산 관리 서비스
export const budgetService = {
	// 월별 예산 생성/수정
	async createOrUpdateBudget(
		groupId: string,
		year: number,
		month: number,
		totalBudget: number
	): Promise<Budget> {
		try {
			const budgetRef = doc(db, "budgets", `${groupId}_${year}_${month}`);
			const budgetDoc = await getDoc(budgetRef);

			const budgetData: Budget = {
				id: budgetRef.id,
				groupId,
				year,
				month,
				totalBudget,
				totalSpent: budgetDoc.exists() ? budgetDoc.data().totalSpent : 0,
				remainingBudget:
					totalBudget - (budgetDoc.exists() ? budgetDoc.data().totalSpent : 0),
				createdAt: budgetDoc.exists() ? budgetDoc.data().createdAt : new Date(),
				updatedAt: new Date(),
			};

			await setDoc(budgetRef, budgetData);
			return budgetData;
		} catch (error) {
			console.error("예산 생성/수정 실패:", error);
			throw new Error("예산 설정에 실패했습니다.");
		}
	},

	// 월별 예산 조회
	async getBudget(
		groupId: string,
		year: number,
		month: number
	): Promise<Budget | null> {
		try {
			const budgetRef = doc(db, "budgets", `${groupId}_${year}_${month}`);
			const budgetDoc = await getDoc(budgetRef);

			if (budgetDoc.exists()) {
				return budgetDoc.data() as Budget;
			}
			return null;
		} catch (error) {
			console.error("예산 조회 실패:", error);
			throw new Error("예산 조회에 실패했습니다.");
		}
	},

	// 예산 요약 정보 조회
	async getBudgetSummary(
		groupId: string,
		year: number,
		month: number
	): Promise<BudgetSummary | null> {
		try {
			const budget = await this.getBudget(groupId, year, month);

			// 실제 지출 금액 계산 (거래 내역에서)
			const transactions = await this.getByGroupAndMonth(groupId, year, month);
			const totalSpent = transactions.reduce((sum, transaction) => {
				if (transaction.type === "expense") {
					return sum + transaction.amount;
				}
				return sum;
			}, 0);

			// 예산이 없으면 기본 요약만 반환
			if (!budget) {
				return {
					budget: {
						id: "default",
						groupId,
						year,
						month,
						totalBudget: 0,
						totalSpent,
						remainingBudget: 0,
						createdAt: new Date(),
						updatedAt: new Date(),
					},
					categoryBudgets: [],
					totalSpent,
					totalRemaining: 0,
					overspentCategories: [],
				};
			}

			return {
				budget: {
					...budget,
					totalSpent,
					remainingBudget: budget.totalBudget - totalSpent,
				},
				categoryBudgets: [],
				totalSpent,
				totalRemaining: budget.totalBudget - totalSpent,
				overspentCategories: [],
			};
		} catch (error) {
			console.error("예산 요약 조회 실패:", error);
			throw new Error("예산 요약 조회에 실패했습니다.");
		}
	},

	// 월별 거래 내역 조회 (예산 계산용)
	async getByGroupAndMonth(
		groupId: string,
		year: number,
		month: number
	): Promise<Transaction[]> {
		try {
			// console.log(`getByGroupAndMonth 호출: groupId=${groupId}, year=${year}, month=${month}`);

			// 임시로 단순 쿼리 사용 (인덱스 생성 전까지)
			const transactionsRef = collection(db, "transactions");
			const q = query(transactionsRef, where("groupId", "==", groupId));

			const querySnapshot = await getDocs(q);


			const allTransactions = querySnapshot.docs.map((doc) => {
				const data = doc.data();
				const transaction = {
					id: doc.id,
					...data,
					date:
						data.date instanceof Timestamp
							? data.date.toDate()
							: new Date(data.date),
					createdAt:
						data.createdAt instanceof Timestamp
							? data.createdAt.toDate()
							: new Date(data.createdAt),
					updatedAt:
						data.updatedAt instanceof Timestamp
							? data.updatedAt.toDate()
							: new Date(data.updatedAt),
				};
				// console.log(`거래 내역: ${transaction.id}, 날짜: ${transaction.date.toISOString()}, 카테고리: ${transaction.categoryId}`);
				return transaction;
			}) as Transaction[];

			// 클라이언트에서 날짜 필터링
			const startDate = new Date(year, month - 1, 1);
			const endDate = new Date(year, month, 0, 23, 59, 59);



			const filteredTransactions = allTransactions.filter((transaction) => {
				const transactionDate = new Date(transaction.date);
				const isInRange =
					transactionDate >= startDate && transactionDate <= endDate;
				// console.log(`날짜 필터링: ${transactionDate.toISOString()} - ${isInRange ? "포함" : "제외"}`);
				return isInRange;
			});

			// console.log(`필터링된 거래 내역 수: ${filteredTransactions.length}`);

			return filteredTransactions;
		} catch (error) {
			console.error("월별 거래 내역 조회 실패:", error);
			throw new Error("월별 거래 내역 조회에 실패했습니다.");
		}
	},
};
