package com.office.calendaradmin.member;

import com.office.calendaradmin.member.jpa.AuthorityDto;
import com.office.calendaradmin.member.jpa.MemberEntity;
import lombok.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

//@Getter
//@Setter
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MemberDto {

    private int no;                 // 관리자 고유 번호
    private String id;              // 관리자 아이디
    private String pw;              // 관리자 비밀번호
    private String mail;            // 관리자 메일
    private String phone;           // 관리자 연락처
    private AuthorityDto authorityDto;  // 관리자 권한 DTO
    private String reg_date;        // 관리자 정보 등록일
    private String mod_date;        // 관리자 정보 수정일

    public MemberEntity toEntity() {

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

        return MemberEntity.builder()
                .memNo(no)
                .memId(id)
                .memPw(pw)
                .memMail(mail)
                .memPhone(phone)
                .authorityEntity(authorityDto != null ? authorityDto.toEntity() : null)
                .memRegDate(reg_date != null ? LocalDateTime.parse(reg_date, formatter) : null)
                .memModDate(mod_date != null ? LocalDateTime.parse(mod_date, formatter) : null)
                .build();

    }

}
