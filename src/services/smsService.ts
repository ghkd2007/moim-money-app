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
		return false;
	}
};

/**
 * SMS 권한 요청
 */
export const requestSMSPermission = async (): Promise<boolean> => {
	if (Platform.OS === "web") {
		// 웹에서는 권한 요청 스킵
		return true;
	}

	try {
		const { status } = await Notifications.requestPermissionsAsync();
		return status === "granted";
	} catch (error) {
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

		// 다양한 은행/카드사 SMS 패턴 분석
		const bankPatterns = [
			// 신한카드 패턴
			{
				regex: /\[신한카드\].*?(\d{1,3}(?:,\d{3})*원).*?결제/,
				bank: "신한카드",
			},
			// KB국민카드 패턴
			{
				regex: /\[KB국민카드\].*?(\d{1,3}(?:,\d{3})*원).*?결제/,
				bank: "KB국민카드",
			},
			// 삼성카드 패턴
			{
				regex: /\[삼성카드\].*?(\d{1,3}(?:,\d{3})*원).*?결제/,
				bank: "삼성카드",
			},
			// 현대카드 패턴
			{
				regex: /\[현대카드\].*?(\d{1,3}(?:,\d{3})*원).*?결제/,
				bank: "현대카드",
			},
			// BC카드 패턴
			{
				regex: /\[BC카드\].*?(\d{1,3}(?:,\d{3})*원).*?결제/,
				bank: "BC카드",
			},
			// 일반적인 금액 패턴 (백업)
			{
				regex: /(\d{1,3}(?:,\d{3})*원)/,
				bank: "기타",
			},
		];

		let amount = 0;
		let matchedAmount = "";
		let detectedBank = "기타";

		// 은행별 패턴 매칭
		for (const pattern of bankPatterns) {
			const match = cleanBody.match(pattern.regex);
			if (match) {
				matchedAmount = match[1];
				detectedBank = pattern.bank;
				// 금액에서 숫자만 추출
				const numericAmount = match[1].replace(/[^\d.]/g, "");
				amount = parseFloat(numericAmount);
				console.log(
					"smsService: 은행 패턴 매치:",
					detectedBank,
					matchedAmount,
					"->",
					amount
				);
				break;
			}
		}

		if (amount === 0) {
			console.log("smsService: 금액을 찾을 수 없음");
			return null; // 금액을 찾을 수 없음
		}

		// 가맹점명 추출
		let merchant = "기타";
		const merchantPatterns = [
			/\[.*?\]\s*\d{2}\/\d{2}\s*\d{2}:\d{2}\s*(.*?)\s*결제/, // [은행] 날짜 시간 가맹점 결제
			/결제\s*(.*?)\s*\d{1,3}(?:,\d{3})*원/, // 결제 가맹점 금액
			/사용\s*(.*?)\s*\d{1,3}(?:,\d{3})*원/, // 사용 가맹점 금액
		];

		for (const pattern of merchantPatterns) {
			const match = cleanBody.match(pattern);
			if (match && match[1]) {
				merchant = match[1].trim();
				break;
			}
		}

		// 카테고리 자동 분류
		let category = "기타";
		const categoryKeywords = {
			식비: [
				"식당",
				"카페",
				"음식",
				"배달",
				"푸드",
				"레스토랑",
				"맛집",
				"치킨",
				"피자",
				"햄버거",
			],
			교통: [
				"버스",
				"지하철",
				"택시",
				"기차",
				"교통",
				"대중교통",
				"주유소",
				"충전소",
				"주차",
			],
			쇼핑: [
				"쇼핑",
				"마트",
				"편의점",
				"백화점",
				"온라인",
				"구매",
				"스토어",
				"몰",
			],
			의료: ["병원", "약국", "의료", "치료", "진료", "치과", "안과"],
			교육: ["학원", "교육", "강의", "수업", "책", "도서", "서점"],
			엔터테인먼트: [
				"영화",
				"게임",
				"놀이",
				"레저",
				"스포츠",
				"놀이공원",
				"공연",
			],
			통신: ["통신", "인터넷", "모바일", "요금"],
			주거: ["월세", "관리비", "전기세", "가스비", "수도세"],
		};

		for (const [cat, keywords] of Object.entries(categoryKeywords)) {
			if (
				keywords.some(
					(keyword) => merchant.includes(keyword) || cleanBody.includes(keyword)
				)
			) {
				category = cat;
				break;
			}
		}

		// 날짜 추출 (SMS 발신 시간 사용)
		const date = new Date();

		// 신뢰도 계산
		let confidence = 0.5; // 기본값
		if (detectedBank !== "기타") confidence += 0.2; // 은행 인식 성공
		if (merchant !== "기타") confidence += 0.2; // 가맹점 인식 성공
		if (category !== "기타") confidence += 0.1; // 카테고리 자동 분류 성공

		const parsedExpense: ParsedExpense = {
			amount,
			description: `${detectedBank} ${merchant} 결제`,
			category,
			date,
			confidence: Math.min(confidence, 1.0),
		};

		console.log(
			"smsService: 파싱 완료:",
			JSON.stringify(parsedExpense, null, 2)
		);
		return parsedExpense;
	} catch (error) {
		console.error("smsService: SMS 파싱 실패:", error);
		return null;
	}
};

