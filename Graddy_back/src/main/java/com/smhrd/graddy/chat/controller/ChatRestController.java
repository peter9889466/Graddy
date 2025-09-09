package com.smhrd.graddy.chat.controller;

import com.smhrd.graddy.chat.dto.ChatMessageRequest;
import com.smhrd.graddy.chat.dto.ChatMessageResponse;
import com.smhrd.graddy.chat.service.ChatService;
import com.smhrd.graddy.security.jwt.JwtUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;
import java.util.List;

/**
 * REST API를 통한 채팅 메시지 전송을 위한 테스트용 컨트롤러
 * 
 * 주요 기능:
 * - HTTP POST 요청으로 채팅 메시지 전송
 * - WebSocket을 통한 실시간 브로드캐스팅
 * - 스터디 멤버십 검증
 * - 파일 메시지 지원
 * - JWT 토큰을 통한 사용자 인증
 * 
 * 사용 목적:
 * - WebSocket 연결 없이도 채팅 기능 테스트 가능
 * - 모바일 앱이나 다른 클라이언트에서 채팅 API 호출
 * - 채팅 히스토리 조회 및 관리
 * 
 * 보안: JWT 토큰을 통해 userId를 추출하여 클라이언트가 임의로 설정할 수 없도록 함
 */
@RestController
@RequestMapping("/chat")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Chat REST API", description = "REST API를 통한 채팅 메시지 전송")
public class ChatRestController {

    private final ChatService chatService;
    private final SimpMessagingTemplate messagingTemplate;
    private final JwtUtil jwtUtil;

