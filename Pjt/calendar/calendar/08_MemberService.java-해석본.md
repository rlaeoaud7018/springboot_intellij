# MemberService.java 해석본

## 역할

회원 관련 업무 규칙(중복 검사, 비밀번호 암호화/검증, 새 비밀번호 생성과 메일 발송)을
처리하는 계층입니다. 이 프로젝트에서 **세 가지 데이터 접근 방식(DAO/Mapper/Repository)이
실제로 나란히 주입되는 곳**이기도 해서, `calendar` 프로젝트의 학습 목적을 가장 잘 보여주는
파일입니다.

```java
@Slf4j
@Service
public class MemberService {

    final private MemberDao memberDao;
    final private PasswordEncoder passwordEncoder;
    final private JavaMailSender javaMailSender;
    final private MemberMapper memberMapper;
    final private MemberRepository memberRepository;

    public MemberService(MemberDao memberDao, PasswordEncoder passwordEncoder,
                          JavaMailSender javaMailSender, MemberMapper memberMapper,
                          MemberRepository memberRepository) {
        ...
    }
}
```

다섯 개의 의존 객체 중 실제로 메서드 안에서 값을 반환받는 데 쓰이는 것은
`passwordEncoder`, `javaMailSender`, `memberRepository` 세 개뿐입니다. `memberDao`와
`memberMapper`는 주입만 되고 호출되지 않습니다(각 파일의 해석본 참고).

## 코드에 남아 있는 "세 가지 구현을 시도한 흔적"

이 파일의 가장 큰 특징은 완성된 코드가 아니라, **같은 기능을 세 가지 방식으로
바꿔가며 구현한 히스토리가 주석으로 그대로 남아 있다**는 점입니다. `signupConfirm()`을
예로 들면:

```java
// 1단계: JdbcTemplate DAO 방식
// boolean isMember = memberDao.isMember(memberDto.getId());

// 2단계: MyBatis Mapper 방식
// boolean isMember = memberMapper.isMember(memberDto.getId());

// 3단계(현재 사용 중): JPA Repository 방식
boolean isMember = memberRepository.existsByMemId(memberDto.getId());
```

저장 부분도 동일한 패턴입니다.

```java
// int result = memberDao.insertMember(memberDto);
// int result = memberMapper.insertMember(memberDto);

/*
MemberEntity memberEntity = MemberEntity.builder()...build();  // Entity를 직접 조립하던 방식
MemberEntity savedMemberEntity = memberRepository.save(memberEntity);
*/

MemberEntity savedMemberEntity = memberRepository.save(memberDto.toEntity());  // 현재: toEntity()로 위임
```

즉 이 파일은 "DAO(SQL 직접 작성) -> Mapper(XML SQL) -> Repository(SQL 없음)"
세 단계를 실제로 다 구현해보고, 가장 마지막에 JPA로 정착한 학습 과정을 그대로
보여주는 살아있는 비교 자료입니다.

## 회원가입 `signupConfirm()`

```text
memberRepository.existsByMemId(id)
  -> 이미 있으면 USER_ID_ALREADY_EXIST(0)
  -> 없으면 비밀번호 암호화 -> memberDto.toEntity() -> memberRepository.save()
     -> 저장 성공: USER_SIGNUP_SUCCESS(1)
     -> 저장 실패(null): USER_SIGNUP_FAIL(-1)
```

반환값이 `int` 상수인 것은 Controller가 이 값을 그대로 `Model`에 담아 View에서
`th:if="${result > 0}"`처럼 성공/실패만 분기하기 때문입니다.

## 로그인 `signinConfirm()`

```java
Optional<MemberEntity> optionalMember = memberRepository.findByMemId(memberDto.getId());
if (optionalMember.isPresent() &&
        passwordEncoder.matches(memberDto.getPw(), optionalMember.get().getMemPw())) {
    return optionalMember.get().getMemId();
} else {
    return null;
}
```

DB에서 꺼낸 암호화된 비밀번호와 입력값을 `passwordEncoder.matches()`로 비교합니다.
평문끼리 비교하지 않는 것이 핵심입니다. 성공 시 ID 문자열을, 실패 시 `null`을
반환하는 규약은 `MemberController.signinConfirm()`이 Session 저장 여부를 결정하는
기준이 됩니다.

## 계정 수정 `modifyConfirm()`과 JPA 변경 감지(Dirty Checking)

