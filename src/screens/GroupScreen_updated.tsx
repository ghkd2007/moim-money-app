// GroupScreen의 스타일 부분만 다크 테마로 업데이트
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background, // #F8FAFC → COLORS.background
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background, // #F8FAFC → COLORS.background
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    position: 'relative',
    backgroundColor: COLORS.glass, // 글래스모피즘 효과 추가
  },
  groupHeader: {
    marginBottom: 20,
  },
  groupInfoContainer: {
    alignItems: 'center',
  },
  groupTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 16,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  memberInfoContainer: {
    alignItems: 'center',
  },
  memberCountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.glassStrong, // 다크 테마용 배경
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: COLORS.secondary, // 네온 그린 테두리
    elevation: 2,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  memberCountIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  memberCountText: {
    fontSize: 16,
    color: COLORS.secondary, // 네온 그린 텍스트
    fontWeight: '700',
  },
  // ... 다른 스타일들도 비슷하게 업데이트
});
