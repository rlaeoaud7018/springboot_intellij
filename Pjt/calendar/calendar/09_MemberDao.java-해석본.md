# MemberDao.java 해석본

## 역할

`JdbcTemplate`을 이용해 SQL을 직접 작성하고 실행하는, Legacy 방식과 가장 가까운
데이터 접근 계층입니다. `calendar` 프로젝트는 같은 기능을 세 가지 방식(DAO, Mapper,
Repository)으로 구현해 두었는데, 이 파일이 그중 "SQL을 문자열로 직접 쓰는" 방식입니다.

```java
@Repository
public class MemberDao {

    final private JdbcTemplate jdbcTemplate;

    public MemberDao(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }
    ...
}
```

## `JdbcTemplate`은 어디서 왔는가 (Boot 자동 설정)

Legacy `BookRentalPjt`는 `jdbc-context.xml`에 `DataSource`, `JdbcTemplate` Bean을
직접 XML로 정의해야 했습니다.

```xml
<!-- Legacy -->
<bean id="dataSource" class="org.apache.commons.dbcp2.BasicDataSource"> ... </bean>
<bean id="jdbcTemplate" class="org.springframework.jdbc.core.JdbcTemplate">
    <constructor-arg ref="dataSource"/>
</bean>
```

`calendar`에는 이런 XML이나 `@Bean JdbcTemplate` 코드가 **어디에도 없습니다.**
`build.gradle`의 `spring-boot-starter-jdbc` + `mysql-connector-j` 의존성과
`application.properties`의 `spring.datasource.*` 설정만으로 Boot가
`DataSource`와 `JdbcTemplate` Bean을 자동으로 만들어 생성자에 주입해 줍니다.

## 메서드별 SQL

```java
isMember(String id)                        SELECT COUNT(*) ... WHERE ID = ?
insertMember(MemberDto memberDto)          INSERT INTO USER_MEMBER(...)
selectMemberByID(String id)                SELECT * ... WHERE ID = ?
updateMember(MemberDto memberDto)          UPDATE ... WHERE NO = ?
selectMemberByIDAndMail(MemberDto)         SELECT * ... WHERE ID=? AND MAIL=?
updatePassword(String id, String pw)       UPDATE ... SET PW = ? WHERE ID = ?
```

`?`는 JDBC의 위치 기반 파라미터이며, `jdbcTemplate.update(sql, 값1, 값2, ...)`처럼
넘긴 순서대로 `?`에 바인딩됩니다. `BeanPropertyRowMapper.newInstance(MemberDto.class)`는
조회 결과의 컬럼명(`ID`, `PW`, `MAIL` ...)을 `MemberDto`의 getter/setter 이름과
대소문자 무시로 자동 매칭해 객체로 변환합니다.

## 현재 코드에서 확인되는 주의점

- **이 클래스는 `@Repository`로 등록되어 있지만 실제로는 어디서도 호출되지 않습니다.**
  [MemberService.java](08_MemberService.java-해석본.md)에서 이 DAO를 호출하던 코드는 전부
  주석 처리되어 있고(`// memberDao.isMember(...)` 등), 현재는 JPA `MemberRepository`가
  실제 데이터 접근을 담당합니다. `MemberService`의 생성자에는 여전히 `MemberDao`가
  주입되고 있어 Bean 자체는 살아있지만, 코드상으로는 사용되지 않는 상태입니다.
  세 가지 데이터 접근 방식(DAO/Mapper/Repository)을 비교 학습하기 위해 남겨둔 것으로
  보이며, 실제 운영 코드라면 사용하지 않는 계층은 제거하는 것이 맞습니다.
- SQL 컬럼명이 대문자(`ID`, `PW`, `MAIL`, `PHONE`, `NO`)로 작성되어 있는데, 이는
  [MemberEntity.java](12_MemberEntity.java-해석본.md)의 `@Column(name = "...")` 값과 동일합니다.
  세 가지 구현 방식이 결국 같은 테이블 `USER_MEMBER`를 공유합니다.
