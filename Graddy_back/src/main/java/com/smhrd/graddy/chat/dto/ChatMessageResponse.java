package com.smhrd.graddy.chat.dto;

import com.smhrd.graddy.chat.entity.ChatMessage;
import lombok.Builder;
import lombok.Getter;

import java.sql.Timestamp;

/**
 * 서버가 클라이언트로 메시지를 브로드캐스팅할 때 사용하는 DTO
 * 
 * 클라이언트에게 전달되는 정보:
 * - 메시지 기본 정보 (ID, 내용, 생성시간 등)
 * - 발신자 정보 (멤버 ID, 닉네임)
 * - 메시지 타입 (텍스트, 파일, 입장/퇴장 등)
 * - 첨부 파일 정보 (파일 URL)
 */
@Getter
@Builder
public class ChatMessageResponse {

    /**
     * 메시지 고유 ID
     */
    private Long messageId;
    
    /**
     * 발신자 멤버 ID (study_project_member 테이블의 member_id)
     */
    private Long memberId;
    
    /**
     * 발신자 닉네임 (users 테이블에서 조회)
     */
    private String senderNick;
    
    /**
     * 메시지 내용
     */
    private String content;
    
    /**
     * 첨부 파일 S3 URL (파일 공유 시)
     */
    private String fileUrl;
    
    /**
     * 메시지 생성 시간
     * 파티셔닝을 위한 정확한 타임스탬프
     */
    private Timestamp createdAt;
    
    /**
     * 메시지 타입
     */
    private ChatMessageRequest.MessageType messageType;
    
    /**
     * 스터디/프로젝트 ID
     */
    private Long studyProjectId;

    /**
     * ChatMessage 엔티티와 발신자 닉네임을 조합하여 Response DTO를 생성
     * 
     * @param message 저장된 ChatMessage 엔티티
     * @param senderNick 발신자 닉네임
     * @param messageType 메시지 타입
     * @return ChatMessageResponse DTO
     */
    public static ChatMessageResponse from(ChatMessage message, String senderNick, ChatMessageRequest.MessageType messageType) {
        return ChatMessageResponse.builder()
                .messageId(message.getMessageId())
                .memberId(message.getMemberId())
                .senderNick(senderNick)
                .content(message.getContent())
                .fileUrl(message.getFileUrl())
                .createdAt(message.getCreatedAt())
                .messageType(messageType)
                .studyProjectId(message.getStudyProjectId())
                .build();
    }
}
