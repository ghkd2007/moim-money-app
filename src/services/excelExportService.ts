import * as XLSX from "xlsx";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { Transaction, Group, User } from "../types";
import { formatDate, formatCurrency } from "../utils";
import { getCurrentUser } from "./authService";
import { userService } from "./dataService";

export interface ExportOptions {
	startDate?: Date;
	endDate?: Date;
	groupId?: string;
	groupName?: string;
}

// 실제 사용자 정보 로드
const loadGroupMembersInfo = async (
	group: Group
): Promise<{ [key: string]: User }> => {
	const membersInfo: { [key: string]: User } = {};

	for (const memberId of group.members) {
		try {
			const memberData = await userService.getById(memberId);
			if (memberData) {
				membersInfo[memberId] = memberData;
			}
		} catch (error) {
			console.error(`멤버 ${memberId} 정보 조회 실패:`, error);
			// 기본 정보 설정
			membersInfo[memberId] = {
				uid: memberId,
				email: null,
				displayName: `사용자 ${memberId.substring(0, 6)}`,
				photoURL: null,
			};
		}
	}

	return membersInfo;
};

// 사용자 표시명 가져오기 (실제 계정 정보 사용)
const getUserDisplayName = (
	userId: string,
	groupMembersInfo: { [key: string]: User }
): string => {
	if (!userId) return "알 수 없음";

	const memberInfo = groupMembersInfo[userId];
	if (memberInfo) {
		// displayName이 있으면 사용, 없으면 이메일의 @ 앞부분 사용
		if (memberInfo.displayName) {
			return memberInfo.displayName;
		} else if (memberInfo.email) {
			return memberInfo.email.split("@")[0];
		}
	}

	return "사용자";
};

// 거래내역을 엑셀 데이터로 변환
const transformTransactionsToExcelData = (
	transactions: Transaction[],
	groupMembersInfo: { [key: string]: User }
): any[] => {
	const excelData = transactions.map((transaction) => ({
		날짜: formatDate(transaction.date),
		구분: transaction.type === "income" ? "수입" : "지출",
		카테고리: transaction.categoryId,
		금액: transaction.amount,
		메모: transaction.memo || "",
		작성자: getUserDisplayName(transaction.userId, groupMembersInfo),
	}));

	return excelData;
};

// 파일명 생성
const generateFileName = (options: ExportOptions): string => {
	const now = new Date();
	const dateStr = now.toISOString().split("T")[0].replace(/-/g, "");

	let periodStr = "";
	if (options.startDate && options.endDate) {
		const start = options.startDate.toISOString().split("T")[0];
		const end = options.endDate.toISOString().split("T")[0];
		periodStr = `_${start}_${end}`;
	} else {
		periodStr = `_전체`;
	}

	const groupStr = options.groupName ? `_${options.groupName}` : "";

	return `모임머니_거래내역${groupStr}${periodStr}_${dateStr}.xlsx`;
};

// 엑셀 파일 생성 및 내보내기
export const exportTransactionsToExcel = async (
	transactions: Transaction[],
	group: Group,
	options: ExportOptions = {}
): Promise<void> => {
	try {
		if (transactions.length === 0) {
			throw new Error("내보낼 거래내역이 없습니다.");
		}

		// 그룹 멤버들의 실제 정보 로드
		const groupMembersInfo = await loadGroupMembersInfo(group);

		// 거래내역을 엑셀 데이터로 변환
		const excelData = transformTransactionsToExcelData(
			transactions,
			groupMembersInfo
		);

		// 워크북 생성
		const workbook = XLSX.utils.book_new();

		// 워크시트 생성
		const worksheet = XLSX.utils.json_to_sheet(excelData);

		// 컬럼 너비 설정
		const columnWidths = [
			{ wch: 12 }, // 날짜
			{ wch: 8 }, // 구분
			{ wch: 15 }, // 카테고리
			{ wch: 12 }, // 금액
			{ wch: 20 }, // 메모
			{ wch: 10 }, // 작성자
		];
		worksheet["!cols"] = columnWidths;

		// 워크시트를 워크북에 추가
		XLSX.utils.book_append_sheet(workbook, worksheet, "거래내역");

		// 파일명 생성
		const fileName = generateFileName(options);

		// 엑셀 파일을 바이너리로 변환
		const excelBuffer = XLSX.write(workbook, {
			type: "array",
			bookType: "xlsx",
		});

		// 파일 경로 설정
		const fileUri = `${FileSystem.documentDirectory}${fileName}`;

		// 바이너리 데이터를 Base64로 인코딩
		const base64Data = btoa(
			new Uint8Array(excelBuffer).reduce(
				(data, byte) => data + String.fromCharCode(byte),
				""
			)
		);

		// 파일 저장
		await FileSystem.writeAsStringAsync(fileUri, base64Data, {
			encoding: FileSystem.EncodingType.Base64,
		});

		// 파일 공유
		const isAvailable = await Sharing.isAvailableAsync();
		if (isAvailable) {
			await Sharing.shareAsync(fileUri, {
				mimeType:
					"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
				dialogTitle: "거래내역 엑셀 파일 내보내기",
			});
		} else {
			throw new Error("파일 공유 기능을 사용할 수 없습니다.");
		}
	} catch (error) {
		console.error("엑셀 내보내기 오류:", error);
		throw error;
	}
};

// 내보내기 옵션 검증
export const validateExportOptions = (
	options: ExportOptions
): string | null => {
	if (options.startDate && options.endDate) {
		if (options.startDate > options.endDate) {
			return "시작 날짜가 종료 날짜보다 늦을 수 없습니다.";
		}

		const daysDiff = Math.ceil(
			(options.endDate.getTime() - options.startDate.getTime()) /
				(1000 * 60 * 60 * 24)
		);
		if (daysDiff > 365) {
			return "내보내기 기간은 최대 1년까지 가능합니다.";
		}
	}

	return null;
};

// 미리 정의된 기간 옵션
export const getPredefinedPeriods = (): {
	label: string;
	startDate: Date;
	endDate: Date;
}[] => {
	const now = new Date();
	const currentYear = now.getFullYear();
	const currentMonth = now.getMonth();

	return [
		{
			label: "이번 달",
			startDate: new Date(currentYear, currentMonth, 1),
			endDate: new Date(currentYear, currentMonth + 1, 0),
		},
		{
			label: "지난 달",
			startDate: new Date(currentYear, currentMonth - 1, 1),
			endDate: new Date(currentYear, currentMonth, 0),
		},
		{
			label: "최근 3개월",
			startDate: new Date(currentYear, currentMonth - 2, 1),
			endDate: new Date(currentYear, currentMonth + 1, 0),
		},
		{
			label: "올해",
			startDate: new Date(currentYear, 0, 1),
			endDate: new Date(currentYear, 11, 31),
		},
	];
};
