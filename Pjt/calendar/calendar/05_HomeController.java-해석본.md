# HomeController.java 해석본

## 역할

애플리케이션의 첫 화면(`/`)을 처리합니다.

```java
@Slf4j
@Controller
public class HomeController {

    @GetMapping({"", "/"})
    public String home() {
        log.debug("DEBUG:: home()");
        log.info("INFO:: home()");
        log.warn("WARN:: home()");
        log.error("ERROR:: home()");

        String nextPage = "home";
        return nextPage;
    }

}
```

## BookRentalPjt의 `HomeController`와의 차이

STS3 `BookRentalPjt`의 `HomeController`는 `/`를 `/user/`로 **redirect**하고,
실제 화면은 별도의 `UserHomeController`가 그렸습니다.

```text
BookRentalPjt
  GET / -> HomeController -> redirect:/user/ -> UserHomeController -> user/home

calendar
  GET / -> HomeController -> "home" (redirect 없이 곧바로 뷰 이름 반환)
```

`calendar`는 아직 사용자/관리자 영역이 분리되지 않은 학습 초기 단계이므로,
`HomeController` 하나가 홈 화면까지 직접 처리합니다. 영역이 나뉘는 시점이 오면
`BookRentalPjt`처럼 진입점 Controller와 화면 Controller를 분리하는 구조로 확장될 수 있습니다.

## View 이름 해석

```text
"home"
  -> spring.thymeleaf.prefix=classpath:/templates/
  -> spring.thymeleaf.suffix=.html
  -> classpath:/templates/home.html
```

Legacy의 `InternalResourceViewResolver`(prefix/suffix를 XML로 지정)와 정확히 같은 역할을
Boot에서는 `application.properties`의 두 줄이 대신합니다.

## `@Slf4j`와 로그 4단계 호출

```java
log.debug(...); log.info(...); log.warn(...); log.error(...);
```

Lombok `@Slf4j`가 컴파일 시점에 `private static final Logger log = LoggerFactory.getLogger(...)`를
자동 생성해 줍니다. 네 줄 모두 실제 로직이 아니라 `logger/log4j2.xml` 설정이 레벨별로
어떤 파일에 기록되는지 확인하기 위한 학습/테스트 목적의 호출로 보입니다
(`com.office` 로거가 `debug` 레벨부터 콘솔과 `logs/spring-app-*.log` 4개 파일에 나뉘어 기록됨).

## 현재 코드에서 확인되는 주의점

주석 처리된 `CLASS_NAME` 필드와 `System.out.println` 대신 `@Slf4j`를 사용하는 점으로 보아,
이 파일은 `System.out.println` 기반 로깅(`MemberController`, `MemberService`, `MemberDao`에서
여전히 사용 중)에서 `log4j2` 기반 로깅으로 전환을 시험해 본 파일로 보입니다. 같은 프로젝트
안에서도 파일별로 로깅 방식이 통일되어 있지 않은 상태입니다.
