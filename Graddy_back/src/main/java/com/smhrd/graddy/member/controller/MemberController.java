package com.smhrd.graddy.member.controller;

import com.smhrd.graddy.api.dto.ApiResponse;
import com.smhrd.graddy.member.dto.MemberInfo;
import com.smhrd.graddy.member.entity.Member;
import com.smhrd.graddy.member.service.MemberService;
import com.smhrd.graddy.security.jwt.JwtUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/members")
@RequiredArgsConstructor
@Tag(name = "멤버 관리", description = "스터디/프로젝트 멤버 관리 API")
public class MemberController {

    private final MemberService memberService;
    private final JwtUtil jwtUtil;

    /**
     * 스터디/프로젝트에 멤버 추가
     * 일반 사용자를 스터디/프로젝트의 멤버로 추가합니다.
     * 
     * @param studyProjectId 스터디/프로젝트 ID
     * @param userId 추가할 사용자 ID
     * @param authorization JWT 토큰
     * @return 추가 결과
     */
    @PostMapping("/{studyProjectId}/users/{userId}")
    @Operation(summary = "멤버 추가",
              description = "스터디/프로젝트에 새로운 멤버를 추가합니다.\n\n" +
                           "**권한:** 해당 스터디/프로젝트의 리더만 가능\n" +
                           "**상태:** 자동으로 'approved' 상태로 설정\n\n" +
                           "**사용법:**\n" +
                           "1. Authorization 헤더에 JWT 토큰 입력 (Bearer 형식)\n" +
                           "2. Path Variable에 studyProjectId와 userId 입력\n" +
                           "3. JWT 토큰의 사용자가 해당 스터디/프로젝트의 리더여야 함")
    @SecurityRequirement(name = "Bearer Authentication")
    public ResponseEntity<ApiResponse<String>> addMember(
            @Parameter(description = "스터디/프로젝트 ID", example = "1", required = true)
            @PathVariable Long studyProjectId,
            @Parameter(description = "추가할 사용자 ID", example = "user123", required = true)
            @PathVariable String userId,
            @Parameter(description = "JWT 토큰 (Bearer 형식)", 
                      example = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                      required = true)
            @RequestHeader(name = "Authorization", required = true) String authorization) {
        try {
            // JWT 토큰에서 현재 사용자 ID 추출
            String token = authorization.replace("Bearer ", "");
            String currentUserId = jwtUtil.extractUserId(token);
            
            // 리더 권한 확인
            if (!memberService.isLeader(studyProjectId, currentUserId)) {
                return ApiResponse.error(HttpStatus.FORBIDDEN, 
                    "해당 스터디/프로젝트의 리더만 멤버를 추가할 수 있습니다.", null);
            }
            
            // 멤버 추가
            memberService.addMember(studyProjectId, userId);
            return ApiResponse.success("멤버가 성공적으로 추가되었습니다.", "SUCCESS");
        } catch (IllegalArgumentException e) {
            return ApiResponse.error(HttpStatus.BAD_REQUEST, e.getMessage(), null);
        } catch (Exception e) {
            return ApiResponse.error(HttpStatus.INTERNAL_SERVER_ERROR, "멤버 추가에 실패했습니다.", null);
        }
    }

    /**
     * 멤버 상태 변경
     * 멤버의 상태를 승인/거부/탈퇴로 변경합니다.
     * 
     * @param studyProjectId 스터디/프로젝트 ID
     * @param userId 멤버 ID
     * @param status 변경할 상태
     * @param authorization JWT 토큰
     * @return 변경 결과
     */
    @PutMapping("/{studyProjectId}/users/{userId}/status")
    @Operation(summary = "멤버 상태 변경",
              description = "멤버의 상태를 변경합니다.\n\n" +
                           "**권한:** 해당 스터디/프로젝트의 리더만 가능\n" +
                           "**상태 옵션:**\n" +
                           "• approved: 승인됨\n" +
                           "• withdraw: 탈퇴\n\n" +
                           "**사용법:**\n" +
                           "1. Authorization 헤더에 JWT 토큰 입력 (Bearer 형식)\n" +
                           "2. JWT 토큰의 사용자가 해당 스터디/프로젝트의 리더여야 함")
    @SecurityRequirement(name = "Bearer Authentication")
    public ResponseEntity<ApiResponse<String>> updateMemberStatus(
            @Parameter(description = "스터디/프로젝트 ID", example = "1", required = true)
            @PathVariable Long studyProjectId,
            @Parameter(description = "멤버 ID", example = "user123", required = true)
            @PathVariable String userId,
            @Parameter(description = "변경할 상태", example = "approved", required = true)
            @RequestParam String status,
            @Parameter(description = "JWT 토큰 (Bearer 형식)", 
                      example = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                      required = true)
            @RequestHeader(name = "Authorization", required = true) String authorization) {
        try {
            // JWT 토큰에서 현재 사용자 ID 추출
            String token = authorization.replace("Bearer ", "");
            String currentUserId = jwtUtil.extractUserId(token);
            
            // 리더 권한 확인
            if (!memberService.isLeader(studyProjectId, currentUserId)) {
                return ApiResponse.error(HttpStatus.FORBIDDEN, 
                    "해당 스터디/프로젝트의 리더만 멤버 상태를 변경할 수 있습니다.", null);
            }
            
            Member.MemberStatus memberStatus = Member.MemberStatus.valueOf(status);
            memberService.updateMemberStatus(studyProjectId, userId, memberStatus);
            return ApiResponse.success("멤버 상태가 성공적으로 변경되었습니다.", "SUCCESS");
        } catch (IllegalArgumentException e) {
            return ApiResponse.error(HttpStatus.BAD_REQUEST, e.getMessage(), null);
        } catch (Exception e) {
            return ApiResponse.error(HttpStatus.INTERNAL_SERVER_ERROR, "멤버 상태 변경에 실패했습니다.", null);
        }
    }

