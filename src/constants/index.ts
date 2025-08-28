// 앱 상수 정의

// 색상 상수 - 모던 다크 테마 (Dribbble 레퍼런스)
export const COLORS = {
		// 기본 보라 팔레트 (다크 배경 최적화)
	primary: "#A855F7", // 더 밝은 보라색으로 가독성 향상
	primaryLight: "#C084FC", 
	primaryDark: "#7C3AED",

	// 네온 그린 액센트
	secondary: "#00FF88",
	secondaryLight: "#34D399",
	secondaryDark: "#059669",

	// 상태 색상
	success: "#00FF88",
	warning: "#F59E0B",
	danger: "#EF4444",

	// 수입/지출 색상
	income: "#00FF88",
	expense: "#EF4444",

	// 다크 배경/서피스
	background: "#0F0F0F",
	backgroundSecondary: "#1A1A1A",
	surface: "#2A2A2A",
	surfaceSecondary: "#3A3A3A",

	// 텍스트 (가독성 개선)
	text: "#F8FAFC", // 순백보다 부드러운 화이트
	textSecondary: "#CBD5E1", // 더 밝은 그레이
	textLight: "#94A3B8", // 중간 톤 그레이

	// 테두리/구분선
	border: "#374151",
	separator: "#1F2937",

	// 글래스 효과용(반투명)
	glass: "rgba(255,255,255,0.08)",
	glassStrong: "rgba(255,255,255,0.15)",

	// 그래디언트 보조값
	gradientStart: "#A855F7",
	gradientEnd: "#C084FC",
} as const;

// 카테고리 아이콘 목록 - 기존 이모티콘 유지
export const CATEGORY_ICONS = [
	// 기본 생활 아이콘
	"🍽️",
	"🚗",
	"🎬",
	"🛍️",
	"🏥",
	"📚",
	"💰",
	"🏠",
	"🎮",
	"✈️",
	"🍺",
	"💄",
	"🎵",
	"📱",
	"💻",
	"🎨",
	"🏃",
	"🧘",
	"🐕",
	"🌱",

	// 음식 관련
	"🍕",
	"🍔",
	"🍜",
	"🍣",
	"🍙",
	"🍪",
	"🍰",
	"🍷",
	"☕",
	"🥤",
	"🍦",
	"🍫",
	"🍎",
	"🍌",
	"🥕",
	"🥩",
	"🍗",
	"🥚",
	"🥛",
	"🧀",

	// 교통 관련
	"🚌",
	"🚇",
	"🚲",
	"🛵",
	"🚁",
	"🚢",
	"🚅",
	"🚆",
	"🚊",
	"🚡",
	"🎠",
	"🎡",
	"🎢",
	"🚁",
	"🛩️",
	"🚀",
	"⛵",
	"🚤",
	"🛥️",
	"🚣",
] as const;

// 기본 카테고리 목록 - 원래 이모티콘으로 복원
export const DEFAULT_CATEGORIES = [
	{
		name: "식비",
		color: "#7C3AED",
		icon: "🍽️",
		isDefault: true,
		isEditable: true,
	},
	{
		name: "교통비",
		color: "#00FF88",
		icon: "🚗",
		isDefault: true,
		isEditable: true,
	},
	{
		name: "문화생활",
		color: "#A855F7",
		icon: "🎬",
		isDefault: true,
		isEditable: true,
	},
	{
		name: "쇼핑",
		color: "#34D399",
		icon: "🛍️",
		isDefault: true,
		isEditable: true,
	},
	{
		name: "의료비",
		color: "#EF4444",
		icon: "🏥",
		isDefault: true,
		isEditable: true,
	},
	{
		name: "교육비",
		color: "#F59E0B",
		icon: "📚",
		isDefault: true,
		isEditable: true,
	},
	{
		name: "가족",
		color: "#7C3AED",
		icon: "👨‍👩‍👧‍👦",
		isDefault: true,
		isEditable: true,
	},
	{
		name: "기타",
		color: "#6B7280",
		icon: "💰",
		isDefault: true,
		isEditable: true,
	},
] as const;

// 화면 크기 관련 상수
export const SCREEN = {
	padding: 16,
	borderRadius: 12,
	headerHeight: 60,
} as const;

// 애니메이션 상수
export const ANIMATION = {
	duration: 300,
	easing: "ease-in-out",
} as const;

// 앱 정보
export const APP_INFO = {
	name: "머니투게더",
	version: "1.0.0",
	description: "모임과 함께하는 스마트 가계부",
} as const;
