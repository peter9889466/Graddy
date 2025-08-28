package com.smhrd.graddy.chat.controller;

import com.smhrd.graddy.chat.dto.ChatMessageRequest;
import com.smhrd.graddy.chat.dto.ChatMessageResponse;
import com.smhrd.graddy.chat.service.ChatService;
import com.smhrd.graddy.security.jwt.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

/**
 * WebSocket을 통해 들어오는 채팅 메시지를 처리하는 컨트롤러
 *
 * 주요 기능:
 * - STOMP 메시지 수신 및 처리
 * - 스터디방별 메시지 브로드캐스팅
 * - 실시간 채팅 지원
 * - JWT 토큰을 통한 사용자 인증
 *
 * 메시지 흐름:
 * 1. 클라이언트 → 서버: /app/chat.sendMessage/{studyProjectId}
 * 2. 서버 → 모든 구독자: /topic/chat/room/{studyProjectId}
 * 
 * 보안: JWT 토큰을 통해 memberId를 추출하여 클라이언트가 임의로 설정할 수 없도록 함
 */
@Controller
@RequiredArgsConstructor
@Slf4j
public class ChatController {

    private final ChatService chatService;
    private final JwtUtil jwtUtil;

    /**
     * 클라이언트가 보낸 채팅 메시지를 처리하고 모든 구독자에게 브로드캐스팅
     * 
     * 메시지 처리 과정:
     * 1. @MessageMapping: 클라이언트가 "/app/chat.sendMessage/{studyProjectId}"로 메시지 전송
     * 2. JWT 토큰에서 memberId 추출
     * 3. ChatService.processAndSaveMessage() 호출하여 메시지 처리 및 저장
     * 4. @SendTo: 반환된 응답을 "/topic/chat/room/{studyProjectId}"로 브로드캐스팅
     * 
     * @param studyProjectId 메시지를 보낼 스터디/프로젝트 ID (URL 경로에서 추출)
     * @param request 클라이언트가 보낸 메시지 요청 DTO
     * @param authorization JWT 토큰 (Authorization 헤더)
     * @return 모든 구독자에게 전달될 메시지 응답 DTO
     */
    @MessageMapping("/chat.sendMessage/{studyProjectId}")
    @SendTo("/topic/chat/room/{studyProjectId}")
    public ChatMessageResponse sendMessage(
            @DestinationVariable Long studyProjectId,
            ChatMessageRequest request,
            @Header("Authorization") String authorization) {
        
        try {
            // JWT 토큰에서 userId 추출
            String token = authorization.replace("Bearer ", "");
            String userId = jwtUtil.extractUserId(token);
            
            log.info("채팅 메시지 수신: studyProjectId={}, userId={}, type={}", 
                    studyProjectId, userId, request.getMessageType());
            
            // ChatService를 통해 메시지 처리 및 저장
            ChatMessageResponse response = chatService.processAndSaveMessage(studyProjectId, userId, request);
            
            log.info("채팅 메시지 처리 완료: messageId={}, sender={}", 
                    response.getMessageId(), response.getSenderNick());
            
            return response;
            
        } catch (Exception e) {
            log.error("채팅 메시지 처리 중 오류 발생: studyProjectId={}, authorization={}", 
                    studyProjectId, authorization, e);
            
            // 오류 발생 시 기본 응답 생성
            return ChatMessageResponse.builder()
                    .messageId(0L)
                    .memberId(0L)
                    .senderNick("시스템")
                    .content("메시지 전송 중 오류가 발생했습니다.")
                    .fileUrl(null)
                    .createdAt(new java.sql.Timestamp(System.currentTimeMillis()))
                    .messageType(ChatMessageRequest.MessageType.SYSTEM)
                    .studyProjectId(studyProjectId)
                    .build();
        }
    }

    /**
     * 스터디방 입장 메시지 처리
     *
     * @param studyProjectId 스터디/프로젝트 ID
     * @param request 입장 메시지 요청
     * @param authorization JWT 토큰
     * @return 입장 메시지 응답
     */
//    @MessageMapping("/chat.enter/{studyProjectId}")
//    @SendTo("/topic/chat/room/{studyProjectId}")
//    public ChatMessageResponse enterRoom(
//            @DestinationVariable Long studyProjectId,
//            ChatMessageRequest request,
//            @Header("Authorization") String authorization) {
//
//        try {
//            // JWT 토큰에서 memberId 추출
//            String token = authorization.replace("Bearer ", "");
//            Long memberId = jwtUtil.extractMemberId(token);
//
//            log.info("스터디방 입장: studyProjectId={}, memberId={}", studyProjectId, memberId);
//
//            // 입장 메시지 타입으로 설정
//            request.setMessageType(ChatMessageRequest.MessageType.ENTER);
//            request.setContent("님이 스터디방에 입장했습니다.");
//
//            return sendMessage(studyProjectId, request, authorization);
//        } catch (Exception e) {
//            log.error("입장 메시지 처리 중 오류 발생: studyProjectId={}", studyProjectId, e);
//            return ChatMessageResponse.builder()
//                    .messageId(0L)
//                    .memberId(0L)
//                    .senderNick("시스템")
//                    .content("입장 메시지 처리 중 오류가 발생했습니다.")
//                    .fileUrl(null)
//                    .createdAt(new java.sql.Timestamp(System.currentTimeMillis()))
//                    .messageType(ChatMessageRequest.MessageType.SYSTEM)
//                    .studyProjectId(studyProjectId)
//                    .build();
//        }
//    }

    /**
     * 스터디방 퇴장 메시지 처리
     *
     * @param studyProjectId 스터디/프로젝트 ID
     * @param request 퇴장 메시지 요청
     * @param authorization JWT 토큰
     * @return 퇴장 메시지 응답
     */
//    @MessageMapping("/chat.leave/{studyProjectId}")
//    @SendTo("/topic/chat/room/{studyProjectId}")
//    public ChatMessageResponse leaveRoom(
//            @DestinationVariable Long studyProjectId,
//            ChatMessageRequest request,
//            @Header("Authorization") String authorization) {
//
//        try {
//            // JWT 토큰에서 memberId 추출
//            String token = authorization.replace("Bearer ", "");
//            Long memberId = jwtUtil.extractMemberId(token);
//
//            log.info("스터디방 퇴장: studyProjectId={}, memberId={}", studyProjectId, memberId);
//
//            // 퇴장 메시지 타입으로 설정
//            request.setMessageType(ChatMessageRequest.MessageType.LEAVE);
//            request.setContent("님이 스터디방을 나갔습니다.");
//
//            return sendMessage(studyProjectId, request, authorization);
//        } catch (Exception e) {
//            log.error("퇴장 메시지 처리 중 오류 발생: studyProjectId={}", studyProjectId, e);
//            return ChatMessageResponse.builder()
//                    .messageId(0L)
//                    .memberId(0L)
//                    .senderNick("시스템")
//                    .content("퇴장 메시지 처리 중 오류가 발생했습니다.")
//                    .fileUrl(null)
//                    .createdAt(new java.sql.Timestamp(System.currentTimeMillis()))
//                    .messageType(ChatMessageRequest.MessageType.SYSTEM)
//                    .studyProjectId(studyProjectId)
//                    .build();
//        }
//    }
}
