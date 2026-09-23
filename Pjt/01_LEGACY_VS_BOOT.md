# Spring Legacy(STS3) vs Spring Boot(STS4/IntelliJ) 비교분석

## 이 문서의 목적

`spring_sts3/Pjt/BookRentalPjt`(Legacy)와 `springboot_intellij/Pjt/calendar/calendar`(Boot)를
직접 비교하여, 왜 Boot 프로젝트 구조가 다른지, Legacy 프로젝트가 이 환경에서
그대로 구동되지 않는 이유, Boot를 쓰는 이유와 장단점을 정리합니다.

## 1. 가장 근본적인 차이: "누가 서버를 갖고 있는가"

```text
Legacy (STS3)
  개발자가 만드는 것: WAR 파일 (실행 가능한 앱이 아니라 배포용 압축 파일)
  서버: 외부에 별도로 설치된 Tomcat (STS3가 관리)
  실행: Tomcat이 WAR을 풀어서 그 안의 웹 애플리케이션을 구동
  Tomcat 시작 -> web.xml을 읽음 -> Spring 컨텍스트를 순서대로 로딩

Boot (IntelliJ)
  개발자가 만드는 것: 실행 가능한 JAR (main() 메서드 포함)
  서버: JAR 안에 내장된 Tomcat 라이브러리
  실행: java -jar 또는 IDE의 main() 실행 -> 그 프로세스 안에서 내장 Tomcat이 뜸
  main() 실행 -> SpringApplication.run() -> 내장 Tomcat 기동 + Spring 컨텍스트 로딩이 한 번에 일어남
```

이 차이 하나가 아래 모든 차이의 원인입니다. Legacy는 "서버 안에 앱을 넣는" 구조이고,
Boot는 "앱 안에 서버를 넣는" 구조입니다.

## 2. STS3 프로젝트가 이 환경에서 바로 구동되지 않는 이유

1. **외부 Tomcat이 없음** — STS3는 워크스페이스에 등록된 로컬 Tomcat 서버(`spring_sts3/Pjt/Servers`)를
   사용해 WAR을 실행합니다. IntelliJ에는 이 서버 등록 개념 자체가 없고, `BookRentalPjt`는
   `main()` 메서드도 없는 순수 WAR 프로젝트라서 `java -jar`로도 실행할 수 없습니다.
2. **빌드 산출물이 다름** — Legacy `pom.xml`은 `<packaging>war</packaging>`로 WAR을 만들고,
   Boot `build.gradle`은 기본적으로 실행 가능한 JAR(내장 Tomcat 포함)을 만듭니다. WAR은
   그 자체로는 실행 파일이 아니라 Tomcat에 얹어야 하는 배포물입니다.
3. **시작점이 다름** — Legacy는 `web.xml`의 `ContextLoaderListener`/`DispatcherServlet` 등록이
   Tomcat에 의해 해석되어야 시작됩니다. Boot는 `@SpringBootApplication`이 붙은 클래스의
   `main()`이 시작점이며 `web.xml` 자체가 존재하지 않습니다(`calendar` 프로젝트에 `web.xml` 없음).
4. **의존성 관리 방식이 다름** — Legacy는 Servlet API, Spring MVC, Jackson 등 버전을
   각각 명시해야 하고 버전 조합을 개발자가 맞춰야 합니다. Boot는
   `spring-boot-starter-*`가 검증된 버전 조합을 한 번에 가져옵니다
   (`build.gradle`의 `io.spring.dependency-management` 플러그인 역할).
5. **IDE와 STS3 도구 자체가 없음** — `.settings/org.springframework.ide.eclipse.*`,
   `.springBeans` 같은 STS3 전용 메타데이터는 IntelliJ가 인식하지 못하며,
   반대로 IntelliJ의 `.idea/*.iml`도 STS3/Eclipse가 인식하지 못합니다.

정리하면, STS3용 Legacy 프로젝트를 IntelliJ/Boot 환경에서 구동하려면 "포팅"이 아니라
**Boot 구조로의 재작성**(web.xml 제거, XML Context를 Java Config/application.properties로 전환,
WAR을 실행형 JAR 구조로 전환)이 필요합니다. 단순히 디렉토리를 옮긴다고 동작하지 않습니다.

