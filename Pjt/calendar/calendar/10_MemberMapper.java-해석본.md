# MemberMapper.java 해석본

## 역할

MyBatis 방식의 데이터 접근 계층입니다. `MemberDao`(SQL을 자바 문자열로 직접 작성)와
`MemberRepository`(JPA, SQL을 아예 쓰지 않음)의 중간 지점에 해당하며, **SQL은 외부
XML 파일에 쓰고, 자바 코드는 인터페이스 메서드 선언만 갖는 방식**입니다.

```java
@Mapper
public interface MemberMapper {
    public boolean isMember(String id);
    public int insertMember(MemberDto memberDto);
    public MemberDto selectMemberByID(String id);
    public int updateMember(MemberDto memberDto);
    public MemberDto selectMemberByIDAndMail(MemberDto memberDto);
    public int updatePassword(@Param("memId") String id, @Param("memPw") String encodedNewPw);
}
```

## `@Mapper`가 하는 일

이 인터페이스는 몸체가 없는데도 실제로 호출하면 동작합니다. MyBatis-Spring-Boot-Starter가
`@Mapper` 인터페이스를 찾아, [member-mapper.xml](20_member-mapper.xml-해석본.md)에서
같은 메서드 이름의 `<select>`/`<insert>`/`<update>` 태그를 찾아 SQL을 실행하는
구현체를 런타임에 자동 생성해 등록합니다.

```text
MemberMapper.selectMemberByID("abc")
  -> MyBatis가 namespace="com.office.calendar.member.mapper.MemberMapper"인
     member-mapper.xml을 찾음
  -> id="selectMemberByID" 태그의 SQL 실행
  -> resultType="MemberDto"로 결과를 MemberDto 객체로 변환
```

## 주석 처리된 애노테이션 방식 SQL

메서드 선언 위에 주석으로 남아 있는 코드는 MyBatis의 또 다른 SQL 작성 방식(애노테이션 방식)입니다.

```java
// @Select("SELECT COUNT(*) FROM USER_MEMBER WHERE ID = #{id}")
public boolean isMember(String id);
```

이 프로젝트는 애노테이션 방식 대신 **XML 매퍼 방식**을 선택해서 사용하고 있습니다.
주석은 "SQL을 Java 코드에 바로 쓸 수도 있었지만 XML로 분리했다"는 선택의 흔적입니다.
XML 방식은 SQL이 길어지거나 동적 조건이 붙을 때(`<if>`, `<include>` 등) 더 유리합니다.

## `#{}` 문법과 JDBC `?`의 차이

`MemberDao`의 `?`는 위치 순서로 값이 바인딩되지만, MyBatis의 `#{id}`, `#{pw}`는
파라미터 객체(`MemberDto`)의 **필드/getter 이름**으로 값을 찾아 바인딩합니다.
`updatePassword`처럼 파라미터가 단순 타입 두 개일 때는 `@Param("memId")`으로
XML에서 참조할 이름을 직접 지정해야 합니다(그렇지 않으면 MyBatis가 어떤 인자가
`#{memId}`인지 알 수 없습니다).

## 현재 코드에서 확인되는 주의점

- `MemberDao`와 마찬가지로, 이 Mapper도 [MemberService.java](08_MemberService.java-해석본.md)에서
  실제로는 호출되지 않고 전부 주석 처리되어 있습니다. 현재 활성화된 데이터 접근 경로는
  `MemberRepository`(JPA) 하나뿐입니다.
- `updatePassword`의 파라미터 이름(`memId`, `memPw`)이 [member-mapper.xml](20_member-mapper.xml-해석본.md)의
  `#{memId}`, `#{memPw}`와는 맞지만, `MemberDto`의 실제 필드명(`id`, `pw`)과는 다릅니다.
  `@Param`으로 별칭을 지정했기 때문에 문제는 없지만, 다른 메서드들이 `MemberDto`
  필드명(`id`, `pw`, `mail`)을 그대로 쓰는 것과 이름 규칙이 통일되어 있지 않습니다.