    /**
     * 리더 권한 이전
     * 현재 리더의 권한을 다른 멤버에게 이전합니다.
     * 
     * @param studyProjectId 스터디/프로젝트 ID
     * @param newLeaderId 새로운 리더 ID
     * @param authorization JWT 토큰
     * @return 이전 결과
     */
    @PutMapping("/{studyProjectId}/leader/{newLeaderId}")
    @Operation(summary = "리더 권한 이전",
              description = "현재 리더의 권한을 다른 멤버에게 이전합니다.\n\n" +
                           "**권한:** 현재 리더만 가능\n" +
                           "**주의:** 권한 이전 후 기존 리더는 일반 멤버가 됩니다.\n\n" +
                           "**사용법:**\n" +
                           "1. Authorization 헤더에 JWT 토큰 입력 (Bearer 형식)\n" +
                           "2. JWT 토큰의 사용자가 현재 리더여야 함")
    @SecurityRequirement(name = "Bearer Authentication")
    public ResponseEntity<ApiResponse<String>> changeLeader(
            @Parameter(description = "스터디/프로젝트 ID", example = "1", required = true)
            @PathVariable Long studyProjectId,
            @Parameter(description = "새로운 리더 ID", example = "user456", required = true)
            @PathVariable String newLeaderId,
            @Parameter(description = "JWT 토큰 (Bearer 형식)", 
                      example = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                      required = true)
            @RequestHeader(name = "Authorization", required = true) String authorization) {
        try {
            // JWT 토큰에서 현재 사용자 ID 추출
            String token = authorization.replace("Bearer ", "");
            String currentLeaderId = jwtUtil.extractUserId(token);
            
            // 현재 리더 권한 확인
            if (!memberService.isLeader(studyProjectId, currentLeaderId)) {
                return ApiResponse.error(HttpStatus.FORBIDDEN, 
                    "현재 리더만 권한을 이전할 수 있습니다.", null);
            }
            
            memberService.changeLeader(studyProjectId, newLeaderId, currentLeaderId);
            return ApiResponse.success("리더 권한이 성공적으로 이전되었습니다.", "SUCCESS");
        } catch (IllegalArgumentException e) {
            return ApiResponse.error(HttpStatus.BAD_REQUEST, e.getMessage(), null);
        } catch (Exception e) {
            return ApiResponse.error(HttpStatus.INTERNAL_SERVER_ERROR, "리더 권한 이전에 실패했습니다.", null);
        }
    }

    /**
     * 스터디/프로젝트의 멤버 목록 조회
     * 특정 스터디/프로젝트의 모든 멤버 정보를 조회합니다.
     * 
     * @param studyProjectId 스터디/프로젝트 ID
     * @return 멤버 목록
     */
    @GetMapping("/{studyProjectId}")
    @Operation(summary = "멤버 목록 조회",
              description = "스터디/프로젝트의 모든 멤버 정보를 조회합니다.\n\n" +
                           "**반환 정보:**\n" +
                           "• 멤버 ID, 사용자 ID\n" +
                           "• 멤버 타입 (리더/일반 멤버)\n" +
                           "• 멤버 상태 (승인됨/탈퇴)\n" +
                           "• 가입일")
    public ResponseEntity<ApiResponse<List<MemberInfo>>> getMembers(
            @PathVariable Long studyProjectId) {
        try {
            List<MemberInfo> members = memberService.getMembersByStudyProjectId(studyProjectId);
            return ApiResponse.success("멤버 목록 조회가 성공했습니다.", members);
        } catch (Exception e) {
            return ApiResponse.error(HttpStatus.INTERNAL_SERVER_ERROR, "멤버 목록 조회에 실패했습니다.", null);
        }
    }