## 3. 설정 파일 대응표

| 역할 | Legacy (STS3, BookRentalPjt) | Boot (calendar) |
|---|---|---|
| 실행 진입점 | `web.xml` (Tomcat이 해석) | `CalendarApplication.main()` |
| 웹 요청 -> Controller 연결 | `servlet-context.xml`의 component-scan + `DispatcherServlet` | `@SpringBootApplication`의 자동 component-scan + 내장 `DispatcherServlet` (자동 설정) |
| DB 연결 | `jdbc-context.xml` (XML Bean 정의) | `application.properties`의 `spring.datasource.*` (자동 설정으로 `DataSource` Bean 생성) |
| 비밀번호 암호화 | `security-context.xml` (XML Bean) | `SecurityConfig.java`의 `@Bean PasswordEncoder` (Java Config) |
| 메일 발송 | `mail-context.xml` (XML Bean) | `application.properties`의 `spring.mail.*` (자동 설정) |
| 파일 업로드 | `file-context.xml` (`MultipartResolver` XML Bean) | Boot 자동 설정 (`spring.servlet.multipart.*`, 별도 XML 불필요) |
| 로그 설정 | `log4j.xml` | `logger/log4j2.xml` (역할 동일, Log4j2로 세대 교체) |
| 인터셉터 등록 | `servlet-context.xml`의 `<mvc:interceptors>` | `WebConfig implements WebMvcConfigurer` (Java Config) |
| 뷰 템플릿 | JSP (`/WEB-INF/views/*.jsp`) | Thymeleaf (`classpath:/templates/*.html`) |
| 정적 리소스 | `servlet-context.xml`의 `<resources mapping.../>` | `src/main/resources/static/**` (자동 매핑) |

핵심 패턴: **Legacy는 "설정을 XML로, 여러 Context 파일로 분산"해서 어디서 무엇이
로딩되는지 직접 추적해야 하고, Boot는 "설정을 Java Config 또는 application.properties
한 곳으로 집중"하고 나머지는 자동 설정(auto-configuration)에 맡깁니다.**

실제로 `BookRentalPjt`의 `00_SYSTEM_OVERVIEW.md`에서 지적했던 문제
("root-context.xml은 비어있는데 JdbcTemplate은 어디서 등록되는가?",
"어떤 XML이 실제로 로딩되는지 web.xml과 component-scan을 함께 봐야 한다")는
Boot에서는 원천적으로 발생하지 않습니다. `calendar`의 `application.properties`
17~19행만 보면 DB 연결 설정 전체를 바로 알 수 있습니다.

## 4. 같은 기능을 구현하는 방식 비교 (Member 로그인 예시)

```text
Legacy (BookRentalPjt)
login_form.jsp
  -> UserMemberController (@Controller, servlet-context.xml의 component-scan으로 등록)
  -> UserMemberService
  -> UserMemberDao (JdbcTemplate, jdbc-context.xml에서 DataSource 주입)
  -> tbl_user_member
  -> HttpSession
  -> login_ok.jsp / login_ng.jsp (JSP, ViewResolver가 prefix/suffix 조립)

Boot (calendar)
signin_form.html
  -> MemberController (@Controller, @SpringBootApplication 자동 component-scan)
  -> MemberService
  -> MemberDao / MemberMapper / MemberRepository (JdbcTemplate / MyBatis / JPA 병행)
  -> tbl_member류 테이블
  -> HttpSession (동일)
  -> signin_result.html (Thymeleaf, application.properties의 prefix/suffix 설정으로 조립)
```

로그인 흐름 자체(Controller -> Service -> DAO -> DB -> Session -> View)는 **Legacy와 Boot가
동일합니다.** 바뀌는 것은 "그 흐름을 만들기 위한 배선(Bean 등록, 설정 로딩) 방식"이지,
MVC 계층 구조 자체가 아닙니다. 이 점이 STS3에서 배운 지식이 Boot 학습에서도
그대로 재사용되는 이유입니다.

## 5. Boot를 사용하는 이유 (이 프로젝트 기준 장점)

