# SecurityConfig.java 해석본

## 역할

Spring Security의 Java Config 클래스입니다. Legacy `BookRentalPjt`의 `security-context.xml`
(BCrypt Bean만 정의하는 XML)과 같은 역할을, Boot에서는 `@Configuration` 클래스로 표현합니다.

```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.disable())
            .csrf(csrf -> csrf.disable());

        http
            .formLogin(login -> login.disable());

        return http.build();
    }

}
```

## `passwordEncoder()` Bean

`MemberService`가 회원가입/로그인/비밀번호 재설정 시 주입받는 `PasswordEncoder`가
바로 이 Bean입니다. Legacy와 동일하게 `BCryptPasswordEncoder`를 사용합니다.

```text
평문 비밀번호 -> passwordEncoder.encode() -> DB 저장
로그인 시 입력값 -> passwordEncoder.matches(입력값, DB값) -> boolean
```

## `filterChain()`이 하는 일: "Security는 있지만 로그인은 직접 구현"

이 프로젝트는 Spring Security가 제공하는 로그인 폼, 인증 절차를 **모두 비활성화**하고
있습니다.

```java
.csrf(csrf -> csrf.disable())     // CSRF 토큰 검사 끔
.cors(cors -> cors.disable())     // CORS 정책 검사 끔
.formLogin(login -> login.disable())  // Security의 기본 로그인 폼 비활성화
```

즉 Spring Security 의존성이 프로젝트에 들어있음에도 불구하고, 실제 로그인 절차는
Security의 인증 필터가 아니라 `MemberController` + `MemberService` + `HttpSession`
조합으로 직접 구현되어 있습니다(이는 STS3 `BookRentalPjt`의 로그인 방식과 동일한 패턴입니다).
이 클래스가 Security로부터 실제로 가져다 쓰는 것은 **BCrypt 암호화 기능 하나**뿐입니다.

## 현재 코드에서 확인되는 주의점

- `csrf().disable()`은 개발/학습 단계에서 폼 전송을 간단히 테스트하기 위한 설정입니다.
  실서비스라면 CSRF 보호를 켜고 `th:action` 폼에 CSRF 토큰을 포함시켜야 합니다.
- `formLogin().disable()`로 Security의 인증 절차 자체를 쓰지 않으므로, 현재 이 프로젝트에서
  "로그인 여부 확인"은 전적으로 [MemberSigninInterceptor.java](src/main/java/com/office/calendar/member/MemberSigninInterceptor.java)와
  Session에 의존합니다. Security의 `SecurityFilterChain`은 이름과 달리 이 프로젝트에서는
  인가(authorization) 역할을 거의 하지 않습니다.
