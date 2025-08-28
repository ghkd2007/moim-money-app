// QuickAddModal 다크 테마 패치할 라인들
const patches = [
  { line: 695, old: "borderBottomColor: '#E2E8F0',", new: "borderBottomColor: COLORS.border," },
  { line: 739, old: "backgroundColor: '#F1F5F9',", new: "backgroundColor: COLORS.backgroundSecondary," },
  { line: 943, old: "borderBottomColor: '#E2E8F0',", new: "borderBottomColor: COLORS.border," },
  { line: 1034, old: "backgroundColor: '#F8FAFC',", new: "backgroundColor: COLORS.backgroundSecondary," },
  { line: 1037, old: "borderColor: '#E2E8F0',", new: "borderColor: COLORS.border," },
  { line: 1124, old: "backgroundColor: '#F8FAFC',", new: "backgroundColor: COLORS.backgroundSecondary," },
  { line: 1127, old: "borderColor: '#E2E8F0',", new: "borderColor: COLORS.border," },
  { line: 1189, old: "borderBottomColor: '#E2E8F0',", new: "borderBottomColor: COLORS.border," },
  { line: 1242, old: "borderColor: '#E2E8F0',", new: "borderColor: COLORS.border," },
  { line: 1253, old: "backgroundColor: '#EEF2FF',", new: "backgroundColor: COLORS.glassStrong," }
];

console.log('QuickAddModal 패치 대상:', patches.length, '개');
