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

    /**
     * 스터디/프로젝트 생성
     * 새로운 스터디 또는 프로젝트를 생성하고 태그 정보와 선호 요일과 함께 데이터베이스에 저장합니다.
     * JWT 토큰에서 user_id를 자동으로 추출하여 설정합니다.
     * 
     * @param request 스터디/프로젝트 생성에 필요한 정보 (user_id 제외)
     * @param authorization JWT 토큰 (Bearer 형식)
     * @return 생성된 스터디/프로젝트 정보 (태그, 선호 요일 포함)
     */
    @PostMapping
    @Operation(summary = "스터디/프로젝트 생성", description = "새로운 스터디 또는 프로젝트를 생성하고 태그 정보와 선호 요일과 함께 데이터베이스에 저장합니다. JWT 토큰에서 user_id를 자동으로 추출합니다.")
    @SecurityRequirement(name = "Bearer Authentication")
    public ResponseEntity<ApiResponse<StudyResponse>> createStudyProject(
            @RequestBody StudyRequest request,
            @Parameter(description = "JWT 토큰", example = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...")
            @RequestHeader(name = "Authorization", required = true) String authorization) {
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
//    @GetMapping("/recruiting")
//    @Operation(summary = "모집중인 스터디/프로젝트 목록", description = "현재 모집 중인 스터디/프로젝트만 조회합니다.")
//    public ResponseEntity<ApiResponse<List<StudyResponse>>> getRecruitingStudyProjects() {
//        List<StudyResponse> studyProjects = studyService.getRecruitingStudies();
//        return ApiResponse.success("모집중인 스터디/프로젝트 목록 조회가 성공했습니다.", studyProjects);
//    }

    /**
     * 사용자가 리더인 스터디/프로젝트 목록 조회
     * 특정 사용자가 리더인 스터디/프로젝트 목록을 조회합니다.
     * 
     * @param userId 리더 ID
     * @return 해당 사용자가 리더인 스터디/프로젝트 목록 (태그, 선호 요일 포함)
     */
//    @GetMapping("/leader/{userId}")
//    @Operation(summary = "리더별 스터디/프로젝트 목록", description = "특정 사용자가 리더인 스터디/프로젝트 목록을 조회합니다.")
//    public ResponseEntity<ApiResponse<List<StudyResponse>>> getStudyProjectsByLeader(@PathVariable String userId) {
//        List<StudyResponse> studyProjects = studyService.getStudiesByLeader(userId);
//        return ApiResponse.success("리더별 스터디/프로젝트 목록 조회가 성공했습니다.", studyProjects);
//    }

    /**
     * 스터디/프로젝트 검색
     * 제목, 스터디/프로젝트명, 설명, 작성자, 태그로 검색합니다.
     * 
     * @param keyword 검색할 키워드
     * @return 검색된 스터디/프로젝트 목록 (태그, 선호 요일 포함)
     */
//    @GetMapping("/search")
//    @Operation(summary = "스터디/프로젝트 검색", description = "제목, 스터디/프로젝트명, 설명, 작성자, 태그로 검색합니다.")
//    public ResponseEntity<ApiResponse<List<StudyResponse>>> searchStudyProjects(@RequestParam(required = false) String keyword) {
//        List<StudyResponse> studyProjects = studyService.searchStudies(keyword);
//        return ApiResponse.success("스터디/프로젝트 검색이 성공했습니다.", studyProjects);
//    }

    /**
     * 레벨별 스터디/프로젝트 목록 조회
     * 특정 레벨의 스터디/프로젝트 목록을 조회합니다.
     * 
     * @param level 조회할 스터디/프로젝트 레벨
     * @return 해당 레벨의 스터디/프로젝트 목록 (태그, 선호 요일 포함)
     */
//    @GetMapping("/level/{level}")
//    @Operation(summary = "레벨별 스터디/프로젝트 목록", description = "특정 레벨의 스터디/프로젝트 목록을 조회합니다.")
//    public ResponseEntity<ApiResponse<List<StudyResponse>>> getStudyProjectsByLevel(@PathVariable Integer level) {
//        List<StudyResponse> studyProjects = studyService.getStudiesByLevel(level);
//        return ApiResponse.success("레벨별 스터디/프로젝트 목록 조회가 성공했습니다.", studyProjects);
//    }

    /**
     * 스터디/프로젝트 수정
     * 기존 스터디/프로젝트 정보를 수정하고 태그 정보와 선호 요일도 함께 업데이트합니다.
     * JWT 토큰에서 user_id를 추출하여 권한을 확인합니다.
     * 
     * @param studyProjectId 수정할 스터디/프로젝트의 ID
     * @param request 수정할 스터디/프로젝트 정보
     * @param authorization JWT 토큰 (Bearer 형식)
     * @return 수정된 스터디/프로젝트 정보 (태그, 선호 요일 포함)
     */
    @PutMapping("/{studyProjectId}")
    @Operation(summary = "스터디/프로젝트 수정", description = "기존 스터디/프로젝트 정보를 수정하고 태그 정보와 선호 요일도 함께 업데이트합니다. JWT 토큰으로 권한을 확인합니다.")
    @SecurityRequirement(name = "Bearer Authentication")
    public ResponseEntity<ApiResponse<StudyResponse>> updateStudyProject(
            @PathVariable Long studyProjectId,
            @RequestBody StudyUpdateRequest request,
            @Parameter(description = "JWT 토큰", example = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...")
            @RequestHeader(name = "Authorization", required = true) String authorization) {
        try {
            // JWT 토큰에서 user_id 추출하여 권한 확인
            String token = authorization.replace("Bearer ", "");
            String userId = jwtUtil.extractUserId(token);
            
            // TODO: 해당 스터디/프로젝트의 리더인지 확인하는 로직 추가 필요
            
            StudyResponse response = studyService.updateStudy(studyProjectId, request);
            return ApiResponse.success("스터디/프로젝트가 성공적으로 수정되었습니다.", response);
        } catch (IllegalArgumentException e) {
            return ApiResponse.error(HttpStatus.NOT_FOUND, "스터디/프로젝트를 찾을 수 없습니다.", null);
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
     * @param status 변경할 상태 (recruitment, complete, end)
     * @param authorization JWT 토큰 (Bearer 형식)
     * @return 상태가 변경된 스터디/프로젝트 정보 (태그, 선호 요일 포함)
     */
    @PatchMapping("/{studyProjectId}/status")
    @Operation(summary = "스터디/프로젝트 상태 변경", description = "스터디/프로젝트의 모집 상태를 변경합니다 (모집중/모집종료/종료). JWT 토큰으로 권한을 확인합니다.")
    @SecurityRequirement(name = "Bearer Authentication")
    public ResponseEntity<ApiResponse<StudyResponse>> updateStudyProjectStatus(
            @PathVariable Long studyProjectId,
            @RequestParam String status,
            @Parameter(description = "JWT 토큰", example = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...")
            @RequestHeader(name = "Authorization", required = true) String authorization) {
        try {
            // JWT 토큰에서 user_id 추출하여 권한 확인
            String token = authorization.replace("Bearer ", "");
            String userId = jwtUtil.extractUserId(token);
            
            // TODO: 해당 스터디/프로젝트의 리더인지 확인하는 로직 추가 필요
            
            StudyResponse response = studyService.updateStudyStatus(studyProjectId, status);
            return ApiResponse.success("스터디/프로젝트 상태가 성공적으로 변경되었습니다.", response);
        } catch (IllegalArgumentException e) {
            return ApiResponse.error(HttpStatus.BAD_REQUEST, "스터디/프로젝트 상태 변경에 실패했습니다.", null);
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
     * @param authorization JWT 토큰 (Bearer 형식)
     * @return 삭제 성공 메시지
     */
    @DeleteMapping("/{studyProjectId}")
    @Operation(summary = "스터디/프로젝트 삭제", description = "특정 스터디/프로젝트와 관련된 모든 태그 정보와 선호 요일을 함께 삭제합니다. JWT 토큰으로 권한을 확인합니다.")
    @SecurityRequirement(name = "Bearer Authentication")
    public ResponseEntity<ApiResponse<String>> deleteStudyProject(
            @PathVariable Long studyProjectId,
            @Parameter(description = "JWT 토큰", example = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...")
            @RequestHeader(name = "Authorization", required = true) String authorization) {
        try {
            // JWT 토큰에서 user_id 추출하여 권한 확인
            String token = authorization.replace("Bearer ", "");
            String userId = jwtUtil.extractUserId(token);
            
            // TODO: 해당 스터디/프로젝트의 리더인지 확인하는 로직 추가 필요
            
            studyService.deleteStudy(studyProjectId);
            return ApiResponse.success("스터디/프로젝트가 성공적으로 삭제되었습니다.", "삭제 완료");
        } catch (IllegalArgumentException e) {
            return ApiResponse.error(HttpStatus.NOT_FOUND, "스터디/프로젝트를 찾을 수 없습니다.", null);
        } catch (Exception e) {
            return ApiResponse.error(HttpStatus.UNAUTHORIZED, "JWT 토큰이 유효하지 않습니다.", null);
        }
    }
}
