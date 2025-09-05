package com.smhrd.graddy.user.controller;


import com.smhrd.graddy.api.dto.ApiResponse;
import com.smhrd.graddy.user.dto.JoinRequest;
import com.smhrd.graddy.user.dto.FindIdRequest;


import com.smhrd.graddy.user.dto.UserInterestsUpdateRequest;
import com.smhrd.graddy.user.dto.UserProfileUpdateRequest;
import com.smhrd.graddy.user.dto.UserProfileUpdateResponse;
import com.smhrd.graddy.user.dto.MyPageResponse;
import com.smhrd.graddy.user.dto.StudyProjectListResponse;
import com.smhrd.graddy.user.dto.UserGitInfoUpdateRequest;
import com.smhrd.graddy.user.dto.UserGitInfoUpdateResponse;
import com.smhrd.graddy.user.entity.User;
import com.smhrd.graddy.user.service.UserService;
import com.smhrd.graddy.security.jwt.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.Map;
import java.util.HashMap;
import com.smhrd.graddy.user.entity.UserInterest;
import java.util.List;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;

@RestController
@RequiredArgsConstructor
@Tag(name = "유저 관리", description = "사용자 관리 API")
public class UserController {
    private final UserService userService;
    private final JwtUtil jwtUtil;

    @Operation(
        summary = "아이디 중복 확인",
        description = "사용자가 입력한 아이디의 사용 가능 여부를 확인합니다."
    )
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "200", 
            description = "사용 가능한 아이디",
            content = @Content(schema = @Schema(implementation = Map.class))
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "409", 
            description = "이미 사용 중인 아이디",
            content = @Content(schema = @Schema(implementation = Map.class))
        )
    })
    @GetMapping("/join/check-userId")
    public ResponseEntity<ApiResponse<Map<String, Boolean>>> checkUserId(
        @Parameter(description = "확인할 아이디", example = "user123") 
        @RequestParam("userId") String userId) {
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

    @Operation(
        summary = "닉네임 중복 확인",
        description = "사용자가 입력한 닉네임의 사용 가능 여부를 확인합니다."
    )
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "200", 
            description = "사용 가능한 닉네임",
            content = @Content(schema = @Schema(implementation = Map.class))
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "409", 
            description = "이미 사용 중인 닉네임",
            content = @Content(schema = @Schema(implementation = Map.class))
        )
    })
    @GetMapping("/join/check-nick")
    public ResponseEntity<ApiResponse<Map<String, Boolean>>> checkNick(
        @Parameter(description = "확인할 닉네임", example = "닉네임") 
        @RequestParam("nick") String nick) {
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

    @Operation(
        summary = "아이디 찾기",
        description = "이름과 전화번호를 입력하여 사용자 아이디를 찾습니다."
    )
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "200", 
            description = "아이디 찾기 성공",
            content = @Content(schema = @Schema(implementation = Map.class))
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "404", 
            description = "사용자를 찾을 수 없음",
            content = @Content(schema = @Schema(implementation = Map.class))
        )
    })
    @PostMapping("/find-id")
    public ResponseEntity<ApiResponse<Map<String, String>>> findUserId(
        @Parameter(description = "아이디 찾기 요청 정보") 
        @RequestBody FindIdRequest request) {
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

    @Operation(
        summary = "회원가입",
        description = "새로운 사용자를 등록합니다. 아이디, 닉네임 중복 시 409 Conflict를 반환합니다."
    )
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "201", 
            description = "회원가입 성공",
            content = @Content(schema = @Schema(implementation = JoinResponse.class))
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "400", 
            description = "잘못된 요청 (가능한 요일 미선택 등)",
            content = @Content(schema = @Schema(implementation = Map.class))
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "409", 
            description = "아이디 또는 닉네임 중복",
            content = @Content(schema = @Schema(implementation = Map.class))
        )
    })
    @PostMapping("/join")
    public ResponseEntity<ApiResponse<JoinResponse>> join(
        @Parameter(description = "회원가입 요청 정보") 
        @RequestBody JoinRequest request) {
        try {
            // 사용자 가능 요일 유효성 검사
            if (request.getAvailableDays() == null || request.getAvailableDays().isEmpty()) {
                return ApiResponse.error(HttpStatus.BAD_REQUEST, "가능한 요일을 최소 1개 이상 선택해주세요.", null);
            }
            
            // 요일 값이 1~7 범위인지 검사
            for (Integer dayId : request.getAvailableDays()) {
                if (dayId == null || dayId < 1 || dayId > 7) {
                    return ApiResponse.error(HttpStatus.BAD_REQUEST, "요일은 1(일요일)부터 7(토요일) 사이의 값이어야 합니다.", null);
                }
            }
            
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





    @Operation(
        summary = "사용자 관심분야 수정",
        description = "현재 로그인한 사용자의 관심분야를 수정합니다. JWT 토큰이 필요합니다."
    )
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "200", 
            description = "관심분야 수정 성공",
            content = @Content(schema = @Schema(implementation = Map.class))
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "400", 
            description = "잘못된 요청",
            content = @Content(schema = @Schema(implementation = Map.class))
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "401", 
            description = "인증 실패",
            content = @Content(schema = @Schema(implementation = Map.class))
        )
    })
    @PutMapping("/me/interests")
    public ResponseEntity<ApiResponse<Map<String, Object>>> updateUserInterests(
        @Parameter(description = "관심분야 수정 요청 정보") 
        @RequestBody UserInterestsUpdateRequest request,
        @Parameter(description = "JWT 토큰", example = "Bearer eyJhbGciOiJIUzI1NiJ9...") 
        @RequestHeader("Authorization") String authorizationHeader) {
        try {
            // 디버깅용 로그
            System.out.println("=== 관심분야 수정 디버깅 정보 ===");
            System.out.println("Authorization Header: " + authorizationHeader);
            
            // JWT 토큰에서 현재 사용자 아이디 추출
            String token = authorizationHeader.replace("Bearer ", "");
            System.out.println("Extracted Token: " + token);
            
            String currentUserId = jwtUtil.extractUserId(token);
            System.out.println("Current User ID: " + currentUserId);
            System.out.println("New Interests Count: " + (request.getInterests() != null ? request.getInterests().size() : 0));
            System.out.println("==================");
            
            // UserService를 통해 관심분야 수정 처리
            List<UserInterest> updatedInterests = userService.updateUserInterests(
                    currentUserId, 
                    request.getInterests()
            );
            
            // 성공 응답 데이터 생성 - 수정된 관심분야 정보 포함
            Map<String, Object> data = Map.of(
                "interests", updatedInterests.stream()
                    .map(interest -> Map.of(
                        "interestId", interest.getId().getInterestId(),
                        "interestName", interest.getInterest().getInterestName(),
                        "interestLevel", interest.getInterestLevel()
                    ))
                    .toList()
            );
            return ApiResponse.success("관심분야가 성공적으로 수정되었습니다.", data);
            
        } catch (IllegalArgumentException e) {
            // 예외 발생 시 400 Bad Request 응답
            System.out.println("IllegalArgumentException: " + e.getMessage());
            return ApiResponse.error(HttpStatus.BAD_REQUEST, e.getMessage(), null);
        } catch (Exception e) {
            // JWT 토큰 관련 오류 등 기타 예외 발생 시 401 Unauthorized 응답
            System.out.println("Exception: " + e.getMessage());
            e.printStackTrace();
            return ApiResponse.error(HttpStatus.UNAUTHORIZED, "인증에 실패했습니다: " + e.getMessage(), null);
        }
    }

    @Operation(
        summary = "회원 정보 수정",
        description = "현재 로그인한 사용자의 비밀번호, 닉네임, 전화번호를 수정합니다. 비어있는 값은 이전 값을 유지합니다. 현재 비밀번호 확인 없이 바로 수정됩니다."
    )
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "200", 
            description = "회원 정보 수정 성공",
            content = @Content(schema = @Schema(implementation = UserProfileUpdateResponse.class))
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "400", 
            description = "잘못된 요청 (닉네임 중복 등)",
            content = @Content(schema = @Schema(implementation = Map.class))
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "401", 
            description = "인증 실패",
            content = @Content(schema = @Schema(implementation = Map.class))
        )
    })
    @PutMapping("/me/profile")
    public ResponseEntity<ApiResponse<UserProfileUpdateResponse>> updateProfile(
        @Parameter(description = "회원 정보 수정 요청 정보") 
        @RequestBody UserProfileUpdateRequest request,
        @Parameter(description = "JWT 토큰", example = "Bearer eyJhbGciOiJIUzI1NiJ9...") 
        @RequestHeader("Authorization") String authorizationHeader) {
        try {
            // JWT 토큰에서 현재 사용자 아이디 추출
            String token = authorizationHeader.replace("Bearer ", "");
            String currentUserId = jwtUtil.extractUserId(token);
            
            // UserService를 통해 회원 정보 수정 처리
            User updatedUser = userService.updateUserProfile(currentUserId, request);
            
            // 수정된 필드들을 응답에 포함
            Map<String, String> updatedFields = new HashMap<>();
            if (request.hasNewPassword()) {
                updatedFields.put("password", "수정됨");
            }
            if (request.hasNewNickname()) {
                updatedFields.put("nickname", updatedUser.getNick());
            }
            if (request.hasNewTel()) {
                updatedFields.put("tel", updatedUser.getTel());
            }
            
            // 성공 응답 데이터 생성
            UserProfileUpdateResponse data = new UserProfileUpdateResponse(
                "회원 정보가 성공적으로 수정되었습니다.", 
                updatedFields
            );
            
            return ApiResponse.success("회원 정보 수정이 완료되었습니다.", data);
            
        } catch (IllegalArgumentException e) {
            // 예외 발생 시 400 Bad Request 응답
            return ApiResponse.error(HttpStatus.BAD_REQUEST, e.getMessage(), null);
        } catch (Exception e) {
            // JWT 토큰 관련 오류 등 기타 예외 발생 시 401 Unauthorized 응답
            return ApiResponse.error(HttpStatus.UNAUTHORIZED, "인증에 실패했습니다: " + e.getMessage(), null);
        }
    }

    @Operation(
        summary = "회원탈퇴",
        description = "현재 로그인한 사용자의 계정을 삭제합니다. 프론트엔드에서 확인 처리를 하므로 즉시 삭제됩니다."
    )
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "200", 
            description = "회원탈퇴 성공",
            content = @Content(schema = @Schema(implementation = Map.class))
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "400", 
            description = "잘못된 요청 (확인 메시지 불일치 등)",
            content = @Content(schema = @Schema(implementation = Map.class))
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "401", 
            description = "인증 실패",
            content = @Content(schema = @Schema(implementation = Map.class))
        )
    })
    @DeleteMapping("/me/withdraw")
    public ResponseEntity<ApiResponse<Map<String, String>>> withdrawUser(
        @Parameter(description = "JWT 토큰", example = "Bearer eyJhbGciOiJIUzI1NiJ9...") 
        @RequestHeader("Authorization") String authorizationHeader) {
        try {
            // JWT 토큰에서 현재 사용자 아이디 추출
            String token = authorizationHeader.replace("Bearer ", "");
            String currentUserId = jwtUtil.extractUserId(token);
            
            // UserService를 통해 회원탈퇴 처리
            User deletedUser = userService.withdrawUser(currentUserId);
            
            // 성공 응답 데이터 생성
            Map<String, String> data = Map.of(
                "message", "회원탈퇴가 완료되었습니다.",
                "deletedUserId", deletedUser.getUserId(),
                "note", "관련 데이터는 CASCADE 설정에 따라 자동 삭제되었으며, 댓글은 남겨집니다."
            );
            
            return ApiResponse.success("회원탈퇴가 성공적으로 처리되었습니다.", data);
            
        } catch (IllegalArgumentException e) {
            // 예외 발생 시 400 Bad Request 응답
            return ApiResponse.error(HttpStatus.BAD_REQUEST, e.getMessage(), null);
        } catch (Exception e) {
            // JWT 토큰 관련 오류 등 기타 예외 발생 시 401 Unauthorized 응답
            return ApiResponse.error(HttpStatus.UNAUTHORIZED, "인증에 실패했습니다: " + e.getMessage(), null);
        }
    }

    @Operation(
        summary = "마이페이지 조회",
        description = "현재 로그인한 사용자의 마이페이지 정보를 조회합니다. 닉네임, 깃허브 URL, 사용자 점수, 관심분야, 추천인 정보를 포함합니다."
    )
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "200", 
            description = "마이페이지 정보 조회 성공",
            content = @Content(schema = @Schema(implementation = MyPageResponse.class))
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "400", 
            description = "잘못된 요청 (사용자를 찾을 수 없음)",
            content = @Content(schema = @Schema(implementation = Map.class))
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "401", 
            description = "인증 실패",
            content = @Content(schema = @Schema(implementation = Map.class))
        )
    })
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<MyPageResponse>> getMyPageInfo(
        @Parameter(description = "JWT 토큰", example = "Bearer eyJhbGciOiJIUzI1NiJ9...") 
        @RequestHeader("Authorization") String authorizationHeader) {
        try {
            // JWT 토큰에서 현재 사용자 아이디 추출
            String token = authorizationHeader.replace("Bearer ", "");
            String currentUserId = jwtUtil.extractUserId(token);
            
            // UserService를 통해 마이페이지 정보 조회
            MyPageResponse myPageInfo = userService.getMyPageInfo(currentUserId);
            
            return ApiResponse.success("마이페이지 정보 조회가 완료되었습니다.", myPageInfo);
            
        } catch (IllegalArgumentException e) {
            // 예외 발생 시 400 Bad Request 응답
            return ApiResponse.error(HttpStatus.BAD_REQUEST, e.getMessage(), null);
        } catch (Exception e) {
            // JWT 토큰 관련 오류 등 기타 예외 발생 시 401 Unauthorized 응답
            return ApiResponse.error(HttpStatus.UNAUTHORIZED, "인증에 실패했습니다: " + e.getMessage(), null);
        }
    }

    @Operation(
        summary = "회원 정보 수정 페이지 데이터 조회",
        description = "현재 로그인한 사용자의 회원 정보 수정 페이지에 필요한 기본 정보(이름, 아이디, 전화번호, 닉네임)를 조회합니다."
    )
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "200", 
            description = "회원 정보 수정 페이지 데이터 조회 성공",
            content = @Content(schema = @Schema(implementation = Map.class))
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "400", 
            description = "잘못된 요청 (사용자를 찾을 수 없음)",
            content = @Content(schema = @Schema(implementation = Map.class))
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "401", 
            description = "인증 실패",
            content = @Content(schema = @Schema(implementation = Map.class))
        )
    })
    @GetMapping("/me/update")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getUpdatePageInfo(
        @Parameter(description = "JWT 토큰", example = "Bearer eyJhbGciOiJIUzI1NiJ9...") 
        @RequestHeader("Authorization") String authorizationHeader) {
        try {
            // JWT 토큰에서 현재 사용자 아이디 추출
            String token = authorizationHeader.replace("Bearer ", "");
            String currentUserId = jwtUtil.extractUserId(token);
            
            // UserService를 통해 회원 정보 수정 페이지 데이터 조회
            Map<String, Object> updatePageInfo = userService.getUpdatePageInfo(currentUserId);
            
            return ApiResponse.success("회원 정보 수정 페이지 데이터 조회가 완료되었습니다.", updatePageInfo);
            
        } catch (IllegalArgumentException e) {
            // 예외 발생 시 400 Bad Request 응답
            return ApiResponse.error(HttpStatus.BAD_REQUEST, e.getMessage(), null);
        } catch (Exception e) {
            // JWT 토큰 관련 오류 등 기타 예외 발생 시 401 Unauthorized 응답
            return ApiResponse.error(HttpStatus.UNAUTHORIZED, "인증에 실패했습니다: " + e.getMessage(), null);
        }
    }

    @Operation(
        summary = "스터디/프로젝트 목록 조회",
        description = "현재 로그인한 사용자가 참여한 스터디/프로젝트 목록을 조회합니다. 상태별 필터링이 가능합니다."
    )
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "200", 
            description = "스터디/프로젝트 목록 조회 성공",
            content = @Content(schema = @Schema(implementation = StudyProjectListResponse.class))
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "400", 
            description = "잘못된 요청",
            content = @Content(schema = @Schema(implementation = Map.class))
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "401", 
            description = "인증 실패",
            content = @Content(schema = @Schema(implementation = Map.class))
        )
    })
    @GetMapping("/me/study-projects")
    public ResponseEntity<ApiResponse<List<StudyProjectListResponse>>> getStudyProjectList(
        @Parameter(description = "필터링할 상태 (ALL, RECRUITING, COMPLETE, END)", example = "ALL") 
        @RequestParam(value = "status", defaultValue = "ALL") String status,
        @Parameter(description = "JWT 토큰", example = "Bearer eyJhbGciOiJIUzI1NiJ9...") 
        @RequestHeader("Authorization") String authorizationHeader) {
        try {
            // JWT 토큰에서 현재 사용자 아이디 추출
            String token = authorizationHeader.replace("Bearer ", "");
            String currentUserId = jwtUtil.extractUserId(token);
            
            // UserService를 통해 스터디/프로젝트 목록 조회
            List<StudyProjectListResponse> studyProjectList = userService.getStudyProjectList(currentUserId, status);
            
            return ApiResponse.success("스터디/프로젝트 목록 조회가 완료되었습니다.", studyProjectList);
            
        } catch (IllegalArgumentException e) {
            // 예외 발생 시 400 Bad Request 응답
            return ApiResponse.error(HttpStatus.BAD_REQUEST, e.getMessage(), null);
        } catch (Exception e) {
            // JWT 토큰 관련 오류 등 기타 예외 발생 시 401 Unauthorized 응답
            return ApiResponse.error(HttpStatus.UNAUTHORIZED, "인증에 실패했습니다: " + e.getMessage(), null);
        }
    }

    @Operation(
        summary = "Git 정보 수정",
        description = "현재 로그인한 사용자의 Git URL과 추천인 정보를 수정합니다. 비어있는 값은 이전 값을 유지합니다."
    )
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "200", 
            description = "Git 정보 수정 성공",
            content = @Content(schema = @Schema(implementation = UserGitInfoUpdateResponse.class))
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "400", 
            description = "잘못된 요청",
            content = @Content(schema = @Schema(implementation = Map.class))
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "401", 
            description = "인증 실패",
            content = @Content(schema = @Schema(implementation = Map.class))
        )
    })
    @PutMapping("/me/git-info")
    public ResponseEntity<ApiResponse<UserGitInfoUpdateResponse>> updateGitInfo(
        @Parameter(description = "Git 정보 수정 요청 정보") 
        @RequestBody UserGitInfoUpdateRequest request,
        @Parameter(description = "JWT 토큰", example = "Bearer eyJhbGciOiJIUzI1NiJ9...") 
        @RequestHeader("Authorization") String authorizationHeader) {
        try {
            // JWT 토큰에서 현재 사용자 아이디 추출
            String token = authorizationHeader.replace("Bearer ", "");
            String currentUserId = jwtUtil.extractUserId(token);
            
            // UserService를 통해 Git 정보 수정 처리
            User updatedUser = userService.updateUserGitInfo(currentUserId, request);
            
            // 수정된 필드들을 응답에 포함
            Map<String, String> updatedFields = new HashMap<>();
            if (request.hasNewGitUrl()) {
                updatedFields.put("gitUrl", updatedUser.getGitUrl());
            }
            if (request.hasNewUserRefer()) {
                updatedFields.put("userRefer", updatedUser.getUserRefer());
            }
            
            // 성공 응답 데이터 생성
            UserGitInfoUpdateResponse data = new UserGitInfoUpdateResponse(
                "Git 정보가 성공적으로 수정되었습니다.", 
                updatedFields
            );
            
            return ApiResponse.success("Git 정보 수정이 완료되었습니다.", data);
            
        } catch (IllegalArgumentException e) {
            // 예외 발생 시 400 Bad Request 응답
            return ApiResponse.error(HttpStatus.BAD_REQUEST, e.getMessage(), null);
        } catch (Exception e) {
            // JWT 토큰 관련 오류 등 기타 예외 발생 시 401 Unauthorized 응답
            return ApiResponse.error(HttpStatus.UNAUTHORIZED, "인증에 실패했습니다: " + e.getMessage(), null);
        }
    }

}
