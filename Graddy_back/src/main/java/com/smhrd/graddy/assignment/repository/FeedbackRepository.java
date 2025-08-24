package com.smhrd.graddy.assignment.repository;

import com.smhrd.graddy.assignment.entity.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FeedbackRepository extends JpaRepository<Feedback, Long> {
    
    // 제출별 피드백 조회
    List<Feedback> findBySubmissionIdOrderByCreatedAtDesc(Long submissionId);
    
    // 멤버별 피드백 조회
    List<Feedback> findByMemberIdOrderByCreatedAtDesc(Long memberId);
    
    // 특정 제출의 특정 멤버 피드백 조회
    Optional<Feedback> findBySubmissionIdAndMemberId(Long submissionId, Long memberId);
    
    // 과제별 평균 점수 조회
    Double findAverageScoreBySubmissionId(Long submissionId);
}
