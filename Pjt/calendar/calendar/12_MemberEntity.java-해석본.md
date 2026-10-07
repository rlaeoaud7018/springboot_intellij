# MemberEntity.java 해석본

## 역할

JPA(Java Persistence API) 방식의 데이터 접근에서 `USER_MEMBER` 테이블 한 행(row)을
그대로 자바 객체로 표현하는 Entity입니다. `MemberDao`/`MemberMapper`처럼 "SQL을
직접 쓰는" 계층이 아니라, **객체를 저장/조회하면 JPA(Hibernate)가 알아서 SQL을
만들어주는** 방식의 핵심 클래스입니다.

```java
@Entity
@Table(name = "USER_MEMBER", uniqueConstraints = {@UniqueConstraint(columnNames = "ID")})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MemberEntity {

    @Id
    @Column(name = "NO")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int memNo;

    @Column(name = "ID", nullable = false, length = 20)
    private String memId;
    ...
}
```

## 애노테이션별 의미

```text
@Entity                  이 클래스가 JPA 관리 대상(테이블과 매핑되는 클래스)임을 선언
@Table(name=...)         매핑되는 실제 테이블 이름 지정 (USER_MEMBER)
@UniqueConstraint        ID 컬럼에 UNIQUE 제약 (같은 ID로 두 번 가입 불가)
@Id                      기본키(PK) 필드
@GeneratedValue(IDENTITY) DB의 AUTO_INCREMENT에 위임해 번호를 자동 채번
@Column(name=..., nullable=..., length=...)  실제 컬럼명과 제약조건
```

## `@PrePersist` / `@PreUpdate`: JPA의 생명주기 콜백

```java
@PrePersist
protected void onCreate() {
    this.memAuthorityNo = 1;
    this.memRegDate = LocalDateTime.now();
    this.memModDate = LocalDateTime.now();
}

@PreUpdate
protected void onUpdate() {
    this.memModDate = LocalDateTime.now();
}
```

`memberRepository.save()`로 **처음 저장(INSERT)되기 직전**에 `onCreate()`가,
**이미 있는 행을 수정(UPDATE)하기 직전**에 `onUpdate()`가 JPA에 의해 자동 호출됩니다.
Legacy나 `MemberDao`/`MemberMapper` 방식에서는 이런 값(가입일, 수정일, 기본 권한)을
Service 코드가 직접 채워 넣어야 했지만, JPA에서는 Entity 자신이 "저장되는 시점"을
알고 스스로 채웁니다.

## `toDto()`: Entity를 DTO로 되돌리는 지점

```java
public MemberDto toDto() {
    ...
    return MemberDto.builder()
            .no(memNo).id(memId).pw(memPw).mail(memMail).phone(memPhone)
            .authority_no(memAuthorityNo)
            .reg_date(memRegDate != null ? memRegDate.format(formatter) : null)
            .mod_date(memModDate != null ? memModDate.format(formatter) : null)
            .build();
}
```

`MemberDto.toEntity()`의 반대 방향입니다. `LocalDateTime`(Entity)을 `yyyy-MM-dd HH:mm:ss`
형식의 `String`(DTO)으로 변환합니다. View(Thymeleaf)는 `LocalDateTime` 객체를 직접
다루지 않고 이미 문자열로 변환된 값만 받습니다.

## 앞뒤 연결

```text
MemberRepository.findByMemId(id)
  -> Optional<MemberEntity>
  -> memberEntity.toDto()
  -> MemberDto
  -> Model
  -> Thymeleaf 화면
```

## 현재 코드에서 확인되는 주의점

`toDto()`는 `phone` -> `mail` 순서로 모든 필드를 빠짐없이 옮기지만, 반대 방향인
[MemberDto.toEntity()](13_MemberDto.java-해석본.md)는 `memPhone` 매핑이 빠져 있어
양방향 변환이 대칭을 이루지 못합니다. 이 Entity의 `memPhone`은 `nullable = false`이므로,
`toEntity()`로 만들어진 객체를 그대로 저장하면 DB 제약조건 위반 가능성이 있습니다.
