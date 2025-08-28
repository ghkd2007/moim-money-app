// 타이포그래피 시스템 - Dribbble 스타일
import { Platform } from "react-native";

export const Typography = {
	// 폰트 패밀리
	fontFamily: {
		regular: Platform.select({
			ios: "SF Pro Display",
			android: "Roboto",
			default: "System",
		}),
		medium: Platform.select({
			ios: "SF Pro Display Medium",
			android: "Roboto Medium",
			default: "System",
		}),
		bold: Platform.select({
			ios: "SF Pro Display Bold",
			android: "Roboto Bold",
			default: "System",
		}),
	},

	// 폰트 크기
	fontSize: {
		xs: 12,
		sm: 14,
		base: 16,
		lg: 18,
		xl: 20,
		"2xl": 24,
		"3xl": 28,
		"4xl": 32,
		"5xl": 36,
		"6xl": 48,
	},

	// 폰트 두께
	fontWeight: {
		normal: "400" as const,
		medium: "500" as const,
		semibold: "600" as const,
		bold: "700" as const,
		extrabold: "800" as const,
	},

	// 라인 높이
	lineHeight: {
		tight: 1.2,
		normal: 1.4,
		relaxed: 1.6,
		loose: 1.8,
	},

	// 레터 스페이싱
	letterSpacing: {
		tight: -0.5,
		normal: 0,
		wide: 0.5,
		wider: 1,
	},
};

// 미리 정의된 텍스트 스타일
export const TextStyles = {
	// 헤딩
	h1: {
		fontSize: Typography.fontSize["4xl"],
		fontWeight: Typography.fontWeight.extrabold,
		lineHeight: Typography.fontSize["4xl"] * Typography.lineHeight.tight,
		letterSpacing: Typography.letterSpacing.tight,
	},
	h2: {
		fontSize: Typography.fontSize["3xl"],
		fontWeight: Typography.fontWeight.bold,
		lineHeight: Typography.fontSize["3xl"] * Typography.lineHeight.tight,
		letterSpacing: Typography.letterSpacing.tight,
	},
	h3: {
		fontSize: Typography.fontSize["2xl"],
		fontWeight: Typography.fontWeight.bold,
		lineHeight: Typography.fontSize["2xl"] * Typography.lineHeight.normal,
	},
	h4: {
		fontSize: Typography.fontSize.xl,
		fontWeight: Typography.fontWeight.semibold,
		lineHeight: Typography.fontSize.xl * Typography.lineHeight.normal,
	},

	// 본문
	body: {
		fontSize: Typography.fontSize.base,
		fontWeight: Typography.fontWeight.normal,
		lineHeight: Typography.fontSize.base * Typography.lineHeight.relaxed,
	},
	bodyMedium: {
		fontSize: Typography.fontSize.base,
		fontWeight: Typography.fontWeight.medium,
		lineHeight: Typography.fontSize.base * Typography.lineHeight.relaxed,
	},
	bodySemibold: {
		fontSize: Typography.fontSize.base,
		fontWeight: Typography.fontWeight.semibold,
		lineHeight: Typography.fontSize.base * Typography.lineHeight.relaxed,
	},

	// 캡션
	caption: {
		fontSize: Typography.fontSize.sm,
		fontWeight: Typography.fontWeight.normal,
		lineHeight: Typography.fontSize.sm * Typography.lineHeight.normal,
	},
	captionMedium: {
		fontSize: Typography.fontSize.sm,
		fontWeight: Typography.fontWeight.medium,
		lineHeight: Typography.fontSize.sm * Typography.lineHeight.normal,
	},

	// 작은 텍스트
	small: {
		fontSize: Typography.fontSize.xs,
		fontWeight: Typography.fontWeight.normal,
		lineHeight: Typography.fontSize.xs * Typography.lineHeight.normal,
	},

	// 버튼
	button: {
		fontSize: Typography.fontSize.base,
		fontWeight: Typography.fontWeight.semibold,
		lineHeight: Typography.fontSize.base * Typography.lineHeight.tight,
	},
	buttonLarge: {
		fontSize: Typography.fontSize.lg,
		fontWeight: Typography.fontWeight.semibold,
		lineHeight: Typography.fontSize.lg * Typography.lineHeight.tight,
	},

	// 입력 필드
	input: {
		fontSize: Typography.fontSize.base,
		fontWeight: Typography.fontWeight.normal,
		lineHeight: Typography.fontSize.base * Typography.lineHeight.normal,
	},
};
