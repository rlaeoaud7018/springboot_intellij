# 화면(View) 계층 해석본 — Thymeleaf 템플릿 / CSS / JS

## 이 문서를 통합 문서로 작성한 이유

`calendar`의 화면 템플릿 11개(`home.html` 1개, `include/` 2개, `member/` 8개)는
전부 같은 뼈대(`title`/`header`/`nav`/`footer` include + 결과 표시용 `th:if` 분기)를
반복 사용하는 구조입니다. STS3 `BookRentalPjt`처럼 화면마다 로직이 크게 다르지
않으므로, 파일 하나하나를 독립 문서로 쪼개는 대신 **패턴 하나를 깊게 설명하고
나머지는 표로 비교**하는 방식을 택했습니다. Legacy와 다른 화면 기술(Thymeleaf)
자체의 동작 원리를 이해하는 데는 이 편이 더 효율적입니다.

## 1. Thymeleaf `th:fragment` / `th:replace` vs JSP `<jsp:include>`

```html
<!-- include/header_nav_footer.html -->
<header th:fragment="header"> ... </header>
<nav th:fragment="nav"> ... </nav>
<footer th:fragment="footer"> ... </footer>
```

```html
<!-- home.html -->
<header th:replace="~{/include/header_nav_footer.html::header}" />
<nav th:replace="~{/include/header_nav_footer.html::nav}"/>
...
<footer th:replace="~{/include/header_nav_footer.html::footer}"/>
```

```text
Legacy(JSP)                              Boot(Thymeleaf)
<jsp:include page="header.jsp" />        th:replace="~{파일::조각이름}"
파일 전체를 그대로 삽입                    한 파일 안에 여러 조각(fragment)을 정의하고
                                          이름으로 필요한 조각만 골라 삽입
```

`BookRentalPjt`는 `header.jsp`, `footer.jsp`, `nav.jsp`가 각각 별도 파일이었지만,
`calendar`는 `header_nav_footer.html` **한 파일 안에 세 조각을 함께 정의**하고
필요한 이름만 꺼내 씁니다. 파일 개수는 줄고, 대신 한 파일 안에서 `th:fragment`
이름으로 구획을 나눕니다.

## 2. `include/title.html` — 가장 단순한 fragment

```html
<title th:fragment="title">MyCalendar</title>
```

모든 화면의 `<head>`에서 `th:replace="~{/include/title.html::title}"`로 참조되어
탭 제목을 통일합니다.

## 3. Session 값을 화면에서 직접 참조

```html
<span th:if="${session.loginedID == null}">
    <a th:href="@{/member/signup}">sign-up</a>
    <a th:href="@{/member/signin}">sign-in</a>
</span>
<span th:if="${session.loginedID != null}">
    <a th:href="@{/member/modify}">modify</a>
    <a th:href="@{/member/signout_confirm}">signout</a>
</span>
```

Controller가 Model에 담아 넘긴 값이 아니라 `${session.loginedID}`로 **HttpSession의
값을 화면에서 곧바로** 참조합니다. `MemberController.signinConfirm()`이 저장한
`"loginedID"` 세션 값을 헤더 메뉴가 그대로 읽어, 로그인 여부에 따라 메뉴를
`sign-up/sign-in` 또는 `modify/signout`으로 바꿔 보여줍니다.

## 4. 폼 화면과 결과 화면의 반복 패턴

```text
*_form.html   입력 폼 (member.js의 검증 함수 호출 -> 통과 시 form.submit())
*_result.html th:if="${result > 0}" / th:if="${result <= 0}"로 성공·실패 문구만 분기
```

| 화면 | 폼 필드 | 제출 URL | JS 검증 함수 | 결과 판정 변수 |
|---|---|---|---|---|
| signup_form / signup_result | id, pw, mail, phone | /member/signup_confirm | `signupForm()` | `result` |
| signin_form / signin_result | id, pw | /member/signin_confirm | `signinForm()` | `loginedID` |
| modify_form / modify_result | no(hidden), id(readonly), pw, mail, phone | /member/modify_confirm | `modifyForm()` | `result` |
| findpassword_form / findpassword_result | id, mail | /member/findpassword_confirm | `findpasswordForm()` | `result` |

`signin_result.html`만 판정 기준이 `result`가 아니라 `loginedID`인 이유는
[07_MemberController.java-해석본.md](07_MemberController.java-해석본.md)에서 로그인이
`int` 상수가 아니라 ID 문자열(성공) 또는 `null`(실패)을 반환하는 규약이기 때문입니다.

## 5. `member.js` — 자바스크립트 유효성 검사

```javascript
function signinForm() {
    let form = document.signin_form;
    if (form.id.value === '') {
        alert('INPUT MEMBER ID!!');
        form.id.focus();
    } else if (form.pw.value === '') {
        alert('INPUT MEMBER PW!!');
        form.pw.focus();
    } else {
        form.submit();
    }
}
```

폼의 `<input type="button" onclick="signinForm()">`이 이 함수를 호출합니다.
`type="submit"`이 아니라 `type="button"`을 쓴 이유가 바로 이것으로, 값 검증을
통과했을 때만 `form.submit()`을 코드로 직접 호출하기 위함입니다. 4개 폼
(signup/signin/modify/findpassword) 각각에 대응하는 검증 함수가 한 파일에
모두 들어 있습니다.

## 6. CSS 파일 구성

```text
common.css              전체 공통 스타일 (26줄, 여백/기본 폰트 등)
header_nav_footer.css   header/nav/footer 전용 스타일
home.css                홈 화면 배너/이미지 레이아웃
member.css              회원 폼/결과 화면 공통 스타일
planner.css             (292줄, 상당한 분량)
```

각 템플릿은 `common.css` + `header_nav_footer.css` + 자기 화면 전용 CSS를
조합해서 불러옵니다(`home.html`은 `home.css`, `member/*.html`은 `member.css`).

## 7. 현재 코드에서 확인되는 불일치 — `planner.css`와 "없으면 끊기는 기능"

```html
<!-- include/header_nav_footer.html -->
<nav th:fragment="nav">
    <div id="nav_wrap">
        <a th:href="@{/planner}">planner</a>
    </div>
</nav>
```

모든 화면의 네비게이션에 **"planner" 메뉴 링크가 이미 존재**하고, 이를 위한
`planner.css`(292줄, 다른 CSS보다 훨씬 큰 분량)도 이미 준비되어 있습니다.
하지만 다음이 프로젝트 어디에도 없습니다.

```text
없는 것들
  - PlannerController.java (또는 Planner 관련 @Controller)
  - templates/planner*.html
  - planner.css를 <link>로 불러오는 템플릿
```

즉 `/planner` 링크를 클릭하면 매핑된 Controller가 없어 **404 응답**이 됩니다.
`calendar`(달력/일정 관리)라는 프로젝트 이름 자체가 암시하듯, Planner 기능이
다음 학습 단계로 예정되어 있고 화면 뼈대(메뉴 링크, CSS)만 먼저 준비해 둔
상태로 보입니다. Member 도메인 완성 이후 이어서 구현될 것으로 예상되는 부분입니다.
