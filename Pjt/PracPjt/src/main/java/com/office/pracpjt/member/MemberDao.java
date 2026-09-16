package com.office.pracpjt.member;

import org.springframework.stereotype.Repository;

@Repository
public class MemberDao {

    final private String CLASS_NAME = "[MemberDao]";

    public void insertNewMember(MemberDto memberDto) {
        System.out.println(CLASS_NAME.concat("insertNewMember()"));

        System.out.println("memberDto: " + memberDto);
        System.out.println("memberDto getmId: " + memberDto.getmId());
        System.out.println("memberDto getmPw: " + memberDto.getmPw());
        System.out.println("memberDto getmMail: " + memberDto.getmMail());

    }
}
