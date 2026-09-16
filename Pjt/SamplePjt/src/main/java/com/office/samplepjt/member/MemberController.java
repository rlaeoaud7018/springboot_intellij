package com.office.samplepjt.member;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;

@Controller
public class MemberController {

    final private String CLASS_NAME = "[MemberController] ";

    private MemberService memberService;

    public MemberController(MemberService memberService) {
        this.memberService = memberService;

    }

    @GetMapping("/member/signup")
    public String signup() {
        System.out.println(CLASS_NAME.concat("signup()"));

        String nextPage = "member/signup";

        return nextPage;

    }

    @PostMapping("/member/signup_confirm")
    public String signup_confirm(MemberDto memberDto) {
        System.out.println(CLASS_NAME.concat("signup_confirm()"));

        String nextPage = "member/signup_ok";

        memberService.signup_confirm(memberDto);

        return nextPage;

    }

    @GetMapping("/member/signin")
    public String signin() {
        System.out.println(CLASS_NAME.concat("signin()"));

        String nextPage = "member/signin";

        return nextPage;

    }

}
