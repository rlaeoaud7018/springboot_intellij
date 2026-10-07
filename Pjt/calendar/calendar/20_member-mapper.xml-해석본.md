# member-mapper.xml 해석본

## 역할

[MemberMapper.java](10_MemberMapper.java-해석본.md) 인터페이스의 각 메서드가 실행할
실제 SQL을 담고 있는 MyBatis 매퍼 XML입니다.

```xml
<mapper namespace="com.office.calendar.member.mapper.MemberMapper">
```

`namespace`가 `MemberMapper` 인터페이스의 전체 경로와 정확히 일치해야, MyBatis가
"이 인터페이스의 이 메서드는 이 XML의 이 태그를 실행하면 된다"고 연결할 수 있습니다.
`id="isMember"` 같은 태그의 `id`는 인터페이스의 메서드 이름과 1:1로 대응합니다.

## 공통 SQL 재사용: `<sql>` + `<include>`

```xml
<sql id="baseSelectFields">
    SELECT * FROM USER_MEMBER
</sql>

<select id="selectMemberByID" resultType="MemberDto" parameterType="String">
    <include refid="baseSelectFields"/> WHERE ID = #{id}
</select>

<select id="selectMemberByIDAndMail" resultType="MemberDto" parameterType="MemberDto">
    <include refid="baseSelectFields"/>
    WHERE ID=#{id} AND MAIL=#{mail}
</select>
```

`SELECT * FROM USER_MEMBER`처럼 여러 쿼리에서 반복되는 부분을 `<sql id="...">`로
정의해 두고 `<include refid="...">`로 재사용합니다. `MemberDao.java`(자바 문자열로
SQL을 작성하는 방식)에서는 이런 재사용이 문자열 조합이나 상수로만 가능한데,
XML 매퍼는 이 재사용을 문법으로 직접 지원합니다.

## `#{}` 파라미터 바인딩

```xml
<insert id="insertMember" parameterType="MemberDto">
    INSERT INTO USER_MEMBER(ID, PW, MAIL, PHONE)
    VALUES(#{id}, #{pw}, #{mail}, #{phone})
</insert>
```

`parameterType="MemberDto"`이므로 `#{id}`, `#{pw}` 등은 전달받은 `MemberDto`
객체의 getter(`getId()`, `getPw()` ...)를 호출해 값을 채웁니다. JDBC의 `?`와
달리 파라미터 순서가 아니라 **이름**으로 매칭되므로, SQL의 컬럼 순서와 DTO의
필드 선언 순서가 달라도 문제없이 동작합니다.

## 주석 처리된 원본 SQL

```xml
<select id="selectMemberByID" resultType="MemberDto" parameterType="String">
    <!-- SELECT * FROM USER_MEMBER WHERE ID = #{id} -->
    <include refid="baseSelectFields"/> WHERE ID = #{id}
</select>
```

원래 직접 쓰던 SQL을 주석으로 남겨두고, `<sql>`/`<include>` 재사용 방식으로
리팩터링한 흔적입니다. 결과적으로 실행되는 SQL은 동일합니다.

## 앞뒤 연결

```text
MemberMapper.selectMemberByID("abc") 호출
  -> namespace="...MemberMapper"인 이 XML 탐색
  -> id="selectMemberByID" 태그 탐색
  -> <include>로 SELECT * FROM USER_MEMBER 삽입 + WHERE ID = 'abc'
  -> 실행 결과를 resultType="MemberDto" 기준으로 MemberDto 객체 리스트/단건 변환
```

## 현재 코드에서 확인되는 주의점

[MemberMapper.java](10_MemberMapper.java-해석본.md)에서 이미 언급했듯, 이 XML에
정의된 SQL들은 `MemberService`에서 실제로 호출되지 않고 있습니다(현재는
`MemberRepository` JPA 방식만 사용). SQL 자체는 문법 오류 없이 정상적으로
작성되어 있어, 필요 시 언제든 다시 활성화해 비교해 볼 수 있는 상태입니다.
