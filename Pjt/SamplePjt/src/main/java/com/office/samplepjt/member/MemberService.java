package com.office.samplepjt.member;

import org.springframework.stereotype.Service;

@Service
public class MemberService {

    final private String CLASS_NAME = "[MemberService]";

    final private MemberDao memberDao;

    public MemberService(MemberDao memberDao) {
        this.memberDao = memberDao;
    }

    public void signup_confirm(MemberDto memberDto) {
        System.out.println(CLASS_NAME.concat("signup_confirm()"));

        memberDao.insertNewMember(memberDto);

    }
}
