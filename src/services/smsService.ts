import * as Notifications from "expo-notifications";
import { Alert, Platform } from "react-native";

export interface SMSMessage {
	id: string;
	address: string;
	body: string;
	date: Date;
	type: "incoming" | "outgoing";
}

export interface ParsedExpense {
	amount: number;
	description: string;
	category?: string;
	date: Date;
	confidence: number; // 파싱 신뢰도 (0-1)
}

/**
 * SMS 권한 확인
 */
export const checkSMSPermission = async (): Promise<boolean> => {
	if (Platform.OS === "web") {
		// 웹에서는 SMS 권한이 없으므로 항상 true 반환 (테스트용)
		return true;
	}

	try {
		const { status } = await Notifications.getPermissionsAsync();
		return status === "granted";
	} catch (error) {
		console.log("권한 확인 실패:", error);
		return false;
	}
};

/**
 * SMS 권한 요청
 */
export const requestSMSPermission = async (): Promise<boolean> => {
	if (Platform.OS === "web") {
		// 웹에서는 권한 요청 스킵
		console.log("웹 환경에서는 SMS 권한이 지원되지 않습니다.");
		return true;
	}

	try {
		const { status } = await Notifications.requestPermissionsAsync();
		return status === "granted";
	} catch (error) {
		console.log("권한 요청 실패:", error);
		return false;
	}
};

/**
 * SMS 메시지에서 지출 정보 파싱
 */
export const parseExpenseFromSMS = (
	messageBody: string
): ParsedExpense | null => {
	try {
		console.log("smsService: SMS 파싱 시작:", messageBody);

		// 메시지 정리
		const cleanBody = messageBody.replace(/\s+/g, " ").trim();
		console.log("smsService: 정리된 메시지:", cleanBody);

		// 금액 패턴들 (다양한 형식 지원)
		const amountPatterns = [
			/\d{1,3}(,\d{3})*원/, // 15,000원
			/\d+원/, // 15000원
			/\d{1,3}(,\d{3})*/, // 15,000
		];

		let amount = 0;
		let matchedAmount = "";

		for (const pattern of amountPatterns) {
			const match = cleanBody.match(pattern);
			if (match) {
				matchedAmount = match[0];
				// 금액에서 숫자만 추출
				const numericAmount = match[0].replace(/[^\d.]/g, "");
				amount = parseFloat(numericAmount);
				console.log("smsService: 금액 패턴 매치:", matchedAmount, "->", amount);
				break;
			}
		}

		if (amount === 0) {
			console.log("smsService: 금액을 찾을 수 없음");
			return null; // 금액을 찾을 수 없음
		}

		// 카테고리 추출 (은행/카드사별 키워드)
		let category = "기타";
		const categoryKeywords = {
			식비: ["식당", "카페", "음식", "배달", "푸드", "레스토랑", "맛집"],
			교통: ["버스", "지하철", "택시", "기차", "교통", "대중교통"],
			쇼핑: ["쇼핑", "마트", "편의점", "백화점", "온라인", "구매"],
			의료: ["병원", "약국", "의료", "치료", "진료"],
			교육: ["학원", "교육", "강의", "수업", "책", "도서"],
			엔터테인먼트: ["영화", "게임", "놀이", "레저", "스포츠"],
		};

		for (const [cat, keywords] of Object.entries(categoryKeywords)) {
			if (keywords.some((keyword) => cleanBody.includes(keyword))) {
				category = cat;
				console.log("smsService: 카테고리 매치:", cat);
				break;
			}
		}

		// 설명 추출 (은행/카드사명 제거 후 남은 텍스트)
		const bankNames = [
			"신한카드",
			"KB국민",
			"삼성카드",
			"현대카드",
			"롯데카드",
			"BC카드",
			"하나카드",
			"우리카드",
			"NH카드",
			"씨티카드",
			"신한은행",
			"KB국민은행",
			"삼성은행",
			"현대은행",
			"롯데은행",
			"하나은행",
			"우리은행",
			"NH농협은행",
			"씨티은행",
			"기업은행",
			"수신",
			"발신",
			"입금",
			"출금",
			"이체",
			"결제",
		];

		let description = cleanBody;
		for (const bankName of bankNames) {
			description = description.replace(new RegExp(bankName, "g"), "");
		}

		// 금액 정보 제거 (모든 패턴 시도)
		for (const pattern of amountPatterns) {
			description = description.replace(pattern, "");
		}
		description = description.replace(/\s+/g, " ").trim();

		// 설명이 너무 짧으면 기본값 사용
		if (description.length < 3) {
			description = "SMS 자동 인식";
		}

		console.log("smsService: 추출된 설명:", description);

		// 신뢰도 계산 (금액이 명확하고 설명이 충분한 경우 높은 신뢰도)
		let confidence = 0.5;
		if (amount > 0 && description.length > 5) confidence += 0.3;
		if (category !== "기타") confidence += 0.2;

		const result = {
			amount,
			description,
			category,
			date: new Date(),
			confidence: Math.min(confidence, 1.0),
		};

		console.log("smsService: 파싱 결과:", result);
		return result;
	} catch (error) {
		console.error("smsService: SMS 파싱 오류:", error);
		return null;
	}
};

