package com.smhrd.graddy.chat.repository;

import com.smhrd.graddy.member.entity.Member;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * 스터디/프로젝트 멤버십 확인을 위한 레포지토리
 * 
 * 주요 기능:
 * - 특정 스터디에 특정 멤버가 존재하는지 확인 (채팅 권한 검증)
 * - 멤버 정보 조회
 * - 스터디별 멤버 목록 조회
 * 
 * 테이블: study_project_member
 * - member_id: 멤버 고유 ID (PK)
 * - user_id: 사용자 ID (users 테이블 참조)
 * - study_project_id: 스터디/프로젝트 ID
 * - joined_at: 가입 시간
 */
@Repository
public interface StudyProjectMemberRepository extends JpaRepository<Member, Long> {
    
    /**
     * 특정 스터디에 특정 멤버가 존재하는지 확인
     * 채팅 권한 검증에 사용
     * 
     * @param studyProjectId 스터디/프로젝트 ID
     * @param memberId 멤버 ID
     * @return 존재하면 true, 아니면 false
     */
    @Query("SELECT COUNT(m) > 0 FROM Member m WHERE m.studyProjectId = :studyProjectId AND m.memberId = :memberId")
    boolean existsByStudyProjectIdAndMemberId(
            @Param("studyProjectId") Long studyProjectId, 
            @Param("memberId") Long memberId
    );
    
    /**
     * 특정 스터디의 모든 멤버를 조회
     * 
     * @param studyProjectId 스터디/프로젝트 ID
     * @return 멤버 목록
     */
    @Query("SELECT m FROM Member m WHERE m.studyProjectId = :studyProjectId ORDER BY m.joinedAt ASC")
    List<Member> findByStudyProjectIdOrderByJoinedAtAsc(@Param("studyProjectId") Long studyProjectId);
    
    /**
     * 특정 멤버 정보를 조회
     * 
     * @param memberId 멤버 ID
     * @return 멤버 정보 (Optional)
     */
    @Override
    Optional<Member> findById(Long memberId);
    
    /**
     * 특정 사용자가 특정 스터디의 멤버인지 확인
     * 
     * @param userId 사용자 ID
     * @param studyProjectId 스터디/프로젝트 ID
     * @return 멤버 정보 (Optional)
     */
    @Query("SELECT m FROM Member m WHERE m.userId = :userId AND m.studyProjectId = :studyProjectId")
    Optional<Member> findByUserIdAndStudyProjectId(
            @Param("userId") String userId, 
            @Param("studyProjectId") Long studyProjectId
    );
    
    /**
     * 특정 스터디의 멤버 수를 조회
     * 
     * @param studyProjectId 스터디/프로젝트 ID
     * @return 멤버 수
     */
    @Query("SELECT COUNT(m) FROM Member m WHERE m.studyProjectId = :studyProjectId")
    long countByStudyProjectId(@Param("studyProjectId") Long studyProjectId);
    
    /**
     * 특정 스터디의 모든 사용자 ID를 조회
     * 
     * @param studyProjectId 스터디/프로젝트 ID
     * @return 사용자 ID 목록
     */
    @Query("SELECT m.userId FROM Member m WHERE m.studyProjectId = :studyProjectId ORDER BY m.joinedAt ASC")
    List<String> findUserIdsByStudyProjectId(@Param("studyProjectId") Long studyProjectId);
}
