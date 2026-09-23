# springboot_intellij/Pjt 학습 자료 목차

## 이 디렉토리의 성격

이 디렉토리는 `spring_sts3/Pjt`(Spring Legacy, STS3/Eclipse 기반)에서 학습한 내용을
Spring Boot(IntelliJ, STS4 계열 지식 포함) 기준으로 이어서 학습하기 위한 워크스페이스입니다.

STS3 프로젝트가 그대로 여기서 구동되지 않는 이유, Legacy와 Boot의 구조적 차이,
그리고 각 프로젝트의 실제 동작 방식을 `spring_sts3/Pjt/BookRentalPjt`와 동일한 방식의
"해석본" 문서로 정리하는 것이 목표입니다.

## 1. 진행 순서

1. [springboot_intellij/Pjt 구조 파악](00_README.md) (본 문서) — 완료
2. [Legacy vs Boot 비교분석](01_LEGACY_VS_BOOT.md) — 완료
3. 프로젝트별 해석본 — 완료
   - [calendar/calendar 해석본 목차](calendar/calendar/00_README.md) (BookRentalPjt와 동일한 파일별 해석본 방식)
   - [SamplePjt / PracPjt 해석본](02_SAMPLEPJT_PRACPJT_OVERVIEW.md) (두 프로젝트가 사실상 동일한 뼈대 템플릿이라 통합 문서로 작성)

## 2. Pjt 디렉토리 구조

```text
Pjt
├─ SamplePjt   Spring Boot 최초 연습 템플릿 (DB 연동 없음)
├─ PracPjt     SamplePjt와 동일 구조의 반복 연습용 사본
└─ calendar
   └─ calendar  실제 학습이 진행 중인 본 프로젝트 (MySQL + Security + Mail + MyBatis + JPA)
```

| 프로젝트 | 포트 | 특징 | 완성도 |
|---|---|---|---|
| SamplePjt | (미지정) | Thymeleaf + Web MVC만 존재, DB 연동 없음, Controller-Service-DAO-DTO 뼈대만 연습 | 뼈대 수준 |
| PracPjt | 8091 | SamplePjt와 패키지명만 다른 사실상 동일 구조 (반복 연습용) | 뼈대 수준 |
| calendar/calendar | 8090 | MySQL 실제 연동, Spring Security, 로그인 Interceptor, Mail 발송, 같은 Member 도메인을 JdbcTemplate DAO / MyBatis Mapper / JPA Repository 세 가지 방식으로 병행 구현 | 진행 중, 가장 발전된 프로젝트 |

`calendar/calendar`가 실질적인 메인 학습 프로젝트이며, 나머지 두 개는 Boot 프로젝트의
기본 뼈대(Controller-Service-DAO-DTO 흐름)를 익히기 위한 사전 연습용 프로젝트로 보입니다.

## 3. 프로젝트별 패키지 구조

### SamplePjt / PracPjt (거의 동일 구조)

```text
com.office.samplepjt (또는 pracpjt)
├─ HoneController.java / HomeController.java   최초 진입점 Controller
├─ SamplePjtApplication.java                    @SpringBootApplication 진입 클래스
└─ member
   ├─ MemberController.java
   ├─ MemberService.java
   ├─ MemberDao.java
   └─ MemberDto.java

resources
├─ application.properties   서버 포트, Thymeleaf 설정만 존재 (DB 설정 없음)
└─ templates
   ├─ home.html
   └─ member/{signin.html, signup.html}
```

### calendar/calendar

```text
com.office.calendar
├─ CalendarApplication.java   @SpringBootApplication + @MapperScan(MyBatis)
├─ HomeController.java
├─ config
│  ├─ SecurityConfig.java     BCryptPasswordEncoder Bean, CSRF/CORS/formLogin 비활성화
│  └─ WebConfig.java          WebMvcConfigurer, 로그인 Interceptor 경로 등록
└─ member
   ├─ MemberController.java / MemberService.java / MemberDao.java / MemberDto.java  (JdbcTemplate 계열 추정)
   ├─ MemberSigninInterceptor.java   로그인 여부 확인 Interceptor
   ├─ jpa
   │  ├─ MemberEntity.java
   │  └─ MemberRepository.java      Spring Data JPA
   └─ mapper
      └─ MemberMapper.java          MyBatis Mapper 인터페이스

resources
├─ application.properties   서버 포트, Thymeleaf, MySQL, Mail, log4j2, MyBatis, JPA 설정 모두 존재
├─ logger/log4j2.xml
├─ mybatis/config/mybatis-config.xml
├─ mybatis/mappers/member-mapper.xml
├─ static/{css,js,img}
└─ templates
   ├─ home.html, include/{title.html, header_nav_footer.html}
   └─ member/{signin_form, signin_result, signup_form, signup_result, modify_form, modify_result, findpassword_form, findpassword_result}.html
```

## 4. 첫 화면 실행 흐름 (calendar 기준)

```text
GET / 또는 ""
  -> HomeController.home()
  -> "home" 반환 (redirect 아님, 곧바로 뷰 이름)
  -> ViewResolver: classpath:/templates/ + home + .html
  -> templates/home.html
  -> include/title.html, include/header_nav_footer.html
  -> static/css/*, static/img/intro.png
```

STS3의 `BookRentalPjt`는 `HomeController`가 `/user/`로 redirect한 뒤 별도의
`UserHomeController`가 화면을 그렸지만, `calendar`는 `HomeController`가 곧바로
뷰 이름(`"home"`)을 반환합니다. Boot 학습 단계에서는 아직 사용자/관리자 영역이
분리되지 않은 단일 구조입니다.

## 5. 현재 코드에서 확인되는 특징 (관찰, 개선 요청 아님)

- `calendar`는 같은 회원(Member) 데이터를 **DAO(JdbcTemplate 추정) / MyBatis Mapper / JPA Repository**
  세 가지 방식으로 동시에 구현해 두었습니다. 실제 서비스라면 하나만 선택하지만,
  이 프로젝트는 세 가지 데이터 접근 기술을 비교 학습하려는 목적으로 보입니다.
- `SecurityConfig`에서 `formLogin`을 비활성화한 것으로 보아, 로그인은 Spring Security의
  기본 로그인 폼이 아니라 `MemberController` + `MemberSigninInterceptor` + Session 조합의
  직접 구현 방식을 그대로 사용하고 있습니다 (STS3 Legacy 방식과 동일한 패턴 유지).
- `WebConfig`의 Interceptor 경로 등록 중 상당 부분이 주석 처리되어 있어, 현재는
  `/member/modify` 한 경로만 로그인 보호 대상입니다.
- `application.properties`에 DB 계정과 메일 계정이 평문으로 직접 작성되어 있습니다
  (STS3 `mail-context.xml`, `jdbc-context.xml`에서 관찰된 것과 동일한 패턴).
- `spring.jpa.hibernate.ddl-auto=update`가 주석 처리되어 있어 JPA가 테이블을
  자동 생성/변경하지 않고, 기존 테이블을 그대로 사용합니다.

## 6. 다음 문서

Legacy(STS3)와 Boot의 구조적 차이, Boot를 쓰는 이유, STS3 프로젝트가 그대로
구동되지 않는 이유는 [01_LEGACY_VS_BOOT.md](01_LEGACY_VS_BOOT.md)에서 다룹니다.
