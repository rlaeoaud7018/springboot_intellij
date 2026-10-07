# CalendarApplication.java 해석본

## 역할

`calendar` 프로젝트의 실행 진입점입니다. Legacy(STS3)에서 `web.xml` + Tomcat이 담당하던
"애플리케이션을 시작시키는 일"을 이 클래스 하나의 `main()` 메서드가 대신합니다.

```java
@SpringBootApplication
public class CalendarApplication {

    public static void main(String[] args) {
        SpringApplication.run(CalendarApplication.class, args);
    }

}
```

## `@SpringBootApplication`이 하는 일

이 애노테이션 하나가 다음 세 가지를 합쳐 놓은 것입니다.

```text
@SpringBootApplication
  = @Configuration            이 클래스 자체도 설정 클래스로 취급
  + @EnableAutoConfiguration  classpath에 있는 라이브러리를 보고 Bean을 자동 등록
  + @ComponentScan            이 클래스가 있는 패키지(com.office.calendar) 이하를 전부 스캔
```

Legacy의 `servlet-context.xml`에 있던 다음 설정이 여기 한 줄로 압축된 것과 같습니다.

```xml
<context:component-scan base-package="com.office.library" .../>
```

`com.office.calendar` 패키지 이하의 `@Controller`, `@Service`, `@Repository`, `@Component`,
`@Configuration`이 전부 이 애노테이션 하나로 자동 등록됩니다.

## `SpringApplication.run()`이 실행되는 순간 벌어지는 일

```text
main() 실행
  -> SpringApplication.run()
  -> ApplicationContext 생성
  -> component-scan으로 Bean 등록
  -> application.properties 읽어서 자동 설정 적용 (DataSource, Thymeleaf, Mail, JPA, MyBatis ...)
  -> 내장 Tomcat 기동 (포트 8090)
  -> 요청을 받을 준비 완료
```

Legacy처럼 "Tomcat이 먼저 뜨고, 그 안에서 web.xml을 읽는" 순서가 아니라,
"이 프로세스가 스스로 Tomcat까지 포함해서 기동하는" 순서입니다.

## 현재 코드에서 확인되는 주의점

```java
import org.mybatis.spring.annotation.MapperScan;
```

`@MapperScan`을 import했지만 클래스에는 실제로 붙어 있지 않습니다(`@SpringBootApplication`만 존재).
이 프로젝트의 `MemberMapper`는 인터페이스 자체에 `@Mapper` 애노테이션을 붙이는 방식을 쓰고 있어서
`@MapperScan`이 없어도 정상 동작합니다. 즉 이 import는 `@MapperScan(basePackages = "...")` 방식을
시도했다가 개별 `@Mapper` 방식으로 바꾼 흔적으로 보이는 미사용 코드입니다. 동작에는 영향이 없지만,
Mapper 인터페이스가 늘어나면 두 방식(`@MapperScan` vs 개별 `@Mapper`) 중 하나로 통일하는 것이
일관성 있는 정리 방향입니다.
