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
