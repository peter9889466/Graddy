package com.smhrd.graddy.comment.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

/**
 * 댓글 요청 DTO
 * 클라이언트가 서버로 댓글 작성/수정 요청을 보낼 때 사용
 * 
 * 포함 정보:
 * - content: 댓글 내용
 * - studyProjectId: 스터디/프로젝트 ID (과제 댓글 작성 시 스터디 멤버십 검증용)
 * 
 * 보안: 
 * - userId는 JWT 토큰에서 서버에서 자동으로 추출하여 설정
 * - 게시판 ID는 URL 경로에서 추출하여 설정 (클라이언트가 임의로 설정할 수 없음)
 * - 과제 댓글 작성 시 studyProjectId를 통해 스터디 멤버십 검증
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommentRequest {

    /**
     * 댓글 내용
     */
    private String content;
    
    /**
     * 스터디/프로젝트 ID (과제 댓글 작성 시 스터디 멤버십 검증용)
     */
    private Long studyProjectId;
}