/**
 * SMS 메시지 필터링
 */
export const filterSMSMessages = (
	messages: SMSMessage[],
	options: SMSFilterOptions = {}
): SMSMessage[] => {
	let filteredMessages = [...messages];

	// 날짜 필터링
	if (options.startDate) {
		filteredMessages = filteredMessages.filter(
			(msg) => msg.date >= options.startDate!
		);
	}
	if (options.endDate) {
		filteredMessages = filteredMessages.filter(
			(msg) => msg.date <= options.endDate!
		);
	}

	// 발신자 필터링
	if (options.addresses && options.addresses.length > 0) {
		filteredMessages = filteredMessages.filter((msg) =>
			options.addresses!.some((addr) =>
				msg.address.toLowerCase().includes(addr.toLowerCase())
			)
		);
	}

	// 키워드 필터링
	if (options.keywords && options.keywords.length > 0) {
		filteredMessages = filteredMessages.filter((msg) =>
			options.keywords!.some((keyword) =>
				msg.body.toLowerCase().includes(keyword.toLowerCase())
			)
		);
	}

	// 최대 개수 제한
	if (options.maxCount && filteredMessages.length > options.maxCount) {
		filteredMessages = filteredMessages.slice(0, options.maxCount);
	}

	return filteredMessages;
};

/**
 * 은행/카드사별 SMS 패턴 확장
 */
export const BANK_SMS_PATTERNS = {
	// 신한카드
	SHINHAN: {
		patterns: [
			/\[신한카드\].*?(\d{1,3}(?:,\d{3})*원).*?결제/,
			/신한카드.*?(\d{1,3}(?:,\d{3})*원).*?승인/,
			/신한카드.*?(\d{1,3}(?:,\d{3})*원).*?사용/,
		],
		name: "신한카드",
		priority: 1,
	},
	// KB국민
	KB: {
		patterns: [
			/\[KB국민카드\].*?(\d{1,3}(?:,\d{3})*원).*?결제/,
			/KB국민.*?(\d{1,3}(?:,\d{3})*원).*?승인/,
			/KB국민.*?(\d{1,3}(?:,\d{3})*원).*?사용/,
		],
		name: "KB국민카드",
		priority: 1,
	},
	// 삼성카드
	SAMSUNG: {
		patterns: [
			/\[삼성카드\].*?(\d{1,3}(?:,\d{3})*원).*?결제/,
			/삼성카드.*?(\d{1,3}(?:,\d{3})*원).*?승인/,
			/삼성카드.*?(\d{1,3}(?:,\d{3})*원).*?사용/,
		],
		name: "삼성카드",
		priority: 1,
	},
	// 현대카드
	HYUNDAI: {
		patterns: [
			/\[현대카드\].*?(\d{1,3}(?:,\d{3})*원).*?결제/,
			/현대카드.*?(\d{1,3}(?:,\d{3})*원).*?승인/,
			/현대카드.*?(\d{1,3}(?:,\d{3})*원).*?사용/,
		],
		name: "현대카드",
		priority: 1,
	},
	// BC카드
	BC: {
		patterns: [
			/\[BC카드\].*?(\d{1,3}(?:,\d{3})*원).*?결제/,
			/BC카드.*?(\d{1,3}(?:,\d{3})*원).*?승인/,
			/BC카드.*?(\d{1,3}(?:,\d{3})*원).*?사용/,
		],
		name: "BC카드",
		priority: 1,
	},
	// 롯데카드
	LOTTE: {
		patterns: [
			/\[롯데카드\].*?(\d{1,3}(?:,\d{3})*원).*?결제/,
			/롯데카드.*?(\d{1,3}(?:,\d{3})*원).*?승인/,
			/롯데카드.*?(\d{1,3}(?:,\d{3})*원).*?사용/,
		],
		name: "롯데카드",
		priority: 2,
	},
	// 하나카드
	HANA: {
		patterns: [
			/\[하나카드\].*?(\d{1,3}(?:,\d{3})*원).*?결제/,
			/하나카드.*?(\d{1,3}(?:,\d{3})*원).*?승인/,
			/하나카드.*?(\d{1,3}(?:,\d{3})*원).*?사용/,
		],
		name: "하나카드",
		priority: 2,
	},
};

