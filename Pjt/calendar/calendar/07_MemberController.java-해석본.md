# MemberController.java 해석본

## 역할

`/member` 하위의 회원가입, 로그인, 로그아웃, 계정 수정, 비밀번호 찾기 요청을 모두
처리하는 Controller입니다. Legacy `BookRentalPjt`의 `UserMemberController`에 대응합니다.

```java
@Controller
@RequestMapping("/member")
public class MemberController {

    final private MemberService memberService;

    public MemberController(MemberService memberService) {
        this.memberService = memberService;
    }
    ...
}
```

## 생성자 주입 방식

`@Autowired` 필드 주입이 아니라 **생성자 주입**을 사용합니다. 생성자가 하나뿐이면
Spring이 `@Autowired` 없이도 자동으로 `MemberService` Bean을 주입합니다. 필드에
`final`이 붙어 있어 생성 이후 재할당이 불가능한 것도 이 방식의 특징입니다.

## 메서드별 URL과 흐름

```text
GET  /member/signup             -> "member/signup_form"
POST /member/signup_confirm     -> memberService.signupConfirm() -> "member/signup_result"
GET  /member/signin             -> "member/signin_form"
POST /member/signin_confirm     -> memberService.signinConfirm() -> Session 저장 -> "member/signin_result"
GET  /member/signout_confirm    -> session.invalidate() -> "redirect:/"
GET  /member/modify             -> Session의 로그인ID로 조회 -> "member/modify_form"
POST /member/modify_confirm     -> memberService.modifyConfirm() -> "member/modify_result"
GET  /member/findpassword       -> "member/findpassword_form"
POST /member/findpassword_confirm -> memberService.findpasswordConfirm() -> "member/findpassword_result"
```

## 로그인 성공 시 Session 처리

```java
String loginedID = memberService.signinConfirm(memberDto);
model.addAttribute("loginedID", loginedID);

if (loginedID != null) {
    session.setAttribute("loginedID", loginedID);
    session.setMaxInactiveInterval(60 * 30);
}
```

Service가 로그인 성공 시 회원 ID 문자열을, 실패 시 `null`을 반환하는 규약을 그대로
사용합니다. `session.setMaxInactiveInterval(60 * 30)`으로 세션 유효 시간을 30분으로
제한합니다. 이 Session의 `"loginedID"` 값은 [MemberSigninInterceptor.java](src/main/java/com/office/calendar/member/MemberSigninInterceptor.java)와
Thymeleaf 화면(`header_nav_footer.html`의 `${session.loginedID}`)에서도 그대로 참조됩니다.

## `modify()`에서 로그인 사용자 조회

```java
String loginedID = String.valueOf(session.getAttribute("loginedID"));
MemberDto loginedMemberDto = memberService.modify(loginedID);
model.addAttribute("loginedMemberDto", loginedMemberDto);
```

로그인 여부 자체는 이 메서드가 검사하지 않습니다. `/member/modify` 경로에
[WebConfig.java](src/main/java/com/office/calendar/config/WebConfig.java)가 등록한
`MemberSigninInterceptor`가 먼저 실행되어 비로그인 접근을 차단하는 구조이므로,
이 메서드는 "이미 로그인되어 있다"는 전제 하에 작성되어 있습니다.

## 앞뒤 연결

```text
signin_form.html (폼)
  -> POST /member/signin_confirm
  -> MemberController.signinConfirm()
  -> MemberService.signinConfirm()
  -> MemberRepository (JPA)
  -> HttpSession
  -> signin_result.html
```

## 현재 코드에서 확인되는 주의점

- 모든 메서드가 `System.out.println(CLASS_NAME.concat(...))`으로 로그를 남깁니다.
  [HomeController.java](05_HomeController.java-해석본.md)는 `@Slf4j`를 사용하므로, 같은 프로젝트
  안에서 로깅 방식이 파일마다 다릅니다.
- `findpassword(MemberDto memberDto, Model model)`은 `GET` 요청인데도 `MemberDto`를
  파라미터로 받습니다. GET 요청은 보통 바인딩할 폼 데이터가 없으므로 이 파라미터는
  실제로 사용되지 않는 것으로 보이며, 정리 시 제거해도 되는 부분입니다.
