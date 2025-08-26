package com.smhrd.graddy.auth.controller;

import com.smhrd.graddy.api.dto.ApiResponse;
import com.smhrd.graddy.auth.dto.UnifiedPhoneVerificationRequest;
import com.smhrd.graddy.auth.dto.UnifiedPhoneVerificationResponse;
import com.smhrd.graddy.user.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * 통합 전화번호 인증 컨트롤러
 * 회원가입 시 전화번호 중복 확인과 SMS 인증을 동시에 처리
 */
@Tag(name = "전화번호 중복, 인증 처리", description = "통합 전화번호 인증 API")
@RestController
@RequestMapping("/api/phone-verification")
@RequiredArgsConstructor
public class UnifiedPhoneVerificationController {

    private final UserService userService;

    /**
     * 통합 전화번호 인증
     * @param request 전화번호와 사용 목적
     * @return 전화번호 사용 가능 여부와 SMS 발송 결과
     */
    @Operation(summary = "통합 전화번호 인증", description = "전화번호 중복 확인과 SMS 인증을 동시에 처리합니다.")
    @PostMapping("/unified")
    public ResponseEntity<ApiResponse<UnifiedPhoneVerificationResponse>> unifiedPhoneVerification(
            @Parameter(description = "전화번호와 사용 목적 정보")
            @RequestBody UnifiedPhoneVerificationRequest request) {
        try {
            UnifiedPhoneVerificationResponse response = userService.unifiedPhoneVerification(
                request.getTel(), request.getPurpose()
            );
            
            if (response.isSmsSent()) {
                return ApiResponse.success("전화번호 인증 처리 완료", response);
            } else {
                return ApiResponse.error(HttpStatus.BAD_REQUEST, response.getMessage(), response);
            }
        } catch (Exception e) {
            return ApiResponse.error(HttpStatus.INTERNAL_SERVER_ERROR, 
                "전화번호 인증 처리 중 오류가 발생했습니다: " + e.getMessage(), null);
        }
    }
}
