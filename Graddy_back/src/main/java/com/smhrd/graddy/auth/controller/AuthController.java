package com.smhrd.graddy.auth.controller;

import com.smhrd.graddy.auth.VerificationService;
import com.smhrd.graddy.auth.dto.SendVerificationCodeRequest;
import com.smhrd.graddy.auth.dto.VerifyCodeRequest;
import com.smhrd.graddy.api.dto.ApiResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.responses.ApiResponses;

import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;

@RestController
@RequestMapping("/auth")
@Tag(name = "SMS 인증", description = "SMS 인증 API")
public class AuthController {
    
    private final VerificationService verificationService;
    
    public AuthController(VerificationService verificationService) {
        this.verificationService = verificationService;
    }
    
    @Operation(
        summary = "SMS 인증번호 발송",
        description = "휴대폰 번호로 6자리 인증번호를 발송합니다."
    )
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "200", 
            description = "인증번호 발송 성공",
            content = @Content(schema = @Schema(implementation = String.class))
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "400", 
            description = "인증번호 발송 실패",
            content = @Content(schema = @Schema(implementation = String.class))
        )
    })
    @PostMapping("/send-code")
    public ResponseEntity<ApiResponse<String>> sendVerificationCode(
        @Parameter(description = "인증번호 발송 요청 정보") 
        @RequestBody SendVerificationCodeRequest request) {
        try {
            verificationService.sendVerificationCode(request.getPhoneNumber());
            return ApiResponse.success("인증번호가 발송되었습니다.", "SMS 발송 완료");
        } catch (Exception e) {
            return ApiResponse.error(HttpStatus.BAD_REQUEST, "인증번호 발송에 실패했습니다: " + e.getMessage(), null);
        }
    }
    
    @Operation(
        summary = "SMS 인증번호 검증",
        description = "발송된 인증번호를 입력하여 휴대폰 인증을 완료합니다."
    )
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "200", 
            description = "인증 성공",
            content = @Content(schema = @Schema(implementation = String.class))
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "400", 
            description = "인증 실패 (인증번호 불일치 또는 만료)",
            content = @Content(schema = @Schema(implementation = String.class))
        )
    })
    @PostMapping("/verify-code")
    public ResponseEntity<ApiResponse<String>> verifyCode(
        @Parameter(description = "인증번호 검증 요청 정보") 
        @RequestBody VerifyCodeRequest request) {
        boolean isValid = verificationService.verifyCode(request.getPhoneNumber(), request.getCode());
        
        if (isValid) {
            return ApiResponse.success("인증이 완료되었습니다.", "인증 성공");
        } else {
            return ApiResponse.error(HttpStatus.BAD_REQUEST, "인증번호가 올바르지 않거나 만료되었습니다.", null);
        }
    }
}
