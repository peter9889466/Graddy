package com.smhrd.graddy.user.controller;

import com.smhrd.graddy.user.dto.UserInfoResponse;
import com.smhrd.graddy.user.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * 사용자 정보 조회를 위한 REST API 컨트롤러
 * 
 * 주요 기능:
 * - 사용자 ID로 사용자 정보 조회
 * - 닉네임, 이미지, 깃주소, 점수, 관심분야, 소개 정보 제공
 */
@RestController
@RequestMapping("/user")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "User Info API", description = "사용자 정보 조회 API")
public class UserInfoController {

    private final UserService userService;

    /**
     * 사용자 ID로 사용자 정보 조회
     * 
     * @param userId 사용자 ID
     * @return 사용자 정보 (닉네임, 이미지, 깃주소, 점수, 관심분야, 소개)
     */
    @GetMapping("/info/{userId}")
    @Operation(
        summary = "사용자 정보 조회",
        description = "사용자 ID로 사용자의 닉네임, 이미지, 깃주소, 점수, 관심분야, 소개 정보를 조회합니다."
    )
    public ResponseEntity<UserInfoResponse> getUserInfo(
            @Parameter(description = "사용자 ID", example = "user123")
            @PathVariable String userId) {
        
        try {
            log.info("사용자 정보 조회 요청: userId={}", userId);
            
            UserInfoResponse userInfo = userService.getUserInfo(userId);
            
            log.info("사용자 정보 조회 완료: userId={}, nick={}", userId, userInfo.getNick());
            
            return ResponseEntity.ok(userInfo);
            
        } catch (IllegalArgumentException e) {
            log.warn("사용자 정보 조회 실패: userId={}, error={}", userId, e.getMessage());
            return ResponseEntity.notFound().build();
            
        } catch (Exception e) {
            log.error("사용자 정보 조회 중 오류 발생: userId={}", userId, e);
            return ResponseEntity.internalServerError().build();
        }
    }
}
