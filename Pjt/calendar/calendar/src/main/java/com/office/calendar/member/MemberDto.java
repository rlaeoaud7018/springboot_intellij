package com.office.calendar.member;

import com.office.calendar.member.jpa.AuthorityDto;
import com.office.calendar.member.jpa.MemberEntity;
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

    private int no;                 // 사용자 고유 번호
    private String id;              // 사용자 아이디
    private String pw;              // 사용자 비밀번호
    private String mail;            // 사용자 메일
    private String phone;           // 사용자 연락처
    // private int authority_no;       // 사용자 권한 번호
    private AuthorityDto authorityDto;
    private String reg_date;        // 사용자 정보 등록일
    private String mod_date;        // 사용자 정보 수정일

    public MemberEntity toEntity() {

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

        return MemberEntity.builder()
                .memNo(no)
                .memId(id)
                .memPw(pw)
                .memMail(mail)
                .memPhone(phone)
                // .memAuthorityNo(authority_no)
                .authorityEntity(authorityDto != null ? authorityDto.toEntity() : null)
                .memRegDate(reg_date != null ? LocalDateTime.parse(reg_date, formatter) : null)
                .memModDate(mod_date != null ? LocalDateTime.parse(mod_date, formatter) : null)
                .build();

    }

}
