# MemberSigninInterceptor.java 해석본

## 역할

로그인 여부를 확인하는 Interceptor입니다. Controller 메서드가 실행되기 **전에** 먼저
실행되어, Session에 로그인 정보가 없으면 로그인 화면으로 돌려보냅니다.

```java
@Component
public class MemberSigninInterceptor implements HandlerInterceptor {

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        HttpSession session = request.getSession();
        Object obj = session.getAttribute("loginedID");
        if (obj != null)
            return true;

        response.sendRedirect("/member/signin");
        return false;
    }
}
```

## `preHandle()`의 반환값이 갖는 의미

```text
true  반환  -> 요청이 실제 Controller 메서드까지 진행됨
false 반환  -> 요청이 여기서 멈추고, sendRedirect()로 응답이 이미 끝남
```

`MemberController.signinConfirm()`이 로그인 성공 시 Session에 저장한 `"loginedID"` 값을
그대로 이 Interceptor가 확인합니다. 즉 로그인 처리(쓰기)와 로그인 확인(읽기)이 같은
Session 키 `"loginedID"`를 공유하는 것이 이 구조가 성립하는 전제입니다.

## Legacy와의 대응

STS3 `BookRentalPjt`의 `UserMemberLoginInterceptor`와 이름, 구조, 동작 방식이 완전히 동일합니다.
`HandlerInterceptor` 인터페이스는 Spring MVC(Legacy)와 Spring Boot에서 코드 한 글자
다르지 않게 그대로 재사용됩니다. 등록 방식만 다릅니다.

```text
Legacy: servlet-context.xml의 <mvc:interceptors> XML
Boot:   WebConfig.addInterceptors() Java 코드
```

## 언제 실행되는가

`@Component`로 등록된 이 Bean이 [WebConfig.java](15_WebConfig.java-해석본.md)의
`addInterceptors()`에서 `/member/modify` 경로에 매핑되어 있으므로, 오직
`GET /member/modify` 요청에서만 실행됩니다. 다른 `/member/**` 경로에는 적용되지
않습니다(자세한 내용은 `15_WebConfig.java-해석본.md`의 주의점 참고).

## 현재 코드에서 확인되는 주의점

`session.getAttribute("loginedID")`가 `null`이 아니기만 하면 통과시킵니다. 로그아웃
시점에는 `MemberController.signoutConfirm()`이 `session.invalidate()`로 세션 전체를
없애므로 문제가 없지만, 세션 타임아웃(30분, `MemberController`에서 설정)이 지나
`loginedID` 없이 자동 만료된 세션에 대해서는 `session.getSession()`이 새 세션을
만들어 반환하므로 항상 `obj == null`이 되어 정상적으로 로그인 페이지로 리다이렉트됩니다.