    /**
     * REST API를 통해 채팅 메시지를 전송하고 WebSocket으로 브로드캐스팅
     * 
     * 처리 과정:
     * 1. HTTP POST 요청으로 메시지 수신
     * 2. JWT 토큰에서 userId 추출
     * 3. ChatService를 통해 메시지 처리 및 저장
     * 4. SimpMessagingTemplate으로 WebSocket 구독자들에게 브로드캐스팅
     * 
     * @param studyProjectId 스터디/프로젝트 ID (URL 경로에서 추출)
     * @param request 채팅 메시지 요청 DTO
     * @param authorization JWT 토큰 (Authorization 헤더)
     * @return 처리된 메시지 응답
     */
    @PostMapping("/send/{studyProjectId}")
    @Operation(
        summary = "채팅 메시지 전송",
        description = "REST API를 통해 채팅 메시지를 전송하고 WebSocket으로 브로드캐스팅합니다."
    )
    public ResponseEntity<ChatMessageResponse> sendMessage(
            @Parameter(description = "스터디/프로젝트 ID", example = "1")
            @PathVariable Long studyProjectId,
            
            @Parameter(description = "채팅 메시지 요청 정보")
            @RequestBody ChatMessageRequest request,
            
            @Parameter(description = "JWT 토큰", example = "Bearer eyJhbGciOiJIUzI1NiJ9...")
            @RequestHeader("Authorization") String authorization) {
        
        try {
            // JWT 토큰에서 userId 추출
            String token = authorization.replace("Bearer ", "");
            String userId = jwtUtil.extractUserId(token);
            
            log.info("REST API 채팅 메시지 수신: studyProjectId={}, userId={}, type={}", 
                    studyProjectId, userId, request.getMessageType());
            
            // 1. ChatService를 통해 메시지 처리 및 저장
            ChatMessageResponse response = chatService.processAndSaveMessage(studyProjectId, userId, request);
            
            log.info("REST API 채팅 메시지 처리 완료: messageId={}, sender={}", 
                    response.getMessageId(), response.getSenderNick());
            
            // 2. WebSocket 구독자들에게 브로드캐스팅
            String destination = "/topic/chat/room/" + studyProjectId;
            messagingTemplate.convertAndSend(destination, response);
            
            log.info("WebSocket 브로드캐스팅 완료: destination={}", destination);
            
            return ResponseEntity.ok(response);
            
        } catch (IllegalArgumentException e) {
            log.warn("채팅 메시지 처리 실패 (권한 없음): {}", e.getMessage());
            return ResponseEntity.badRequest().build();
            
        } catch (Exception e) {
            log.error("채팅 메시지 처리 중 오류 발생: studyProjectId={}, authorization={}", 
                    studyProjectId, authorization, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 스터디방 입장 메시지 전송
     * 
     * @param studyProjectId 스터디/프로젝트 ID
     * @param request 입장 메시지 요청
     * @param authorization JWT 토큰
     * @return 입장 메시지 응답
     */
    @PostMapping("/enter/{studyProjectId}")
    @Operation(
        summary = "스터디방 입장 메시지 전송",
        description = "사용자가 스터디방에 입장했음을 알리는 메시지를 전송합니다."
    )
    public ResponseEntity<ChatMessageResponse> enterRoom(
            @Parameter(description = "스터디/프로젝트 ID", example = "1")
            @PathVariable Long studyProjectId,
            
            @Parameter(description = "입장 메시지 요청 정보")
            @RequestBody ChatMessageRequest request,
            
            @Parameter(description = "JWT 토큰", example = "Bearer eyJhbGciOiJIUzI1NiJ9...")
            @RequestHeader("Authorization") String authorization) {
        
        try {
            // JWT 토큰에서 userId 추출
            String token = authorization.replace("Bearer ", "");
            String userId = jwtUtil.extractUserId(token);
            
            log.info("스터디방 입장 메시지 전송: studyProjectId={}, userId={}", 
                    studyProjectId, userId);
            
            // 입장 메시지 타입으로 설정
            request.setMessageType(ChatMessageRequest.MessageType.ENTER);
            request.setContent("님이 스터디방에 입장했습니다.");
            
            return sendMessage(studyProjectId, request, authorization);
        } catch (Exception e) {
            log.error("입장 메시지 처리 중 오류 발생: studyProjectId={}", studyProjectId, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 스터디방 퇴장 메시지 전송
     * 
     * @param studyProjectId 스터디/프로젝트 ID
     * @param request 퇴장 메시지 요청
     * @param authorization JWT 토큰
     * @return 퇴장 메시지 응답
     */
    @PostMapping("/leave/{studyProjectId}")
    @Operation(
        summary = "스터디방 퇴장 메시지 전송",
        description = "사용자가 스터디방을 나갔음을 알리는 메시지를 전송합니다."
    )
    public ResponseEntity<ChatMessageResponse> leaveRoom(
            @Parameter(description = "스터디/프로젝트 ID", example = "1")
            @PathVariable Long studyProjectId,
            
            @Parameter(description = "퇴장 메시지 요청 정보")
            @RequestBody ChatMessageRequest request,
            
            @Parameter(description = "JWT 토큰", example = "Bearer eyJhbGciOiJIUzI1NiJ9...")
            @RequestHeader("Authorization") String authorization) {
        
        try {
            // JWT 토큰에서 userId 추출
            String token = authorization.replace("Bearer ", "");
            String userId = jwtUtil.extractUserId(token);
            
            log.info("스터디방 퇴장 메시지 전송: studyProjectId={}, userId={}", 
                    studyProjectId, userId);
            
            // 퇴장 메시지 타입으로 설정
            request.setMessageType(ChatMessageRequest.MessageType.LEAVE);
            request.setContent("님이 스터디방을 나갔습니다.");
            
            return sendMessage(studyProjectId, request, authorization);
        } catch (Exception e) {
            log.error("퇴장 메시지 처리 중 오류 발생: studyProjectId={}", studyProjectId, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 파일 공유 메시지 전송
     * 
     * @param studyProjectId 스터디/프로젝트 ID
     * @param request 파일 메시지 요청
     * @param authorization JWT 토큰
     * @return 파일 메시지 응답
     */
    @PostMapping("/file/{studyProjectId}")
    @Operation(
        summary = "파일 공유 메시지 전송",
        description = "파일을 공유하는 채팅 메시지를 전송합니다."
    )
    public ResponseEntity<ChatMessageResponse> sendFileMessage(
            @Parameter(description = "스터디/프로젝트 ID", example = "1")
            @PathVariable Long studyProjectId,
            
            @Parameter(description = "파일 메시지 요청 정보")
            @RequestBody ChatMessageRequest request,
            
            @Parameter(description = "JWT 토큰", example = "Bearer eyJhbGciOiJIUzI1NiJ9...")
            @RequestHeader("Authorization") String authorization) {
        
        try {
            // JWT 토큰에서 userId 추출
            String token = authorization.replace("Bearer ", "");
            String userId = jwtUtil.extractUserId(token);
            
            log.info("파일 공유 메시지 전송: studyProjectId={}, userId={}, fileUrl={}", 
                    studyProjectId, userId, request.getFileUrl());
            
            // 파일 메시지 타입으로 설정
            request.setMessageType(ChatMessageRequest.MessageType.FILE);
            
            return sendMessage(studyProjectId, request, authorization);
        } catch (Exception e) {
            log.error("파일 메시지 처리 중 오류 발생: studyProjectId={}", studyProjectId, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 특정 스터디방의 메시지 개수 조회
     * 
     * @param studyProjectId 스터디/프로젝트 ID
     * @return 메시지 개수
     */
    @GetMapping("/count/{studyProjectId}")
    @Operation(
        summary = "스터디방 메시지 개수 조회",
        description = "특정 스터디방의 총 메시지 개수를 조회합니다."
    )
    public ResponseEntity<Long> getMessageCount(
            @Parameter(description = "스터디/프로젝트 ID", example = "1")
            @PathVariable Long studyProjectId) {
        
        try {
            long count = chatService.getMessageCount(studyProjectId);
            log.info("스터디방 메시지 개수 조회: studyProjectId={}, count={}", studyProjectId, count);
            return ResponseEntity.ok(count);
            
        } catch (Exception e) {
            log.error("메시지 개수 조회 중 오류 발생: studyProjectId={}", studyProjectId, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 특정 스터디방의 채팅 이력 조회
     * 
     * @param studyProjectId 스터디/프로젝트 ID
     * @return 채팅 메시지 목록
     */
    @GetMapping("/history/{studyProjectId}")
    @Operation(
        summary = "스터디방 채팅 이력 조회",
        description = "특정 스터디방의 채팅 이력을 조회합니다. 해당 스터디의 멤버만 조회 가능합니다."
    )
    public ResponseEntity<List<ChatMessageResponse>> getChatHistory(
            @Parameter(description = "스터디/프로젝트 ID", example = "1")
            @PathVariable Long studyProjectId,
            @Parameter(description = "JWT 토큰", example = "Bearer eyJhbGciOiJIUzI1NiJ9...")
            @RequestHeader("Authorization") String authorization) {
        
        try {
            // JWT 토큰에서 userId 추출
            String token = authorization.replace("Bearer ", "");
            String userId = jwtUtil.extractUserId(token);
            
            // 멤버십 확인 (채팅 권한 확인)
            Long memberId = chatService.getMemberIdByUserIdAndStudyProjectId(userId, studyProjectId);
            if (memberId == null) {
                log.warn("채팅 이력 조회 권한 없음: studyProjectId={}, userId={}", studyProjectId, userId);
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            
            List<ChatMessageResponse> history = chatService.getChatHistory(studyProjectId);
            log.info("스터디방 채팅 이력 조회: studyProjectId={}, userId={}, messageCount={}", studyProjectId, userId, history.size());
            return ResponseEntity.ok(history);
            
        } catch (Exception e) {
            log.error("채팅 이력 조회 중 오류 발생: studyProjectId={}", studyProjectId, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 특정 스터디에서 현재 사용자의 memberId 조회
     * 
     * @param studyProjectId 스터디/프로젝트 ID
     * @param authorization JWT 토큰
     * @return memberId
     */
    @GetMapping("/member-id/{studyProjectId}")
    @Operation(
        summary = "스터디별 멤버 ID 조회",
        description = "특정 스터디에서 현재 사용자의 memberId를 조회합니다."
    )
    public ResponseEntity<Long> getMemberId(
            @Parameter(description = "스터디/프로젝트 ID", example = "1")
            @PathVariable Long studyProjectId,
            
            @Parameter(description = "JWT 토큰", example = "Bearer eyJhbGciOiJIUzI1NiJ9...")
            @RequestHeader("Authorization") String authorization) {
        
        try {
            // JWT 토큰에서 userId 추출
            String token = authorization.replace("Bearer ", "");
            String userId = jwtUtil.extractUserId(token);
            
            log.info("멤버 ID 조회 요청: studyProjectId={}, userId={}", studyProjectId, userId);
            
            // ChatService를 통해 memberId 조회
            Long memberId = chatService.getMemberIdByUserIdAndStudyProjectId(userId, studyProjectId);
            
            if (memberId != null) {
                log.info("멤버 ID 조회 성공: studyProjectId={}, userId={}, memberId={}", 
                        studyProjectId, userId, memberId);
                return ResponseEntity.ok(memberId);
            } else {
                log.warn("멤버 ID 조회 실패 (권한 없음): studyProjectId={}, userId={}", studyProjectId, userId);
                return ResponseEntity.badRequest().build();
            }
            
        } catch (Exception e) {
            log.error("멤버 ID 조회 중 오류 발생: studyProjectId={}", studyProjectId, e);
            return ResponseEntity.internalServerError().build();
        }
    }
}
