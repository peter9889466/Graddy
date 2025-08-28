package com.smhrd.graddy.chat.entity;

import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.sql.Timestamp;

/**
 * 채팅 메시지 엔티티
 * chat_messages 테이블과 매핑되며, 단일 기본키 사용
 * 
 * 테이블 구조:
 * - message_id: 메시지 고유 ID (AUTO_INCREMENT, 단일 기본키)
 * - member_id: 스터디 멤버 ID (study_project_member 테이블의 member_id)
 * - study_project_id: 스터디/프로젝트 ID
 * - content: 메시지 내용 (TEXT)
 * - file_url: 첨부 파일 S3 URL (선택적)
 * - created_at: 메시지 생성 시간 (파티셔닝 키)
 * 
 * 파티셔닝: UNIX_TIMESTAMP(created_at) 기준으로 월별 파티션
 * 주의: 파티셔닝 키는 기본키가 아닌 일반 컬럼입니다.
 */
@Entity
@Table(name = "chat_messages")
@Getter
@Setter
@NoArgsConstructor
public class ChatMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "message_id", nullable = false)
    private Long messageId;

    @Column(name = "created_at", nullable = false)
    private Timestamp createdAt;

    @Column(name = "member_id", nullable = false)
    private Long memberId;

    @Column(name = "study_project_id", nullable = false)
    private Long studyProjectId;

    @Column(name = "content", nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(name = "file_url", columnDefinition = "TEXT")
    private String fileUrl;

    /**
     * Builder 패턴을 사용한 생성자
     * @param memberId 스터디 멤버 ID
     * @param studyProjectId 스터디/프로젝트 ID
     * @param content 메시지 내용
     * @param fileUrl 첨부 파일 URL (선택적)
     */
    @Builder
    public ChatMessage(Long memberId, Long studyProjectId, String content, String fileUrl) {
        this.memberId = memberId;
        this.studyProjectId = studyProjectId;
        this.content = content;
        this.fileUrl = fileUrl;
        // 생성 시간은 @PrePersist에서 자동 설정
    }

    /**
     * 엔티티가 저장되기 전에 자동으로 생성 시간을 설정
     * 파티셔닝을 위해 정확한 시간 설정이 중요
     */
    @PrePersist
    protected void onCreate() {
        if (this.createdAt == null) {
            this.createdAt = new Timestamp(System.currentTimeMillis());
        }
    }

    // 복합키 클래스 제거 - 단일 기본키 사용
}
