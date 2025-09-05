package com.smhrd.graddy.comment.controller;

import com.smhrd.graddy.api.dto.ApiResponse;
import com.smhrd.graddy.comment.dto.CommentRequest;
import com.smhrd.graddy.comment.dto.CommentResponse;
import com.smhrd.graddy.comment.service.CommentService;
import com.smhrd.graddy.security.jwt.JwtUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 댓글 컨트롤러
 * 과제, 자유게시판, 스터디게시판에서 모두 사용
 * 
 * 보안: JWT 토큰을 통해 userId를 자동으로 추출하여 클라이언트가 임의로 설정할 수 없도록 함
 */
@RestController
@RequestMapping("/api/comments")
@RequiredArgsConstructor
@Tag(name = "댓글 관리", description = "댓글 CRUD API")
@Slf4j
public class CommentController {

    private final CommentService commentService;
    private final JwtUtil jwtUtil;

    // ==================== 과제 댓글 ====================

    @Operation(
        summary = "과제 댓글 작성",
        description = "과제에 댓글을 작성합니다. JWT 토큰에서 사용자 ID를 자동으로 추출하고, 해당 스터디의 멤버인지 검증합니다."
    )
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "201", 
            description = "댓글 작성 성공",
            content = @Content(schema = @Schema(implementation = CommentResponse.class))
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "400", 
            description = "잘못된 요청",
            content = @Content(schema = @Schema(implementation = String.class))
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "401", 
            description = "인증 실패 또는 스터디 멤버가 아님",
            content = @Content(schema = @Schema(implementation = String.class))
        )
    })
    @PostMapping("/assignments/{assignmentId}")
    public ResponseEntity<ApiResponse<CommentResponse>> createAssignmentComment(
        @Parameter(description = "과제 ID") 
        @PathVariable Long assignmentId,
        @Parameter(description = "댓글 요청 정보") 
        @RequestBody CommentRequest request,
        @Parameter(description = "JWT 토큰", example = "Bearer eyJhbGciOiJIUzI1NiJ9...")
        @RequestHeader("Authorization") String authorization) {
        
        try {
            // JWT 토큰에서 userId 추출
            String token = authorization.replace("Bearer ", "");
            String userId = jwtUtil.extractUserId(token);
            
            CommentResponse comment = commentService.createAssignmentComment(userId, assignmentId, request);
            return ApiResponse.created(null, "과제 댓글이 성공적으로 작성되었습니다.", comment);
        } catch (IllegalArgumentException e) {
            // 멤버십 검증 실패 또는 권한 없음
            log.warn("과제 댓글 작성 실패 (권한 없음): assignmentId={}, error={}", assignmentId, e.getMessage());
            return ApiResponse.error(HttpStatus.UNAUTHORIZED, e.getMessage(), null);
        } catch (Exception e) {
            log.error("과제 댓글 작성 중 오류 발생: assignmentId={}", assignmentId, e);
            return ApiResponse.error(HttpStatus.BAD_REQUEST, e.getMessage(), null);
        }
    }

    @Operation(
        summary = "과제 댓글 목록 조회",
        description = "과제의 댓글 목록을 조회합니다. (닉네임, 작성일, 내용 포함)"
    )
    @GetMapping("/assignments/{assignmentId}")
    public ResponseEntity<ApiResponse<List<CommentResponse>>> getAssignmentComments(
        @Parameter(description = "과제 ID") 
        @PathVariable Long assignmentId) {
        
        try {
            List<CommentResponse> comments = commentService.getAssignmentComments(assignmentId);
            return ApiResponse.success("과제 댓글 목록 조회가 완료되었습니다.", comments);
        } catch (Exception e) {
            return ApiResponse.error(HttpStatus.BAD_REQUEST, e.getMessage(), null);
        }
    }

    // ==================== 자유게시판 댓글 ====================

    @Operation(
        summary = "자유게시판 댓글 작성",
        description = "자유게시판에 댓글을 작성합니다. JWT 토큰에서 사용자 ID를 자동으로 추출합니다."
    )
    @PostMapping("/free-posts/{frPostId}")
    public ResponseEntity<ApiResponse<CommentResponse>> createFreePostComment(
        @Parameter(description = "자유게시판 ID") 
        @PathVariable Long frPostId,
        @Parameter(description = "댓글 요청 정보") 
        @RequestBody CommentRequest request,
        @Parameter(description = "JWT 토큰", example = "Bearer eyJhbGciOiJIUzI1NiJ9...")
        @RequestHeader("Authorization") String authorization) {
        
        try {
            // JWT 토큰에서 userId 추출
            String token = authorization.replace("Bearer ", "");
            String userId = jwtUtil.extractUserId(token);
            
            CommentResponse comment = commentService.createFreePostComment(userId, frPostId, request);
            return ApiResponse.created(null, "자유게시판 댓글이 성공적으로 작성되었습니다.", comment);
        } catch (Exception e) {
            log.error("자유게시판 댓글 작성 중 오류 발생: frPostId={}", frPostId, e);
            return ApiResponse.error(HttpStatus.BAD_REQUEST, e.getMessage(), null);
        }
    }

    @Operation(
        summary = "자유게시판 댓글 목록 조회",
        description = "자유게시판의 댓글 목록을 조회합니다. (닉네임, 작성일, 내용 포함)"
    )
    @GetMapping("/free-posts/{frPostId}")
    public ResponseEntity<ApiResponse<List<CommentResponse>>> getFreePostComments(
        @Parameter(description = "자유게시판 ID") 
        @PathVariable Long frPostId) {
        
        try {
            List<CommentResponse> comments = commentService.getFreePostComments(frPostId);
            return ApiResponse.success("자유게시판 댓글 목록 조회가 완료되었습니다.", comments);
        } catch (Exception e) {
            return ApiResponse.error(HttpStatus.BAD_REQUEST, e.getMessage(), null);
        }
    }

    // ==================== 스터디게시판 댓글 ====================

    @Operation(
        summary = "스터디게시판 댓글 작성",
        description = "스터디게시판에 댓글을 작성합니다. JWT 토큰에서 사용자 ID를 자동으로 추출하고, 해당 스터디의 멤버인지 검증합니다."
    )
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "201", 
            description = "댓글 작성 성공",
            content = @Content(schema = @Schema(implementation = CommentResponse.class))
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "400", 
            description = "잘못된 요청",
            content = @Content(schema = @Schema(implementation = String.class))
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "401", 
            description = "인증 실패 또는 스터디 멤버가 아님",
            content = @Content(schema = @Schema(implementation = String.class))
        )
    })
    @PostMapping("/study-posts/{stPrPostId}")
    public ResponseEntity<ApiResponse<CommentResponse>> createStudyPostComment(
        @Parameter(description = "스터디게시판 ID") 
        @PathVariable Long stPrPostId,
        @Parameter(description = "댓글 요청 정보") 
        @RequestBody CommentRequest request,
        @Parameter(description = "JWT 토큰", example = "Bearer eyJhbGciOiJIUzI1NiJ9...")
        @RequestHeader("Authorization") String authorization) {
        
        try {
            // JWT 토큰에서 userId 추출
            String token = authorization.replace("Bearer ", "");
            String userId = jwtUtil.extractUserId(token);
            
            CommentResponse comment = commentService.createStudyPostComment(userId, stPrPostId, request);
            return ApiResponse.created(null, "스터디게시판 댓글이 성공적으로 작성되었습니다.", comment);
        } catch (IllegalArgumentException e) {
            // 멤버십 검증 실패 또는 권한 없음
            log.warn("스터디게시판 댓글 작성 실패 (권한 없음): stPrPostId={}, error={}", stPrPostId, e.getMessage());
            return ApiResponse.error(HttpStatus.UNAUTHORIZED, e.getMessage(), null);
        } catch (Exception e) {
            log.error("스터디게시판 댓글 작성 중 오류 발생: stPrPostId={}", stPrPostId, e);
            return ApiResponse.error(HttpStatus.BAD_REQUEST, e.getMessage(), null);
        }
    }

    @Operation(
        summary = "스터디게시판 댓글 목록 조회",
        description = "스터디게시판의 댓글 목록을 조회합니다. (닉네임, 작성일, 내용 포함)"
    )
    @GetMapping("/study-posts/{stPrPostId}")
    public ResponseEntity<ApiResponse<List<CommentResponse>>> getStudyPostComments(
        @Parameter(description = "스터디게시판 ID") 
        @PathVariable Long stPrPostId) {
        
        try {
            List<CommentResponse> comments = commentService.getStudyPostComments(stPrPostId);
            return ApiResponse.success("스터디게시판 댓글 목록 조회가 완료되었습니다.", comments);
        } catch (Exception e) {
            return ApiResponse.error(HttpStatus.BAD_REQUEST, e.getMessage(), null);
        }
    }

    // ==================== 공통 댓글 기능 ====================

    @Operation(
        summary = "댓글 수정",
        description = "댓글을 수정합니다. 본인이 작성한 댓글만 수정 가능하며, 스터디 댓글인 경우 해당 스터디의 멤버여야 합니다. JWT 토큰에서 사용자 ID를 자동으로 추출합니다."
    )
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "200", 
            description = "댓글 수정 성공",
            content = @Content(schema = @Schema(implementation = CommentResponse.class))
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "400", 
            description = "잘못된 요청",
            content = @Content(schema = @Schema(implementation = String.class))
        )
        // @io.swagger.v3.oas.annotations.responses.ApiResponse(
        //     responseCode = "401", 
        //     description = "인증 실패, 권한 없음 또는 스터디 멤버가 아님",
        //     content = @Content(schema = @Schema(implementation = String.class))
        // )
    })
    @PutMapping("/{commentId}")
    public ResponseEntity<ApiResponse<CommentResponse>> updateComment(
        @Parameter(description = "댓글 ID") 
        @PathVariable Long commentId,
        @Parameter(description = "수정할 내용") 
        @RequestParam String content,
        @Parameter(description = "JWT 토큰", example = "Bearer eyJhbGciOiJIUzI1NiJ9...")
        @RequestHeader("Authorization") String authorization) {
        
        try {
            // JWT 토큰에서 userId 추출
            String token = authorization.replace("Bearer ", "");
            String userId = jwtUtil.extractUserId(token);
            
            CommentResponse comment = commentService.updateComment(commentId, userId, content);
            return ApiResponse.success("댓글이 성공적으로 수정되었습니다.", comment);
        } catch (IllegalArgumentException e) {
            // 권한 없음 또는 멤버십 검증 실패
            log.warn("댓글 수정 실패 (권한 없음): commentId={}, error={}", commentId, e.getMessage());
            return ApiResponse.error(HttpStatus.UNAUTHORIZED, e.getMessage(), null);
        } catch (Exception e) {
            log.error("댓글 수정 중 오류 발생: commentId={}", commentId, e);
            return ApiResponse.error(HttpStatus.BAD_REQUEST, e.getMessage(), null);
        }
    }

    @Operation(
        summary = "댓글 삭제",
        description = "댓글을 삭제합니다. 본인이 작성한 댓글만 삭제 가능하며, 스터디 댓글인 경우 해당 스터디의 멤버여야 합니다. JWT 토큰에서 사용자 ID를 자동으로 추출합니다."
    )
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "200", 
            description = "댓글 삭제 성공"
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "400", 
            description = "잘못된 요청",
            content = @Content(schema = @Schema(implementation = String.class))
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "401", 
            description = "인증 실패, 권한 없음 또는 스터디 멤버가 아님",
            content = @Content(schema = @Schema(implementation = String.class))
        )
    })
    @DeleteMapping("/{commentId}")
    public ResponseEntity<ApiResponse<Void>> deleteComment(
        @Parameter(description = "댓글 ID") 
        @PathVariable Long commentId,
        @Parameter(description = "JWT 토큰", example = "Bearer eyJhbGciOiJIUzI1NiJ9...")
        @RequestHeader("Authorization") String authorization) {
        
        try {
            // JWT 토큰에서 userId 추출
            String token = authorization.replace("Bearer ", "");
            String userId = jwtUtil.extractUserId(token);
            
            commentService.deleteComment(commentId, userId);
            return ApiResponse.success("댓글이 성공적으로 삭제되었습니다.", null);
        } catch (IllegalArgumentException e) {
            // 권한 없음 또는 멤버십 검증 실패
            log.warn("댓글 삭제 실패 (권한 없음): commentId={}, error={}", commentId, e.getMessage());
            return ApiResponse.error(HttpStatus.UNAUTHORIZED, e.getMessage(), null);
        } catch (Exception e) {
            log.error("댓글 삭제 중 오류 발생: commentId={}", commentId, e);
            return ApiResponse.error(HttpStatus.BAD_REQUEST, e.getMessage(), null);
        }
    }

    // ==================== 댓글 수 조회 ====================

    @Operation(
        summary = "과제 댓글 수 조회",
        description = "과제의 총 댓글 수를 조회합니다."
    )
    @GetMapping("/assignments/{assignmentId}/count")
    public ResponseEntity<ApiResponse<Long>> getAssignmentCommentCount(
        @Parameter(description = "과제 ID") 
        @PathVariable Long assignmentId) {
        
        try {
            long count = commentService.getAssignmentCommentCount(assignmentId);
            return ApiResponse.success("과제 댓글 수 조회가 완료되었습니다.", count);
        } catch (Exception e) {
            return ApiResponse.error(HttpStatus.BAD_REQUEST, e.getMessage(), null);
        }
    }

    @Operation(
        summary = "자유게시판 댓글 수 조회",
        description = "자유게시판의 총 댓글 수를 조회합니다."
    )
    @GetMapping("/free-posts/{frPostId}/count")
    public ResponseEntity<ApiResponse<Long>> getFreePostCommentCount(
        @Parameter(description = "자유게시판 ID") 
        @PathVariable Long frPostId) {
        
        try {
            long count = commentService.getFreePostCommentCount(frPostId);
            return ApiResponse.success("자유게시판 댓글 수 조회가 완료되었습니다.", count);
        } catch (Exception e) {
            return ApiResponse.error(HttpStatus.BAD_REQUEST, e.getMessage(), null);
        }
    }

    @Operation(
        summary = "스터디게시판 댓글 수 조회",
        description = "스터디게시판의 총 댓글 수를 조회합니다."
    )
    @GetMapping("/study-posts/{stPrPostId}/count")
    public ResponseEntity<ApiResponse<Long>> getStudyPostCommentCount(
        @Parameter(description = "스터디게시판 ID") 
        @PathVariable Long stPrPostId) {
        
        try {
            long count = commentService.getStudyPostCommentCount(stPrPostId);
            return ApiResponse.success("스터디게시판 댓글 수 조회가 완료되었습니다.", count);
        } catch (Exception e) {
            return ApiResponse.error(HttpStatus.BAD_REQUEST, e.getMessage(), null);
        }
    }
}
