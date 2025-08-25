package com.smhrd.graddy.study.service;

import com.smhrd.graddy.study.dto.AICurriculumResponse;
import com.smhrd.graddy.study.entity.StudyProject;
import com.smhrd.graddy.study.repository.StudyProjectRepository;
import com.smhrd.graddy.tag.entity.Tag;
import com.smhrd.graddy.tag.repository.TagRepository;
import com.smhrd.graddy.interest.entity.Interest;
import com.smhrd.graddy.interest.repository.InterestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

@Service
public class AICurriculumService {

    private static final Logger logger = LoggerFactory.getLogger(AICurriculumService.class);

    @Autowired
    private StudyProjectRepository studyProjectRepository;

    @Autowired
    private TagRepository tagRepository;

    @Autowired
    private InterestRepository interestRepository;

    @Value("${ai.curriculum.api.url:http://localhost:8000}")
    private String aiApiUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * FastAPI 서버를 통해 AI 커리큘럼을 생성합니다.
     */
    public AICurriculumResponse generateCurriculum(Long studyProjectId) {
        try {
            logger.info("Starting AI curriculum generation for study project ID: {}", studyProjectId);
            
            // 스터디/프로젝트 정보 조회
            StudyProject studyProject = studyProjectRepository.findById(studyProjectId)
                    .orElseThrow(() -> new IllegalArgumentException("스터디/프로젝트를 찾을 수 없습니다: " + studyProjectId));

            // 태그 정보 조회 (관심 항목명으로)
            List<String> interestTags = new ArrayList<>();
            List<Tag> tags = tagRepository.findByStudyProjectId(studyProjectId);
            for (Tag tag : tags) {
                Interest interest = interestRepository.findById(tag.getInterestId()).orElse(null);
                if (interest != null) {
                    interestTags.add(interest.getInterestName());
                }
            }

            logger.info("Found interest tags: {}", interestTags);

            // FastAPI 서버로 요청할 데이터 구성
            Map<String, Object> requestData = new HashMap<>();
            requestData.put("study_project_id", studyProjectId);
            requestData.put("study_project_name", studyProject.getStudyProjectName());
            requestData.put("study_project_title", studyProject.getStudyProjectTitle());
            requestData.put("study_project_desc", studyProject.getStudyProjectDesc());
            requestData.put("study_level", studyProject.getStudyLevel());
            requestData.put("interest_tags", interestTags);
            requestData.put("study_project_start", studyProject.getStudyProjectStart().toString());
            requestData.put("study_project_end", studyProject.getStudyProjectEnd().toString());
            requestData.put("type_check", studyProject.getTypeCheck().toString());

            // HTTP 헤더 설정 (UTF-8 인코딩 명시)
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set(HttpHeaders.ACCEPT_CHARSET, StandardCharsets.UTF_8.name());

            // HTTP 요청 엔티티 생성
            HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(requestData, headers);

            logger.info("Sending request to FastAPI server: {}", aiApiUrl + "/generate-curriculum");

            // FastAPI 서버로 POST 요청
            ResponseEntity<Map> response = restTemplate.postForEntity(
                    aiApiUrl + "/generate-curriculum",
                    requestEntity,
                    Map.class
            );

            // 응답 처리
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Map<String, Object> responseBody = response.getBody();
                
                logger.info("Received response from FastAPI server: {}", responseBody);
                
                // 성공 응답
                if (Boolean.TRUE.equals(responseBody.get("success"))) {
                    String curriculum = (String) responseBody.get("curriculum");
                    
                    // 한글 인코딩 확인 및 로깅
                    logger.info("Generated curriculum length: {}", curriculum != null ? curriculum.length() : 0);
                    if (curriculum != null) {
                        logger.info("Curriculum preview: {}", curriculum.substring(0, Math.min(100, curriculum.length())));
                    }
                    
                    // 생성된 커리큘럼을 StudyProject에 저장
                    studyProject.setCurText(curriculum);
                    studyProjectRepository.save(studyProject);

                    logger.info("Curriculum saved to database successfully");

                    return AICurriculumResponse.builder()
                            .studyId(studyProjectId)
                            .curriculum(curriculum)
                            .message("AI 커리큘럼이 성공적으로 생성되었습니다.")
                            .success(true)
                            .build();
                } else {
                    // AI 서버에서 실패 응답
                    logger.error("AI server returned failure: {}", responseBody.get("message"));
                    return AICurriculumResponse.builder()
                            .studyId(studyProjectId)
                            .curriculum("")
                            .message("AI 커리큘럼 생성에 실패했습니다: " + responseBody.get("message"))
                            .success(false)
                            .build();
                }
            } else {
                // HTTP 응답 실패
                logger.error("HTTP response error: {}", response.getStatusCode());
                return AICurriculumResponse.builder()
                        .studyId(studyProjectId)
                        .curriculum("")
                        .message("AI 서버 응답 오류: " + response.getStatusCode())
                        .success(false)
                        .build();
            }

        } catch (Exception e) {
            // 예외 발생 시
            logger.error("Error during curriculum generation: ", e);
            return AICurriculumResponse.builder()
                    .studyId(studyProjectId)
                    .curriculum("")
                    .message("커리큘럼 생성 중 오류가 발생했습니다: " + e.getMessage())
                    .success(false)
                    .build();
        }
    }

    /**
     * FastAPI 서버 상태를 확인합니다.
     */
    public boolean checkAIServerHealth() {
        try {
            ResponseEntity<Map> response = restTemplate.getForEntity(
                    aiApiUrl + "/health",
                    Map.class
            );
            boolean isHealthy = response.getStatusCode().is2xxSuccessful();
            logger.info("AI server health check: {}", isHealthy ? "healthy" : "unhealthy");
            return isHealthy;
        } catch (Exception e) {
            logger.error("Error checking AI server health: ", e);
            return false;
        }
    }
}