```java
@Transactional
public int modifyConfirm(MemberDto memberDto) {
    String encodedPW = passwordEncoder.encode(memberDto.getPw());
    memberDto.setPw(encodedPW);

    Optional<MemberEntity> optionalMember = memberRepository.findById(memberDto.getNo());
    if (optionalMember.isPresent()) {
        MemberEntity memberEntity = optionalMember.get();
        memberEntity.setMemPw(memberDto.getPw());
        memberEntity.setMemMail(memberDto.getMail());
        memberEntity.setMemPhone(memberDto.getPhone());

        // memberRepository.save(memberEntity);  <- 호출하지 않아도 됨

        return MODIFY_SUCCESS;
    } else {
        return MODIFY_FAIL;
    }
}
```

`memberRepository.save(memberEntity)`가 **주석 처리되어 있는데도 실제로는 DB에
반영됩니다.** 이것이 `MemberDao`(JdbcTemplate) 방식과 JPA 방식의 가장 큰 차이입니다.

```text
JdbcTemplate 방식 (MemberDao.updateMember)
  UPDATE문을 직접 실행해야만 DB가 바뀜 (호출 안 하면 아무 일도 없음)

JPA 방식 (MemberService.modifyConfirm)
  @Transactional 메서드 안에서 findById()로 가져온 Entity는
  영속성 컨텍스트(Persistence Context)가 추적 중인 상태가 됨
  -> setter로 필드를 바꾸면 "변경됨"으로 표시(dirty)
  -> 트랜잭션이 커밋되는 시점에 Hibernate가 변경된 필드만 UPDATE문을 자동 생성해 실행
  -> 이것을 "변경 감지(Dirty Checking)"라고 부름
```

`@Transactional`이 없으면 `findById()`로 가져온 Entity가 이미 영속성 컨텍스트를
벗어난(detached) 상태라서 이 자동 UPDATE가 동작하지 않습니다. 이 메서드에만
`@Transactional`이 붙어 있는 이유가 여기에 있습니다.

## 비밀번호 찾기 `findpasswordConfirm()`

```text
1. memberRepository.findByMemIdAndMemMail(id, mail)  ID + MAIL 로 본인 인증
2. 있으면 createNewPassword()로 새 비밀번호 생성
3. 암호화 후 memberRepository.save()로 갱신
4. sendNewPasswordByMail()로 메일 발송
```

`createNewPassword()`는 `SecureRandom`으로 숫자+영문 8자리를 만들고, 인덱스가
짝수면 대문자, 홀수면 소문자로 바꿔 넣는 방식으로 규칙성을 살짝 섞습니다.

## 현재 코드에서 확인되는 주의점

- **`sendNewPasswordByMail()`이 실제 수신자를 무시합니다.**

  ```java
  private void sendNewPasswordByMail(String toMailAddr, String newPassword) {
      SimpleMailMessage simpleMailMessage = new SimpleMailMessage();
      // simpleMailMessage.setTo(toMailAddr);
      simpleMailMessage.setTo("nikecafe@naver.com");   // 하드코딩된 고정 주소
      ...
  }
  ```

  파라미터로 회원의 실제 메일 주소(`toMailAddr`)를 받아오지만 `setTo()`에는 쓰지 않고
  고정된 문자열 주소로 메일을 보냅니다. 어떤 회원이 비밀번호를 찾든 새 비밀번호 메일이
  항상 `nikecafe@naver.com`으로만 발송되는 상태이며, 실제 서비스라면 반드시
  `simpleMailMessage.setTo(toMailAddr);`로 되돌려야 합니다. 테스트 중 발신 대상을
  고정해 두고 원복을 잊은 것으로 보입니다.
- `application.properties`의 발신 계정(`spring.mail.username=hohasic@gmail.com`,
  비밀번호 포함)과 이 메서드의 수신 주소가 모두 코드/설정에 평문으로 노출되어 있습니다.
- `modifyConfirm()`에서 `MemberDto.getPw()`가 비어 있는 값이어도 그대로
  `passwordEncoder.encode()`를 호출해 암호화하므로, 화면에서 비밀번호 입력을
  건너뛰면 빈 문자열이 암호화되어 기존 비밀번호를 덮어씁니다. `modify_form.html`은
  비밀번호 입력을 필수로 강제하지 않으므로 이 부분은 실제 사용 시 주의가 필요합니다.