/**
 * 고급 SMS 파싱 (은행별 패턴 우선순위 적용)
 */
export const parseExpenseFromSMSAdvanced = (
	messageBody: string
): ParsedExpense | null => {
	try {
		console.log("smsService: 고급 SMS 파싱 시작:", messageBody);

		const cleanBody = messageBody.replace(/\s+/g, " ").trim();
		let bestMatch: { bank: string; amount: number; confidence: number } | null =
			null;

		// 우선순위별로 은행 패턴 매칭
		for (const [key, bankInfo] of Object.entries(BANK_SMS_PATTERNS)) {
			for (const pattern of bankInfo.patterns) {
				const match = cleanBody.match(pattern);
				if (match) {
					const amount = parseFloat(match[1].replace(/[^\d.]/g, ""));
					if (amount > 0) {
						const confidence = 0.5 + 0.1 * (3 - bankInfo.priority); // 우선순위에 따른 신뢰도
						if (!bestMatch || confidence > bestMatch.confidence) {
							bestMatch = {
								bank: bankInfo.name,
								amount,
								confidence,
							};
						}
					}
				}
			}
		}

		if (!bestMatch) {
			console.log("smsService: 은행 패턴 매치 실패");
			return null;
		}

		// 가맹점명 추출 (더 정확한 패턴)
		let merchant = "기타";
		const merchantPatterns = [
			/\[.*?\]\s*\d{2}\/\d{2}\s*\d{2}:\d{2}\s*(.*?)\s*결제/, // [은행] 날짜 시간 가맹점 결제
			/결제\s*(.*?)\s*\d{1,3}(?:,\d{3})*원/, // 결제 가맹점 금액
			/사용\s*(.*?)\s*\d{1,3}(?:,\d{3})*원/, // 사용 가맹점 금액
			/승인\s*(.*?)\s*\d{1,3}(?:,\d{3})*원/, // 승인 가맹점 금액
		];

		for (const pattern of merchantPatterns) {
			const match = cleanBody.match(pattern);
			if (match && match[1]) {
				merchant = match[1].trim();
				break;
			}
		}

		// 카테고리 자동 분류 (향상된 키워드)
		let category = "기타";
		const categoryKeywords = {
			식비: [
				"식당",
				"카페",
				"음식",
				"배달",
				"푸드",
				"레스토랑",
				"맛집",
				"치킨",
				"피자",
				"햄버거",
				"분식",
				"일식",
				"중식",
				"양식",
			],
			교통: [
				"버스",
				"지하철",
				"택시",
				"기차",
				"교통",
				"대중교통",
				"주유소",
				"충전소",
				"주차",
				"고속도로",
				"터널",
				"교량",
			],
			쇼핑: [
				"쇼핑",
				"마트",
				"편의점",
				"백화점",
				"온라인",
				"구매",
				"스토어",
				"몰",
				"아울렛",
				"디스카운트",
			],
			의료: [
				"병원",
				"약국",
				"의료",
				"치료",
				"진료",
				"치과",
				"안과",
				"피부과",
				"정형외과",
				"내과",
			],
			교육: [
				"학원",
				"교육",
				"강의",
				"수업",
				"책",
				"도서",
				"서점",
				"도서관",
				"대학교",
				"고등학교",
			],
			엔터테인먼트: [
				"영화",
				"게임",
				"놀이",
				"레저",
				"스포츠",
				"놀이공원",
				"공연",
				"콘서트",
				"전시회",
				"박물관",
			],
			통신: [
				"통신",
				"인터넷",
				"모바일",
				"요금",
				"SKT",
				"KT",
				"LG",
				"SK",
				"통신사",
			],
			주거: [
				"월세",
				"관리비",
				"전기세",
				"가스비",
				"수도세",
				"아파트",
				"빌라",
				"원룸",
				"오피스텔",
			],
		};

		for (const [cat, keywords] of Object.entries(categoryKeywords)) {
			if (
				keywords.some(
					(keyword) =>
						merchant.toLowerCase().includes(keyword.toLowerCase()) ||
						cleanBody.toLowerCase().includes(keyword.toLowerCase())
				)
			) {
				category = cat;
				bestMatch.confidence += 0.1; // 카테고리 매치 시 신뢰도 증가
				break;
			}
		}

		const parsedExpense: ParsedExpense = {
			amount: bestMatch.amount,
			description: `${bestMatch.bank} ${merchant} 결제`,
			category,
			date: new Date(),
			confidence: Math.min(bestMatch.confidence, 1.0),
		};

		console.log(
			"smsService: 고급 파싱 완료:",
			JSON.stringify(parsedExpense, null, 2)
		);
		return parsedExpense;
	} catch (error) {
		console.error("smsService: 고급 SMS 파싱 실패:", error);
		return null;
	}
};

