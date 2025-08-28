package com.smhrd.graddy.comment.controller;

import com.smhrd.graddy.api.dto.ApiResponse;
import com.smhrd.graddy.comment.dto.CommentRequest;
import com.smhrd.graddy.comment.dto.CommentResponse;
import com.smhrd.graddy.comment.service.CommentService;
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
 */
@RestController
@RequestMapping("/api/comments")
@RequiredArgsConstructor
@Tag(name = "댓글 관리", description = "댓글 CRUD API")
@Slf4j
public class CommentController {

    private final CommentService commentService;

    // ==================== 과제 댓글 ====================

    @Operation(
        summary = "과제 댓글 작성",
        description = "과제에 댓글을 작성합니다. 대댓글도 지원합니다."
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
        )
    })
    @PostMapping("/assignments/{assignmentId}")
    public ResponseEntity<ApiResponse<CommentResponse>> createAssignmentComment(
        @Parameter(description = "과제 ID") 
        @PathVariable Long assignmentId,
        @Parameter(description = "댓글 요청 정보") 
        @RequestBody CommentRequest request,
        @Parameter(description = "멤버 ID (실제로는 JWT에서 추출)") 
        @RequestParam Long memberId) {
        
        try {
            request.setAssignmentId(assignmentId);
            CommentResponse comment = commentService.createAssignmentComment(memberId, request);
            return ApiResponse.created(null, "과제 댓글이 성공적으로 작성되었습니다.", comment);
        } catch (Exception e) {
            return ApiResponse.error(HttpStatus.BAD_REQUEST, e.getMessage(), null);
        }
    }

    @Operation(
        summary = "과제 댓글 목록 조회",
        description = "과제의 댓글 목록을 계층 구조로 조회합니다."
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
        description = "자유게시판에 댓글을 작성합니다. 대댓글도 지원합니다."
    )
    @PostMapping("/free-posts/{frPostId}")
    public ResponseEntity<ApiResponse<CommentResponse>> createFreePostComment(
        @Parameter(description = "자유게시판 ID") 
        @PathVariable Long frPostId,
        @Parameter(description = "댓글 요청 정보") 
        @RequestBody CommentRequest request,
        @Parameter(description = "멤버 ID (실제로는 JWT에서 추출)") 
        @RequestParam Long memberId) {
        
        try {
            request.setFrPostId(frPostId);
            CommentResponse comment = commentService.createFreePostComment(memberId, request);
            return ApiResponse.created(null, "자유게시판 댓글이 성공적으로 작성되었습니다.", comment);
        } catch (Exception e) {
            return ApiResponse.error(HttpStatus.BAD_REQUEST, e.getMessage(), null);
        }
    }

    @Operation(
        summary = "자유게시판 댓글 목록 조회",
        description = "자유게시판의 댓글 목록을 계층 구조로 조회합니다."
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
        description = "스터디게시판에 댓글을 작성합니다. 대댓글도 지원합니다."
    )
    @PostMapping("/study-posts/{stPrPostId}")
    public ResponseEntity<ApiResponse<CommentResponse>> createStudyPostComment(
        @Parameter(description = "스터디게시판 ID") 
        @PathVariable Long stPrPostId,
        @Parameter(description = "댓글 요청 정보") 
        @RequestBody CommentRequest request,
        @Parameter(description = "멤버 ID (실제로는 JWT에서 추출)") 
        @RequestParam Long memberId) {
        
        try {
            request.setStPrPostId(stPrPostId);
            CommentResponse comment = commentService.createStudyPostComment(memberId, request);
            return ApiResponse.created(null, "스터디게시판 댓글이 성공적으로 작성되었습니다.", comment);
        } catch (Exception e) {
            return ApiResponse.error(HttpStatus.BAD_REQUEST, e.getMessage(), null);
        }
    }

    @Operation(
        summary = "스터디게시판 댓글 목록 조회",
        description = "스터디게시판의 댓글 목록을 계층 구조로 조회합니다."
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
        description = "댓글을 수정합니다. 본인이 작성한 댓글만 수정 가능합니다."
    )
    @PutMapping("/{commentId}")
    public ResponseEntity<ApiResponse<CommentResponse>> updateComment(
        @Parameter(description = "댓글 ID") 
        @PathVariable Long commentId,
        @Parameter(description = "수정할 내용") 
        @RequestParam String content,
        @Parameter(description = "멤버 ID (실제로는 JWT에서 추출)") 
        @RequestParam Long memberId) {
        
        try {
            CommentResponse comment = commentService.updateComment(commentId, memberId, content);
            return ApiResponse.success("댓글이 성공적으로 수정되었습니다.", comment);
        } catch (Exception e) {
            return ApiResponse.error(HttpStatus.BAD_REQUEST, e.getMessage(), null);
        }
    }

    @Operation(
        summary = "댓글 삭제",
        description = "댓글을 삭제합니다. 본인이 작성한 댓글만 삭제 가능합니다."
    )
    @DeleteMapping("/{commentId}")
    public ResponseEntity<ApiResponse<Void>> deleteComment(
        @Parameter(description = "댓글 ID") 
        @PathVariable Long commentId,
        @Parameter(description = "멤버 ID (실제로는 JWT에서 추출)") 
        @RequestParam Long memberId) {
        
        try {
            commentService.deleteComment(commentId, memberId);
            return ApiResponse.success("댓글이 성공적으로 삭제되었습니다.", null);
        } catch (Exception e) {
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
