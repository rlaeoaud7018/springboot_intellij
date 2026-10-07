# calendar 프로젝트 해석본 목차

## 이 프로젝트를 읽는 목표

`calendar`는 `springboot_intellij/Pjt` 안에서 가장 발전된 Spring Boot 학습
프로젝트입니다. STS3 `LegacyTemplatePjt`/`BookRentalPjt`에서 배운 MVC 흐름
(Controller -> Service -> DAO -> DB -> Model/Session -> View)이 Boot에서
어떻게 배선되는지, 그리고 같은 기능을 **JdbcTemplate / MyBatis / JPA** 세 가지
데이터 접근 기술로 구현하면 무엇이 달라지는지를 비교 학습하는 것이 목표입니다.

Legacy(STS3)와 Boot의 구조적 차이 자체는 상위 문서인
[../../00_README.md](../../00_README.md), [../../01_LEGACY_VS_BOOT.md](../../01_LEGACY_VS_BOOT.md)에서
다뤘으므로, 이 문서부터는 `calendar` 프로젝트 자체의 세부 동작에 집중합니다.

## 1. 먼저 읽을 문서

1. [calendar 전체 시스템 해석본](01_SYSTEM_OVERVIEW.md)
2. [회원(Member) 기능 전체 흐름 — 3가지 데이터 접근 방식 비교](06_MEMBER_FLOW.md)
3. [화면(View) 계층 해석본 — Thymeleaf/CSS/JS](17_VIEW_LAYER.md)
4. 아래 파일별 해석본 (계층 순서대로)

## 2. 현재 해석 진행 상태

| 단계 | 대상 | 상태 |
|---|---|---|
| 전체 지도 | 실행 구조와 계층별 흐름 | 완료 |
| 실행 준비 | `build.gradle` | 완료 |
| 설정 | `application.properties`, `log4j2.xml`, `mybatis-config.xml` | 완료 |
| 진입점/첫 화면 | `CalendarApplication`, `HomeController` | 완료 |
| 보안/배선 | `SecurityConfig`, `WebConfig`, `MemberSigninInterceptor` | 완료 |
| 회원 기능 | Controller, Service, DTO, 3종 데이터 접근 계층(DAO/Mapper/Repository), Entity | 완료 |
| 화면 자원 | Thymeleaf 템플릿, CSS, JS (통합 문서) | 완료 |
| Planner 기능 | 메뉴/CSS만 존재, 실제 구현 없음 | 미구현 (해석 대상 아님) |

## 3. 파일별 해석본

### 실행/설정

- [02_build.gradle-해석본.md](02_build.gradle-해석본.md)
- [03_application.properties-해석본.md](03_application.properties-해석본.md)
- [18_log4j2.xml-해석본.md](18_log4j2.xml-해석본.md)
- [19_mybatis-config.xml-해석본.md](19_mybatis-config.xml-해석본.md)
- [20_member-mapper.xml-해석본.md](20_member-mapper.xml-해석본.md)

### 진입점 / 공통

- [04_CalendarApplication.java-해석본.md](04_CalendarApplication.java-해석본.md)
- [05_HomeController.java-해석본.md](05_HomeController.java-해석본.md)

### 보안 / 배선 (Java Config)

- [14_SecurityConfig.java-해석본.md](14_SecurityConfig.java-해석본.md)
- [15_WebConfig.java-해석본.md](15_WebConfig.java-해석본.md)
- [16_MemberSigninInterceptor.java-해석본.md](16_MemberSigninInterceptor.java-해석본.md)

### 회원(Member) 도메인

- [07_MemberController.java-해석본.md](07_MemberController.java-해석본.md)
- [08_MemberService.java-해석본.md](08_MemberService.java-해석본.md)
- [13_MemberDto.java-해석본.md](13_MemberDto.java-해석본.md)
- [09_MemberDao.java-해석본.md](09_MemberDao.java-해석본.md) — JdbcTemplate 방식 (현재 미사용)
- [10_MemberMapper.java-해석본.md](10_MemberMapper.java-해석본.md) — MyBatis 방식 (현재 미사용)
- [11_MemberRepository.java-해석본.md](11_MemberRepository.java-해석본.md) — JPA 방식 (현재 사용 중)
- [12_MemberEntity.java-해석본.md](12_MemberEntity.java-해석본.md)

기능 전체 흐름과 3가지 데이터 접근 방식 비교: [06_MEMBER_FLOW.md](06_MEMBER_FLOW.md)

### 화면 자원

Thymeleaf 템플릿(11개) + CSS + JS 전체 해석: [17_VIEW_LAYER.md](17_VIEW_LAYER.md)
(화면들이 구조적으로 매우 유사하여 파일별 문서 대신 통합 문서로 작성했습니다.)

## 4. 원본 파일 위치

```text
src/main/java/com/office/calendar/
├─ CalendarApplication.java
├─ HomeController.java
├─ config/
│  ├─ SecurityConfig.java
│  └─ WebConfig.java
└─ member/
   ├─ MemberController.java
   ├─ MemberService.java
   ├─ MemberDao.java
   ├─ MemberDto.java
   ├─ MemberSigninInterceptor.java
   ├─ jpa/MemberEntity.java
   ├─ jpa/MemberRepository.java
   └─ mapper/MemberMapper.java

src/main/resources/
├─ application.properties
├─ logger/log4j2.xml
├─ mybatis/config/mybatis-config.xml
├─ mybatis/mappers/member-mapper.xml
├─ static/{css,js,img}/*
└─ templates/{home.html, include/*, member/*}
```

## 5. 현재 코드와 원본의 불일치 / 관찰 사항 요약

전체 목록은 [01_SYSTEM_OVERVIEW.md](01_SYSTEM_OVERVIEW.md) 8절에 정리되어 있습니다.
가장 중요한 두 가지만 남깁니다.

- (수정 필요) `MemberDto.toEntity()`에 `phone` 매핑이 빠져 있어, 회원가입 시
  `USER_MEMBER.PHONE`(NOT NULL) 저장이 실패할 수 있습니다.
- (수정 필요) `MemberService.sendNewPasswordByMail()`이 실제 수신자 대신 고정된
  메일 주소로만 발송합니다.

## 6. 원본과 생성 산출물 구분

`BookRentalPjt`와 동일한 기준을 따릅니다.

```text
해석 대상
  src/main/java
  src/main/resources
  build.gradle

별도 취급
  build/, bin/, .gradle/, .idea/, .git/
```