/**
 * 실제 SMS 데이터 타입 (네이티브 모듈에서 반환되는 데이터)
 */
export interface NativeSMSData {
	id: string;
	address: string;
	body: string;
	date: number; // Unix timestamp
	type: "incoming" | "outgoing";
	thread_id?: string;
	read?: boolean;
}

/**
 * SMS 읽기 결과 타입
 */
export interface SMSReadResult {
	success: boolean;
	messages: SMSMessage[];
	error?: string;
	totalCount: number;
	processedCount: number;
}

/**
 * SMS 필터링 옵션
 */
export interface SMSFilterOptions {
	startDate?: Date;
	endDate?: Date;
	addresses?: string[]; // 특정 발신자만 필터링
	keywords?: string[]; // 특정 키워드가 포함된 메시지만 필터링
	maxCount?: number; // 최대 읽을 메시지 수
}

/**
 * 실제 SMS 읽기 인터페이스
 * 실제 구현 시에는 이 인터페이스를 구현하는 네이티브 모듈을 사용
 */
export interface SMSReader {
	readMessages(): Promise<SMSMessage[]>;
	hasPermission(): Promise<boolean>;
	requestPermission(): Promise<boolean>;
}

/**
 * 실제 SMS 읽기 구현체 (현재는 시뮬레이션)
 * 실제 구현 시에는 react-native-sms-retriever 등의 라이브러리 사용
 */
class RealSMSReader implements SMSReader {
	async readMessages(): Promise<SMSMessage[]> {
		// TODO: 실제 SMS 읽기 구현
		// react-native-sms-retriever 또는 다른 네이티브 모듈 사용
		throw new Error(
			"실제 SMS 읽기 기능이 구현되지 않았습니다. 네이티브 모듈을 설치해주세요."
		);
	}

	async hasPermission(): Promise<boolean> {
		return await checkSMSPermission();
	}

	async requestPermission(): Promise<boolean> {
		return await requestSMSPermission();
	}
}

/**
 * 테스트용 SMS 시뮬레이터
 * 개발 및 테스트 시에만 사용
 */
class MockSMSReader implements SMSReader {
	async readMessages(): Promise<SMSMessage[]> {
		// 다양한 은행/카드사 SMS 패턴 시뮬레이션
		const mockMessages: SMSMessage[] = [
			{
				id: "1",
				address: "신한카드",
				body: "[신한카드] 12/15 15:30 식당 ABC 결제 15,000원 승인",
				date: new Date(),
				type: "incoming",
			},
			{
				id: "2",
				address: "KB국민",
				body: "[KB국민카드] 12/15 14:20 편의점 XYZ 결제 8,500원 승인",
				date: new Date(Date.now() - 3600000), // 1시간 전
				type: "incoming",
			},
			{
				id: "3",
				address: "삼성카드",
				body: "[삼성카드] 12/15 13:15 온라인쇼핑몰 결제 32,000원 승인",
				date: new Date(Date.now() - 7200000), // 2시간 전
				type: "incoming",
			},
			{
				id: "4",
				address: "현대카드",
				body: "[현대카드] 12/15 12:00 주유소 결제 45,000원 승인",
				date: new Date(Date.now() - 10800000), // 3시간 전
				type: "incoming",
			},
			{
				id: "5",
				address: "BC카드",
				body: "[BC카드] 12/15 11:30 병원 결제 25,000원 승인",
				date: new Date(Date.now() - 14400000), // 4시간 전
				type: "incoming",
			},
		];
		return mockMessages;
	}

	async hasPermission(): Promise<boolean> {
		return true; // 테스트용이므로 항상 true
	}

	async requestPermission(): Promise<boolean> {
		return true; // 테스트용이므로 항상 true
	}
}

