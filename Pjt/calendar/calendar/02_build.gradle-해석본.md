# build.gradle 해석본

## 역할

Legacy `BookRentalPjt`의 `pom.xml`(Maven)과 같은 역할을 하는, Gradle 기반 빌드
설정 파일입니다. 어떤 라이브러리를 쓸지, 어떻게 빌드할지를 정의합니다.

```groovy
plugins {
    id 'java'
    id 'org.springframework.boot' version '4.1.1'
    id 'io.spring.dependency-management' version '1.1.7'
}
```

`org.springframework.boot` 플러그인이 "실행 가능한 JAR(내장 Tomcat 포함)로 빌드"를
가능하게 하고, `io.spring.dependency-management`가 아래 의존성들의 버전을
서로 호환되도록 자동으로 맞춰줍니다. Legacy `pom.xml`에서 각 라이브러리 버전을
`<properties>`에 일일이 명시하고 조합을 맞추던 작업을, 이 두 플러그인이 대신합니다.

## Maven `pom.xml`과의 대응

```text
Maven (pom.xml)                          Gradle (build.gradle)
<packaging>war</packaging>               (기본값이 실행 가능 JAR, WAR 지정 안 함)
<dependency>...</dependency>             implementation '...'
<properties>로 버전 관리                  io.spring.dependency-management 플러그인
mvn package                              ./gradlew build
```

이 프로젝트는 `<packaging>war</packaging>` 같은 지정이 없으므로 **내장 Tomcat이
포함된 실행 가능 JAR**로 빌드됩니다. 이는 `BookRentalPjt`가 WAR로만 빌드되어
외부 Tomcat 없이는 실행조차 안 되는 것과 근본적으로 다른 부분입니다
(자세한 설명은 `01_LEGACY_VS_BOOT.md` 2절 참고).

## 의존성 목록과 역할

```groovy
implementation 'org.springframework.boot:spring-boot-starter-thymeleaf'   // View: Thymeleaf
implementation 'org.springframework.boot:spring-boot-starter-webmvc'      // Spring MVC + 내장 Tomcat
implementation 'org.springframework.boot:spring-boot-starter-jdbc'        // DataSource + JdbcTemplate 자동 설정
implementation 'com.mysql:mysql-connector-j'                              // MySQL 드라이버
implementation 'org.springframework.boot:spring-boot-starter-security'    // Spring Security (BCrypt만 사용 중)
compileOnly 'org.projectlombok:lombok'                                    // @Data, @Builder 등
annotationProcessor 'org.projectlombok:lombok'                            // Lombok 코드 생성기
implementation 'org.springframework.boot:spring-boot-starter-mail'        // JavaMailSender 자동 설정
implementation 'org.springframework.boot:spring-boot-starter-log4j2'      // Log4j2 로깅
implementation 'org.mybatis.spring.boot:mybatis-spring-boot-starter:4.1.0' // MyBatis
implementation 'org.springframework.boot:spring-boot-starter-data-jpa'    // JPA(Hibernate)
developmentOnly 'org.springframework.boot:spring-boot-devtools'           // 자동 재시작
```

MyBatis와 JPA(Data JPA)가 **동시에** 의존성으로 들어있는 것이 이 프로젝트의
가장 두드러진 특징입니다. 실제 서비스라면 데이터 접근 기술을 하나로 통일하지만,
이 프로젝트는 두 기술을 나란히 두고 `MemberMapper`(MyBatis)와
`MemberRepository`(JPA)를 모두 만들어 비교 학습하려는 목적이 build.gradle
수준에서부터 드러납니다.

## `configurations` 블록

```groovy
configurations {
    compileOnly {
        extendsFrom annotationProcessor
    }
    all {
        exclude group: 'org.springframework.boot', module: 'spring-boot-starter-logging'
    }
}
```

`spring-boot-starter-logging`(기본 Logback)을 모든 의존성에서 제외합니다.
`spring-boot-starter-log4j2`와 기본 로깅 라이브러리가 동시에 classpath에 있으면
충돌하므로, Log4j2를 쓰기로 한 이상 기본 로깅은 빼야 합니다.
`application.properties`의 `logging.config=classpath:logger/log4j2.xml` 설정이
정상 동작하기 위한 필수 조건이기도 합니다.

## 테스트 관련

```groovy
testImplementation 'org.springframework.boot:spring-boot-starter-thymeleaf-test'
testImplementation 'org.springframework.boot:spring-boot-starter-webmvc-test'
testRuntimeOnly 'org.junit.platform:junit-platform-launcher'
```

```groovy
tasks.named('test') {
    useJUnitPlatform()
}
```

JUnit 5(Jupiter) 플랫폼을 사용하도록 지정합니다. 다만 `src/test`에는
`CalendarApplicationTests.java` 하나(컨텍스트 로딩만 확인하는 기본 생성 테스트)만
있고, Member 기능에 대한 실제 테스트 코드는 아직 작성되어 있지 않습니다.

## 현재 코드에서 확인되는 주의점

Spring Boot 4.1.1을 사용하면서 `spring-boot-starter-web` 대신
`spring-boot-starter-webmvc`라는 이름을 쓰고 있습니다. 스타터 명칭이 버전에 따라
바뀔 수 있다는 점을 보여주는 사례이며, 다른 Boot 버전/문서를 참고할 때는 이
프로젝트가 고정한 버전(`4.1.1`) 기준으로 스타터 이름을 확인해야 혼동이 없습니다.
