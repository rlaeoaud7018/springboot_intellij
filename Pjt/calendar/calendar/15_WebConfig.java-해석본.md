# WebConfig.java 해석본

## 역할

`WebMvcConfigurer`를 구현해 Interceptor를 등록하는 Java Config 클래스입니다.
Legacy `servlet-context.xml`의 `<mvc:interceptors>` XML 블록과 같은 역할을 합니다.

```java
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Autowired
    MemberSigninInterceptor memberSigninInterceptor;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(memberSigninInterceptor)
                .addPathPatterns("/member/modify");
    }
}
```

## Legacy XML과의 1:1 대응

```xml
<!-- Legacy: servlet-context.xml -->
<mvc:interceptors>
    <mvc:interceptor>
        <mvc:mapping path="/member/modify"/>
        <bean class="....MemberSigninInterceptor"/>
    </mvc:interceptor>
</mvc:interceptors>
```

```java
// Boot: WebConfig.java
registry.addInterceptor(memberSigninInterceptor)
        .addPathPatterns("/member/modify");
```

XML의 `<mvc:mapping path="...">`가 Java의 `.addPathPatterns("...")`로,
`<bean class="...">`가 `@Autowired`로 주입받은 Interceptor 인스턴스로 바뀐 것뿐,
"어떤 URL 패턴에 어떤 Interceptor를 적용하는가"라는 개념 자체는 동일합니다.

## 현재 보호되는 범위가 좁다는 점

주석 처리된 코드를 보면 원래 의도는 `/member/**` 전체를 보호하되 로그인이 필요 없는
경로만 예외로 빼는 것이었습니다.

```java
/*
registry.addInterceptor(memberSigninInterceptor)
        .addPathPatterns("/member/**")
        .excludePathPatterns(
                "/member/signup", "/member/signup_confirm",
                "/member/signin", "/member/signin_confirm",
                "/member/signout_confirm",
                "/member/findpassword", "/member/findpassword_confirm"
        );
*/
```

하지만 현재 활성화된 코드는 `/member/modify` **딱 한 경로**만 보호합니다.

## 현재 코드에서 확인되는 주의점

- `/member/modify`(수정 폼을 보여주는 GET)는 보호되지만, 실제로 DB를 변경하는
  `/member/modify_confirm`(POST)은 Interceptor 대상에 포함되어 있지 않습니다.
  즉 로그인하지 않은 사용자도 `no`, `pw`, `mail`, `phone` 파라미터만 알면
  `POST /member/modify_confirm`을 직접 호출해 다른 회원 정보를 수정할 수 있는
  경로가 열려 있습니다. 화면(`modify_form.html`)에서는 로그인한 사용자의 `no`만
  hidden 값으로 노출되지만, Interceptor가 없으므로 URL을 직접 호출하는 경우까지는
  막지 못합니다.
- 이 문제는 주석 처리된 `excludePathPatterns` 방식으로 되돌리면(즉 `/member/**`를
  기본 보호 대상으로 하고 로그인/가입 관련 경로만 예외 처리) 해결되는 구조입니다.
