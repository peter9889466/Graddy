package com.smhrd.graddy.auth.controller;

import com.smhrd.graddy.api.dto.ApiResponse;
import com.smhrd.graddy.auth.VerificationCodeStore;
import com.smhrd.graddy.auth.SmsService;
import com.smhrd.graddy.auth.dto.VerifyCodeRequest;
import com.smhrd.graddy.auth.dto.SendCodeRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Random;

/**
 * SMS 인증번호 발송 및 검증 컨트롤러
 */
@Tag(name = "SMS 인증", description = "SMS 인증번호 발송 및 검증 API")
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
public class SmsVerificationController {

    private final VerificationCodeStore verificationCodeStore;
    private final SmsService smsService;
    private final Random random = new Random();

    /**
     * SMS 인증번호 발송
     * @param request 전화번호
     * @return 발송 결과
     */
    @Operation(summary = "SMS 인증번호 발송", description = "전화번호로 SMS 인증번호를 발송합니다.")
    @PostMapping("/send-code")
    public ResponseEntity<ApiResponse<String>> sendVerificationCode(
            @Parameter(description = "전화번호") @RequestBody SendCodeRequest request) {
        
        log.info("SMS 인증번호 발송 요청: phoneNumber={}", request.getPhoneNumber());
        
        try {
            // 6자리 인증번호 생성
            String verificationCode = String.format("%06d", random.nextInt(1000000));
            
            // 인증번호 저장
            verificationCodeStore.saveCode(request.getPhoneNumber(), verificationCode);
            
            // SMS 발송
            smsService.sendVerificationCode(request.getPhoneNumber(), verificationCode);
            
            log.info("SMS 인증번호 발송 성공: phoneNumber={}", request.getPhoneNumber());
            return ApiResponse.success("인증번호가 발송되었습니다.", "SUCCESS");
            
        } catch (Exception e) {
            log.error("SMS 인증번호 발송 중 오류 발생: phoneNumber={}, error={}", 
                request.getPhoneNumber(), e.getMessage());
            return ApiResponse.error(HttpStatus.INTERNAL_SERVER_ERROR, 
                "인증번호 발송 중 오류가 발생했습니다: " + e.getMessage(), null);
        }
    }

    /**
     * SMS 인증번호 검증
     * @param request 전화번호와 인증번호
     * @return 검증 결과
     */
    @Operation(summary = "SMS 인증번호 검증", description = "발송된 SMS 인증번호를 검증합니다.")
    @PostMapping("/verify-code")
    public ResponseEntity<ApiResponse<Boolean>> verifyCode(
            @Parameter(description = "전화번호와 인증번호") @RequestBody VerifyCodeRequest request) {
        
        log.info("SMS 인증번호 검증 요청: phoneNumber={}", request.getPhoneNumber());
        
        try {
            boolean verified = verificationCodeStore.verifyCode(request.getPhoneNumber(), request.getCode());
            
            if (verified) {
                return ApiResponse.success("인증번호가 확인되었습니다.", true);
            } else {
                return ApiResponse.error(HttpStatus.BAD_REQUEST, "인증번호가 일치하지 않습니다.", false);
            }
        } catch (Exception e) {
            log.error("SMS 인증번호 검증 중 오류 발생: phoneNumber={}, error={}", 
                request.getPhoneNumber(), e.getMessage());
            return ApiResponse.error(HttpStatus.INTERNAL_SERVER_ERROR, 
                "인증번호 검증 중 오류가 발생했습니다: " + e.getMessage(), false);
        }
    }
}
