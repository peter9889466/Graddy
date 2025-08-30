package com.smhrd.graddy.auth.controller;

import com.smhrd.graddy.auth.dto.RefreshTokenRequest;
import com.smhrd.graddy.auth.dto.RefreshTokenResponse;
import com.smhrd.graddy.auth.dto.LogoutRequest;
import com.smhrd.graddy.auth.service.AuthService;
import com.smhrd.graddy.auth.service.TokenService;
import com.smhrd.graddy.user.dto.LoginRequest;
import com.smhrd.graddy.user.dto.LoginResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Tag(name = "인증 관리", description = "사용자 인증 및 토큰 관리 API")
@Slf4j
public class AuthController {

    private final AuthService authService;
    private final TokenService tokenService;

    @Operation(
        summary = "사용자 로그인",
        description = "사용자 ID와 비밀번호로 로그인하여 Access Token과 Refresh Token을 발급합니다."
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200", 
            description = "로그인 성공",
            content = @Content(schema = @Schema(implementation = Map.class))
        ),
        @ApiResponse(
            responseCode = "401", 
            description = "아이디 또는 비밀번호 불일치",
            content = @Content(schema = @Schema(implementation = Map.class))
        ),
        @ApiResponse(
            responseCode = "500", 
            description = "서버 내부 오류",
            content = @Content(schema = @Schema(implementation = Map.class))
        )
    })
    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(
        @Parameter(description = "로그인 요청 정보", required = true) 
        @RequestBody LoginRequest request) {
        try {
            log.info("로그인 시도: userId={}", request.getUserId());
            
            // 로그인 처리 및 토큰 발급
            LoginResponse loginResponse = authService.login(request);
            
            log.info("로그인 성공: userId={}", request.getUserId());
            
            return ResponseEntity.ok(Map.of(
                "status", 200,
                "message", "로그인이 성공적으로 완료되었습니다.",
                "data", loginResponse
            ));
            
        } catch (IllegalArgumentException e) {
            log.warn("로그인 실패: userId={}, reason={}", request.getUserId(), e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of(
                    "status", 401,
                    "message", e.getMessage(),
                    "data", null
                ));
        } catch (Exception e) {
            log.error("로그인 중 오류 발생: userId={}", request.getUserId(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of(
                    "status", 500,
                    "message", "로그인 처리 중 오류가 발생했습니다.",
                    "data", null
                ));
        }
    }

    @Operation(
        summary = "Access Token 갱신",
        description = "Refresh Token을 사용하여 새로운 Access Token을 발급합니다."
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200", 
            description = "Access Token 갱신 성공",
            content = @Content(schema = @Schema(implementation = Map.class))
        ),
        @ApiResponse(
            responseCode = "400", 
            description = "잘못된 요청 (Refresh Token 누락)",
            content = @Content(schema = @Schema(implementation = Map.class))
        ),
        @ApiResponse(
            responseCode = "401", 
            description = "유효하지 않은 Refresh Token",
            content = @Content(schema = @Schema(implementation = Map.class))
        ),
        @ApiResponse(
            responseCode = "500", 
            description = "서버 내부 오류",
            content = @Content(schema = @Schema(implementation = Map.class))
        )
    })
    @PostMapping("/refresh")
    public ResponseEntity<Map<String, Object>> refreshToken(
        @Parameter(description = "Refresh Token 요청 정보", required = true) 
        @RequestBody RefreshTokenRequest request) {
        try {
            log.info("Access Token 갱신 시도: refreshToken={}", request.getRefreshToken());
            
            if (request.getRefreshToken() == null || request.getRefreshToken().trim().isEmpty()) {
                log.warn("Refresh Token이 비어있음");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of(
                        "status", 400,
                        "message", "Refresh Token이 필요합니다.",
                        "data", null
                    ));
            }
            
            // Access Token 갱신
            String newAccessToken = tokenService.refreshAccessToken(request.getRefreshToken());
            
            RefreshTokenResponse response = RefreshTokenResponse.builder()
                .accessToken(newAccessToken)
                .tokenType("Bearer")
                .expiresIn(3600L) // 1시간 (3600초)
                .build();
            
            log.info("Access Token 갱신 성공");
            
            return ResponseEntity.ok(Map.of(
                "status", 200,
                "message", "Access Token이 성공적으로 갱신되었습니다.",
                "data", response
            ));
            
        } catch (IllegalArgumentException e) {
            log.warn("Access Token 갱신 실패: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of(
                    "status", 401,
                    "message", e.getMessage(),
                    "data", null
                ));
        } catch (Exception e) {
            log.error("Access Token 갱신 중 오류 발생", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of(
                    "status", 500,
                    "message", "Access Token 갱신 중 오류가 발생했습니다.",
                    "data", null
                ));
        }
    }

    @Operation(
        summary = "사용자 로그아웃",
        description = "Refresh Token을 사용하여 사용자를 로그아웃 처리하고 DB에서 Refresh Token을 삭제합니다."
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200", 
            description = "로그아웃 성공",
            content = @Content(schema = @Schema(implementation = String.class))
        ),
        @ApiResponse(
            responseCode = "400", 
            description = "잘못된 요청 (Refresh Token 누락 또는 유효하지 않음)",
            content = @Content(schema = @Schema(implementation = String.class))
        )
    })
    @PostMapping("/logout")
    public ResponseEntity<?> logout(
        @Parameter(description = "로그아웃 요청 정보", required = true) 
        @RequestBody LogoutRequest logoutRequest) {
        try {
            // Refresh Token이 비어있는지 확인
            if (logoutRequest.getRefreshToken() == null || logoutRequest.getRefreshToken().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Refresh Token이 필요합니다.");
            }
            
            String refreshToken = logoutRequest.getRefreshToken();
            
            // 1. Refresh Token 유효성 검증
            if (!tokenService.validateRefreshToken(refreshToken)) {
                return ResponseEntity.badRequest().body("유효하지 않은 Refresh Token입니다.");
            }
            
            // 2. Refresh Token으로 userId 직접 조회 (JWT 파싱 없이)
            String userId = tokenService.getUserIdFromRefreshToken(refreshToken);
            
            if (userId == null) {
                return ResponseEntity.badRequest().body("Refresh Token에서 사용자 정보를 찾을 수 없습니다.");
            }
            
            // 3. 해당 사용자의 Refresh Token 삭제
            tokenService.deleteRefreshToken(userId);
            
            return ResponseEntity.ok("로그아웃이 성공적으로 처리되었습니다.");
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("로그아웃 처리 중 오류가 발생했습니다: " + e.getMessage());
        }
    }
}
