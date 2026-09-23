# SamplePjt / PracPjt 해석본

## 이 문서를 하나로 묶어 작성한 이유

`SamplePjt`와 `PracPjt`는 패키지명(`com.office.samplepjt` vs `com.office.pracpjt`)과
파일명 대소문자(`HoneController` vs `HomeController`, 오타 포함) 정도만 다를 뿐,
클래스 구조·메서드·템플릿이 전부 동일한 **같은 연습을 두 번 반복한 프로젝트**입니다.
`calendar`처럼 실제 DB, Security, Mail이 연동된 프로젝트가 아니라, Boot의
Controller-Service-DAO-DTO 뼈대를 손에 익히기 위한 최초 연습용 템플릿이므로,
`BookRentalPjt`/`calendar` 수준의 파일별 심층 해석본 대신 이 통합 문서 하나로
정리합니다(내용이 사실상 중복인 두 프로젝트에 똑같은 문서를 두 벌 만드는 것은
불필요한 반복이라고 판단했습니다).

## 1. 패키지 구조 (두 프로젝트 공통)

```text
com.office.{samplepjt|pracpjt}
├─ Ho(m|n)eController.java     "/" 요청 처리, home.html 반환
├─ {SamplePjt|PracPjt}Application.java   @SpringBootApplication 진입점
└─ member
   ├─ MemberController.java    /member/signup, /member/signup_confirm, /member/signin
   ├─ MemberService.java       signup_confirm() 위임만 수행
   ├─ MemberDao.java           System.out.println으로 값만 출력 (실제 DB 연동 없음)
   └─ MemberDto.java           mId, mPw, mMail 세 필드 + getter/setter (Lombok 미사용)

resources
├─ application.properties      spring.application.name, server.port, thymeleaf 설정만 존재
└─ templates
   ├─ home.html                순수 HTML, Thymeleaf 문법(th:*) 미사용
   └─ member/{signin.html, signup.html}
```

## 2. `calendar`와 비교했을 때 "없는 것"이 학습 포인트

```text
calendar에는 있고, SamplePjt/PracPjt에는 없는 것
  실제 DataSource 연결 (application.properties에 spring.datasource.* 자체가 없음)
  JdbcTemplate / MyBatis / JPA 등 실제 데이터 접근 기술
  PasswordEncoder, Session, Interceptor를 이용한 로그인 처리
  Lombok(@Data 등)을 이용한 DTO 간소화 (getter/setter를 손으로 직접 작성)
  th:action, th:href 등 Thymeleaf 동적 바인딩 (순수 HTML 폼만 사용)
```

`MemberDao.insertNewMember()`가 실제로 하는 일은 SQL 실행이 아니라
`System.out.println()`으로 전달받은 값을 출력하는 것뿐입니다.

```java
public void insertNewMember(MemberDto memberDto) {
    System.out.println("memberDto getmId: " + memberDto.getmId());
    System.out.println("memberDto getmPw: " + memberDto.getmPw());
    System.out.println("memberDto getmMail: " + memberDto.getmMail());
}
```

즉 이 두 프로젝트의 목적은 "DB 없이도 Controller -> Service -> DAO로 값이
어떻게 전달되는지"만 확인하는 것이며, `calendar`가 여기에 실제 DB/보안/메일
연동을 얹은 다음 단계임을 알 수 있습니다.

## 3. 요청 흐름 (두 프로젝트 동일)

```text
GET /                    -> Ho(m|n)eController.home() -> "home" -> home.html
GET /member/signup       -> MemberController.signup() -> "member/signup" -> signup.html
POST /member/signup_confirm (mId, mPw, mMail)
                          -> MemberController.signup_confirm(memberDto)
                          -> MemberService.signup_confirm(memberDto)
                          -> MemberDao.insertNewMember(memberDto)  (콘솔 출력만)
                          -> "member/signup_ok"  (※ signup_ok.html 파일은 존재하지 않음)
GET /member/signin       -> MemberController.signin() -> "member/signin" -> signin.html
```

## 4. `application.properties` (두 프로젝트 동일 패턴, 포트만 다름)

```properties
# SamplePjt
spring.application.name=SamplePjt
server.port=(미지정, 기본값 8080)

# PracPjt
spring.application.name=PracPjt
server.port=8091
```

`spring.thymeleaf.*` 설정은 `calendar`와 동일한 4줄을 그대로 갖고 있지만,
DB/Mail/로깅 관련 설정은 전혀 없습니다. 실제 데이터 접근 기술이 없으므로
필요하지 않은 설정입니다.

## 5. 현재 코드에서 확인되는 주의점

- **`MemberController.signup_confirm()`이 반환하는 `"member/signup_ok"`에 대응하는
  `signup_ok.html` 템플릿이 두 프로젝트 모두에 존재하지 않습니다.** 실제로 회원가입
  폼을 제출하면 Thymeleaf가 템플릿을 찾지 못해 오류 화면이 나타납니다. `BookRentalPjt`의
  00_README.md 3절에서도 "현재 코드와 원본 파일의 불일치"를 별도로 기록해 둔 것과
  같은 종류의 문제입니다.
- **`SamplePjt`의 진입 Controller 이름이 `HoneController`로 오타(Home -> Hone)가
  나 있습니다.** `PracPjt`에서는 `HomeController`로 정정되어 있어, `PracPjt`가
  `SamplePjt`를 그대로 복사한 뒤 발견한 오타를 고친 반복 연습용 사본임을 짐작할 수
  있습니다.
- **`PracPjt.MemberController`에 `import java.lang.reflect.Member;`가 남아
  있습니다.** 클래스 이름 `Member`를 IDE가 자동완성하면서 (프로젝트에서 만든 회원
  도메인 클래스가 아니라) JDK의 리플렉션 API 클래스를 잘못 import한 것으로 보이며,
  코드 어디에서도 사용되지 않는 미사용 import입니다.
- 두 프로젝트 모두 `home.html`, `signin.html`, `signup.html`이 Thymeleaf 문법을
  전혀 쓰지 않는 순수 HTML입니다. 폼 action도 `th:action`이 아닌 정적 문자열
  (`action="/member/signup_confirm"`)이라, 값이 고정된 이 단계에서는 문제가
  없지만 `calendar`처럼 서버 데이터를 화면에 채워야 하는 순간부터는 Thymeleaf
  문법 전환이 필요합니다.

## 6. 다음 단계로서 `calendar`와의 연결

이 두 프로젝트에서 익힌 "Controller가 Service를 부르고, Service가 DAO를 부른다"는
뼈대는 [calendar/calendar/00_SYSTEM_OVERVIEW.md](calendar/calendar/00_SYSTEM_OVERVIEW.md)에서
그대로 재사용되며, 거기에 실제 DB(JdbcTemplate/MyBatis/JPA 3종 비교), Session/Interceptor
로그인, BCrypt 암호화, 메일 발송이 차례로 추가된 것이 `calendar`입니다.
