// 사용자 타입
export interface User {
	uid: string;
	email: string | null;
	displayName: string | null;
	photoURL: string | null;
	createdAt?: Date;
	updatedAt?: Date;
}

// 모임 타입
export interface Group {
	id: string;
	name: string;
	members: string[];
	createdBy?: string;
	inviteCode?: string; // 참여 코드 추가
	description?: string;
	currency?: string;
	createdAt: Date;
	updatedAt?: Date;
}

// 거래 내역 타입
export interface Transaction {
	id: string;
	groupId: string;
	userId: string;
	amount: number;
	type: "income" | "expense";
	categoryId: string;
	memo?: string;
	date: Date;
	createdAt: Date;
	updatedAt: Date;
}

// 카테고리 타입
export interface Category {
	id: string;
	groupId: string;
	name: string;
	icon?: string;
	color?: string;
	isDefault: boolean;
	createdAt: Date;
}

// 초대장 타입
export interface Invitation {
	id: string;
	groupId: string;
	email?: string;
	phone?: string;
	status: "pending" | "accepted" | "rejected" | "expired";
	createdAt: Date;
	expiresAt: Date;
}

// 예산 관련 타입
export interface Budget {
	id: string;
	groupId: string;
	year: number;
	month: number;
	totalBudget: number;
	totalSpent: number;
	remainingBudget: number;
	createdAt: Date;
	updatedAt: Date;
}

export interface BudgetSummary {
	budget: Budget;
	categoryBudgets: any[]; // 빈 배열로 유지 (기존 코드 호환성)
	totalSpent: number;
	totalRemaining: number;
	overspentCategories: any[]; // 빈 배열로 유지 (기존 코드 호환성)
}
