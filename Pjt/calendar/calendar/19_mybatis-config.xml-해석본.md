# mybatis-config.xml 해석본

## 역할

MyBatis 자체의 전역 설정 파일입니다. `application.properties`의
`mybatis.config-location=classpath:mybatis/config/mybatis-config.xml`이 이 파일을
가리킵니다.

```xml
<configuration>
    <typeAliases>
        <typeAlias type="com.office.calendar.member.MemberDto" alias="MemberDto" />
    </typeAliases>
</configuration>
```

## `typeAlias`가 하는 일

[member-mapper.xml](20_member-mapper.xml-해석본.md)에서 `resultType="MemberDto"`,
`parameterType="MemberDto"`처럼 짧게 쓸 수 있는 이유가 이 설정 때문입니다.
이 별칭이 없었다면 매번 전체 패키지 경로를 써야 합니다.

```xml
<!-- 별칭이 없다면 -->
<select id="selectMemberByID" resultType="com.office.calendar.member.MemberDto">

<!-- 별칭 덕분에 -->
<select id="selectMemberByID" resultType="MemberDto">
```

## 현재 코드에서 확인되는 주의점

이 프로젝트 전체에서 MyBatis로 다루는 도메인이 `Member` 하나뿐이라 `typeAlias`도
하나만 등록되어 있습니다. 향후 다른 도메인(예: Planner)이 MyBatis로 추가된다면
같은 방식으로 `<typeAlias>`를 추가하거나, `<typeAliasesPackage>`로 패키지 전체를
한 번에 별칭 등록하는 방식으로 바꾸는 것을 고려할 수 있습니다.
