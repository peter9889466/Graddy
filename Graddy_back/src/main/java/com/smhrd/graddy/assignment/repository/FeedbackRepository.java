package com.smhrd.graddy.assignment.repository;

import com.smhrd.graddy.assignment.entity.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FeedbackRepository extends JpaRepository<Feedback, Long> {
    
    /**
     * 제출물 ID로 피드백 목록 조회
     */
    List<Feedback> findBySubmissionId(Long submissionId);
    
    /**
     * 제출물 ID와 멤버 ID로 피드백 조회
     */
    Optional<Feedback> findBySubmissionIdAndMemberId(Long submissionId, Long memberId);
    
    /**
     * 제출물 ID로 피드백 목록 조회 (생성일 내림차순)
     */
    List<Feedback> findBySubmissionIdOrderByCreatedAtDesc(Long submissionId);
    
    /**
     * 멤버 ID로 피드백 목록 조회 (생성일 내림차순)
     */
    List<Feedback> findByMemberIdOrderByCreatedAtDesc(Long memberId);
    
    /**
     * 제출물 ID로 평균 점수 조회
     */
    @Query("SELECT AVG(f.score) FROM Feedback f WHERE f.submissionId = :submissionId")
    Double findAverageScoreBySubmissionId(@Param("submissionId") Long submissionId);
}