- **설정 파일 개수 감소**: Legacy는 `web.xml` + XML Context 5개 이상을 나눠 관리해야 하지만,
  `calendar`는 `application.properties` 한 파일과 Java `@Configuration` 클래스 2개(`SecurityConfig`,
  `WebConfig`)로 동일한 수준의 설정을 표현합니다.
- **내장 서버로 실행/배포 단순화**: 별도 Tomcat 설치, 워크스페이스 서버 등록, WAR 배포 과정 없이
  `main()` 실행 또는 `java -jar`만으로 구동됩니다.
- **의존성 버전 충돌 감소**: `spring-boot-starter-*` + `io.spring.dependency-management`가
  서로 호환되는 버전 조합을 강제하므로, Legacy에서 흔한 "라이브러리 버전 불일치" 문제가 줄어듭니다.
- **자동 설정(auto-configuration)**: `mysql-connector-j`와 `spring.datasource.*`만 있으면
  `DataSource`, `JdbcTemplate` Bean이 자동 생성됩니다. Legacy처럼 `jdbc-context.xml`에
  Bean을 직접 나열할 필요가 없습니다.
- **최신 개발 편의 기능**: `spring-boot-devtools`(코드 변경 시 자동 재시작), 통합 테스트
  스타터(`spring-boot-starter-*-test`) 등이 기본 제공됩니다.

## 6. Boot의 단점 / 주의할 점

- **"자동으로 되는 것"이 많아서, 실제로 무엇이 어떤 조건에서 활성화되는지 추적하기 어려움**
  (Legacy는 XML을 직접 열어보면 알 수 있지만, Boot는 `spring-boot-autoconfigure` 내부
  조건부 로직까지 알아야 정확히 이해됨). 그래서 STS3 학습에서 "Context 구조를 명시적으로
  추적하는 훈련"을 먼저 한 것이 Boot의 자동 설정을 이해하는 데 오히려 도움이 됩니다.
- **배포 방식이 조직 관례에 따라 갈릴 수 있음**: 기존에 WAR + 외부 Tomcat 운영 환경을
  쓰는 조직이라면 Boot도 WAR로 빌드해 외부 Tomcat에 올리는 방식으로 되돌릴 수 있지만,
  기본 철학(내장 서버)과는 어긋나는 절충입니다.
- **버전 상승에 따른 스타터 명칭/구조 변화**: 이 프로젝트의 `build.gradle`은
  Spring Boot 4.1.1을 사용하며 `spring-boot-starter-webmvc`처럼 이전에는
  `spring-boot-starter-web`이었던 스타터 명칭이 바뀌는 등, Legacy보다 변화 주기가
  빠르므로 버전별 마이그레이션 가이드 확인이 필요합니다.

## 7. Legacy 지식이 Boot에서도 유효한 부분 / 무효화되는 부분

```text
그대로 유효한 지식
  Controller -> Service -> DAO -> DB -> Model/Session -> View 계층 구조
  Interceptor를 이용한 로그인 체크
  DTO를 이용한 계층 간 데이터 전달
  Service에서 업무 규칙(중복 검사, 암호화)을 처리하는 책임 분리
  BCryptPasswordEncoder 등 Spring Security의 개별 컴포넌트 사용법

무효화되거나 대체되는 지식
  web.xml 작성법 -> Boot에는 web.xml이 없음
  XML Bean 정의 문법 -> @Configuration + @Bean Java Config로 대체
  ViewResolver의 JSP prefix/suffix XML 설정 -> application.properties의 thymeleaf 설정
  WAR로 패키징해 STS3 워크스페이스 서버에 배포하는 절차 -> java -jar / IDE 실행 버튼
  <mvc:interceptors> XML 등록 -> WebMvcConfigurer.addInterceptors() Java 코드
```

## 8. 다음 단계

이 비교분석을 기반으로, `Pjt` 내부 각 프로젝트(`SamplePjt`, `PracPjt`, `calendar/calendar`)에
대해 `BookRentalPjt`와 동일한 형식의 해석본을 작성합니다. 가장 완성도가 높고 실제
학습이 진행 중인 `calendar/calendar`부터 작성하는 것을 제안합니다.
