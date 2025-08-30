package com.smhrd.graddy.assignment.service;

import com.smhrd.graddy.assignment.dto.AssignmentGenerationRequest;
import com.smhrd.graddy.assignment.dto.AssignmentGenerationResponse;
import com.smhrd.graddy.assignment.entity.Assignment;
import com.smhrd.graddy.assignment.repository.AssignmentRepository;
import com.smhrd.graddy.study.entity.StudyProject;
import com.smhrd.graddy.study.repository.StudyProjectRepository;
import com.smhrd.graddy.tag.entity.Tag;
import com.smhrd.graddy.tag.repository.TagRepository;
import com.smhrd.graddy.member.service.MemberService;
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
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class AssignmentGenerationService {

    private final AssignmentRepository assignmentRepository;
    private final StudyProjectRepository studyProjectRepository;
    private final TagRepository tagRepository;
    private final RestTemplate restTemplate;
    private final MemberService memberService;

    @Value("${fastapi.server.url:http://ec2-3-113-246-191.ap-northeast-1.compute.amazonaws.com}")
    private String fastApiServerUrl;

    /**
     * GPT를 사용하여 과제 자동 생성
     */
    @Transactional
    public AssignmentGenerationResponse generateAssignments(Long studyProjectId, String userId) {
        try {
            log.info("GPT 과제 생성 시작: studyProjectId={}, userId={}", studyProjectId, userId);

            // 스터디 프로젝트 정보 조회
            StudyProject studyProject = studyProjectRepository.findById(studyProjectId)
                    .orElseThrow(() -> new IllegalArgumentException("스터디 프로젝트를 찾을 수 없습니다."));

            // 리더 권한 확인
            if (!memberService.isLeader(studyProjectId, userId)) {
                throw new IllegalArgumentException("과제 생성은 스터디/프로젝트 리더만 가능합니다.");
            }

            // 태그 정보 조회
            List<Tag> tags = tagRepository.findByStudyProjectId(studyProjectId);
            List<String> interestTags = tags.stream()
                    .map(tag -> tag.getInterest().getInterestName())
                    .collect(Collectors.toList());

            // FastAPI 서버에 과제 생성 요청
            String url = fastApiServerUrl + "/generate-assignments";
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Accept-Charset", "UTF-8");

            AssignmentGenerationRequest request = new AssignmentGenerationRequest();
            request.setStudyProjectId(studyProjectId);
            request.setStudyProjectName(studyProject.getStudyProjectName());
            request.setStudyProjectTitle(studyProject.getStudyProjectTitle());
            request.setStudyProjectDesc(studyProject.getStudyProjectDesc());
            request.setStudyLevel(studyProject.getStudyLevel());
            request.setInterestTags(interestTags);
            request.setStudyProjectStart(studyProject.getStudyProjectStart().toString());
            request.setStudyProjectEnd(studyProject.getStudyProjectEnd().toString());
            request.setTypeCheck(studyProject.getTypeCheck().name());

            HttpEntity<AssignmentGenerationRequest> entity = new HttpEntity<>(request, headers);

            log.info("FastAPI 서버 호출: {}", url);
            AssignmentGenerationResponse response = restTemplate.postForObject(url, entity, AssignmentGenerationResponse.class);

            if (response != null && response.getSuccess()) {
                log.info("과제 생성 완료: {}개", response.getAssignments().size());
                
                // 생성된 과제를 데이터베이스에 저장 (선택사항)
                // saveGeneratedAssignments(studyProjectId, response.getAssignments());
                
                return response;
            } else {
                throw new RuntimeException("FastAPI 서버로부터 과제 생성 응답을 받지 못했습니다.");
            }

        } catch (Exception e) {
            log.error("GPT 과제 생성 중 오류 발생", e);
            throw new RuntimeException("과제 생성에 실패했습니다: " + e.getMessage());
        }
    }

    /**
     * 생성된 과제를 데이터베이스에 저장 (선택사항)
     */
    @Transactional
    public void saveGeneratedAssignments(Long studyProjectId, List<Map<String, Object>> assignments, String userId) {
        try {
            // 리더 권한 확인
            if (!memberService.isLeader(studyProjectId, userId)) {
                throw new IllegalArgumentException("과제 저장은 스터디/프로젝트 리더만 가능합니다.");
            }

            // 리더의 memberId 조회
            Long leaderMemberId = memberService.getLeaderMemberId(studyProjectId);
            if (leaderMemberId == null) {
                throw new IllegalArgumentException("리더 정보를 찾을 수 없습니다.");
            }

            for (Map<String, Object> assignmentData : assignments) {
                Assignment assignment = new Assignment();
                assignment.setStudyProjectId(studyProjectId);
                assignment.setMemberId(leaderMemberId); // 리더의 memberId 사용
                assignment.setTitle((String) assignmentData.get("title"));
                assignment.setDescription((String) assignmentData.get("description"));
                
                // 마감일 파싱
                String deadlineStr = (String) assignmentData.get("deadline");
                if (deadlineStr != null) {
                    try {
                        LocalDateTime deadline = LocalDateTime.parse(deadlineStr, 
                            DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
                        assignment.setDeadline(Timestamp.valueOf(deadline));
                    } catch (Exception e) {
                        // 파싱 실패 시 기본값 설정
                        assignment.setDeadline(Timestamp.valueOf(LocalDateTime.now().plusWeeks(1)));
                    }
                } else {
                    assignment.setDeadline(Timestamp.valueOf(LocalDateTime.now().plusWeeks(1)));
                }
                
                assignment.setCreatedAt(Timestamp.valueOf(LocalDateTime.now()));
                
                assignmentRepository.save(assignment);
                log.info("과제 저장 완료: {}", assignment.getTitle());
            }
        } catch (Exception e) {
            log.error("과제 저장 중 오류 발생", e);
            // 과제 저장 실패는 전체 프로세스를 중단하지 않음
        }
    }

    /**
     * 스터디 프로젝트별 기존 과제 목록 조회
     */
    public List<Assignment> getAssignmentsByStudyProject(Long studyProjectId) {
        return assignmentRepository.findByStudyProjectIdOrderByCreatedAtDesc(studyProjectId);
    }
}
