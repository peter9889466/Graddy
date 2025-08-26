package com.smhrd.graddy.user.controller;

import com.smhrd.graddy.api.dto.ApiResponse;
import com.smhrd.graddy.user.dto.PasswordFindRequest;
import com.smhrd.graddy.user.dto.PasswordResetRequest;
import com.smhrd.graddy.user.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * 비밀번호 찾기 컨트롤러
 * 로그인하지 않은 사용자를 위한 비밀번호 찾기 API
 */
@Tag(name = "Password Find", description = "비밀번호 찾기 API (로그인 불필요)")
@RestController
@RequestMapping("/password-find")
@RequiredArgsConstructor
public class PasswordFindController {

    private final UserService userService;

    /**
     * 비밀번호 찾기 1단계: 사용자 존재 여부 확인
     * @param request 아이디와 전화번호
     * @return 사용자 존재 여부
     */
    @Operation(summary = "비밀번호 찾기 1단계", description = "아이디와 전화번호로 사용자 존재 여부를 확인합니다.")
    @PostMapping("/verify-user")
    public ResponseEntity<ApiResponse<Boolean>> verifyUserForPasswordFind(
            @Parameter(description = "아이디와 전화번호 정보")
            @RequestBody PasswordFindRequest request) {
        try {
            boolean isValid = userService.verifyUserForPasswordFind(request.getUserId(), request.getTel());
            
            if (isValid) {
                return ApiResponse.success("사용자 확인 성공", true);
            } else {
                return ApiResponse.error(HttpStatus.BAD_REQUEST, "아이디 또는 전화번호가 일치하지 않습니다.", false);
            }
        } catch (Exception e) {
            return ApiResponse.error(HttpStatus.INTERNAL_SERVER_ERROR, "사용자 확인 중 오류가 발생했습니다.", false);
        }
    }

    /**
     * 비밀번호 찾기 3단계: 비밀번호 변경
     * @param request 아이디와 새 비밀번호
     * @return 비밀번호 변경 결과
     */
    @Operation(summary = "비밀번호 찾기 3단계", description = "새로운 비밀번호로 변경합니다.")
    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<String>> resetPassword(
            @Parameter(description = "아이디와 새 비밀번호 정보")
            @RequestBody PasswordResetRequest request) {
        try {
            userService.resetPassword(request.getUserId(), request.getNewPassword());
            return ApiResponse.success("비밀번호 변경 성공", "비밀번호가 성공적으로 변경되었습니다.");
        } catch (Exception e) {
            return ApiResponse.error(HttpStatus.BAD_REQUEST, e.getMessage(), null);
        }
    }
}
