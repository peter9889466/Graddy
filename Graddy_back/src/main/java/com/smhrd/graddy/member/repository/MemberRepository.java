package com.smhrd.graddy.member.repository;

import com.smhrd.graddy.member.entity.Member;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MemberRepository extends JpaRepository<Member, Long> {

    // 유저별 멤버십 조회
    List<Member> findByUserId(String userId);
    
    // 스터디/프로젝트별 멤버 조회
    List<Member> findByStudyProjectId(Long studyProjectId);
    
    // 특정 유저가 특정 스터디/프로젝트의 멤버인지 확인
    Optional<Member> findByUserIdAndStudyProjectId(String userId, Long studyProjectId);
    
    // 스터디/프로젝트의 멤버 수 조회 (approved 상태만)
    @Query("SELECT COUNT(m) FROM Member m WHERE m.studyProjectId = :studyProjectId AND m.studyProjectCheck = 'approved'")
    long countByStudyProjectIdAndApproved(@Param("studyProjectId") Long studyProjectId);
    
    // 스터디/프로젝트의 멤버 수 조회 (기존 메서드 유지)
    long countByStudyProjectId(Long studyProjectId);
    
    // 스터디/프로젝트의 리더 조회
    Optional<Member> findByStudyProjectIdAndMemberType(Long studyProjectId, Member.MemberType memberType);
    
    // 스터디/프로젝트의 approved 상태 멤버 목록 조회
    List<Member> findByStudyProjectIdAndStudyProjectCheck(Long studyProjectId, Member.MemberStatus status);
    
    // 스터디/프로젝트 ID로 삭제
    void deleteByStudyProjectId(Long studyProjectId);
    
    // 유저 ID로 삭제
    void deleteByUserId(String userId);
    
    /**
     * 사용자가 참여한 스터디/프로젝트 ID 목록 조회
     * @param userId 사용자 ID
     * @return 참여한 스터디/프로젝트 ID 목록
     */
    @Query("SELECT m.studyProjectId FROM Member m WHERE m.userId = :userId")
    List<Long> findStudyProjectIdsByUserId(@Param("userId") String userId);
    
    /**
     * 특정 스터디/프로젝트에 참여한 사용자 ID 목록 조회
     * @param studyProjectId 스터디/프로젝트 ID
     * @return 참여한 사용자 ID 목록
     */
    @Query("SELECT m.userId FROM Member m WHERE m.studyProjectId = :studyProjectId")
    List<String> findUserIdsByStudyProjectId(@Param("studyProjectId") Long studyProjectId);
    
    /**
     * 특정 사용자가 특정 스터디/프로젝트에 참여하고 있는지 확인
     * @param userId 사용자 ID
     * @param studyProjectId 스터디/프로젝트 ID
     * @return 참여 여부
     */
    boolean existsByUserIdAndStudyProjectId(String userId, Long studyProjectId);
}
