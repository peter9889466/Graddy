package com.smhrd.graddy.study.controller;

import com.smhrd.graddy.study.dto.StudyRequest;
import com.smhrd.graddy.study.dto.StudyResponse;
import com.smhrd.graddy.study.dto.StudyUpdateRequest;
import com.smhrd.graddy.study.service.StudyService;
import com.smhrd.graddy.api.dto.ApiResponse;
import com.smhrd.graddy.security.jwt.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;

import java.net.URI;
import java.util.List;
import com.smhrd.graddy.member.service.MemberService;
import com.smhrd.graddy.study.service.StudyApplicationService;

import java.util.Map;
import com.smhrd.graddy.study.dto.AICurriculumResponse;
import com.smhrd.graddy.study.service.AICurriculumService;

/**
 * 스터디/프로젝트 관리 API 컨트롤러
 * 스터디와 프로젝트의 생성, 조회, 수정, 삭제 및 태그 관리 기능을 제공합니다.
 */
@RestController
@RequestMapping("/studies-projects")
@RequiredArgsConstructor
@Tag(name = "스터디/프로젝트 관리", description = "스터디와 프로젝트 생성, 조회, 수정, 삭제 및 태그 관리 API")
public class StudyController {

    private final StudyService studyService;
    private final JwtUtil jwtUtil;
    private final MemberService memberService;
    private final StudyApplicationService studyApplicationService;
    private final AICurriculumService aiCurriculumService;

