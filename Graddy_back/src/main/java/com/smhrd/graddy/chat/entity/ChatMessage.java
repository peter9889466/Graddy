package com.smhrd.graddy.chat.entity;

import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;
import java.sql.Timestamp;
import java.util.Objects;

/**
 * 채팅 메시지 엔티티
 * chat_messages 테이블과 매핑되며, 파티셔닝을 위해 복합키 사용
 * 
 * 테이블 구조:
 * - message_id: 메시지 고유 ID (AUTO_INCREMENT)
 * - member_id: 스터디 멤버 ID (study_project_member 테이블의 member_id)
 * - study_project_id: 스터디/프로젝트 ID
 * - content: 메시지 내용 (TEXT)
 * - file_url: 첨부 파일 S3 URL (선택적)
 * - created_at: 메시지 생성 시간 (파티션 키)
 * 
 * 파티셔닝: UNIX_TIMESTAMP(created_at) 기준으로 월별 파티션
 */
@Entity
@Table(name = "chat_messages")
@Getter
@Setter
@NoArgsConstructor
@IdClass(ChatMessage.ChatMessageId.class)
public class ChatMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "message_id", nullable = false)
    private Long messageId;

    @Id
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

    /**
     * 복합 기본키 클래스
     * JPA @IdClass 요구사항을 따르며, equals와 hashCode 구현 필수
     */
    public static class ChatMessageId implements Serializable {
        private Long messageId;
        private Timestamp createdAt;

        // 기본 생성자
        public ChatMessageId() {}

        public ChatMessageId(Long messageId, Timestamp createdAt) {
            this.messageId = messageId;
            this.createdAt = createdAt;
        }

        @Override
        public boolean equals(Object o) {
            if (this == o) return true;
            if (o == null || getClass() != o.getClass()) return false;
            ChatMessageId that = (ChatMessageId) o;
            return Objects.equals(messageId, that.messageId) && 
                   Objects.equals(createdAt, that.createdAt);
        }

        @Override
        public int hashCode() {
            return Objects.hash(messageId, createdAt);
        }
    }
}
