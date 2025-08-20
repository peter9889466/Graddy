package com.smhrd.graddy.study.controller;

import com.smhrd.graddy.study.dto.StudyRequest;
import com.smhrd.graddy.study.dto.StudyResponse;
import com.smhrd.graddy.study.dto.StudyUpdateRequest;
import com.smhrd.graddy.study.service.StudyService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;

import java.net.URI;
import java.util.List;

/**
 * 스터디 관리 API 컨트롤러
 * 스터디의 생성, 조회, 수정, 삭제 및 태그 관리 기능을 제공합니다.
 */
@RestController
@RequestMapping("/api/studies")
@RequiredArgsConstructor
@Tag(name = "스터디 관리", description = "스터디 생성, 조회, 수정, 삭제 및 태그 관리 API")
public class StudyController {

    private final StudyService studyService;

    /**
     * 스터디 생성
     * 새로운 스터디를 생성하고 태그 정보와 함께 데이터베이스에 저장합니다.
     * 
     * @param request 스터디 생성에 필요한 정보 (스터디명, 제목, 설명, 레벨, 사용자ID, 기간, 인원, 관심사ID 리스트)
     * @return 생성된 스터디 정보 (태그 포함)
     */
    @PostMapping
    @Operation(summary = "스터디 생성", description = "새로운 스터디를 생성하고 태그 정보와 함께 데이터베이스에 저장합니다.")
    @SecurityRequirement(name = "Bearer Authentication")
    public ResponseEntity<StudyResponse> createStudy(
            @RequestBody StudyRequest request,
            @Parameter(description = "JWT 토큰", example = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...")
            @RequestHeader(name = "Authorization", required = false) String authorization) {
        try {
            StudyResponse response = studyService.createStudy(request);
            return ResponseEntity.created(URI.create("/api/studies/" + response.getStudyId()))
                    .body(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * 스터디 조회
     * 특정 스터디ID로 스터디 정보와 태그를 조회합니다.
     * 
     * @param studyId 조회할 스터디의 ID
     * @return 스터디 정보 (태그 포함)
     */
    @GetMapping("/{studyId}")
    @Operation(summary = "스터디 조회", description = "특정 스터디ID로 스터디 정보와 태그를 조회합니다.")
    public ResponseEntity<StudyResponse> getStudy(@PathVariable Long studyId) {
        try {
            StudyResponse response = studyService.getStudy(studyId);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * 모든 스터디 목록 조회
     * 전체 스터디 목록을 생성일 기준 내림차순으로 조회합니다.
     * 
     * @return 전체 스터디 목록 (태그 포함)
     */
    @GetMapping
    @Operation(summary = "전체 스터디 목록", description = "전체 스터디 목록을 생성일 기준 내림차순으로 조회합니다.")
    public ResponseEntity<List<StudyResponse>> getAllStudies() {
        List<StudyResponse> studies = studyService.getAllStudies();
        return ResponseEntity.ok(studies);
    }

    /**
     * 모집중인 스터디 목록 조회
     * 현재 모집 중인 스터디만 조회합니다.
     * 
     * @return 모집중인 스터디 목록 (태그 포함)
     */
    @GetMapping("/recruiting")
    @Operation(summary = "모집중인 스터디 목록", description = "현재 모집 중인 스터디만 조회합니다.")
    public ResponseEntity<List<StudyResponse>> getRecruitingStudies() {
        List<StudyResponse> studies = studyService.getRecruitingStudies();
        return ResponseEntity.ok(studies);
    }

    /**
     * 사용자가 리더인 스터디 목록 조회
     * 특정 사용자가 리더인 스터디 목록을 조회합니다.
     * 
     * @param userId 리더 ID
     * @return 해당 사용자가 리더인 스터디 목록 (태그 포함)
     */
    @GetMapping("/leader/{userId}")
    @Operation(summary = "리더별 스터디 목록", description = "특정 사용자가 리더인 스터디 목록을 조회합니다.")
    public ResponseEntity<List<StudyResponse>> getStudiesByLeader(@PathVariable String userId) {
        List<StudyResponse> studies = studyService.getStudiesByLeader(userId);
        return ResponseEntity.ok(studies);
    }

    /**
     * 스터디 검색
     * 제목, 스터디명, 설명, 작성자, 태그로 검색합니다.
     * 
     * @param keyword 검색할 키워드
     * @return 검색된 스터디 목록 (태그 포함)
     */
    @GetMapping("/search")
    @Operation(summary = "스터디 검색", description = "제목, 스터디명, 설명, 작성자, 태그로 검색합니다.")
    public ResponseEntity<List<StudyResponse>> searchStudies(@RequestParam(required = false) String keyword) {
        List<StudyResponse> studies = studyService.searchStudies(keyword);
        return ResponseEntity.ok(studies);
    }

    /**
     * 레벨별 스터디 목록 조회
     * 특정 레벨의 스터디 목록을 조회합니다.
     * 
     * @param level 조회할 스터디 레벨
     * @return 해당 레벨의 스터디 목록 (태그 포함)
     */
    @GetMapping("/level/{level}")
    @Operation(summary = "레벨별 스터디 목록", description = "특정 레벨의 스터디 목록을 조회합니다.")
    public ResponseEntity<List<StudyResponse>> getStudiesByLevel(@PathVariable Integer level) {
        List<StudyResponse> studies = studyService.getStudiesByLevel(level);
        return ResponseEntity.ok(studies);
    }

    /**
     * 스터디 수정
     * 기존 스터디 정보를 수정하고 태그 정보도 함께 업데이트합니다.
     * 
     * @param studyId 수정할 스터디의 ID
     * @param request 수정할 스터디 정보 (스터디명, 제목, 설명, 레벨, 상태, 기간, 인원, 관심사ID 리스트)
     * @return 수정된 스터디 정보 (태그 포함)
     */
    @PutMapping("/{studyId}")
    @Operation(summary = "스터디 수정", description = "기존 스터디 정보를 수정하고 태그 정보도 함께 업데이트합니다.")
    @SecurityRequirement(name = "Bearer Authentication")
    public ResponseEntity<StudyResponse> updateStudy(
            @PathVariable Long studyId,
            @RequestBody StudyUpdateRequest request,
            @Parameter(description = "JWT 토큰", example = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...")
            @RequestHeader(name = "Authorization", required = false) String authorization) {
        try {
            StudyResponse response = studyService.updateStudy(studyId, request);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * 스터디 상태 변경
     * 스터디의 모집 상태를 변경합니다 (모집중/모집종료/스터디종료).
     * 
     * @param studyId 상태를 변경할 스터디의 ID
     * @param status 변경할 상태 (recruitment, complete, end)
     * @return 상태가 변경된 스터디 정보 (태그 포함)
     */
    @PatchMapping("/{studyId}/status")
    @Operation(summary = "스터디 상태 변경", description = "스터디의 모집 상태를 변경합니다 (모집중/모집종료/스터디종료).")
    @SecurityRequirement(name = "Bearer Authentication")
    public ResponseEntity<StudyResponse> updateStudyStatus(
            @PathVariable Long studyId,
            @RequestParam String status,
            @Parameter(description = "JWT 토큰", example = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...")
            @RequestHeader(name = "Authorization", required = false) String authorization) {
        try {
            StudyResponse response = studyService.updateStudyStatus(studyId, status);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * 스터디 삭제
     * 특정 스터디와 관련된 모든 태그 정보를 함께 삭제합니다.
     * 
     * @param studyId 삭제할 스터디의 ID
     * @return 삭제 성공 시 204 No Content
     */
    @DeleteMapping("/{studyId}")
    @Operation(summary = "스터디 삭제", description = "특정 스터디와 관련된 모든 태그 정보를 함께 삭제합니다.")
    @SecurityRequirement(name = "Bearer Authentication")
    public ResponseEntity<Void> deleteStudy(
            @PathVariable Long studyId,
            @Parameter(description = "JWT 토큰", example = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...")
            @RequestHeader(name = "Authorization", required = false) String authorization) {
        try {
            studyService.deleteStudy(studyId);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
