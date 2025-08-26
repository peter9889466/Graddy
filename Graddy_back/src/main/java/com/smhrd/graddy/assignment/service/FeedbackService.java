package com.smhrd.graddy.assignment.service;

import com.smhrd.graddy.assignment.dto.FeedbackRequest;
import com.smhrd.graddy.assignment.dto.FeedbackResponse;
import com.smhrd.graddy.assignment.entity.Feedback;
import com.smhrd.graddy.assignment.entity.Assignment;
import com.smhrd.graddy.assignment.entity.Submission;
import com.smhrd.graddy.assignment.repository.FeedbackRepository;
import com.smhrd.graddy.assignment.repository.AssignmentRepository;
import com.smhrd.graddy.assignment.repository.SubmissionRepository;
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
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class FeedbackService {

    private final FeedbackRepository feedbackRepository;
    private final AssignmentRepository assignmentRepository;
    private final SubmissionRepository submissionRepository;
    private final RestTemplate restTemplate;

    @Value("${fastapi.server.url:http://localhost:8000}")
    private String fastApiServerUrl;

    /**
     * 과제 ID를 통해 과제 정보와 제출 정보를 가져와서 AI 피드백 생성
     */
    @Transactional
    public FeedbackResponse generateFeedback(FeedbackRequest request) {
        try {
            log.info("AI 피드백 생성 시작: assignmentId={}", request.getAssignmentId());

            // 1. 과제 정보 조회
            Assignment assignment = assignmentRepository.findById(request.getAssignmentId())
                    .orElseThrow(() -> new IllegalArgumentException("과제를 찾을 수 없습니다: " + request.getAssignmentId()));

            // 2. 해당 과제의 제출 정보 조회
            List<Submission> submissions = submissionRepository.findByAssignmentIdOrderByCreatedAtDesc(request.getAssignmentId());
            if (submissions.isEmpty()) {
                throw new IllegalArgumentException("해당 과제에 제출된 내용이 없습니다.");
            }

            // 3. 각 제출에 대해 AI 피드백 생성
            List<Feedback> generatedFeedbacks = new ArrayList<>();
            
            for (Submission submission : submissions) {
                // 이미 피드백이 있는지 확인
                if (feedbackRepository.findBySubmissionIdAndMemberId(submission.getSubmissionId(), submission.getMemberId()).isPresent()) {
                    log.info("제출 {}에 대한 피드백이 이미 존재합니다. 건너뜁니다.", submission.getSubmissionId());
                    continue;
                }

                // AI 피드백 생성
                Map<String, Object> aiFeedback = generateAiFeedback(assignment, submission);
                
                // 피드백을 데이터베이스에 저장
                Feedback feedback = new Feedback();
                feedback.setMemberId(submission.getMemberId());
                feedback.setSubmissionId(submission.getSubmissionId());
                feedback.setScore((Integer) aiFeedback.get("score"));
                feedback.setComment((String) aiFeedback.get("comment"));
                feedback.setCreatedAt(Timestamp.valueOf(LocalDateTime.now()));

                Feedback savedFeedback = feedbackRepository.save(feedback);
                generatedFeedbacks.add(savedFeedback);
                
                log.info("제출 {}에 대한 피드백 생성 완료: feedId={}, score={}", 
                        submission.getSubmissionId(), savedFeedback.getFeedId(), savedFeedback.getScore());
            }

            if (generatedFeedbacks.isEmpty()) {
                throw new IllegalArgumentException("모든 제출에 대해 이미 피드백이 존재합니다.");
            }

            // 4. 첫 번째 피드백을 응답으로 반환
            Feedback firstFeedback = generatedFeedbacks.get(0);
            return new FeedbackResponse(
                    firstFeedback.getFeedId(),
                    firstFeedback.getMemberId(),
                    firstFeedback.getSubmissionId(),
                    firstFeedback.getScore(),
                    firstFeedback.getComment(),
                    firstFeedback.getCreatedAt()
                );
        } catch (Exception e) {
            log.error("AI 피드백 생성 중 오류 발생", e);
            throw new RuntimeException("AI 피드백 생성에 실패했습니다: " + e.getMessage());
        }
    }

    /**
     * Assignment와 Submission을 직접 받아서 AI 피드백 생성 (SubmissionService에서 사용)
     */
    public Map<String, Object> generateFeedback(Assignment assignment, Submission submission) {
        try {
            log.info("개별 제출에 대한 AI 피드백 생성 시작: submissionId={}", submission.getSubmissionId());

            // AI 피드백 생성
            Map<String, Object> aiFeedback = generateAiFeedback(assignment, submission);
            
            log.info("개별 제출에 대한 AI 피드백 생성 완료: submissionId={}", submission.getSubmissionId());
            return aiFeedback;
            
        } catch (Exception e) {
            log.error("개별 제출에 대한 AI 피드백 생성 중 오류 발생: submissionId={}", submission.getSubmissionId(), e);
            throw new RuntimeException("AI 피드백 생성에 실패했습니다: " + e.getMessage());
        }
    }

    /**
     * Submission만 받아서 AI 피드백을 생성하고 저장 (SubmissionService에서 사용)
     */
    @Transactional
    public void generateFeedbackForSubmission(Submission submission) {
        try {
            log.info("제출에 대한 AI 피드백 생성 및 저장 시작: submissionId={}", submission.getSubmissionId());

            // 1. 과제 정보 조회
            Assignment assignment = assignmentRepository.findById(submission.getAssignmentId())
                    .orElseThrow(() -> new IllegalArgumentException("과제를 찾을 수 없습니다: " + submission.getAssignmentId()));

            // 2. 이미 피드백이 있는지 확인
            if (feedbackRepository.findBySubmissionIdAndMemberId(submission.getSubmissionId(), submission.getMemberId()).isPresent()) {
                log.info("제출 {}에 대한 피드백이 이미 존재합니다. 건너뜁니다.", submission.getSubmissionId());
                return;
            }

            // 3. AI 피드백 생성
            Map<String, Object> aiFeedback = generateAiFeedback(assignment, submission);
            
            // 4. 피드백을 데이터베이스에 저장
            Feedback feedback = new Feedback();
            feedback.setMemberId(submission.getMemberId());
            feedback.setSubmissionId(submission.getSubmissionId());
            feedback.setScore((Integer) aiFeedback.get("score"));
            feedback.setComment((String) aiFeedback.get("comment"));
            feedback.setCreatedAt(Timestamp.valueOf(LocalDateTime.now()));

            Feedback savedFeedback = feedbackRepository.save(feedback);
            
            log.info("제출 {}에 대한 AI 피드백 생성 및 저장 완료: feedId={}, score={}", 
                    submission.getSubmissionId(), savedFeedback.getFeedId(), savedFeedback.getScore());
            
        } catch (Exception e) {
            log.error("제출에 대한 AI 피드백 생성 및 저장 중 오류 발생: submissionId={}", submission.getSubmissionId(), e);
            throw new RuntimeException("AI 피드백 생성 및 저장에 실패했습니다: " + e.getMessage());
        }
    }

    /**
     * OpenAI API를 사용하여 AI 피드백 생성
     */
    private Map<String, Object> generateAiFeedback(Assignment assignment, Submission submission) {
        try {
            // FastAPI 서버에 피드백 생성 요청
            String url = fastApiServerUrl + "/generate-feedback";
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Accept-Charset", "UTF-8");

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("assignment_title", assignment.getTitle());
            requestBody.put("assignment_description", assignment.getDescription());
            requestBody.put("submission_content", submission.getContent());
            requestBody.put("submission_file_url", submission.getFileUrl());

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            log.info("FastAPI 서버 호출: {}", url);
            Map<String, Object> response = restTemplate.postForObject(url, entity, Map.class);

            if (response != null) {
                // 응답에서 피드백 정보 추출
                Integer score = (Integer) response.get("score");
                String comment = (String) response.get("comment");
                String detailedFeedback = (String) response.get("detailed_feedback");

                Map<String, Object> result = new HashMap<>();
                result.put("score", score != null ? score : 5);
                result.put("comment", comment != null ? comment : "피드백이 생성되었습니다.");
                result.put("detailed_feedback", detailedFeedback);

                return result;
            } else {
                throw new RuntimeException("FastAPI 서버로부터 응답을 받지 못했습니다.");
            }

        } catch (Exception e) {
            log.error("AI 피드백 생성 중 오류 발생", e);
            // 기본 피드백 반환
            Map<String, Object> defaultFeedback = new HashMap<>();
            defaultFeedback.put("score", 5);
            defaultFeedback.put("comment", "AI 피드백 생성에 실패하여 기본 피드백을 제공합니다.");
            defaultFeedback.put("detailed_feedback", "과제 제출이 확인되었습니다.");
            return defaultFeedback;
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
