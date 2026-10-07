# MemberDto.java 해석본

## 역할

Controller, Service, View(Thymeleaf) 사이에서 회원 데이터를 운반하는 DTO입니다.

```java
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MemberDto {
    private int no;
    private String id;
    private String pw;
    private String mail;
    private String phone;
    private int authority_no;
    private String reg_date;
    private String mod_date;

    public MemberEntity toEntity() { ... }
}
```

## Lombok 애노테이션의 의미

```text
@Data              getter/setter/toString/equals/hashCode 자동 생성
@NoArgsConstructor  기본 생성자 (Thymeleaf 폼 바인딩, MyBatis 결과 매핑에 필요)
@AllArgsConstructor 전체 필드 생성자
@Builder            MemberDto.builder()....build() 형태의 생성 방식
```

Legacy `BookRentalPjt`의 DTO는 `@Getter`/`@Setter`만 쓰는 경우가 많았지만, `calendar`는
`@Data` + `@Builder` 조합으로 더 간결하게 표현합니다. 폼 파라미터 바인딩(`@ModelAttribute`
생략형)이 동작하려면 기본 생성자 + setter가 필요하므로 `@NoArgsConstructor`가 필수입니다.

## `toEntity()`: DTO와 JPA Entity를 연결하는 지점

```java
public MemberEntity toEntity() {
    DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    return MemberEntity.builder()
            .memNo(no)
            .memId(id)
            .memPw(pw)
            .memMail(mail)
            .memAuthorityNo(authority_no)
            .memRegDate(reg_date != null ? LocalDateTime.parse(reg_date, formatter) : null)
            .memModDate(mod_date != null ? LocalDateTime.parse(mod_date, formatter) : null)
            .build();
}
```

DTO의 필드명(`id`, `pw`, `mail` ...)과 JPA Entity의 필드명(`memId`, `memPw`, `memMail` ...)이
다르기 때문에, 화면/Controller 계층(DTO)과 DB 매핑 계층(Entity)을 분리해 두고 이 메서드가
그 경계를 연결합니다. `MemberEntity`에도 반대 방향 변환 메서드 `toDto()`가 있어 양방향으로
오갈 수 있습니다.

## 앞뒤 연결

```text
Thymeleaf 폼 (name="id", name="pw" ...)
  -> MemberController 메서드 파라미터 MemberDto memberDto (자동 바인딩)
  -> MemberService
  -> memberDto.toEntity()
  -> MemberRepository (JPA)
```

## 현재 코드에서 확인되는 주의점

`toEntity()`에는 `phone` 필드를 `memPhone`으로 옮기는 코드가 **빠져 있습니다.**

```text
MemberDto 필드:    no, id, pw, mail, phone, authority_no, reg_date, mod_date
toEntity()에서 옮기는 필드: no, id, pw, mail,       authority_no, reg_date, mod_date
                                        ^^^^^ phone 누락
```

`MemberEntity.memPhone`은 `@Column(nullable = false)`로 선언되어 있으므로, 이 메서드를 거쳐
저장을 시도하면 `phone` 값이 항상 `null`로 들어가 DB 제약조건 위반(NOT NULL 위반) 예외가
발생할 가능성이 있습니다. 실제로 `MemberService.signupConfirm()`이 `memberDto.toEntity()`를
그대로 `memberRepository.save()`에 전달하므로, 회원가입 시 이 경로를 타면 `phone`이
누락된 채로 저장을 시도하게 됩니다. `toEntity()`에 `.memPhone(phone)` 한 줄을 추가해야
`MemberEntity`의 `toDto()`와 대칭이 맞습니다.
