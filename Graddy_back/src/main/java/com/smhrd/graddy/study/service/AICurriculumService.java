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

            logger.info("Sending request to FastAPI server: {}", aiApiUrl + "/auto-generate-curriculum");

            // FastAPI 서버로 POST 요청 (auto-generate-curriculum 엔드포인트 사용)
            ResponseEntity<Map> response = restTemplate.postForEntity(
                    aiApiUrl + "/auto-generate-curriculum",
                    requestData,
                    Map.class
            );

            // 응답 처리
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Map<String, Object> responseBody = response.getBody();
                
                // 응답 데이터를 AICurriculumResponse로 변환
                AICurriculumResponse aiCurriculumResponse = new AICurriculumResponse();
                aiCurriculumResponse.setStudyId(studyProjectId);
                aiCurriculumResponse.setCurriculum((String) responseBody.get("curriculum"));
                aiCurriculumResponse.setMessage((String) responseBody.get("message"));
                aiCurriculumResponse.setSuccess((Boolean) responseBody.get("success"));
                
                logger.info("AI curriculum generated successfully for study project ID: {}", studyProjectId);
                return aiCurriculumResponse;
            } else {
                logger.error("Failed to generate AI curriculum. Response status: {}", response.getStatusCode());
                throw new RuntimeException("AI 커리큘럼 생성에 실패했습니다.");
            }
            
        } catch (Exception e) {
            logger.error("Error generating AI curriculum for study project ID: {}", studyProjectId, e);
            throw new RuntimeException("AI 커리큘럼 생성 중 오류가 발생했습니다: " + e.getMessage());
        }
    }

    /**
     * 스터디/프로젝트 생성 후 자동으로 AI 커리큘럼을 생성합니다.
     * 이 메서드는 StudyService에서 호출되어 스터디 생성과 함께 자동으로 실행됩니다.
     * typeCheck가 "study"인 경우에만 AI 커리큘럼을 생성합니다.
     */
    public void createAICurriculum(Long studyProjectId, String studyProjectName) {
        try {
            logger.info("Auto-creating AI curriculum for study project: {} (ID: {})", studyProjectName, studyProjectId);
            
            // 스터디/프로젝트 정보 조회하여 typeCheck 확인
            StudyProject studyProject = studyProjectRepository.findById(studyProjectId)
                    .orElseThrow(() -> new IllegalArgumentException("스터디/프로젝트를 찾을 수 없습니다: " + studyProjectId));
            
            // typeCheck가 "study"인 경우에만 AI 커리큘럼 생성
            if (!"study".equals(studyProject.getTypeCheck().toString())) {
                logger.info("Skipping AI curriculum generation for non-study project: {} (ID: {}, type: {})", 
                    studyProjectName, studyProjectId, studyProject.getTypeCheck());
                return;
            }
            
            logger.info("Proceeding with AI curriculum generation for study project: {} (ID: {}, type: {})", 
                studyProjectName, studyProjectId, studyProject.getTypeCheck());
            
            // AI 커리큘럼 생성
            AICurriculumResponse curriculumResponse = generateCurriculum(studyProjectId);
            
            // 생성된 커리큘럼을 데이터베이스의 cur_text 필드에 저장
            if (curriculumResponse != null && curriculumResponse.isSuccess() && curriculumResponse.getCurriculum() != null) {
                // cur_text 필드에 AI 생성 커리큘럼 저장
                studyProject.setCurText(curriculumResponse.getCurriculum());
                studyProjectRepository.save(studyProject);
                
                logger.info("AI curriculum saved to cur_text field for study project: {} (ID: {})", studyProjectName, studyProjectId);
            } else {
                logger.warn("AI curriculum generation was not successful for study project: {} (ID: {})", studyProjectName, studyProjectId);
            }
            
            logger.info("AI curriculum auto-created successfully for study project: {} (ID: {})", studyProjectName, studyProjectId);
            
        } catch (Exception e) {
            logger.error("Failed to auto-create AI curriculum for study project: {} (ID: {})", studyProjectName, studyProjectId, e);
            // 에러가 발생해도 스터디 생성에는 영향을 주지 않도록 예외를 던지지 않음
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

    /**
     * 특정 스터디의 커리큘럼을 수정합니다.
     * study_project_id를 통해 해당 스터디의 커리큘럼만 수정 가능합니다.
     * 
     * @param studyProjectId 수정할 스터디의 ID
     * @return 수정된 커리큘럼 정보
     */
    public AICurriculumResponse updateCurriculum(Long studyProjectId) {
        try {
            logger.info("Starting curriculum update for study project ID: {}", studyProjectId);
            
            // 스터디/프로젝트 정보 조회
            StudyProject studyProject = studyProjectRepository.findById(studyProjectId)
                    .orElseThrow(() -> new IllegalArgumentException("스터디/프로젝트를 찾을 수 없습니다: " + studyProjectId));

            // typeCheck가 "study"인지 확인
            if (!"study".equals(studyProject.getTypeCheck().toString())) {
                throw new IllegalArgumentException("커리큘럼 수정은 스터디 타입에서만 가능합니다. 현재 타입: " + studyProject.getTypeCheck());
            }

            // 태그 정보 조회 (관심 항목명으로)
            List<String> interestTags = new ArrayList<>();
            List<Tag> tags = tagRepository.findByStudyProjectId(studyProjectId);
            for (Tag tag : tags) {
                Interest interest = interestRepository.findById(tag.getInterestId()).orElse(null);
                if (interest != null) {
                    interestTags.add(interest.getInterestName());
                }
            }

            logger.info("Found interest tags for curriculum update: {}", interestTags);

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

            logger.info("Sending curriculum update request to FastAPI server: {}", aiApiUrl + "/generate-curriculum");

            // FastAPI 서버로 POST 요청 (generate-curriculum 엔드포인트 사용)
            ResponseEntity<Map> response = restTemplate.postForEntity(
                    aiApiUrl + "/generate-curriculum",
                    requestData,
                    Map.class
            );

            // 응답 처리
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Map<String, Object> responseBody = response.getBody();
                
                // 응답 데이터를 AICurriculumResponse로 변환
                AICurriculumResponse aiCurriculumResponse = new AICurriculumResponse();
                aiCurriculumResponse.setStudyId(studyProjectId);
                aiCurriculumResponse.setCurriculum((String) responseBody.get("curriculum"));
                aiCurriculumResponse.setMessage((String) responseBody.get("message"));
                aiCurriculumResponse.setSuccess((Boolean) responseBody.get("success"));
                
                // 수정된 커리큘럼을 데이터베이스의 cur_text 필드에 저장
                if (aiCurriculumResponse.isSuccess() && aiCurriculumResponse.getCurriculum() != null) {
                    studyProject.setCurText(aiCurriculumResponse.getCurriculum());
                    studyProjectRepository.save(studyProject);
                    
                    logger.info("Updated curriculum saved to cur_text field for study project: {} (ID: {})", 
                        studyProject.getStudyProjectName(), studyProjectId);
                }
                
                logger.info("Curriculum updated successfully for study project ID: {}", studyProjectId);
                return aiCurriculumResponse;
            } else {
                logger.error("Failed to update curriculum. Response status: {}", response.getStatusCode());
                throw new RuntimeException("커리큘럼 수정에 실패했습니다.");
            }
            
        } catch (Exception e) {
            logger.error("Error updating curriculum for study project ID: {}", studyProjectId, e);
            throw new RuntimeException("커리큘럼 수정 중 오류가 발생했습니다: " + e.getMessage());
        }
    }
}
