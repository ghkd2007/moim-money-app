# Firestore 인덱스 설정 가이드

## 필요한 복합 인덱스

### 1. groups 컬렉션 인덱스
- **컬렉션**: groups
- **필드1**: members (Array-contains)
- **필드2**: createdAt (Descending)

### 인덱스 생성 방법

#### 방법 1: 오류 링크 사용
1. 앱에서 오류가 발생할 때 나타나는 링크 클릭
2. Firebase Console에서 자동으로 인덱스 생성 페이지 열림
3. "인덱스 만들기" 버튼 클릭

#### 방법 2: 수동 생성
1. Firebase Console > Firestore Database > 인덱스
2. "복합 인덱스 만들기" 클릭
3. 설정:
   - 컬렉션 ID: `groups`
   - 필드 1: `members` / Array-contains
   - 필드 2: `createdAt` / Descending
4. "만들기" 클릭

### 임시 해결책
개발 초기에는 `orderBy` 절을 제거하여 단순한 쿼리 사용:
```javascript
// 인덱스 없이 사용 (정렬 안됨)
const q = query(
  collection(db, "groups"),
  where("members", "array-contains", userId)
);

// 인덱스 생성 후 사용 (정렬됨)
const q = query(
  collection(db, "groups"),
  where("members", "array-contains", userId),
  orderBy("createdAt", "desc")
);
```

## 인덱스 생성 시간
- 일반적으로 몇 분 내에 완료
- 데이터가 많을 경우 더 오래 걸릴 수 있음
- 생성 중에는 해당 쿼리 사용 불가
