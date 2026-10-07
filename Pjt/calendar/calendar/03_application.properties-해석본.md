# application.properties 해석본

## 역할

`calendar` 프로젝트의 모든 설정이 모이는 단일 파일입니다. Legacy `BookRentalPjt`에서
`web.xml`, `jdbc-context.xml`, `security-context.xml`, `mail-context.xml`, `log4j.xml`
5개 이상의 XML로 나뉘어 있던 설정이, Boot에서는 이 파일 하나(+ 일부 Java Config)로
집중됩니다.

## 항목별 해석

```properties
spring.application.name=calendar
server.port=8090
```

애플리케이션 식별 이름과 내장 Tomcat이 사용할 포트입니다. `PracPjt`(8091),
`SamplePjt`와 포트가 겹치지 않도록 프로젝트마다 다르게 지정되어 있어, 여러 Boot
프로젝트를 동시에 띄워 비교할 수 있습니다.

```properties
spring.devtools.restart.enabled=true
```

`spring-boot-devtools` 의존성과 함께 동작하며, 코드 변경 시 재컴파일되면 서버를
자동 재시작합니다. Legacy에서 STS3가 제공하던 "Tomcat에 다시 배포(redeploy)"
과정을 대체합니다.

```properties
spring.thymeleaf.cache=false
spring.thymeleaf.prefix=classpath:/templates/
spring.thymeleaf.suffix=.html
spring.thymeleaf.check-template-location=true
```

Legacy의 `InternalResourceViewResolver` XML 설정과 대응됩니다. `cache=false`는
개발 중 템플릿을 수정하면 바로 반영되도록 캐시를 끈 것으로, 운영 환경에서는
`true`로 바꿔야 합니다.

```properties
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
spring.datasource.url=jdbc:mysql://localhost:3306/DB_CALENDAR
spring.datasource.username=root
spring.datasource.password=1234
```

`jdbc-context.xml`의 `BasicDataSource` Bean 정의를 4줄로 축약한 것입니다. 이 네 줄만
있으면 Boot가 `DataSource`, `JdbcTemplate`, JPA의 `EntityManager`까지 필요한 Bean을
전부 자동으로 만들어 줍니다.

```properties
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=hohasic@gmail.com
spring.mail.password=frgwshxafkeucqis
spring.mail.protocol=smtp
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
spring.mail.default-encoding=UTF-8
```

`mail-context.xml`의 `JavaMailSenderImpl` XML Bean과 같은 정보입니다. 이 값들로
Boot가 `JavaMailSender` Bean을 자동 생성하며, `MemberService`가 이를 생성자 주입받아
사용합니다.

```properties
logging.config=classpath:logger/log4j2.xml
```

Boot의 기본 로깅 구현(Logback)을 쓰지 않고 Log4j2로 바꿔서 쓰겠다는 설정입니다.
이 설정이 동작하려면 `build.gradle`에서 기본 로깅 스타터를 제외해야 하는데,
실제로 `configurations { all { exclude module: 'spring-boot-starter-logging' } }`
로 처리되어 있습니다.

```properties
mybatis.config-location=classpath:mybatis/config/mybatis-config.xml
mybatis.mapper-locations=classpath:mybatis/mappers/*.xml
```

MyBatis가 어떤 설정 파일과 어떤 매퍼 XML들을 읽을지 지정합니다.
`mapper-locations`의 `*.xml`은 와일드카드이므로, `mybatis/mappers/` 아래에
매퍼 XML을 추가하면 별도 등록 없이 자동으로 인식됩니다.

```properties
spring.jpa.database-platform=org.hibernate.dialect.MySQLDialect
# spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
```

JPA(Hibernate)가 MySQL 문법을 사용하도록 지정하고, 실행되는 SQL을 콘솔에 보기 좋게
출력하도록 설정합니다. `ddl-auto=update`가 주석 처리되어 있으므로, 현재는 JPA가
테이블을 자동 생성/변경하지 않고 기존 `USER_MEMBER` 테이블을 그대로 사용합니다
(파일 안의 한글 주석이 이 설정의 의도를 직접 설명하고 있습니다).

## Legacy와의 결정적 차이

Legacy에서는 "이 설정이 Root Context에서 읽히는가, DispatcherServlet Context에서
읽히는가"를 XML의 위치와 `web.xml`의 import 여부까지 따라가며 확인해야 했습니다
(`BookRentalPjt`의 `00_SYSTEM_OVERVIEW.md` 4절 참고). Boot는 이런 Context 분리
개념이 없고, `application.properties`의 값 하나하나가 조건에 맞는 자동 설정
클래스(`DataSourceAutoConfiguration`, `MailSenderAutoConfiguration`,
`MybatisAutoConfiguration`, `JpaRepositoriesAutoConfiguration` 등)를 활성화하는
트리거 역할을 합니다.

## 현재 코드에서 확인되는 주의점

DB 비밀번호(`1234`)와 메일 계정 비밀번호(앱 비밀번호로 보이는 문자열)가 평문으로
파일에 직접 작성되어 있습니다. Legacy `jdbc-context.xml`/`mail-context.xml`에서
관찰된 것과 동일한 패턴이며, 실제 배포 시에는 환경 변수나 별도의 비밀 관리 도구로
분리해야 하는 부분입니다.
