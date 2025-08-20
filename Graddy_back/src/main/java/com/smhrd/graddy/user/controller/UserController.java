package com.smhrd.graddy.user.controller;


import com.smhrd.graddy.api.dto.ApiResponse;
import com.smhrd.graddy.user.dto.JoinRequest;
import com.smhrd.graddy.user.dto.FindIdRequest;
import com.smhrd.graddy.user.entity.User;
import com.smhrd.graddy.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;

    /**
     * 아이디 중복 확인 API
     * 아이디 사용 가능 여부에 따라 다른 HTTP 상태 코드를 반환하도록 수정
     */
    @GetMapping("/api/join/check-userId")
    public ResponseEntity<ApiResponse<Map<String, Boolean>>> checkUserId(@RequestParam("userId") String userId) {
        boolean isAvailable = userService.isUserIdAvailable(userId);

        // 응답 데이터 생성
        Map<String, Boolean> data = Map.of("isAvailable", isAvailable);

        if (isAvailable) {
            // 사용 가능한 아이디인 경우: 200 OK 응답
            return ApiResponse.success("사용 가능한 아이디입니다.", data);
        } else {
            // 이미 사용 중인 아이디인 경우: 409 Conflict 응답
            return ApiResponse.error(HttpStatus.CONFLICT, "이미 사용 중인 아이디입니다.", data);
        }
    }

    /**
     * 닉네임 중복 확인 API
     * 닉네임 사용 가능 여부에 따라 다른 HTTP 상태 코드를 반환
     */
    @GetMapping("/api/join/check-nick")
    public ResponseEntity<ApiResponse<Map<String, Boolean>>> checkNick(@RequestParam("nick") String nick) {
        boolean isAvailable = userService.isNickAvailable(nick);

        // 응답 데이터 생성
        Map<String, Boolean> data = Map.of("isAvailable", isAvailable);

        if (isAvailable) {
            // 사용 가능한 닉네임인 경우: 200 OK 응답
            return ApiResponse.success("사용 가능한 닉네임입니다.", data);
        } else {
            // 이미 사용 중인 닉네임인 경우: 409 Conflict 응답
            return ApiResponse.error(HttpStatus.CONFLICT, "이미 사용 중인 닉네임입니다.", data);
        }
    }

    /**
     * 아이디 찾기 API
     * 이름과 전화번호로 사용자 아이디를 찾습니다.
     */
    @PostMapping("/api/find-id")
    public ResponseEntity<ApiResponse<Map<String, String>>> findUserId(@RequestBody FindIdRequest request) {
        String userId = userService.findUserIdByNameAndTel(request.getName(), request.getTel());
        
        if (userId != null) {
            // 아이디를 찾은 경우: 200 OK 응답
            Map<String, String> data = Map.of("userId", userId);
            return ApiResponse.success("아이디 찾기에 성공했습니다.", data);
        } else {
            // 아이디를 찾지 못한 경우: 404 Not Found 응답
            return ApiResponse.error(HttpStatus.NOT_FOUND, "해당 정보로 가입된 사용자를 찾을 수 없습니다.", null);
        }
    }

    // 회원가입 성공 시 응답 DTO
    public record JoinResponse(String userId) {}

    /**
     * 회원가입 API 엔드포인트
     * @param request 회원가입 요청 정보
     * @return 성공 시 201 Created, 아이디 중복 시 409 Conflict
     */
    @PostMapping("/api/join")
    public ResponseEntity<ApiResponse<JoinResponse>> join(@RequestBody JoinRequest request) {
        try {
            // 1. UserService를 통해 회원가입 처리
            User savedUser = userService.join(request);

            // 2. 성공 응답 데이터 생성
            JoinResponse data = new JoinResponse(savedUser.getUserId());
            URI location = URI.create("/api/users/" + savedUser.getUserId());

            // 3. ApiResponse의 created 정적 메서드를 사용하여 201 응답 반환
            return ApiResponse.created(location, "회원가입이 성공적으로 완료되었습니다.", data);

        } catch (IllegalArgumentException e) {
            // 4. 아이디 중복 등 예외 발생 시 ApiResponse의 error 정적 메서드를 사용하여 409 응답 반환
            // 실패 시에는 data 부분이 null이 됩니다.
            return ApiResponse.error(HttpStatus.CONFLICT, e.getMessage(), null);
        }
    }
}