    /**
     * 스터디/프로젝트의 현재 인원수 조회
     * 특정 스터디/프로젝트의 현재 인원수를 조회합니다.
     * 
     * @param studyProjectId 스터디/프로젝트 ID
     * @return 현재 인원수
     */
    @GetMapping("/{studyProjectId}/count")
    @Operation(summary = "현재 인원수 조회",
              description = "스터디/프로젝트의 현재 인원수를 조회합니다.\n\n" +
                           "**참고:** approved 상태인 멤버만 카운트됩니다.")
    public ResponseEntity<ApiResponse<Integer>> getCurrentMemberCount(
            @PathVariable Long studyProjectId) {
        try {
            int count = memberService.getCurrentMemberCount(studyProjectId);
            return ApiResponse.success("인원수 조회가 성공했습니다.", count);
        } catch (Exception e) {
            return ApiResponse.error(HttpStatus.INTERNAL_SERVER_ERROR, "인원수 조회에 실패했습니다.", null);
        }
    }

    /**
     * 본인 탈퇴 처리 (member_id 기준)
     * 해당 멤버가 스스로 자신의 상태를 withdraw로 변경합니다.
     *
     * @param memberId 멤버 ID (study_project_member.member_id)
     * @param authorization JWT 토큰 (Bearer)
     */
    @PatchMapping("/{memberId}/withdraw")
    @Operation(summary = "멤버 본인 탈퇴",
              description = "member_id 기준으로 본인이 자신의 상태를 withdraw로 변경합니다. 리더 권한 불필요, 본인만 가능")
    @SecurityRequirement(name = "Bearer Authentication")
    public ResponseEntity<ApiResponse<String>> withdrawSelf(
            @Parameter(description = "멤버 ID", example = "123", required = true)
            @PathVariable Long memberId,
            @Parameter(description = "JWT 토큰 (Bearer 형식)", required = true)
            @RequestHeader(name = "Authorization", required = true) String authorization) {
        try {
            String token = authorization.replace("Bearer ", "");
            String requesterUserId = jwtUtil.extractUserId(token);

            memberService.withdrawSelfByMemberId(memberId, requesterUserId);
            return ApiResponse.success("탈퇴가 완료되었습니다.", "withdraw");
        } catch (IllegalArgumentException e) {
            return ApiResponse.error(HttpStatus.BAD_REQUEST, e.getMessage(), null);
        } catch (Exception e) {
            return ApiResponse.error(HttpStatus.INTERNAL_SERVER_ERROR, "탈퇴 처리 중 오류가 발생했습니다.", null);
        }
    }

    /**
     * user_id와 study_project_id로 멤버 상태 조회
     * 멤버가 존재하면 DB의 study_project_check 값을, 없으면 "free"를 반환합니다.
     */
    // @GetMapping("/status")
    // @Operation(summary = "멤버 상태 조회 (없으면 free)",
    //           description = "userId와 studyProjectId로 멤버 상태를 조회합니다. 존재하지 않으면 free를 반환합니다.")
    // public ResponseEntity<ApiResponse<String>> getMemberStatusOrFree(
    //         @Parameter(description = "사용자 ID", example = "user123", required = true)
    //         @RequestParam String userId,
    //         @Parameter(description = "스터디/프로젝트 ID", example = "1", required = true)
    //         @RequestParam Long studyProjectId) {
    //     try {
    //         String status = memberService.getMemberStatusOrFree(userId, studyProjectId);
    //         return ApiResponse.success("멤버 상태 조회 성공", status);
    //     } catch (Exception e) {
    //         return ApiResponse.error(HttpStatus.INTERNAL_SERVER_ERROR, "멤버 상태 조회 중 오류가 발생했습니다.", null);
    //     }
    // }

    /**
     * 내 멤버 상태 조회 (JWT 기반)
     * Authorization 헤더의 JWT에서 user_id를 추출하여 멤버 상태를 조회합니다.
     * 멤버가 존재하면 study_project_check, 없으면 "free" 반환.
     */
    @GetMapping("/my-status")
    @Operation(summary = "내 멤버 상태 조회 (JWT)",
              description = "JWT에서 user_id를 추출하여 studyProjectId에 대한 멤버 상태를 반환합니다. 존재하지 않으면 free 반환")
    @SecurityRequirement(name = "Bearer Authentication")
    public ResponseEntity<ApiResponse<String>> getMyMemberStatus(
            @Parameter(description = "스터디/프로젝트 ID", example = "1", required = true)
            @RequestParam Long studyProjectId,
            @Parameter(description = "JWT 토큰 (Bearer 형식)", required = true)
            @RequestHeader(name = "Authorization", required = true) String authorization) {
        try {
            String token = authorization.replace("Bearer ", "");
            String userId = jwtUtil.extractUserId(token);
            String status = memberService.getMemberStatusOrFree(userId, studyProjectId);
            return ApiResponse.success("내 멤버 상태 조회 성공", status);
        } catch (Exception e) {
            return ApiResponse.error(HttpStatus.INTERNAL_SERVER_ERROR, "멤버 상태 조회 중 오류가 발생했습니다.", null);
        }
    }
}
