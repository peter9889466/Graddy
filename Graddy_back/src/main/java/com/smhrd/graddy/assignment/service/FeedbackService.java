package com.smhrd.graddy.assignment.service;

import com.smhrd.graddy.assignment.dto.FeedbackRequest;
import com.smhrd.graddy.assignment.dto.FeedbackResponse;
import com.smhrd.graddy.assignment.entity.Feedback;
import com.smhrd.graddy.assignment.entity.Assignment;
import com.smhrd.graddy.assignment.entity.Submission;
import com.smhrd.graddy.assignment.repository.FeedbackRepository;
import com.smhrd.graddy.assignment.repository.AssignmentRepository;
import com.smhrd.graddy.assignment.repository.SubmissionRepository;
import com.smhrd.graddy.member.service.MemberService;
import com.smhrd.graddy.score.service.ScoreService;
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
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class FeedbackService {

    private final FeedbackRepository feedbackRepository;
    private final AssignmentRepository assignmentRepository;
    private final SubmissionRepository submissionRepository;
    private final MemberService memberService;
    private final ScoreService scoreService;
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
            Assignment assignment = assignmentRepository.findById(submission.getAssignmentId()).orElse(null);
            if (assignment == null) {
                log.warn("과제를 찾을 수 없습니다: assignmentId={}, submissionId={}. AI 피드백 생성을 건너뜁니다.", 
                        submission.getAssignmentId(), submission.getSubmissionId());
                
                // 추가 디버깅 정보 로깅
                log.warn("제출 정보: submissionId={}, assignmentId={}, memberId={}, content={}", 
                        submission.getSubmissionId(), submission.getAssignmentId(), 
                        submission.getMemberId(), submission.getContent());
                
                return; // 과제가 존재하지 않으면 AI 피드백 생성을 건너뜀
            }

            // 2. 이미 피드백이 있는지 확인
            Optional<Feedback> existingFeedback = feedbackRepository.findBySubmissionIdAndMemberId(submission.getSubmissionId(), submission.getMemberId());
            if (existingFeedback.isPresent()) {
                log.info("⚠️ [DEBUG] 제출 {}에 대한 피드백이 이미 존재합니다. 점수 재반영을 시도합니다.", submission.getSubmissionId());
                Feedback feedback = existingFeedback.get();
                log.info("📊 [DEBUG] 기존 피드백 정보: feedId={}, score={}, memberId={}", 
                        feedback.getFeedId(), feedback.getScore(), feedback.getMemberId());
                
                // 기존 피드백이 있으면 점수를 다시 반영
                if (feedback.getScore() != null) {
                    log.info("🔄 [DEBUG] 기존 피드백 점수 재반영 시도: score={}", feedback.getScore());
                    updateUserScoreFromFeedback(feedback.getMemberId(), feedback.getScore());
                } else {
                    log.warn("⚠️ [DEBUG] 기존 피드백에 점수가 없습니다: feedId={}", feedback.getFeedId());
                }
                return;
            }

            // 3. AI 피드백 생성
            Map<String, Object> aiFeedback = generateAiFeedback(assignment, submission);
            log.info("🎯 [DEBUG] AI 피드백 생성 결과: score={}, comment={}", 
                    aiFeedback.get("score"), aiFeedback.get("comment") != null ? "있음" : "없음");
            
            // 4. 피드백을 데이터베이스에 저장
            Feedback feedback = new Feedback();
            feedback.setMemberId(submission.getMemberId());
            feedback.setSubmissionId(submission.getSubmissionId());
            feedback.setScore((Integer) aiFeedback.get("score"));
            feedback.setComment((String) aiFeedback.get("comment"));
            feedback.setCreatedAt(Timestamp.valueOf(LocalDateTime.now()));

            Feedback savedFeedback = feedbackRepository.save(feedback);
            
            log.info("✅ [DEBUG] 제출 {}에 대한 AI 피드백 생성 및 저장 완료: feedId={}, score={}", 
                    submission.getSubmissionId(), savedFeedback.getFeedId(), savedFeedback.getScore());
            
            // 5. AI 피드백 점수를 사용자의 총 점수에 반영 (가중치 없이 그대로 반영)
            log.info("🚀 [DEBUG] 사용자 점수 반영 시작: memberId={}, 피드백점수={}", 
                    submission.getMemberId(), savedFeedback.getScore());
            updateUserScoreFromFeedback(submission.getMemberId(), savedFeedback.getScore());
            
        } catch (Exception e) {
            log.error("제출에 대한 AI 피드백 생성 및 저장 중 오류 발생: submissionId={}, error={}", submission.getSubmissionId(), e.getMessage());
            // AI 피드백 생성 실패는 과제 제출에 영향을 주지 않음
            // RuntimeException을 던지지 않고 로그만 남김
        }
    }

    /**
     * OpenAI API를 사용하여 AI 피드백 생성
     */
    private Map<String, Object> generateAiFeedback(Assignment assignment, Submission submission) {
        try {
            log.info("🚀 [DEBUG] AI 피드백 생성 시작");
            log.info("📝 [DEBUG] 과제 정보 - ID: {}, 제목: {}", assignment.getAssignmentId(), assignment.getTitle());
            log.info("📄 [DEBUG] 제출 정보 - ID: {}, 회원ID: {}, 내용길이: {}", 
                    submission.getSubmissionId(), submission.getMemberId(), 
                    submission.getContent() != null ? submission.getContent().length() : 0);
            log.info("📎 [DEBUG] 첨부파일 URL: {}", submission.getFileUrl());
            
            // FastAPI 서버에 피드백 생성 요청
            String url = fastApiServerUrl + "/generate-feedback";
            log.info("🌐 [DEBUG] FastAPI 서버 URL: {}", url);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Accept-Charset", "UTF-8");

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("assignment_title", assignment.getTitle());
            requestBody.put("assignment_description", assignment.getDescription());
            requestBody.put("submission_content", submission.getContent());
            requestBody.put("submission_file_url", submission.getFileUrl());

            log.info("📦 [DEBUG] 요청 데이터:");
            log.info("  - assignment_title: {}", assignment.getTitle());
            log.info("  - assignment_description 길이: {}", assignment.getDescription() != null ? assignment.getDescription().length() : 0);
            log.info("  - submission_content 길이: {}", submission.getContent() != null ? submission.getContent().length() : 0);
            log.info("  - submission_file_url: {}", submission.getFileUrl());

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            log.info("🌐 [DEBUG] FastAPI 서버 호출 시작: {}", url);
            Map<String, Object> response = restTemplate.postForObject(url, entity, Map.class);
            log.info("✅ [DEBUG] FastAPI 서버 응답 받음");

            if (response != null) {
                log.info("📊 [DEBUG] FastAPI 응답 분석:");
                log.info("  - 응답 키들: {}", response.keySet());
                
                // 응답에서 피드백 정보 추출
                Integer score = (Integer) response.get("score");
                String comment = (String) response.get("comment");
                String detailedFeedback = (String) response.get("detailed_feedback");

                log.info("📊 [DEBUG] 추출된 데이터:");
                log.info("  - score: {}", score);
                log.info("  - comment 길이: {}", comment != null ? comment.length() : 0);
                log.info("  - detailed_feedback 길이: {}", detailedFeedback != null ? detailedFeedback.length() : 0);

                Map<String, Object> result = new HashMap<>();
                result.put("score", score != null ? score : 5);
                result.put("comment", comment != null ? comment : "피드백이 생성되었습니다.");
                result.put("detailed_feedback", detailedFeedback);

                log.info("✅ [DEBUG] AI 피드백 생성 완료 - 점수: {}", result.get("score"));
                return result;
            } else {
                log.error("❌ [DEBUG] FastAPI 서버로부터 null 응답 받음");
                throw new RuntimeException("FastAPI 서버로부터 응답을 받지 못했습니다.");
            }

        } catch (Exception e) {
            log.error("💥 [DEBUG] AI 피드백 생성 중 오류 발생", e);
            log.error("💥 [DEBUG] 오류 타입: {}", e.getClass().getSimpleName());
            log.error("💥 [DEBUG] 오류 메시지: {}", e.getMessage());
            
            // 기본 피드백 반환
            Map<String, Object> defaultFeedback = new HashMap<>();
            defaultFeedback.put("score", 5);
            defaultFeedback.put("comment", "AI 피드백 생성에 실패하여 기본 피드백을 제공합니다.");
            defaultFeedback.put("detailed_feedback", "과제 제출이 확인되었습니다.");
            
            log.warn("⚠️ [DEBUG] 기본 피드백 반환 - 점수: {}", defaultFeedback.get("score"));
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

    /**
     * 특정 제출물의 피드백 수동 재생성 (디버깅용)
     */
    @Transactional
    public void regenerateFeedbackForSubmission(Long submissionId) {
        try {
            log.info("🔧 [DEBUG] 피드백 수동 재생성 시작: submissionId={}", submissionId);
            
            // 제출물 조회
            Optional<Submission> submissionOpt = submissionRepository.findById(submissionId);
            if (submissionOpt.isEmpty()) {
                log.error("❌ [DEBUG] 제출물을 찾을 수 없음: submissionId={}", submissionId);
                return;
            }
            
            Submission submission = submissionOpt.get();
            log.info("📄 [DEBUG] 제출물 정보: assignmentId={}, memberId={}, fileUrl={}", 
                    submission.getAssignmentId(), submission.getMemberId(), submission.getFileUrl());
            
            // 기존 피드백 삭제
            Optional<Feedback> existingFeedback = feedbackRepository.findBySubmissionIdAndMemberId(
                    submission.getSubmissionId(), submission.getMemberId());
            if (existingFeedback.isPresent()) {
                log.info("🗑️ [DEBUG] 기존 피드백 삭제: feedId={}", existingFeedback.get().getFeedId());
                feedbackRepository.delete(existingFeedback.get());
            }
            
            // 새 피드백 생성
            generateFeedbackForSubmission(submission);
            log.info("✅ [DEBUG] 피드백 수동 재생성 완료: submissionId={}", submissionId);
            
        } catch (Exception e) {
            log.error("❌ [DEBUG] 피드백 수동 재생성 실패: submissionId={}, error={}", submissionId, e.getMessage());
        }
    }

    /**
     * AI 피드백 점수를 사용자의 총 점수에 반영 (가중치 없이 그대로 반영)
     */
    private void updateUserScoreFromFeedback(Long memberId, Integer feedbackScore) {
        try {
            log.info("AI 피드백 점수를 사용자 점수에 반영 시작: memberId={}, feedbackScore={}", memberId, feedbackScore);
            
            // 1. memberId로 userId 조회
            String userId = memberService.getUserIdByMemberId(memberId);
            if (userId == null) {
                log.warn("memberId {}에 해당하는 userId를 찾을 수 없습니다.", memberId);
                return;
            }
            
            // 2. AI 피드백 점수를 그대로 사용자 점수에 반영 (가중치 없음)
            scoreService.increaseUserScore(userId, feedbackScore);
            
            log.info("AI 피드백 점수 반영 완료: userId={}, 피드백점수={}, 총 점수에 그대로 반영됨", 
                    userId, feedbackScore);
            
        } catch (Exception e) {
            log.error("AI 피드백 점수를 사용자 점수에 반영 중 오류 발생: memberId={}, error={}", memberId, e.getMessage());
            // 점수 반영 실패해도 피드백 생성은 성공으로 처리
        }
    }
}
