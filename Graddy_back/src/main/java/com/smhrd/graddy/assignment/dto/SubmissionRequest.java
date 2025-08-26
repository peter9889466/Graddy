package com.smhrd.graddy.assignment.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubmissionRequest {

    private Long assignmentId; // 과제 ID
    private Long memberId; // 제출자 멤버 ID
    private String content; // 과제 제출 내용
    private String fileUrl; // 첨부 파일 URL (선택사항)
}
