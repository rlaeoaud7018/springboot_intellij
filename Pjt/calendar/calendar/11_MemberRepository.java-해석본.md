# MemberRepository.java 해석본

## 역할

Spring Data JPA 방식의 데이터 접근 계층입니다. `MemberDao`(SQL 직접 작성),
`MemberMapper`(XML에 SQL 작성) 두 방식과 달리, 이 인터페이스는 **SQL을 한 줄도
작성하지 않습니다.** 현재 `MemberService`가 실제로 사용하는 유일한 데이터 접근
경로입니다.

```java
public interface MemberRepository extends JpaRepository<MemberEntity, Integer> {

    public boolean existsByMemId(String memId);

    public Optional<MemberEntity> findByMemId(String memId);

    public Optional<MemberEntity> findByMemIdAndMemMail(String memId, String memMail);

}
```

## `JpaRepository<MemberEntity, Integer>`가 기본 제공하는 기능

`extends`만으로 다음 메서드들이 이미 구현되어 사용 가능합니다(코드가 어디에도 없지만 동작).

```text
save(entity)         INSERT 또는 UPDATE (PK 존재 여부로 자동 판단)
findById(id)         PK로 단건 조회
findAll()            전체 조회
deleteById(id)       삭제
count()              전체 개수
```

`<MemberEntity, Integer>`는 "이 Repository가 다루는 Entity 타입은 `MemberEntity`이고,
PK 타입은 `Integer`(즉 `memNo`)"라는 의미입니다.

## 메서드 이름만으로 SQL이 만들어지는 원리 (Query Method)

```java
public boolean existsByMemId(String memId);
public Optional<MemberEntity> findByMemId(String memId);
public Optional<MemberEntity> findByMemIdAndMemMail(String memId, String memMail);
```

Spring Data JPA는 메서드 이름을 `동사 + By + 필드명(+And+필드명...)` 규칙으로 해석해
쿼리를 자동 생성합니다.

```text
existsByMemId(String memId)
  -> SELECT COUNT(*) > 0 FROM USER_MEMBER WHERE MEM_ID = ?  (개념적으로 이런 동작)

findByMemIdAndMemMail(String memId, String memMail)
  -> SELECT * FROM USER_MEMBER WHERE MEM_ID = ? AND MEM_MAIL = ?
```

`MemberDao.isMember()` + 직접 작성한 SQL, `MemberMapper.isMember` + XML SQL과
정확히 같은 결과를 내는 코드를, 이 방식은 **메서드 이름 하나**로 대체합니다.

## `Optional<MemberEntity>`을 반환하는 이유

`MemberDao`/`MemberMapper`는 결과가 없으면 `null`을 반환하는 반면, JPA Repository는
`Optional`로 감싸서 반환합니다. 호출부(`MemberService`)는 `.isPresent()`,
`.get()`으로 null 여부를 명시적으로 처리하도록 강제됩니다.

```java
Optional<MemberEntity> optionalMember = memberRepository.findByMemId(memberDto.getId());
if (optionalMember.isPresent() && passwordEncoder.matches(...)) { ... }
```

## 현재 코드에서 확인되는 주의점

세 가지 데이터 접근 방식(DAO/Mapper/Repository) 중 이 인터페이스만 실제로 사용되고
있습니다. 나머지 두 방식은 [MemberDao.java](09_MemberDao.java-해석본.md),
[MemberMapper.java](10_MemberMapper.java-해석본.md)에 코드는 남아 있지만 호출되지 않는
상태이므로, 학습 목적이 아니라면 정리 대상입니다.
