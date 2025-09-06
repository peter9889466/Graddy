package com.smhrd.graddy.assignment.service;

import com.smhrd.graddy.assignment.dto.AiAssignmentRequest;
import com.smhrd.graddy.assignment.dto.AiAssignmentResponse;
import com.smhrd.graddy.assignment.entity.Assignment;
import com.smhrd.graddy.assignment.repository.AssignmentRepository;
import com.smhrd.graddy.member.service.MemberService;
import com.smhrd.graddy.study.entity.StudyProject;
import com.smhrd.graddy.study.repository.StudyProjectRepository;
import com.smhrd.graddy.interest.entity.Interest;
import com.smhrd.graddy.interest.repository.InterestRepository;
import com.smhrd.graddy.tag.entity.Tag;
import com.smhrd.graddy.tag.repository.TagRepository;
import com.smhrd.graddy.schedule.service.ScheduleService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.type.TypeReference;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class AiAssignmentService {

    private final AssignmentRepository assignmentRepository;
    private final StudyProjectRepository studyProjectRepository;
    private final TagRepository tagRepository;
    private final InterestRepository interestRepository;
    private final MemberService memberService;
    private final ScheduleService scheduleService;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${openai.api.key:}")
    private String openaiApiKey;

    @Value("${openai.api.url:https://api.openai.com/v1/chat/completions}")
    private String openaiApiUrl;

    @Value("${openai.model:gpt-4o}")
    private String openaiModel;

    // 초기화 시 API 설정 로깅
    @PostConstruct
    public void logApiSettings() {
        log.info("OpenAI API 설정 확인:");
        log.info("- API URL: {}", openaiApiUrl);
        log.info("- Model: {}", openaiModel);
        log.info("- API Key 설정됨: {}", (openaiApiKey != null && !openaiApiKey.trim().isEmpty()));
        if (openaiApiKey != null && !openaiApiKey.trim().isEmpty()) {
            log.info("- API Key 길이: {}", openaiApiKey.length());
        }
    }

    /**
     * AI 과제 생성
     */
    @Transactional
    public AiAssignmentResponse generateAiAssignment(AiAssignmentRequest request, String userId) {
        log.info("AI 과제 생성 시작: studyProjectId={}, assignmentType={}, userId={}",
                request.getStudyProjectId(), request.getAssignmentType(), userId);

        // 1. 권한 체크: 해당 스터디의 리더인지 확인
        if (!memberService.isLeader(request.getStudyProjectId(), userId)) {
            throw new IllegalArgumentException("AI 과제 생성은 스터디/프로젝트 리더만 가능합니다.");
        }

        // 2. 스터디 정보 조회
        StudyProject studyProject = studyProjectRepository.findById(request.getStudyProjectId())
                .orElseThrow(() -> new IllegalArgumentException("스터디 프로젝트를 찾을 수 없습니다: " + request.getStudyProjectId()));

        // 3. 스터디의 태그 정보 조회
        List<String> tagNames = getStudyProjectTags(request.getStudyProjectId());

        // 4. AI 과제 생성
        Map<String, Object> aiAssignmentData = generateAiAssignmentWithOpenAI(
                studyProject, tagNames, request.getAssignmentType());

        // 5. 과제를 assignments 테이블에 저장
        Assignment savedAssignment = saveAiAssignmentToDatabase(request, userId, aiAssignmentData);

        // 6. 과제 제출일에 맞춰 자동으로 일정 추가
        try {
            scheduleService.createAssignmentSchedule(
                    userId,
                    request.getStudyProjectId(),
                    savedAssignment.getTitle(),
                    savedAssignment.getDeadline().toLocalDateTime());
            log.info("AI 과제 제출일 일정 자동 생성 완료: assignmentId={}", savedAssignment.getAssignmentId());
        } catch (Exception e) {
            log.warn("AI 과제 제출일 일정 자동 생성 실패: assignmentId={}", savedAssignment.getAssignmentId(), e);
        }

        // 7. 응답 생성
        return convertToAiAssignmentResponse(savedAssignment, aiAssignmentData);
    }

    /**
     * 스터디 프로젝트의 태그 정보 조회
     */
    private List<String> getStudyProjectTags(Long studyProjectId) {
        List<Tag> tags = tagRepository.findByStudyProjectId(studyProjectId);
        List<String> tagNames = new ArrayList<>();

        for (Tag tag : tags) {
            Interest interest = interestRepository.findById(tag.getInterestId()).orElse(null);
            if (interest != null) {
                tagNames.add(interest.getInterestName());
            }
        }

        return tagNames;
    }

    /**
     * OpenAI API를 사용하여 AI 과제 생성
     */
    private Map<String, Object> generateAiAssignmentWithOpenAI(StudyProject studyProject,
            List<String> tagNames,
            String assignmentType) {
        try {
            // OpenAI API 키 확인
            if (openaiApiKey == null || openaiApiKey.trim().isEmpty()) {
                log.warn("OpenAI API 키가 설정되지 않았습니다. 기본 과제 데이터를 생성합니다.");
                log.warn("환경변수 OPENAI_API_KEY를 확인해주세요.");
                return createDefaultAssignmentData(studyProject, tagNames, assignmentType);
            }

            log.info("OpenAI API 키 확인됨: {}", openaiApiKey.substring(0, Math.min(10, openaiApiKey.length())) + "...");

            log.info("OpenAI API 호출 시작 - 스터디: {}, 태그: {}, 유형: {}",
                    studyProject.getStudyProjectName(), tagNames, assignmentType);

            // OpenAI API 요청 데이터 구성
            Map<String, Object> requestBody = createOpenAIRequest(studyProject, tagNames, assignmentType);
            log.info("OpenAI API 요청 데이터: {}", requestBody);

            // HTTP 헤더 설정
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(openaiApiKey);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            // OpenAI API 호출
            ResponseEntity<Map> response = restTemplate.postForEntity(openaiApiUrl, entity, Map.class);
            log.info("OpenAI API 응답 상태: {}", response.getStatusCode());
            log.info("OpenAI API 응답 본문: {}", response.getBody());

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Map<String, Object> result = parseOpenAIResponse(response.getBody());
                log.info("OpenAI API 파싱 결과: {}", result);
                return result;
            } else {
                log.warn("OpenAI API 응답이 올바르지 않습니다: {}", response.getStatusCode());
                return createDefaultAssignmentData(studyProject, tagNames, assignmentType);
            }

        } catch (Exception e) {
            log.error("OpenAI API 호출 중 오류 발생: {}", e.getMessage(), e);
            log.error("오류 상세 정보: ", e);
            log.error("기본 과제 데이터를 생성합니다. OpenAI API 설정을 확인해주세요.");
            return createDefaultAssignmentData(studyProject, tagNames, assignmentType);
        }
    }

    /**
     * OpenAI API 요청 데이터 생성
     */
    private Map<String, Object> createOpenAIRequest(StudyProject studyProject,
            List<String> tagNames,
            String assignmentType) {
        // 레벨에 따른 난이도 설명
        Map<Integer, String> levelDescriptions = Map.of(
                1, "초급자 수준 (기초 개념 이해 및 간단한 실습)",
                2, "중급자 수준 (기본 실습 및 응용 문제)",
                3, "고급자 수준 (심화 학습 및 프로젝트 기반)");

        String levelDesc = levelDescriptions.getOrDefault(studyProject.getStudyLevel(), "기본 수준");

        // 과제 유형별 설명
        Map<String, String> assignmentTypeDescriptions = Map.of(
                "과제", "실제로 풀 수 있는 구체적인 문제",
                "퀴즈", "실습 가능한 퀴즈 문제",
                "프로젝트", "구체적인 프로젝트 과제",
                "복습", "실습 기반 복습 문제");

        String typeDesc = assignmentTypeDescriptions.getOrDefault(assignmentType, "실제로 풀 수 있는 구체적인 문제");

        // 프롬프트 구성 - 실질적인 문제 생성에 초점
        String prompt = String.format("""
                다음 정보를 바탕으로 %s 스터디를 위한 %s를 생성해주세요.

                **중요: 추상적인 과제가 아닌 실제로 풀 수 있는 구체적인 문제를 만들어주세요!**

                **스터디 정보:**
                - 스터디명: %s
                - 제목: %s
                - 설명: %s
                - 수준: %s (레벨 %d)
                - 관심 분야: %s
                - 커리큘럼: %s

                **과제 요구사항 (실질적인 문제 중심):**
                1. 레벨 %d에 맞는 적절한 난이도로 구성
                2. %s 분야의 핵심 개념을 포함한 실제 문제
                3. **구체적인 코드 작성이나 실습이 가능한 문제**
                4. **명확한 입력값과 예상 출력값 제시**
                5. **실제로 실행해볼 수 있는 예제 포함**
                6. **단계별 해결 과정이 명확한 문제**

                **출력 형식 (JSON):**
                {
                    "title": "구체적인 문제 제목 (100자 이내)",
                    "description": "실제로 풀 수 있는 구체적인 문제 설명. 코드 예제, 입력값, 예상 출력값을 포함하여 구체적으로 작성",
                    "problem_statement": "실제 문제 상황과 해결해야 할 구체적인 요구사항",
                    "input_example": "입력 예시 (구체적인 값)",
                    "expected_output": "예상 출력 결과 (구체적인 값)",
                    "sample_code": "기본 코드 구조나 시작점 (선택사항)",
                    "learning_objectives": ["구체적인 학습 목표 1", "학습 목표 2", "학습 목표 3"],
                    "requirements": ["구체적인 요구사항 1", "요구사항 2", "요구사항 3"],
                    "submission_format": "제출 형식 (코드 파일, 실행 결과 등)",
                    "evaluation_criteria": ["평가 기준 1", "평가 기준 2", "평가 기준 3"],
                    "difficulty_level": "난이도 설명",
                    "additional_resources": ["추가 자료 1", "추가 자료 2"]
                }

                **예시:**
                - Python: "리스트에서 중복 제거하는 함수 작성" (구체적인 입력/출력 예시 포함)
                - JavaScript: "배열 정렬 알고리즘 구현" (실제 배열 예시와 정렬 결과 포함)
                - HTML/CSS: "반응형 네비게이션 바 만들기" (구체적인 디자인 요구사항 포함)

                한국어로 작성하고, JSON 형식을 정확히 지켜주세요. title은 100자 이내로 작성해주세요.
                """,
                studyProject.getStudyProjectName(), typeDesc,
                studyProject.getStudyProjectName(),
                studyProject.getStudyProjectTitle(),
                studyProject.getStudyProjectDesc(),
                levelDesc, studyProject.getStudyLevel(),
                String.join(", ", tagNames),
                studyProject.getCurText() != null ? studyProject.getCurText() : "커리큘럼 정보 없음",
                studyProject.getStudyLevel(),
                String.join(", ", tagNames));

        // OpenAI API 요청 구조
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", openaiModel);
        requestBody.put("max_tokens", 2500); // 더 상세한 문제 생성을 위해 토큰 수 증가
        requestBody.put("temperature", 0.8); // 창의성 증가

        List<Map<String, String>> messages = new ArrayList<>();
        messages.add(Map.of("role", "system", "content",
                "당신은 교육 전문가이자 실습 문제 설계 전문가입니다. 추상적인 과제가 아닌 실제로 풀 수 있는 구체적이고 실용적인 문제를 만드는 것이 특기입니다. 항상 구체적인 입력값, 예상 출력값, 실행 가능한 예제를 포함하여 문제를 설계해주세요."));
        messages.add(Map.of("role", "user", "content", prompt));

        requestBody.put("messages", messages);

        return requestBody;
    }

    /**
     * OpenAI API 응답 파싱
     */
    private Map<String, Object> parseOpenAIResponse(Map responseBody) {
        try {
            if (responseBody.containsKey("choices") && responseBody.get("choices") instanceof List) {
                List<Map> choices = (List<Map>) responseBody.get("choices");
                if (!choices.isEmpty() && choices.get(0).containsKey("message")) {
                    Map message = (Map) choices.get(0).get("message");
                    if (message.containsKey("content")) {
                        String content = (String) message.get("content");
                        log.info("OpenAI 응답 내용: {}", content);

                        // JSON 파싱 시도
                        try {
                            log.info("OpenAI 응답 JSON 파싱 시작...");
                            // Jackson ObjectMapper를 사용한 JSON 파싱
                            Map<String, Object> result = parseJsonContentWithJackson(content);
                            log.info("OpenAI 응답 JSON 파싱 성공: title={}", result.get("title"));
                            return result;
                        } catch (Exception e) {
                            log.warn("Jackson JSON 파싱 실패: {}", e.getMessage());
                            log.warn("응답 내용: {}", content);
                            try {
                                log.info("간단한 JSON 파싱 시도...");
                                Map<String, Object> result = parseJsonContent(content);
                                log.info("간단한 JSON 파싱 성공: title={}", result.get("title"));
                                return result;
                            } catch (Exception e2) {
                                log.warn("간단한 JSON 파싱도 실패: {}", e2.getMessage());
                                log.warn("기본 형식으로 반환합니다.");
                                return createDefaultAssignmentDataFromContent(content);
                            }
                        }
                    }
                }
            }
        } catch (Exception e) {
            log.error("OpenAI 응답 파싱 중 오류: {}", e.getMessage(), e);
        }

        return createDefaultAssignmentData(null, null, "과제");
    }

    /**
     * Jackson ObjectMapper를 사용한 JSON 파싱
     */
    private Map<String, Object> parseJsonContentWithJackson(String content) {
        try {
            // JSON 문자열을 Map으로 변환
            TypeReference<Map<String, Object>> typeRef = new TypeReference<Map<String, Object>>() {
            };
            Map<String, Object> result = objectMapper.readValue(content, typeRef);

            // 필수 필드 검증 및 기본값 설정
            log.info("파싱된 JSON 필드들: {}", result.keySet());

            if (!result.containsKey("title") || result.get("title") == null ||
                    ((String) result.get("title")).trim().isEmpty()) {
                log.warn("title 필드가 없거나 비어있음, 기본값 설정");
                result.put("title", "AI 생성 구체적 문제");
            }
            if (!result.containsKey("description") || result.get("description") == null ||
                    ((String) result.get("description")).trim().isEmpty()) {
                log.warn("description 필드가 없거나 비어있음, 기본값 설정");
                result.put("description", "AI가 생성한 구체적인 실습 문제입니다.");
            }
            if (!result.containsKey("problem_statement") || result.get("problem_statement") == null ||
                    ((String) result.get("problem_statement")).trim().isEmpty()) {
                log.warn("problem_statement 필드가 없거나 비어있음, 기본값 설정");
                result.put("problem_statement", "구체적인 문제 상황과 해결 요구사항");
            }
            if (!result.containsKey("input_example") || result.get("input_example") == null ||
                    ((String) result.get("input_example")).trim().isEmpty()) {
                log.warn("input_example 필드가 없거나 비어있음, 기본값 설정");
                result.put("input_example", "구체적인 입력 예시");
            }
            if (!result.containsKey("expected_output") || result.get("expected_output") == null ||
                    ((String) result.get("expected_output")).trim().isEmpty()) {
                log.warn("expected_output 필드가 없거나 비어있음, 기본값 설정");
                result.put("expected_output", "예상 출력 결과");
            }
            if (!result.containsKey("sample_code") || result.get("sample_code") == null ||
                    ((String) result.get("sample_code")).trim().isEmpty()) {
                log.warn("sample_code 필드가 없거나 비어있음, 기본값 설정");
                result.put("sample_code", "기본 코드 구조");
            }
            if (!result.containsKey("learning_objectives") || result.get("learning_objectives") == null) {
                log.warn("learning_objectives 필드가 없거나 비어있음, 기본값 설정");
                result.put("learning_objectives", Arrays.asList("구체적인 학습 목표"));
            }
            if (!result.containsKey("requirements") || result.get("requirements") == null) {
                log.warn("requirements 필드가 없거나 비어있음, 기본값 설정");
                result.put("requirements", Arrays.asList("구체적인 요구사항"));
            }
            if (!result.containsKey("submission_format") || result.get("submission_format") == null ||
                    ((String) result.get("submission_format")).trim().isEmpty()) {
                log.warn("submission_format 필드가 없거나 비어있음, 기본값 설정");
                result.put("submission_format", "코드 파일 및 실행 결과");
            }
            if (!result.containsKey("evaluation_criteria") || result.get("evaluation_criteria") == null) {
                log.warn("evaluation_criteria 필드가 없거나 비어있음, 기본값 설정");
                result.put("evaluation_criteria", Arrays.asList("코드 정확성", "실행 결과"));
            }
            if (!result.containsKey("difficulty_level") || result.get("difficulty_level") == null ||
                    ((String) result.get("difficulty_level")).trim().isEmpty()) {
                log.warn("difficulty_level 필드가 없거나 비어있음, 기본값 설정");
                result.put("difficulty_level", "AI 생성 난이도");
            }
            if (!result.containsKey("additional_resources") || result.get("additional_resources") == null) {
                log.warn("additional_resources 필드가 없거나 비어있음, 기본값 설정");
                result.put("additional_resources", Arrays.asList("AI가 제안한 자료"));
            }

            log.info("Jackson JSON 파싱 성공: {}", result.get("title"));
            return result;

        } catch (Exception e) {
            log.error("Jackson JSON 파싱 실패: {}", e.getMessage(), e);
            throw new RuntimeException("JSON 파싱 실패", e);
        }
    }

    /**
     * JSON 내용 파싱 (간단한 구현)
     */
    private Map<String, Object> parseJsonContent(String content) {
        Map<String, Object> result = new HashMap<>();

        // 간단한 파싱 로직
        if (content.contains("\"title\"")) {
            result.put("title", extractJsonValue(content, "title"));
            result.put("description", extractJsonValue(content, "description"));
            result.put("problem_statement", extractJsonValue(content, "problem_statement"));
            result.put("input_example", extractJsonValue(content, "input_example"));
            result.put("expected_output", extractJsonValue(content, "expected_output"));
            result.put("sample_code", extractJsonValue(content, "sample_code"));
            result.put("learning_objectives", Arrays.asList("구체적인 학습 목표"));
            result.put("requirements", Arrays.asList("구체적인 요구사항"));
            result.put("submission_format", "코드 파일 및 실행 결과");
            result.put("evaluation_criteria", Arrays.asList("코드 정확성", "실행 결과"));
            result.put("difficulty_level", "AI 생성 난이도");
            result.put("additional_resources", Arrays.asList("AI가 제안한 자료"));
        } else {
            result.put("title", "AI 생성 구체적 문제");
            result.put("description", content);
            result.put("problem_statement", "구체적인 문제 상황과 해결 요구사항");
            result.put("input_example", "구체적인 입력 예시");
            result.put("expected_output", "예상 출력 결과");
            result.put("sample_code", "기본 코드 구조");
            result.put("learning_objectives", Arrays.asList("구체적인 학습 목표"));
            result.put("requirements", Arrays.asList("구체적인 요구사항"));
            result.put("submission_format", "코드 파일 및 실행 결과");
            result.put("evaluation_criteria", Arrays.asList("코드 정확성", "실행 결과"));
            result.put("difficulty_level", "AI 생성");
            result.put("additional_resources", Arrays.asList());
        }

        return result;
    }

    /**
     * JSON 값 추출 (간단한 구현)
     */
    private String extractJsonValue(String content, String key) {
        try {
            int startIndex = content.indexOf("\"" + key + "\"");
            if (startIndex != -1) {
                startIndex = content.indexOf(":", startIndex);
                if (startIndex != -1) {
                    startIndex = content.indexOf("\"", startIndex + 1);
                    if (startIndex != -1) {
                        int endIndex = content.indexOf("\"", startIndex + 1);
                        if (endIndex != -1) {
                            return content.substring(startIndex + 1, endIndex);
                        }
                    }
                }
            }
        } catch (Exception e) {
            log.warn("JSON 값 추출 실패: {}", e.getMessage());
        }
        return "AI 생성 " + key;
    }

    /**
     * 기본 과제 데이터 생성
     */
    private Map<String, Object> createDefaultAssignmentData(StudyProject studyProject,
            List<String> tagNames,
            String assignmentType) {
        Map<String, Object> data = new HashMap<>();

        // 스터디 정보 기반으로 의미있는 기본 과제 생성
        String studyName = studyProject != null ? studyProject.getStudyProjectName() : "스터디";
        String tagInfo = tagNames != null && !tagNames.isEmpty() ? String.join(", ", tagNames) : "프로그래밍";

        data.put("title", studyName + " " + assignmentType + " - " + tagInfo + " 기초 실습");
        data.put("description",
                "**" + studyName + " " + assignmentType + "**\n\n" +
                        "**학습 목표:**\n" +
                        "• " + tagInfo + "의 기본 개념 이해\n" +
                        "• 실습을 통한 프로그래밍 능력 향상\n" +
                        "• 문제 해결 능력 개발\n\n" +
                        "**과제 내용:**\n" +
                        "1. " + tagInfo + " 기본 문법을 사용한 간단한 프로그램 작성\n" +
                        "2. 변수, 함수, 조건문, 반복문 활용\n" +
                        "3. 사용자 입력을 받아 처리하는 프로그램 구현\n\n" +
                        "**요구사항:**\n" +
                        "• 코드에 주석을 포함하여 작성\n" +
                        "• 실행 결과를 스크린샷으로 제출\n" +
                        "• 에러가 발생하지 않도록 구현\n\n" +
                        "**제출 형식:**\n" +
                        "• 소스 코드 파일 (.java, .py, .js 등)\n" +
                        "• 실행 결과 스크린샷\n" +
                        "• 간단한 설명 문서");
        data.put("problem_statement", tagInfo + "을 사용하여 기본적인 프로그램을 작성해보세요.");
        data.put("input_example", "사용자로부터 입력을 받는 예시");
        data.put("expected_output", "프로그램 실행 결과 예시");
        data.put("sample_code",
                "// 기본 코드 구조\npublic class Main {\n    public static void main(String[] args) {\n        // 여기에 코드를 작성하세요\n    }\n}");
        data.put("learning_objectives", Arrays.asList(
                tagInfo + " 기본 문법 이해",
                "프로그래밍 문제 해결 능력 향상",
                "코드 작성 및 디버깅 능력 개발"));
        data.put("requirements", Arrays.asList(
                "기본 문법을 사용한 프로그램 작성",
                "사용자 입력 처리",
                "에러 없는 실행"));
        data.put("submission_format", "소스 코드 파일 및 실행 결과");
        data.put("evaluation_criteria", Arrays.asList(
                "코드 정확성",
                "실행 결과",
                "주석 및 문서화"));
        data.put("difficulty_level", "초급");
        data.put("additional_resources", Arrays.asList(
                tagInfo + " 공식 문서",
                "프로그래밍 기초 튜토리얼"));

        return data;
    }

    /**
     * 내용에서 기본 과제 데이터 생성
     */
    private Map<String, Object> createDefaultAssignmentDataFromContent(String content) {
        Map<String, Object> data = new HashMap<>();
        data.put("title", "AI 생성 구체적 문제");
        data.put("description", content);
        data.put("problem_statement", "구체적인 문제 상황과 해결 요구사항");
        data.put("input_example", "구체적인 입력 예시");
        data.put("expected_output", "예상 출력 결과");
        data.put("sample_code", "기본 코드 구조");
        data.put("learning_objectives", Arrays.asList("구체적인 학습 목표"));
        data.put("requirements", Arrays.asList("구체적인 요구사항"));
        data.put("submission_format", "코드 파일 및 실행 결과");
        data.put("evaluation_criteria", Arrays.asList("코드 정확성", "실행 결과"));
        data.put("difficulty_level", "AI 생성");
        data.put("additional_resources", Arrays.asList());

        return data;
    }

    /**
     * AI 과제를 assignments 테이블에 저장
     */
    private Assignment saveAiAssignmentToDatabase(AiAssignmentRequest request,
            String userId,
            Map<String, Object> aiAssignmentData) {
        // 사용자의 member_id 조회
        Long memberId = memberService.getMemberIdByUserIdAndStudyProjectId(userId, request.getStudyProjectId());
        if (memberId == null) {
            throw new IllegalArgumentException("해당 스터디/프로젝트의 멤버가 아닙니다.");
        }

        // 마감일이 설정되지 않은 경우 기본값으로 생성일로부터 7일 뒤로 설정
        LocalDateTime deadline = request.getDeadline();
        if (deadline == null) {
            deadline = LocalDateTime.now().plusDays(7);
        }

        // AI가 생성한 모든 데이터를 하나의 통합된 description으로 생성
        String integratedDescription = createIntegratedDescription(aiAssignmentData);

        // 과제 엔티티 생성 (assignments 테이블에 저장)
        Assignment assignment = new Assignment();
        assignment.setStudyProjectId(request.getStudyProjectId());
        assignment.setMemberId(memberId);
        assignment.setTitle((String) aiAssignmentData.get("title"));
        assignment.setDescription(integratedDescription); // 통합된 description 사용
        assignment.setDeadline(Timestamp.valueOf(deadline)); // LocalDateTime을 Timestamp로 변환
        assignment.setFileUrl(null); // file_url은 실제 파일이 있을 때만 설정

        // 과제 저장
        Assignment savedAssignment = assignmentRepository.save(assignment);
        log.info("AI 과제를 assignments 테이블에 저장 완료: assignmentId={}", savedAssignment.getAssignmentId());

        return savedAssignment;
    }

    /**
     * AI가 생성한 모든 데이터를 하나의 통합된 description으로 생성
     */
    private String createIntegratedDescription(Map<String, Object> aiAssignmentData) {
        StringBuilder description = new StringBuilder();

        // 기본 description 추가
        if (aiAssignmentData.containsKey("description") && aiAssignmentData.get("description") != null) {
            description.append(aiAssignmentData.get("description")).append("\n\n");
        }

        // problem_statement 추가
        if (aiAssignmentData.containsKey("problem_statement") && aiAssignmentData.get("problem_statement") != null) {
            description.append("**문제 상황:**\n").append(aiAssignmentData.get("problem_statement")).append("\n\n");
        }

        // input_example 추가
        if (aiAssignmentData.containsKey("input_example") && aiAssignmentData.get("input_example") != null) {
            description.append("**입력 예시:**\n").append(aiAssignmentData.get("input_example")).append("\n\n");
        }

        // expected_output 추가
        if (aiAssignmentData.containsKey("expected_output") && aiAssignmentData.get("expected_output") != null) {
            description.append("**예상 출력:**\n").append(aiAssignmentData.get("expected_output")).append("\n\n");
        }

        // sample_code 추가
        if (aiAssignmentData.containsKey("sample_code") && aiAssignmentData.get("sample_code") != null &&
                !((String) aiAssignmentData.get("sample_code")).trim().isEmpty()) {
            description.append("**기본 코드 구조:**\n```\n").append(aiAssignmentData.get("sample_code")).append("\n```\n\n");
        }

        // learning_objectives 추가
        if (aiAssignmentData.containsKey("learning_objectives")
                && aiAssignmentData.get("learning_objectives") != null) {
            List<?> objectives = (List<?>) aiAssignmentData.get("learning_objectives");
            if (!objectives.isEmpty()) {
                description.append("**학습 목표:**\n");
                for (Object obj : objectives) {
                    description.append("• ").append(obj.toString()).append("\n");
                }
                description.append("\n");
            }
        }

        // requirements 추가
        if (aiAssignmentData.containsKey("requirements") && aiAssignmentData.get("requirements") != null) {
            List<?> requirements = (List<?>) aiAssignmentData.get("requirements");
            if (!requirements.isEmpty()) {
                description.append("**요구사항:**\n");
                for (Object obj : requirements) {
                    description.append("• ").append(obj.toString()).append("\n");
                }
                description.append("\n");
            }
        }

        // submission_format 추가
        if (aiAssignmentData.containsKey("submission_format") && aiAssignmentData.get("submission_format") != null) {
            description.append("**제출 형식:**\n").append(aiAssignmentData.get("submission_format")).append("\n\n");
        }

        // evaluation_criteria 추가
        if (aiAssignmentData.containsKey("evaluation_criteria")
                && aiAssignmentData.get("evaluation_criteria") != null) {
            List<?> criteria = (List<?>) aiAssignmentData.get("evaluation_criteria");
            if (!criteria.isEmpty()) {
                description.append("**평가 기준:**\n");
                for (Object obj : criteria) {
                    description.append("• ").append(obj.toString()).append("\n");
                }
                description.append("\n");
            }
        }

        // difficulty_level 추가
        if (aiAssignmentData.containsKey("difficulty_level") && aiAssignmentData.get("difficulty_level") != null) {
            description.append("**난이도:**\n").append(aiAssignmentData.get("difficulty_level")).append("\n\n");
        }

        // additional_resources 추가
        if (aiAssignmentData.containsKey("additional_resources")
                && aiAssignmentData.get("additional_resources") != null) {
            List<?> resources = (List<?>) aiAssignmentData.get("additional_resources");
            if (!resources.isEmpty()) {
                description.append("**추가 자료:**\n");
                for (Object obj : resources) {
                    description.append("• ").append(obj.toString()).append("\n");
                }
                description.append("\n");
            }
        }

        return description.toString().trim();
    }

    /**
     * AI 과제 응답으로 변환
     */
    private AiAssignmentResponse convertToAiAssignmentResponse(Assignment assignment,
            Map<String, Object> aiAssignmentData) {
        return AiAssignmentResponse.builder()
                .assignmentId(assignment.getAssignmentId())
                .studyProjectId(assignment.getStudyProjectId())
                .memberId(assignment.getMemberId())
                .title(assignment.getTitle())
                .description(assignment.getDescription()) // 통합된 description만 포함
                .deadline(assignment.getDeadline())
                .fileUrl(assignment.getFileUrl())
                .createdAt(assignment.getCreatedAt())
                .build(); // aiGeneratedData 제거
    }
}
