package com.smhrd.graddy.chat.service;

import com.smhrd.graddy.chat.dto.ChatMessageRequest;
import com.smhrd.graddy.chat.dto.ChatMessageResponse;
import com.smhrd.graddy.chat.entity.ChatMessage;
import com.smhrd.graddy.chat.repository.ChatMessageRepository;
import com.smhrd.graddy.study.repository.StudyProjectMemberRepository;
import com.smhrd.graddy.member.entity.Member;
import com.smhrd.graddy.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

/**
 * 채팅 관련 비즈니스 로직을 처리하는 서비스 클래스
 * 
 * 주요 기능:
 * - 채팅 메시지 처리 및 저장
 * - 스터디 멤버십 검증 (채팅 권한 확인)
 * - 발신자 정보 조회 (닉네임 등)
 * - 메시지 타입별 처리
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ChatService {

    private final ChatMessageRepository chatMessageRepository;
    private final StudyProjectMemberRepository memberRepository;
    private final UserRepository userRepository;

    /**
     * 클라이언트로부터 받은 채팅 메시지를 처리하고 저장
     * 
     * 처리 과정:
     * 1. 멤버십 검증: 요청한 userId가 해당 스터디의 멤버인지 확인
     * 2. 메시지 저장: 검증된 메시지를 데이터베이스에 저장
     * 3. 응답 생성: 클라이언트에게 브로드캐스팅할 응답 DTO 생성
     * 
     * @param studyProjectId 메시지를 보낼 스터디/프로젝트 ID
     * @param userId JWT 토큰에서 추출한 사용자 ID
     * @param request 클라이언트가 보낸 메시지 요청 DTO
     * @return 클라이언트들에게 브로드캐스팅될 메시지 응답 DTO
     * @throws IllegalArgumentException 멤버가 아닌 경우 또는 유효하지 않은 요청
     */
    @Transactional
    public ChatMessageResponse processAndSaveMessage(Long studyProjectId, String userId, ChatMessageRequest request) {
        log.info("채팅 메시지 처리 시작: studyProjectId={}, userId={}, type={}", 
                studyProjectId, userId, request.getMessageType());
        
        // 1. userId를 통해 memberId 조회
        Optional<Member> memberOpt = memberRepository.findByUserIdAndStudyProjectId(userId, studyProjectId);
        if (memberOpt.isEmpty()) {
            log.warn("채팅 권한 없음: studyProjectId={}, userId={}", studyProjectId, userId);
            throw new IllegalArgumentException("해당 스터디의 멤버가 아니므로 메시지를 보낼 수 없습니다.");
        }
        
        Long memberId = memberOpt.get().getMemberId();
        log.info("멤버십 검증 완료: studyProjectId={}, userId={}, memberId={}", studyProjectId, userId, memberId);

        // 2. 메시지 엔티티 생성 및 저장
        ChatMessage chatMessage = ChatMessage.builder()
                .memberId(memberId)
                .studyProjectId(studyProjectId)
                .content(request.getContent())
                .fileUrl(request.getFileUrl())
                .build();
        
        ChatMessage savedMessage = chatMessageRepository.save(chatMessage);
        log.info("메시지 저장 완료: messageId={}", savedMessage.getMessageId());

        // 3. 발신자 정보 조회 (닉네임 등)
        String senderNick = getSenderNickname(memberId);
        log.info("발신자 정보 조회 완료: memberId={}, nickname={}", memberId, senderNick);

        // 4. 응답 DTO 생성 및 반환
        ChatMessageResponse response = ChatMessageResponse.from(
                savedMessage, senderNick, userId, request.getMessageType());
        
        log.info("채팅 메시지 처리 완료: messageId={}, sender={}", 
                savedMessage.getMessageId(), senderNick);
        
        return response;
    }

    /**
     * 멤버 ID를 통해 발신자의 닉네임을 조회
     * 
     * 조회 과정:
     * 1. memberId로 Member 엔티티 조회
     * 2. Member의 userId로 User 엔티티 조회
     * 3. User의 닉네임 반환
     * 
     * @param memberId 멤버 ID
     * @return 발신자 닉네임, 조회 실패 시 "알 수 없음"
     */
    private String getSenderNickname(Long memberId) {
        try {
            // 1. memberId로 Member 엔티티 조회
            Optional<Member> memberOpt = memberRepository.findById(memberId);
            if (memberOpt.isEmpty()) {
                log.warn("멤버 정보를 찾을 수 없음: memberId={}", memberId);
                return "알 수 없음";
            }
            
            Member member = memberOpt.get();
            String userId = member.getUserId();
            
            // 2. userId로 User 엔티티 조회하여 닉네임 가져오기
            Optional<com.smhrd.graddy.user.entity.User> userOpt = userRepository.findByUserId(userId);
            if (userOpt.isEmpty()) {
                log.warn("사용자 정보를 찾을 수 없음: userId={}", userId);
                return "알 수 없음";
            }
            
            String nickname = userOpt.get().getNick();
            log.debug("발신자 닉네임 조회 성공: memberId={}, userId={}, nickname={}", 
                    memberId, userId, nickname);
            
            return nickname;
            
        } catch (Exception e) {
            log.error("발신자 닉네임 조회 중 오류 발생: memberId={}", memberId, e);
            return "알 수 없음";
        }
    }

    /**
     * 특정 스터디방의 메시지 개수를 조회
     * 파티셔닝된 테이블에서 효율적으로 조회
     * 
     * @param studyProjectId 스터디/프로젝트 ID
     * @return 메시지 개수
     */
    public long getMessageCount(Long studyProjectId) {
        return chatMessageRepository.countByStudyProjectId(studyProjectId);
    }

    /**
     * 특정 스터디방의 채팅 이력을 조회
     * 
     * @param studyProjectId 스터디/프로젝트 ID
     * @return 채팅 메시지 목록
     */
    public List<ChatMessageResponse> getChatHistory(Long studyProjectId) {
        log.info("채팅 이력 조회 시작: studyProjectId={}", studyProjectId);
        
        // 최근 100개 메시지를 최신순으로 조회
        Pageable pageable = PageRequest.of(0, 100, Sort.by("createdAt").descending());
        Page<ChatMessage> messagePage = chatMessageRepository.findByStudyProjectIdOrderByCreatedAtDesc(studyProjectId, pageable);
        
        List<ChatMessage> messages = messagePage.getContent();
        log.info("채팅 이력 조회 완료: studyProjectId={}, messageCount={}", studyProjectId, messages.size());
        
        // ChatMessageResponse로 변환하고 역순으로 정렬 (오래된 것부터 최신 순으로)
        return messages.stream()
                .map(message -> {
                    String senderNick = getSenderNickname(message.getMemberId());
                    String userId = getUserIdByMemberId(message.getMemberId());
                    return ChatMessageResponse.from(message, senderNick, userId, ChatMessageRequest.MessageType.TEXT);
                })
                .collect(Collectors.toList());
    }

    /**
     * memberId로 userId 조회
     * 
     * @param memberId 멤버 ID
     * @return 사용자 ID
     */
    private String getUserIdByMemberId(Long memberId) {
        try {
            Optional<Member> memberOpt = memberRepository.findById(memberId);
            if (memberOpt.isEmpty()) {
                log.warn("멤버 정보를 찾을 수 없음: memberId={}", memberId);
                return "알 수 없음";
            }
            return memberOpt.get().getUserId();
        } catch (Exception e) {
            log.error("사용자 ID 조회 중 오류 발생: memberId={}", memberId, e);
            return "알 수 없음";
        }
    }
}
