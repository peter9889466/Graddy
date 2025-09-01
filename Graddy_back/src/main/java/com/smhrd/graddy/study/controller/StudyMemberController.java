package com.smhrd.graddy.study.controller;

import com.smhrd.graddy.study.dto.StudyMemberResponse;
import com.smhrd.graddy.study.service.StudyMemberService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * 스터디 멤버 조회 컨트롤러
 */
@RestController
@RequestMapping("/api/study/members")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Study Member", description = "스터디 멤버 조회 API")
public class StudyMemberController {
    
    private final StudyMemberService studyMemberService;
    
    /**
     * 특정 스터디의 특정 멤버 상세 정보 조회
     * 
     * @param studyProjectId 스터디/프로젝트 ID
     * @param memberId 멤버 ID
     * @return 멤버 상세 정보
     */
    @GetMapping("/{studyProjectId}/{memberId}")
    @Operation(
        summary = "스터디 특정 멤버 상세 정보 조회",
        description = "특정 스터디의 특정 멤버에 대한 상세 정보를 조회합니다."
    )
    public ResponseEntity<StudyMemberResponse> getMemberDetail(
            @Parameter(description = "스터디/프로젝트 ID", required = true)
            @PathVariable Long studyProjectId,
            @Parameter(description = "멤버 ID", required = true)
            @PathVariable Long memberId) {
        
        log.info("스터디 멤버 상세 정보 조회 요청: studyProjectId={}, memberId={}", studyProjectId, memberId);
        
        try {
            StudyMemberResponse memberDetail = studyMemberService.getMemberDetail(studyProjectId, memberId);
            return ResponseEntity.ok(memberDetail);
        } catch (IllegalArgumentException e) {
            log.warn("스터디 멤버를 찾을 수 없음: studyProjectId={}, memberId={}, error={}", 
                studyProjectId, memberId, e.getMessage());
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("스터디 멤버 상세 정보 조회 실패: studyProjectId={}, memberId={}, error={}", 
                studyProjectId, memberId, e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }
}
