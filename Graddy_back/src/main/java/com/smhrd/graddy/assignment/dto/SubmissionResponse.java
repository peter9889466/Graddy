package com.smhrd.graddy.assignment.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.sql.Timestamp;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubmissionResponse {

    private Long submissionId; // 제출 ID
    private Long assignmentId; // 과제 ID
    private Long memberId; // 제출자 멤버 ID
    private String content; // 과제 제출 내용
    private String fileUrl; // 첨부 파일 URL
    private Timestamp createdAt; // 제출 일시
}