    /**
     * 스터디/프로젝트 생성
     * 새로운 스터디 또는 프로젝트를 생성하고 태그 정보와 선호 요일과 함께 데이터베이스에 저장합니다.
     * JWT 토큰에서 user_id를 자동으로 추출하여 설정합니다.
     * 
     * @param request       스터디/프로젝트 생성에 필요한 정보 (user_id 제외)
     * @param authorization JWT 토큰 (Bearer 형식)
     * @return 생성된 스터디/프로젝트 정보 (태그, 선호 요일 포함)
     */
    @PostMapping
    @Operation(summary = "스터디/프로젝트 생성", description = "새로운 스터디 또는 프로젝트를 생성하고 태그 정보와 선호 요일과 함께 데이터베이스에 저장합니다. JWT 토큰에서 user_id를 자동으로 추출합니다.\n\n"
            +
            "**사용법:**\n" +
            "1. Authorization 헤더에 JWT 토큰 입력 (Bearer 형식)\n" +
            "2. Request Body에 생성할 정보 입력\n" +
            "3. user_id는 자동으로 JWT 토큰에서 추출됨")
    @SecurityRequirement(name = "Bearer Authentication")
    public ResponseEntity<ApiResponse<StudyResponse>> createStudyProject(
            @RequestBody StudyRequest request,
            @Parameter(description = "JWT 토큰 (Bearer 형식)", example = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...", required = true) @RequestHeader(name = "Authorization", required = true) String authorization) {
        try {
            // JWT 토큰에서 user_id 추출
            String token = authorization.replace("Bearer ", "");
            String userId = jwtUtil.extractUserId(token);

            // StudyRequest에 user_id 설정
            request.setUserId(userId);

            StudyResponse response = studyService.createStudy(request);
            URI location = URI.create("/api/studies-projects/" + response.getStudyProjectId());
            return ApiResponse.created(location, "스터디/프로젝트가 성공적으로 생성되었습니다.", response);
        } catch (IllegalArgumentException e) {
            return ApiResponse.error(HttpStatus.BAD_REQUEST, "스터디/프로젝트 생성에 실패했습니다.", null);
        } catch (Exception e) {
            return ApiResponse.error(HttpStatus.UNAUTHORIZED, "JWT 토큰이 유효하지 않습니다.", null);
        }
    }

    /**
     * 스터디/프로젝트 조회
     * 특정 스터디/프로젝트 ID로 정보와 태그, 선호 요일을 조회합니다.
     * 
     * @param studyProjectId 조회할 스터디/프로젝트의 ID
     * @return 스터디/프로젝트 정보 (태그, 선호 요일 포함)
     */
    @GetMapping("/{studyProjectId}")
    @Operation(summary = "스터디/프로젝트 조회", description = "특정 스터디/프로젝트 ID로 정보와 태그, 선호 요일을 조회합니다.")
    public ResponseEntity<ApiResponse<StudyResponse>> getStudyProject(@PathVariable Long studyProjectId) {
        try {
            StudyResponse response = studyService.getStudy(studyProjectId);
            return ApiResponse.success("스터디/프로젝트 조회가 성공했습니다.", response);
        } catch (IllegalArgumentException e) {
            return ApiResponse.error(HttpStatus.NOT_FOUND, "스터디/프로젝트를 찾을 수 없습니다.", null);
        }
    }

    /**
     * 모든 스터디/프로젝트 목록 조회
     * 전체 스터디/프로젝트 목록을 생성일 기준 내림차순으로 조회합니다.
     * 
     * @return 전체 스터디/프로젝트 목록 (태그, 선호 요일 포함)
     */
    @GetMapping
    @Operation(summary = "전체 스터디/프로젝트 목록", description = "전체 스터디/프로젝트 목록을 생성일 기준 내림차순으로 조회합니다.")
    public ResponseEntity<ApiResponse<List<StudyResponse>>> getAllStudyProjects() {
        List<StudyResponse> studyProjects = studyService.getAllStudies();
        return ApiResponse.success("전체 스터디/프로젝트 목록 조회가 성공했습니다.", studyProjects);
    }

    /**
     * 모집중인 스터디/프로젝트 목록 조회
     * 현재 모집 중인 스터디/프로젝트만 조회합니다.
     * 
     * @return 모집중인 스터디/프로젝트 목록 (태그, 선호 요일 포함)
     */
    // @GetMapping("/recruiting")
    // @Operation(summary = "모집중인 스터디/프로젝트 목록", description = "현재 모집 중인 스터디/프로젝트만
    // 조회합니다.")
    // public ResponseEntity<ApiResponse<List<StudyResponse>>>
    // getRecruitingStudyProjects() {
    // List<StudyResponse> studyProjects = studyService.getRecruitingStudies();
    // return ApiResponse.success("모집중인 스터디/프로젝트 목록 조회가 성공했습니다.", studyProjects);
    // }

    /**
     * 사용자가 리더인 스터디/프로젝트 목록 조회
     * 특정 사용자가 리더인 스터디/프로젝트 목록을 조회합니다.
     * 
     * @param userId 리더 ID
     * @return 해당 사용자가 리더인 스터디/프로젝트 목록 (태그, 선호 요일 포함)
     */
    // @GetMapping("/leader/{userId}")
    // @Operation(summary = "리더별 스터디/프로젝트 목록", description = "특정 사용자가 리더인 스터디/프로젝트
    // 목록을 조회합니다.")
    // public ResponseEntity<ApiResponse<List<StudyResponse>>>
    // getStudyProjectsByLeader(@PathVariable String userId) {
    // List<StudyResponse> studyProjects = studyService.getStudiesByLeader(userId);
    // return ApiResponse.success("리더별 스터디/프로젝트 목록 조회가 성공했습니다.", studyProjects);
    // }

    /**
     * 스터디/프로젝트 검색
     * 제목, 스터디/프로젝트명, 설명, 작성자, 태그로 검색합니다.
     * 
     * @param keyword 검색할 키워드
     * @return 검색된 스터디/프로젝트 목록 (태그, 선호 요일 포함)
     */
    // @GetMapping("/search")
    // @Operation(summary = "스터디/프로젝트 검색", description = "제목, 스터디/프로젝트명, 설명, 작성자,
    // 태그로 검색합니다.")
    // public ResponseEntity<ApiResponse<List<StudyResponse>>>
    // searchStudyProjects(@RequestParam(required = false) String keyword) {
    // List<StudyResponse> studyProjects = studyService.searchStudies(keyword);
    // return ApiResponse.success("스터디/프로젝트 검색이 성공했습니다.", studyProjects);
    // }

    /**
     * 레벨별 스터디/프로젝트 목록 조회
     * 특정 레벨의 스터디/프로젝트 목록을 조회합니다.
     * 
     * @param level 조회할 스터디/프로젝트 레벨
     * @return 해당 레벨의 스터디/프로젝트 목록 (태그, 선호 요일 포함)
     */
    // @GetMapping("/level/{level}")
    // @Operation(summary = "레벨별 스터디/프로젝트 목록", description = "특정 레벨의 스터디/프로젝트 목록을
    // 조회합니다.")
    // public ResponseEntity<ApiResponse<List<StudyResponse>>>
    // getStudyProjectsByLevel(@PathVariable Integer level) {
    // List<StudyResponse> studyProjects = studyService.getStudiesByLevel(level);
    // return ApiResponse.success("레벨별 스터디/프로젝트 목록 조회가 성공했습니다.", studyProjects);
    // }

    /**
     * 스터디/프로젝트 수정
     * 기존 스터디/프로젝트 정보를 수정하고 태그 정보와 선호 요일도 함께 업데이트합니다.
     * JWT 토큰에서 user_id를 추출하여 권한을 확인합니다.
     * 
     * @param studyProjectId 수정할 스터디/프로젝트의 ID
     * @param request        수정할 스터디/프로젝트 정보
     * @param authorization  JWT 토큰 (Bearer 형식)
     * @return 수정된 스터디/프로젝트 정보 (태그, 선호 요일 포함)
     */
    @PutMapping("/{studyProjectId}")
    @Operation(summary = "스터디/프로젝트 수정", description = "기존 스터디/프로젝트 정보를 수정하고 태그 정보와 선호 요일도 함께 업데이트합니다. **권한: 해당 스터디/프로젝트의 리더만 수정 가능**\n\n"
            +
            "**사용법:**\n" +
            "1. Authorization 헤더에 JWT 토큰 입력 (Bearer 형식)\n" +
            "2. Request Body에 수정할 정보 입력\n" +
            "3. 리더만 수정 가능")
    @SecurityRequirement(name = "Bearer Authentication")
    public ResponseEntity<ApiResponse<StudyResponse>> updateStudyProject(
            @PathVariable Long studyProjectId,
            @RequestBody StudyUpdateRequest request,
            @Parameter(description = "JWT 토큰 (Bearer 형식)", example = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...", required = true) @RequestHeader(name = "Authorization", required = true) String authorization) {
        try {
            // JWT 토큰에서 user_id 추출하여 권한 확인
            String token = authorization.replace("Bearer ", "");
            String userId = jwtUtil.extractUserId(token);

            StudyResponse response = studyService.updateStudy(studyProjectId, request, userId);
            return ApiResponse.success("스터디/프로젝트가 성공적으로 수정되었습니다.", response);
        } catch (IllegalArgumentException e) {
            return ApiResponse.error(HttpStatus.FORBIDDEN, e.getMessage(), null);
        } catch (Exception e) {
            return ApiResponse.error(HttpStatus.UNAUTHORIZED, "JWT 토큰이 유효하지 않습니다.", null);
        }
    }

    /**
     * 스터디/프로젝트 상태 변경
     * 스터디/프로젝트의 모집 상태를 변경합니다 (모집중/모집종료/종료).
     * JWT 토큰에서 user_id를 추출하여 권한을 확인합니다.
     * 
     * @param studyProjectId 상태를 변경할 스터디/프로젝트의 ID
     * @param status         변경할 상태 (recruitment: 모집중, complete: 모집종료, end: 종료) -
     *                       소문자로 전송
     * @param authorization  JWT 토큰 (Bearer 형식)
     * @return 상태가 변경된 스터디/프로젝트 정보 (태그, 선호 요일 포함)
     */
    @PatchMapping("/{studyProjectId}/status")
    @Operation(summary = "스터디/프로젝트 상태 변경", description = "스터디/프로젝트의 모집 상태를 변경합니다. **권한: 해당 스터디/프로젝트의 리더만 변경 가능**\n\n" +
            "**사용법:**\n" +
            "1. Authorization 헤더에 JWT 토큰 입력 (Bearer 형식)\n" +
            "2. status 파라미터에 변경할 상태 입력\n" +
            "3. 변경 가능한 상태: recruitment(모집중), complete(모집종료), end(종료)")
    @SecurityRequirement(name = "Bearer Authentication")
    public ResponseEntity<ApiResponse<StudyResponse>> updateStudyProjectStatus(
            @PathVariable Long studyProjectId,
            @Parameter(description = "변경할 상태 값", example = "complete", schema = @io.swagger.v3.oas.annotations.media.Schema(type = "string", allowableValues = {
                    "recruitment", "complete",
                    "end" }, description = "recruitment: 모집중, complete: 모집종료, end: 종료")) @RequestParam String status,
            @Parameter(description = "JWT 토큰 (Bearer 형식)", example = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...", required = true) @RequestHeader(name = "Authorization", required = true) String authorization) {
        try {
            // JWT 토큰에서 user_id 추출하여 권한 확인
            String token = authorization.replace("Bearer ", "");
            String userId = jwtUtil.extractUserId(token);

            StudyResponse response = studyService.updateStudyStatus(studyProjectId, status, userId);
            return ApiResponse.success("스터디/프로젝트 상태가 성공적으로 변경되었습니다.", response);
        } catch (IllegalArgumentException e) {
            return ApiResponse.error(HttpStatus.FORBIDDEN, e.getMessage(), null);
        } catch (Exception e) {
            return ApiResponse.error(HttpStatus.UNAUTHORIZED, "JWT 토큰이 유효하지 않습니다.", null);
        }
    }

    /**
     * 스터디/프로젝트 삭제
     * 특정 스터디/프로젝트와 관련된 모든 태그 정보와 선호 요일을 함께 삭제합니다.
     * JWT 토큰에서 user_id를 추출하여 권한을 확인합니다.
     * 
     * @param studyProjectId 삭제할 스터디/프로젝트의 ID
     * @param authorization  JWT 토큰 (Bearer 형식)
     * @return 삭제 성공 메시지
     */
    @DeleteMapping("/{studyProjectId}")
    @Operation(summary = "스터디/프로젝트 삭제", description = "특정 스터디/프로젝트와 관련된 모든 태그 정보와 선호 요일을 함께 삭제합니다. **권한: 해당 스터디/프로젝트의 리더만 삭제 가능**\n\n"
            +
            "**사용법:**\n" +
            "1. Authorization 헤더에 JWT 토큰 입력 (Bearer 형식)\n" +
            "2. 리더만 삭제 가능")
    @SecurityRequirement(name = "Bearer Authentication")
    public ResponseEntity<ApiResponse<String>> deleteStudyProject(
            @PathVariable Long studyProjectId,
            @Parameter(description = "JWT 토큰 (Bearer 형식)", example = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...", required = true) @RequestHeader(name = "Authorization", required = true) String authorization) {
        try {
            // JWT 토큰에서 user_id 추출하여 권한 확인
            String token = authorization.replace("Bearer ", "");
            String userId = jwtUtil.extractUserId(token);

            studyService.deleteStudy(studyProjectId, userId);
            return ApiResponse.success("스터디/프로젝트가 성공적으로 삭제되었습니다.", "삭제 완료");
        } catch (IllegalArgumentException e) {
            return ApiResponse.error(HttpStatus.FORBIDDEN, e.getMessage(), null);
        } catch (Exception e) {
            return ApiResponse.error(HttpStatus.UNAUTHORIZED, "JWT 토큰이 유효하지 않습니다.", null);
        }
    }

    /**
     * 로그인한 사용자의 참여 스터디/프로젝트 목록 조회
     * 현재 로그인한 사용자가 참여하고 있는 모든 스터디/프로젝트 정보를 조회합니다.
     * 
     * @param authorization JWT 토큰 (Bearer 형식)
     * @return 사용자가 참여하고 있는 스터디/프로젝트 목록
     */
    @GetMapping("/my-participations")
    @Operation(summary = "내 참여 스터디/프로젝트 목록", description = "현재 로그인한 사용자가 참여하고 있는 모든 스터디/프로젝트 정보를 조회합니다.\n\n" +
            "**반환 정보:**\n" +
            "• 기본 정보: 이름, 제목, 설명, 레벨, 타입 등\n" +
            "• 태그 정보: 관심 분야 태그 목록\n" +
            "• 선호 요일: 가능한 요일 목록\n" +
            "• 인원 정보: 총 인원수와 현재 인원수\n" +
            "• 멤버 정보: 현재 가입된 멤버들의 상세 정보\n" +
            "• 내 역할: 해당 스터디/프로젝트에서의 역할 (리더/멤버)")
    @SecurityRequirement(name = "Bearer Authentication")
    public ResponseEntity<ApiResponse<List<StudyResponse>>> getMyParticipations(
            @Parameter(description = "JWT 토큰 (Bearer 형식)", example = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...", required = true) @RequestHeader(name = "Authorization", required = true) String authorization) {
        try {
            // JWT 토큰에서 user_id 추출
            String token = authorization.replace("Bearer ", "");
            String userId = jwtUtil.extractUserId(token);

            List<StudyResponse> participations = studyService.getStudiesByParticipant(userId);
            return ApiResponse.success("내 참여 스터디/프로젝트 목록 조회가 성공했습니다.", participations);
        } catch (Exception e) {
            return ApiResponse.error(HttpStatus.INTERNAL_SERVER_ERROR, "참여 목록 조회에 실패했습니다.", null);
        }
    }

    /**
     * 로그인한 사용자의 신청 스터디/프로젝트 목록 조회
     * 현재 로그인한 사용자가 신청한 모든 스터디/프로젝트 정보를 조회합니다.
     * 
     * @param authorization JWT 토큰 (Bearer 형식)
     * @return 사용자가 신청한 스터디/프로젝트 목록
     */
    @GetMapping("/my-applications")
    @Operation(summary = "내 신청 스터디/프로젝트 목록", description = "현재 로그인한 사용자가 신청한 모든 스터디/프로젝트 정보를 조회합니다.\n\n" +
            "**반환 정보:**\n" +
            "• 기본 정보: 이름, 제목, 설명, 레벨, 타입 등\n" +
            "• 태그 정보: 관심 분야 태그 목록\n" +
            "• 선호 요일: 가능한 요일 목록\n" +
            "• 인원 정보: 총 인원수와 현재 인원수\n" +
            "• 신청 상태: PENDING(대기중), APPROVED(승인됨), REJECTED(거부됨)\n" +
            "• 신청 메시지: 신청 시 작성한 메시지")
    @SecurityRequirement(name = "Bearer Authentication")
    public ResponseEntity<ApiResponse<List<StudyResponse>>> getMyApplications(
            @Parameter(description = "JWT 토큰 (Bearer 형식)", example = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...", required = true) @RequestHeader(name = "Authorization", required = true) String authorization) {
        try {
            // JWT 토큰에서 user_id 추출
            String token = authorization.replace("Bearer ", "");
            String userId = jwtUtil.extractUserId(token);

            List<StudyResponse> applications = studyService.getStudiesByApplicant(userId);
            return ApiResponse.success("내 신청 스터디/프로젝트 목록 조회가 성공했습니다.", applications);
        } catch (Exception e) {
            return ApiResponse.error(HttpStatus.INTERNAL_SERVER_ERROR, "신청 목록 조회에 실패했습니다.", null);
        }
    }

    /**
     * 로그인한 사용자의 스터디/프로젝트 관리 대시보드
     * 참여 중인 스터디/프로젝트와 신청한 스터디/프로젝트 정보를 통합하여 조회합니다.
     * 
     * @param authorization JWT 토큰 (Bearer 형식)
     * @return 사용자의 스터디/프로젝트 관리 정보 (통합 목록 + 개별 목록 + 통계)
     */
    @GetMapping("/my-dashboard")
    @Operation(summary = "내 스터디/프로젝트 관리 대시보드", description = "현재 로그인한 사용자의 스터디/프로젝트 관리 정보를 통합하여 조회합니다.\n\n" +
            "**반환 정보:**\n" +
            "• `allStudies`: 참여중이거나 신청한 모든 스터디/프로젝트 통합 목록\n" +
            "• `participations`: 참여 중인 스터디/프로젝트 목록\n" +
            "• `applications`: 신청한 스터디/프로젝트 목록\n" +
            "• `totalCount`: 전체 스터디/프로젝트 수\n" +
            "• `participationCount`: 참여 중인 스터디/프로젝트 수\n" +
            "• `applicationCount`: 신청한 스터디/프로젝트 수\n" +
            "• 각 스터디/프로젝트의 상세 정보와 참여 상태")
    @SecurityRequirement(name = "Bearer Authentication")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getMyDashboard(
            @Parameter(description = "JWT 토큰 (Bearer 형식)", example = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...", required = true) @RequestHeader(name = "Authorization", required = true) String authorization) {
        try {
            System.out.println("=== /my-dashboard 엔드포인트 호출 ===");
            System.out.println("Authorization 헤더: " + authorization);

            // JWT 토큰에서 user_id 추출
            String token = authorization.replace("Bearer ", "");
            System.out.println("JWT 토큰 (Bearer 제거): " + token);

            String userId = jwtUtil.extractUserId(token);
            System.out.println("추출된 user_id: " + userId);

            // StudyService를 통해 대시보드 정보 조회
            Map<String, Object> dashboard = studyService.getUserDashboard(userId);

            System.out.println("=== /my-dashboard 응답 생성 완료 ===");
            return ApiResponse.success("내 스터디/프로젝트 대시보드 조회가 성공했습니다.", dashboard);
        } catch (Exception e) {
            System.err.println("=== /my-dashboard 오류 발생 ===");
            System.err.println("오류 메시지: " + e.getMessage());
            e.printStackTrace();
            return ApiResponse.error(HttpStatus.INTERNAL_SERVER_ERROR, "대시보드 조회에 실패했습니다.", null);
        }
    }

    /**
     * 내 스터디/프로젝트 상태별 상세 정보 조회
     * 현재 로그인한 사용자의 스터디/프로젝트를 상태별로 구분하여 조회합니다.
     * 
     * @param authorization JWT 토큰 (Bearer 형식)
     * @return 참여중, 승인대기중, 종료된 스터디/프로젝트 정보
     */
    @GetMapping("/my-status-details")
    @Operation(summary = "내 스터디/프로젝트 상태별 상세 정보", description = "현재 로그인한 사용자의 스터디/프로젝트를 상태별로 구분하여 조회합니다.\n\n" +
            "**반환 정보:**\n" +
            "• `activeStudies`: 참여중인 활성 스터디/프로젝트 목록 (진행중)\n" +
            "• `pendingStudies`: 승인대기중인 스터디/프로젝트 목록\n" +
            "• `completedStudies`: 종료된 스터디/프로젝트 목록 (참여했던 것들)\n" +
            "• `completedAppliedStudies`: 종료된 스터디/프로젝트 목록 (신청했던 것들)\n" +
            "• 각 카테고리별 개수와 전체 개수")
    @SecurityRequirement(name = "Bearer Authentication")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getMyStudyStatusDetails(
            @Parameter(description = "JWT 토큰 (Bearer 형식)", example = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...", required = true) @RequestHeader(name = "Authorization", required = true) String authorization) {
        try {
            String token = authorization.replace("Bearer ", "");
            String userId = jwtUtil.extractUserId(token);

            Map<String, Object> statusDetails = studyService.getUserStudyStatusDetails(userId);
            return ApiResponse.success("내 스터디/프로젝트 상태별 상세 정보 조회가 성공했습니다.", statusDetails);
        } catch (Exception e) {
            return ApiResponse.error(HttpStatus.INTERNAL_SERVER_ERROR, "상태별 상세 정보 조회에 실패했습니다.", null);
        }
    }

    /**
     * 스케줄러 수동 실행 (테스트용)
     * 종료일이 지난 스터디/프로젝트의 모집 상태를 'end'로 변경합니다.
     * 
     * @return 실행 결과
     */
    @PostMapping("/test-scheduler")
    @Operation(summary = "스케줄러 수동 실행 (테스트용)", description = "종료일이 지난 스터디/프로젝트의 모집 상태를 'end'로 변경하는 스케줄러를 수동으로 실행합니다.\n\n"
            +
            "**주의:** 이 엔드포인트는 테스트 목적으로만 사용해야 합니다.")
    public ResponseEntity<ApiResponse<String>> testScheduler() {
        try {
            // StudySchedulerService를 주입받아야 하므로, 여기서는 간단한 메시지만 반환
            return ApiResponse.success("스케줄러 테스트 엔드포인트가 호출되었습니다. 실제 스케줄러는 매일 자정에 자동으로 실행됩니다.",
                    "스케줄러는 매일 자정(00:00)에 자동으로 실행됩니다.");
        } catch (Exception e) {
            return ApiResponse.error(HttpStatus.INTERNAL_SERVER_ERROR, "스케줄러 테스트 실행에 실패했습니다.", null);
        }
    }

    /**
     * 스터디/프로젝트 커리큘럼 텍스트 업데이트
     * 특정 스터디/프로젝트의 커리큘럼 텍스트를 직접 수정합니다.
     * JWT 토큰에서 user_id를 추출하여 권한을 확인합니다.
     * 
     * @param studyProjectId 수정할 스터디/프로젝트의 ID
     * @param request        수정할 커리큘럼 텍스트 정보
     * @param authorization  JWT 토큰 (Bearer 형식)
     * @return 수정된 스터디/프로젝트 정보
     */
    @PatchMapping("/{studyProjectId}/curriculum")
    @Operation(summary = "스터디/프로젝트 커리큘럼 텍스트 업데이트", description = "특정 스터디/프로젝트의 커리큘럼 텍스트를 직접 수정합니다. **권한: 해당 스터디/프로젝트의 리더만 수정 가능**\n\n"
            +
            "**사용법:**\n" +
            "1. Authorization 헤더에 JWT 토큰 입력 (Bearer 형식)\n" +
            "2. Request Body에 수정할 커리큘럼 텍스트 입력\n" +
            "3. 리더만 수정 가능\n\n" +
            "**마크다운 지원:**\n" +
            "• 커리큘럼 텍스트는 마크다운 형식으로 저장됩니다.\n" +
            "• 프론트엔드에서 ReactMarkdown을 통해 렌더링됩니다.")
    @SecurityRequirement(name = "Bearer Authentication")
    public ResponseEntity<ApiResponse<StudyResponse>> updateCurriculumText(
            @Parameter(description = "수정할 스터디/프로젝트의 ID", example = "1", required = true) @PathVariable Long studyProjectId,
            @Parameter(description = "수정할 커리큘럼 텍스트 정보", required = true) @RequestBody Map<String, String> request,
            @Parameter(description = "JWT 토큰 (Bearer 형식)", example = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...", required = true) @RequestHeader(name = "Authorization", required = true) String authorization) {
        try {
            System.out.println("🔍 [DEBUG] updateCurriculumText 호출 - studyProjectId: " + studyProjectId);
            System.out.println("🔍 [DEBUG] updateCurriculumText 호출 - request: " + request);
            System.out.println("🔍 [DEBUG] updateCurriculumText 호출 - authorization: " + (authorization != null ? "토큰 존재" : "토큰 없음"));
            
            // JWT 토큰에서 user_id 추출하여 권한 확인
            String token = authorization.replace("Bearer ", "");
            String userId = jwtUtil.extractUserId(token);
            System.out.println("🔍 [DEBUG] updateCurriculumText - 추출된 userId: " + userId);

            // 커리큘럼 텍스트 추출
            String curText = request.get("curText");
            System.out.println("🔍 [DEBUG] updateCurriculumText - curText: " + (curText != null ? "텍스트 존재 (길이: " + curText.length() + ")" : "null"));
            
            if (curText == null || curText.trim().isEmpty()) {
                System.out.println("❌ [DEBUG] updateCurriculumText - 커리큘럼 텍스트가 비어있음");
                return ApiResponse.error(HttpStatus.BAD_REQUEST, "커리큘럼 텍스트는 필수입니다.", null);
            }

            StudyResponse response = studyService.updateCurriculumText(studyProjectId, curText, userId);
            System.out.println("✅ [DEBUG] updateCurriculumText - 성공적으로 완료");
            return ApiResponse.success("커리큘럼 텍스트가 성공적으로 업데이트되었습니다.", response);
        } catch (IllegalArgumentException e) {
            System.out.println("❌ [DEBUG] updateCurriculumText - IllegalArgumentException: " + e.getMessage());
            return ApiResponse.error(HttpStatus.FORBIDDEN, e.getMessage(), null);
        } catch (Exception e) {
            System.out.println("❌ [DEBUG] updateCurriculumText - Exception: " + e.getMessage());
            e.printStackTrace();
            return ApiResponse.error(HttpStatus.INTERNAL_SERVER_ERROR, "커리큘럼 텍스트 업데이트 중 오류가 발생했습니다: " + e.getMessage(),
                    null);
        }
    }
}
