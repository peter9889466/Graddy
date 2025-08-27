package com.smhrd.graddy.chat.dto;

import lombok.Getter;
import lombok.Setter;

/**
 * 클라이언트가 서버로 채팅 메시지를 보낼 때 사용하는 DTO
 * 
 * 필수 정보:
 * - memberId: 스터디 멤버 ID (study_project_member 테이블의 member_id)
 * - studyProjectId: 스터디/프로젝트 ID
 * - content: 메시지 내용
 * 
 * 선택 정보:
 * - fileUrl: 첨부 파일 S3 URL (파일 공유 시)
 * - messageType: 메시지 타입 (일반 텍스트, 파일, 입장/퇴장 등)
 */
@Getter
@Setter
public class ChatMessageRequest {
    
    /**
     * 스터디 멤버 ID (study_project_member 테이블의 member_id)
     * 이 ID로 해당 사용자가 스터디 멤버인지 검증
     */
    private Long memberId;
    
    /**
     * 스터디/프로젝트 ID
     * 어떤 스터디방에서 메시지를 보내는지 식별
     */
    private Long studyProjectId;
    
    /**
     * 메시지 내용
     * 텍스트 메시지 또는 파일 설명 등
     */
    private String content;
    
    /**
     * 첨부 파일 S3 URL (선택적)
     * 파일 공유 시 사용되며, null이면 일반 텍스트 메시지
     */
    private String fileUrl;
    
    /**
     * 메시지 타입
     * 메시지의 종류를 구분하여 클라이언트에서 적절한 UI 표시
     */
    private MessageType messageType = MessageType.TEXT;
    
    /**
     * 메시지 타입 열거형
     */
    public enum MessageType {
        TEXT,       // 일반 텍스트 메시지
        FILE,       // 파일 공유 메시지
        IMAGE,      // 이미지 공유 메시지
        ENTER,      // 스터디방 입장 메시지
        LEAVE,      // 스터디방 퇴장 메시지
        SYSTEM      // 시스템 메시지 (공지사항 등)
    }
}
