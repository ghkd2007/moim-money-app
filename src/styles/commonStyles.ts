// 공통 스타일 가이드 - Dribbble 스타일 다크 테마
import { StyleSheet, Platform } from "react-native";
import { COLORS } from "../constants";
import { TextStyles } from "../constants/typography";

export const CommonStyles = StyleSheet.create({
	// 기본 컨테이너
	container: {
		flex: 1,
		backgroundColor: COLORS.background,
	},

	// 글래스모피즘 헤더
	glassHeader: {
		backgroundColor: COLORS.glass,
		borderBottomWidth: 1,
		borderBottomColor: COLORS.border,
		paddingHorizontal: 20,
		paddingVertical: 16,
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},

	// 모던 카드
	card: {
		backgroundColor: COLORS.surface,
		borderRadius: 20,
		padding: 20,
		marginHorizontal: 20,
		marginVertical: 8,
		borderWidth: 1,
		borderColor: COLORS.border,
		...Platform.select({
			ios: {
				shadowColor: "#000",
				shadowOffset: { width: 0, height: 4 },
				shadowOpacity: 0.1,
				shadowRadius: 12,
			},
			android: {
				elevation: 4,
			},
		}),
	},

	// 프라이머리 버튼
	primaryButton: {
		backgroundColor: COLORS.primary,
		borderRadius: 16,
		paddingVertical: 16,
		paddingHorizontal: 24,
		alignItems: "center",
		justifyContent: "center",
		...Platform.select({
			ios: {
				shadowColor: COLORS.primary,
				shadowOffset: { width: 0, height: 4 },
				shadowOpacity: 0.3,
				shadowRadius: 8,
			},
			android: {
				elevation: 6,
			},
		}),
	},

	primaryButtonText: {
		...TextStyles.button,
		color: "#FFFFFF",
	},

	// 세컨더리 버튼
	secondaryButton: {
		backgroundColor: COLORS.surface,
		borderRadius: 16,
		paddingVertical: 16,
		paddingHorizontal: 24,
		alignItems: "center",
		justifyContent: "center",
		borderWidth: 2,
		borderColor: COLORS.border,
	},

	secondaryButtonText: {
		...TextStyles.button,
		color: COLORS.text,
	},

	// 입력 필드
	input: {
		...TextStyles.input,
		backgroundColor: COLORS.surface,
		borderRadius: 12,
		paddingVertical: 16,
		paddingHorizontal: 16,
		color: COLORS.text,
		borderWidth: 1,
		borderColor: COLORS.border,
	},

	inputFocused: {
		borderColor: COLORS.primary,
		borderWidth: 2,
	},

	// 타이포그래피
	h1: {
		...TextStyles.h1,
		color: COLORS.text,
	},

	h2: {
		...TextStyles.h2,
		color: COLORS.text,
	},

	h3: {
		...TextStyles.h3,
		color: COLORS.text,
	},

	h4: {
		...TextStyles.h4,
		color: COLORS.text,
	},

	title: {
		...TextStyles.h2,
		color: COLORS.text,
	},

	subtitle: {
		...TextStyles.h4,
		color: COLORS.text,
	},

	body: {
		...TextStyles.body,
		color: COLORS.text,
	},

	bodyMedium: {
		...TextStyles.bodyMedium,
		color: COLORS.text,
	},

	bodySemibold: {
		...TextStyles.bodySemibold,
		color: COLORS.text,
	},

	caption: {
		...TextStyles.caption,
		color: COLORS.textSecondary,
	},

	captionMedium: {
		...TextStyles.captionMedium,
		color: COLORS.textSecondary,
	},

	small: {
		...TextStyles.small,
		color: COLORS.textSecondary,
	},

	// 모달 스타일
	modalContainer: {
		flex: 1,
		backgroundColor: COLORS.background,
	},

	modalHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingHorizontal: 20,
		paddingVertical: 16,
		backgroundColor: COLORS.glass,
		borderBottomWidth: 1,
		borderBottomColor: COLORS.border,
	},

	modalTitle: {
		...TextStyles.h4,
		color: COLORS.text,
	},

	modalCloseButton: {
		padding: 8,
		borderRadius: 8,
		backgroundColor: COLORS.surface,
	},

	modalCloseText: {
		...TextStyles.button,
		color: COLORS.text,
	},

	// 네온 효과 (액센트용)
	neonGlow: {
		shadowColor: COLORS.secondary,
		shadowOffset: { width: 0, height: 0 },
		shadowOpacity: 0.6,
		shadowRadius: 10,
		elevation: 8,
	},

	// 그라데이션 효과 (프라이머리 요소용)
	gradientCard: {
		backgroundColor: COLORS.primary,
		borderRadius: 24,
		padding: 24,
		...Platform.select({
			ios: {
				shadowColor: COLORS.primary,
				shadowOffset: { width: 0, height: 8 },
				shadowOpacity: 0.4,
				shadowRadius: 16,
			},
			android: {
				elevation: 8,
			},
		}),
	},

	gradientText: {
		color: "#FFFFFF",
		fontWeight: "700",
	},

	// 플로팅 액션 버튼
	fab: {
		position: "absolute",
		bottom: 80,
		right: 20,
		width: 64,
		height: 64,
		borderRadius: 32,
		backgroundColor: COLORS.secondary,
		alignItems: "center",
		justifyContent: "center",
		...Platform.select({
			ios: {
				shadowColor: COLORS.secondary,
				shadowOffset: { width: 0, height: 8 },
				shadowOpacity: 0.6,
				shadowRadius: 16,
			},
			android: {
				elevation: 8,
			},
		}),
	},

	fabIcon: {
		fontSize: 24,
		color: COLORS.background,
		fontWeight: "600",
	},

	// 상태별 텍스트
	successText: {
		color: COLORS.success,
		fontWeight: "600",
	},

	warningText: {
		color: COLORS.warning,
		fontWeight: "600",
	},

	dangerText: {
		color: COLORS.danger,
		fontWeight: "600",
	},

	// 링크 텍스트
	linkText: {
		color: COLORS.primary,
		fontWeight: "600",
	},
});

// 애니메이션 상수
export const Animations = {
	spring: {
		tension: 300,
		friction: 35,
	},
	timing: {
		duration: 300,
	},
};

// 간격 상수
export const Spacing = {
	xs: 4,
	sm: 8,
	md: 16,
	lg: 24,
	xl: 32,
	xxl: 48,
};

// 둥근 모서리 상수
export const BorderRadius = {
	sm: 8,
	md: 12,
	lg: 16,
	xl: 20,
	xxl: 24,
	full: 9999,
};
