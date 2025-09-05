package com.smhrd.graddy.chat.repository;

import com.smhrd.graddy.chat.entity.ChatMessage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.sql.Timestamp;
import java.util.List;

/**
 * ChatMessage 엔티티에 대한 데이터베이스 작업을 처리하는 JPA 레포지토리
 * 
 * 주요 기능:
 * - 메시지 저장/조회/삭제
 * - 스터디방별 메시지 조회 (파티셔닝 고려)
 * - 멤버별 메시지 조회
 * - 시간 범위별 메시지 조회
 * - 파일 메시지 조회
 */
@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    
    /**
     * 특정 스터디방의 최근 메시지들을 생성 시간 역순으로 조회
     * 파티셔닝을 고려하여 created_at 기준으로 정렬
     * 
     * @param studyProjectId 스터디/프로젝트 ID
     * @param pageable 페이징 정보
     * @return 페이징된 메시지 목록
     */
    @Query("SELECT cm FROM ChatMessage cm WHERE cm.studyProjectId = :studyProjectId ORDER BY cm.createdAt DESC")
    Page<ChatMessage> findByStudyProjectIdOrderByCreatedAtDesc(
            @Param("studyProjectId") Long studyProjectId, 
            Pageable pageable
    );
    
    /**
     * 특정 스터디방의 메시지들을 생성 시간 순으로 조회
     * 채팅 이력에서 최신 메시지가 맨 아래에 오도록 정렬
     * 
     * @param studyProjectId 스터디/프로젝트 ID
     * @param pageable 페이징 정보
     * @return 페이징된 메시지 목록
     */
    @Query("SELECT cm FROM ChatMessage cm WHERE cm.studyProjectId = :studyProjectId ORDER BY cm.createdAt ASC")
    Page<ChatMessage> findByStudyProjectIdOrderByCreatedAtAsc(
            @Param("studyProjectId") Long studyProjectId, 
            Pageable pageable
    );
    
    /**
     * 특정 스터디방의 특정 시간 이후 메시지들을 조회
     * 실시간 채팅에서 새 메시지만 가져올 때 사용
     * 
     * @param studyProjectId 스터디/프로젝트 ID
     * @param afterTime 기준 시간 (이 시간 이후의 메시지)
     * @return 메시지 목록
     */
    @Query("SELECT cm FROM ChatMessage cm WHERE cm.studyProjectId = :studyProjectId AND cm.createdAt > :afterTime ORDER BY cm.createdAt ASC")
    List<ChatMessage> findByStudyProjectIdAndCreatedAtAfterOrderByCreatedAtAsc(
            @Param("studyProjectId") Long studyProjectId,
            @Param("afterTime") Timestamp afterTime
    );
    
    /**
     * 특정 멤버가 보낸 메시지들을 조회
     * 
     * @param memberId 멤버 ID
     * @param pageable 페이징 정보
     * @return 페이징된 메시지 목록
     */
    @Query("SELECT cm FROM ChatMessage cm WHERE cm.memberId = :memberId ORDER BY cm.createdAt DESC")
    Page<ChatMessage> findByMemberIdOrderByCreatedAtDesc(
            @Param("memberId") Long memberId, 
            Pageable pageable
    );
    
    /**
     * 특정 스터디방의 파일 메시지들을 조회
     * 
     * @param studyProjectId 스터디/프로젝트 ID
     * @param pageable 페이징 정보
     * @return 페이징된 파일 메시지 목록
     */
    @Query("SELECT cm FROM ChatMessage cm WHERE cm.studyProjectId = :studyProjectId AND cm.fileUrl IS NOT NULL ORDER BY cm.createdAt DESC")
    Page<ChatMessage> findFileMessagesByStudyProjectIdOrderByCreatedAtDesc(
            @Param("studyProjectId") Long studyProjectId, 
            Pageable pageable
    );
    
    /**
     * 특정 스터디방의 메시지 개수를 조회
     * 
     * @param studyProjectId 스터디/프로젝트 ID
     * @return 메시지 개수
     */
    @Query("SELECT COUNT(cm) FROM ChatMessage cm WHERE cm.studyProjectId = :studyProjectId")
    long countByStudyProjectId(@Param("studyProjectId") Long studyProjectId);
}