// 환경 설정 (개발/배포 시 SMS 리더 선택)
const SMS_CONFIG = {
	// 개발 환경에서는 MockSMSReader 사용
	// 배포 환경에서는 RealSMSReader 사용
	USE_MOCK_SMS: __DEV__, // 개발 모드일 때만 true
	// 실제 SMS 기능을 테스트하려면 아래를 true로 설정
	FORCE_REAL_SMS: false,
};

/**
 * SMS 설정 관리 유틸리티
 * 개발 및 테스트 시에만 사용
 */
export const SMSConfigManager = {
	/**
	 * Mock SMS 사용 여부 확인
	 */
	isMockEnabled(): boolean {
		return SMS_CONFIG.USE_MOCK_SMS && !SMS_CONFIG.FORCE_REAL_SMS;
	},

	/**
	 * 실제 SMS 강제 사용 설정
	 */
	forceRealSMS(): void {
		SMS_CONFIG.FORCE_REAL_SMS = true;
		console.log("smsService: 실제 SMS 강제 사용 설정됨");
	},

	/**
	 * Mock SMS 사용 설정
	 */
	enableMockSMS(): void {
		SMS_CONFIG.FORCE_REAL_SMS = false;
		console.log("smsService: Mock SMS 사용 설정됨");
	},

	/**
	 * 현재 SMS 설정 상태 출력
	 */
	getConfigStatus(): string {
		return `Mock: ${this.isMockEnabled()}, Real: ${!this.isMockEnabled()}`;
	},
};

// 개발 환경에서만 전역 객체에 노출 (디버깅용)
if (__DEV__) {
	(global as any).SMSConfigManager = SMSConfigManager;
	(global as any).SMSDebugTools = {
		// 중복 방지 테스트용 함수들
		testDuplicatePrevention: () => {
			console.log("smsService: 중복 방지 테스트 시작");
			const testExpense1 = {
				amount: 15000,
				description: "신한카드 식당 결제",
				category: "식비",
				date: new Date(),
				confidence: 0.9,
			};
			const testExpense2 = {
				amount: 15000,
				description: "신한카드 식당 결제",
				category: "식비",
				date: new Date(),
				confidence: 0.9,
			};

			// 동일한 지출이 중복으로 인식되는지 테스트
			const id1 = `${testExpense1.amount}_${testExpense1.description}_${
				testExpense1.date.toISOString().split("T")[0]
			}`;
			const id2 = `${testExpense2.amount}_${testExpense2.description}_${
				testExpense2.date.toISOString().split("T")[0]
			}`;

			console.log("smsService: 테스트 지출 ID 1:", id1);
			console.log("smsService: 테스트 지출 ID 2:", id2);
			console.log("smsService: 중복 여부:", id1 === id2);
		},

		// MockSMSReader 재설정
		resetMockSMS: () => {
			console.log("smsService: MockSMSReader 재설정");
			// MockSMSReader의 mockMessages를 새로운 데이터로 교체
		},
	};

	console.log(
		"smsService: 개발 모드 - SMSConfigManager와 SMSDebugTools가 전역 객체에 노출됨"
	);
	console.log("smsService: SMS 설정 상태:", SMSConfigManager.getConfigStatus());
	console.log(
		"smsService: 중복 방지 테스트 - SMSDebugTools.testDuplicatePrevention() 실행"
	);
}

// 현재 사용할 SMS 리더 선택
const smsReader: SMSReader =
	SMS_CONFIG.USE_MOCK_SMS && !SMS_CONFIG.FORCE_REAL_SMS
		? new MockSMSReader()
		: new RealSMSReader();

console.log(
	`smsService: SMS 리더 초기화 - Mock: ${SMS_CONFIG.USE_MOCK_SMS}, Real: ${
		!SMS_CONFIG.USE_MOCK_SMS || SMS_CONFIG.FORCE_REAL_SMS
	}`
);

/**
 * SMS 메시지 읽기 (권한 확인 후)
 */
export const readSMSMessages = async (): Promise<SMSMessage[]> => {
	try {
		console.log("smsService: SMS 메시지 읽기 시작");

		// 권한 확인
		const hasPermission = await smsReader.hasPermission();
		console.log("smsService: 권한 확인 결과:", hasPermission);

		if (!hasPermission) {
			console.log("smsService: 권한 요청 시작");
			const granted = await smsReader.requestPermission();
			console.log("smsService: 권한 요청 결과:", granted);
			if (!granted) {
				throw new Error("SMS 권한이 필요합니다.");
			}
		}

		// SMS 메시지 읽기
		const messages = await smsReader.readMessages();

		console.log("smsService: SMS 메시지 읽기 완료:", messages.length, "개");
		return messages;
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
