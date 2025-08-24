package com.smhrd.graddy.assignment.service;

import com.smhrd.graddy.assignment.dto.FeedbackRequest;
import com.smhrd.graddy.assignment.dto.FeedbackResponse;
import com.smhrd.graddy.assignment.entity.Feedback;
import com.smhrd.graddy.assignment.repository.FeedbackRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class FeedbackService {

    private final FeedbackRepository feedbackRepository;
    private final RestTemplate restTemplate;

    @Value("${fastapi.server.url:http://localhost:8000}")
    private String fastApiServerUrl;

    /**
     * GPT를 사용하여 과제 제출에 대한 피드백 생성
     */
    @Transactional
    public FeedbackResponse generateFeedback(FeedbackRequest request) {
        try {
            log.info("GPT 피드백 생성 시작: assignment={}, member={}", 
                    request.getAssignmentId(), request.getMemberId());

            // FastAPI 서버에 피드백 생성 요청
            String url = fastApiServerUrl + "/generate-feedback";
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Accept-Charset", "UTF-8");

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("assignment_title", request.getAssignmentTitle());
            requestBody.put("assignment_description", request.getAssignmentDescription());
            requestBody.put("submission_content", request.getSubmissionContent());
            requestBody.put("submission_file_url", request.getSubmissionFileUrl());

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            log.info("FastAPI 서버 호출: {}", url);
            Map<String, Object> response = restTemplate.postForObject(url, entity, Map.class);

            if (response != null) {
                // 응답에서 피드백 정보 추출
                Integer score = (Integer) response.get("score");
                String comment = (String) response.get("comment");
                String detailedFeedback = (String) response.get("detailed_feedback");

                // 피드백을 데이터베이스에 저장
                Feedback feedback = new Feedback();
                feedback.setMemberId(request.getMemberId());
                feedback.setSubmissionId(request.getSubmissionId());
                feedback.setScore(score != null ? score : 5);
                feedback.setComment(comment != null ? comment : "피드백이 생성되었습니다.");
                feedback.setCreatedAt(Timestamp.valueOf(LocalDateTime.now()));

                Feedback savedFeedback = feedbackRepository.save(feedback);
                log.info("피드백 저장 완료: feedId={}", savedFeedback.getFeedId());

                return new FeedbackResponse(
                        savedFeedback.getFeedId(),
                        savedFeedback.getMemberId(),
                        savedFeedback.getSubmissionId(),
                        savedFeedback.getScore(),
                        savedFeedback.getComment(),
                        savedFeedback.getCreatedAt()
                );
            } else {
                throw new RuntimeException("FastAPI 서버로부터 응답을 받지 못했습니다.");
            }

        } catch (Exception e) {
            log.error("GPT 피드백 생성 중 오류 발생", e);
            throw new RuntimeException("피드백 생성에 실패했습니다: " + e.getMessage());
        }
    }

    /**
     * 제출별 피드백 조회
     */
    public List<FeedbackResponse> getFeedbacksBySubmission(Long submissionId) {
        List<Feedback> feedbacks = feedbackRepository.findBySubmissionIdOrderByCreatedAtDesc(submissionId);
        return feedbacks.stream()
                .map(this::convertToResponse)
                .toList();
    }

    /**
     * 멤버별 피드백 조회
     */
    public List<FeedbackResponse> getFeedbacksByMember(Long memberId) {
        List<Feedback> feedbacks = feedbackRepository.findByMemberIdOrderByCreatedAtDesc(memberId);
        return feedbacks.stream()
                .map(this::convertToResponse)
                .toList();
    }

    /**
     * 특정 제출의 특정 멤버 피드백 조회
     */
    public FeedbackResponse getFeedbackBySubmissionAndMember(Long submissionId, Long memberId) {
        Feedback feedback = feedbackRepository.findBySubmissionIdAndMemberId(submissionId, memberId)
                .orElseThrow(() -> new IllegalArgumentException("피드백을 찾을 수 없습니다."));
        return convertToResponse(feedback);
    }

    /**
     * 제출별 평균 점수 조회
     */
    public Double getAverageScoreBySubmission(Long submissionId) {
        return feedbackRepository.findAverageScoreBySubmissionId(submissionId);
    }

    /**
     * Entity를 Response DTO로 변환
     */
    private FeedbackResponse convertToResponse(Feedback feedback) {
        return new FeedbackResponse(
                feedback.getFeedId(),
                feedback.getMemberId(),
                feedback.getSubmissionId(),
                feedback.getScore(),
                feedback.getComment(),
                feedback.getCreatedAt()
        );
    }
}