/**
 * SMS 메시지 읽기 (권한 확인 후)
 */
export const readSMSMessages = async (): Promise<SMSMessage[]> => {
	try {
		console.log("smsService: SMS 메시지 읽기 시작");
		const hasPermission = await checkSMSPermission();
		console.log("smsService: 권한 확인 결과:", hasPermission);

		if (!hasPermission) {
			console.log("smsService: 권한 요청 시작");
			const granted = await requestSMSPermission();
			console.log("smsService: 권한 요청 결과:", granted);
			if (!granted) {
				throw new Error("SMS 권한이 필요합니다.");
			}
		}

		// 실제 SMS 읽기 기능은 네이티브 모듈이 필요하므로
		// 여기서는 시뮬레이션된 데이터를 반환
		// 실제 구현시에는 react-native-sms-retriever 등의 라이브러리 사용 필요

		console.log("smsService: 모의 SMS 메시지 생성 시작");
		const mockMessages: SMSMessage[] = [
			{
				id: "1",
				address: "신한카드",
				body: "신한카드 결제 15,000원 (식당)",
				date: new Date(),
				type: "incoming",
			},
			{
				id: "2",
				address: "KB국민",
				body: "KB국민카드 사용 8,500원 편의점",
				date: new Date(Date.now() - 3600000), // 1시간 전
				type: "incoming",
			},
		];

		console.log(
			"smsService: 모의 SMS 메시지 생성 완료:",
			mockMessages.length,
			"개"
		);
		return mockMessages;
	} catch (error) {
		console.error("smsService: SMS 읽기 실패:", error);
		throw error;
	}
};

/**
 * 지출 자동 추가 확인 다이얼로그
 */
export const showExpenseConfirmation = (
	parsedExpense: ParsedExpense,
	onConfirm: () => void,
	onCancel: () => void
) => {
	console.log("smsService: 지출 확인 다이얼로그 표시 시작");
	console.log(
		"smsService: 파싱된 지출:",
		JSON.stringify(parsedExpense, null, 2)
	);
	console.log("smsService: onConfirm 콜백 타입:", typeof onConfirm);
	console.log("smsService: onCancel 콜백 타입:", typeof onCancel);

	// 웹 환경에서는 window.confirm 사용
	if (Platform.OS === "web") {
		console.log("smsService: 웹 환경에서 window.confirm 사용");
		const message =
			`다음 지출을 추가하시겠습니까?\n\n` +
			`💰 금액: ${parsedExpense.amount.toLocaleString()}원\n` +
			`📝 내용: ${parsedExpense.description}\n` +
			`🏷️ 카테고리: ${parsedExpense.category}\n` +
			`📅 날짜: ${parsedExpense.date.toLocaleDateString()}\n\n` +
			`신뢰도: ${Math.round(parsedExpense.confidence * 100)}%`;

		const result = window.confirm(message);
		if (result) {
			console.log("smsService: 웹 환경 - 지출 추가 확인됨");
			onConfirm();
		} else {
			console.log("smsService: 웹 환경 - 지출 추가 취소됨");
			onCancel();
		}
		return;
	}

	// 모바일 환경에서는 기존 Alert.alert 사용
	console.log("smsService: 모바일 환경에서 Alert.alert 사용");
	console.log("smsService: Alert.alert 호출 직전");

	// 약간의 지연을 두어 로그가 먼저 출력되도록 함
	setTimeout(() => {
		Alert.alert(
			"지출 자동 추가",
			`다음 지출을 추가하시겠습니까?\n\n` +
				`💰 금액: ${parsedExpense.amount.toLocaleString()}원\n` +
				`📝 내용: ${parsedExpense.description}\n` +
				`🏷️ 카테고리: ${parsedExpense.category}\n` +
				`📅 날짜: ${parsedExpense.date.toLocaleDateString()}\n\n` +
				`신뢰도: ${Math.round(parsedExpense.confidence * 100)}%`,
			[
				{
					text: "취소",
					style: "cancel",
					onPress: () => {
						console.log("smsService: 지출 추가 취소됨 - onCancel 콜백 실행");
						onCancel();
					},
				},
				{
					text: "추가",
					onPress: () => {
						console.log(
							"smsService: 지출 추가 확인됨 - onConfirm 콜백 실행 시작"
						);
						onConfirm();
						console.log("smsService: onConfirm 콜백 실행 완료");
					},
				},
			],
			{
				cancelable: false, // 뒤로가기로 취소 불가
				onDismiss: () => {
					console.log(
						"smsService: Alert 다이얼로그가 닫힘 (사용자 상호작용 없음)"
					);
				},
			}
		);
		console.log("smsService: Alert.alert 호출 완료");
	}, 100); // 100ms 지연
};
