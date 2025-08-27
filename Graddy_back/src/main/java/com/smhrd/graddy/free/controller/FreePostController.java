package com.smhrd.graddy.free.controller;

import com.smhrd.graddy.api.dto.ApiResponse;
import com.smhrd.graddy.free.dto.FreePostRequest;
import com.smhrd.graddy.free.dto.FreePostResponse;
import com.smhrd.graddy.free.dto.FreePostUpdateRequest;
import com.smhrd.graddy.free.service.FreePostService;
import com.smhrd.graddy.security.jwt.JwtUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/free-posts")
@RequiredArgsConstructor
@Tag(name = "자유게시판", description = "자유게시판 게시글 관리 API")
public class FreePostController {
    
    private final FreePostService freePostService;
    private final JwtUtil jwtUtil;
    
    /**
     * 게시글 생성
     */
    @PostMapping
    @Operation(summary = "게시글 생성", description = "새로운 자유게시판 게시글을 생성합니다.")
    @SecurityRequirement(name = "Bearer Authentication")
    public ResponseEntity<ApiResponse<FreePostResponse>> createPost(
            @RequestBody FreePostRequest request,
            @Parameter(description = "JWT 토큰 (Bearer 형식)", 
                      example = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                      required = true)
            @RequestHeader(name = "Authorization", required = true) String authorization) {
        try {
            String token = authorization.replace("Bearer ", "");
            String userId = jwtUtil.extractUserId(token);
            
            FreePostResponse response = freePostService.createPost(request, userId);
            return ApiResponse.success("게시글 생성이 성공했습니다.", response);
        } catch (Exception e) {
            log.error("게시글 생성 실패: error={}", e.getMessage());
            return ApiResponse.error(HttpStatus.INTERNAL_SERVER_ERROR, "게시글 생성에 실패했습니다.", null);
        }
    }
    
    /**
     * 게시글 조회 (조회수 증가)
     */
    // @GetMapping("/{postId}")
    // @Operation(summary = "게시글 조회", description = "특정 게시글의 상세 내용을 조회합니다. 조회 시 조회수가 증가합니다.")
    // public ResponseEntity<ApiResponse<FreePostResponse>> getPost(
    //         @Parameter(description = "게시글 ID", required = true)
    //         @PathVariable Long postId) {
    //     try {
    //         FreePostResponse response = freePostService.getPost(postId);
    //         return ApiResponse.success("게시글 조회가 성공했습니다.", response);
    //     } catch (IllegalArgumentException e) {
    //         log.warn("게시글 조회 실패 (존재하지 않음): postId={}, error={}", postId, e.getMessage());
    //         return ApiResponse.error(HttpStatus.NOT_FOUND, e.getMessage(), null);
    //     } catch (Exception e) {
    //         log.error("게시글 조회 실패: postId={}, error={}", postId, e.getMessage());
    //         return ApiResponse.error(HttpStatus.INTERNAL_SERVER_ERROR, "게시글 조회에 실패했습니다.", null);
    //     }
    // }
    
    /**
     * 모든 게시글 목록 조회
     */
    @GetMapping
    @Operation(summary = "게시글 목록 조회", description = "모든 자유게시판 게시글을 최신순으로 조회합니다.")
    public ResponseEntity<ApiResponse<List<FreePostResponse>>> getAllPosts() {
        try {
            List<FreePostResponse> response = freePostService.getAllPosts();
            return ApiResponse.success("게시글 목록 조회가 성공했습니다.", response);
        } catch (Exception e) {
            log.error("게시글 목록 조회 실패: error={}", e.getMessage());
            return ApiResponse.error(HttpStatus.INTERNAL_SERVER_ERROR, "게시글 목록 조회에 실패했습니다.", null);
        }
    }
    
    /**
     * 작성자별 게시글 목록 조회
     */
    // @GetMapping("/user/{userId}")
    // @Operation(summary = "작성자별 게시글 조회", description = "특정 작성자의 게시글 목록을 조회합니다.")
    // public ResponseEntity<ApiResponse<List<FreePostResponse>>> getPostsByUserId(
    //         @Parameter(description = "작성자 ID", required = true)
    //         @PathVariable String userId) {
    //     try {
    //         List<FreePostResponse> response = freePostService.getPostsByUserId(userId);
    //         return ApiResponse.success("작성자별 게시글 조회가 성공했습니다.", response);
    //     } catch (Exception e) {
    //         log.error("작성자별 게시글 조회 실패: userId={}, error={}", userId, e.getMessage());
    //         return ApiResponse.error(HttpStatus.INTERNAL_SERVER_ERROR, "작성자별 게시글 조회에 실패했습니다.", null);
    //     }
    // }
    
    /**
     * 제목으로 게시글 검색
     */
    // @GetMapping("/search/title")
    // @Operation(summary = "제목으로 게시글 검색", description = "제목에 특정 키워드가 포함된 게시글을 검색합니다.")
    // public ResponseEntity<ApiResponse<List<FreePostResponse>>> searchPostsByTitle(
    //         @Parameter(description = "검색할 제목 키워드", required = true)
    //         @RequestParam String title) {
    //     try {
    //         List<FreePostResponse> response = freePostService.searchPostsByTitle(title);
    //         return ApiResponse.success("제목 검색이 성공했습니다.", response);
    //     } catch (Exception e) {
    //         log.error("제목 검색 실패: title={}, error={}", title, e.getMessage());
    //         return ApiResponse.error(HttpStatus.INTERNAL_SERVER_ERROR, "제목 검색에 실패했습니다.", null);
    //     }
    // }
    
    /**
     * 내용으로 게시글 검색
     */
    // @GetMapping("/search/content")
    // @Operation(summary = "내용으로 게시글 검색", description = "내용에 특정 키워드가 포함된 게시글을 검색합니다.")
    // public ResponseEntity<ApiResponse<List<FreePostResponse>>> searchPostsByContent(
    //         @Parameter(description = "검색할 내용 키워드", required = true)
    //         @RequestParam String content) {
    //     try {
    //         List<FreePostResponse> response = freePostService.searchPostsByContent(content);
    //         return ApiResponse.success("내용 검색이 성공했습니다.", response);
    //     } catch (Exception e) {
    //         log.error("내용 검색 실패: content={}, error={}", content, e.getMessage());
    //         return ApiResponse.error(HttpStatus.INTERNAL_SERVER_ERROR, "내용 검색에 실패했습니다.", null);
    //     }
    // }
    
    /**
     * 키워드로 게시글 검색 (제목 + 내용)
     */
    // @GetMapping("/search/keyword")
    // @Operation(summary = "키워드로 게시글 검색", description = "제목과 내용에서 특정 키워드를 검색합니다.")
    // public ResponseEntity<ApiResponse<List<FreePostResponse>>> searchPostsByKeyword(
    //         @Parameter(description = "검색할 키워드", required = true)
    //         @RequestParam String keyword) {
    //     try {
    //         List<FreePostResponse> response = freePostService.searchPostsByKeyword(keyword);
    //         return ApiResponse.success("키워드 검색이 성공했습니다.", response);
    //     } catch (Exception e) {
    //         log.error("키워드 검색 실패: keyword={}, error={}", keyword, e.getMessage());
    //         return ApiResponse.error(HttpStatus.INTERNAL_SERVER_ERROR, "키워드 검색에 실패했습니다.", null);
    //     }
    // }
    
    /**
     * 게시글 수정
     */
    @PutMapping("/{postId}")
    @Operation(summary = "게시글 수정", description = "기존 게시글을 수정합니다. 작성자만 수정할 수 있습니다.")
    @SecurityRequirement(name = "Bearer Authentication")
    public ResponseEntity<ApiResponse<FreePostResponse>> updatePost(
            @Parameter(description = "게시글 ID", required = true)
            @PathVariable Long postId,
            @RequestBody FreePostUpdateRequest request,
            @Parameter(description = "JWT 토큰 (Bearer 형식)", 
                      example = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                      required = true)
            @RequestHeader(name = "Authorization", required = true) String authorization) {
        try {
            String token = authorization.replace("Bearer ", "");
            String currentUserId = jwtUtil.extractUserId(token);
            
            FreePostResponse response = freePostService.updatePost(postId, request, currentUserId);
            return ApiResponse.success("게시글 수정이 성공했습니다.", response);
        } catch (IllegalArgumentException e) {
            log.warn("게시글 수정 실패 (권한 없음 또는 존재하지 않음): postId={}, error={}", postId, e.getMessage());
            return ApiResponse.error(HttpStatus.BAD_REQUEST, e.getMessage(), null);
        } catch (Exception e) {
            log.error("게시글 수정 실패: postId={}, error={}", postId, e.getMessage());
            return ApiResponse.error(HttpStatus.INTERNAL_SERVER_ERROR, "게시글 수정에 실패했습니다.", null);
        }
    }
    
    /**
     * 게시글 삭제
     */
    @DeleteMapping("/{postId}")
    @Operation(summary = "게시글 삭제", description = "게시글을 삭제합니다. 작성자만 삭제할 수 있습니다.")
    @SecurityRequirement(name = "Bearer Authentication")
    public ResponseEntity<ApiResponse<Void>> deletePost(
            @Parameter(description = "게시글 ID", required = true)
            @PathVariable Long postId,
            @Parameter(description = "JWT 토큰 (Bearer 형식)", 
                      example = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                      required = true)
            @RequestHeader(name = "Authorization", required = true) String authorization) {
        try {
            String token = authorization.replace("Bearer ", "");
            String currentUserId = jwtUtil.extractUserId(token);
            
            freePostService.deletePost(postId, currentUserId);
            return ApiResponse.success("게시글 삭제가 성공했습니다.", null);
        } catch (IllegalArgumentException e) {
            log.warn("게시글 삭제 실패 (권한 없음 또는 존재하지 않음): postId={}, error={}", postId, e.getMessage());
            return ApiResponse.error(HttpStatus.BAD_REQUEST, e.getMessage(), null);
        } catch (Exception e) {
            log.error("게시글 삭제 실패: postId={}, error={}", postId, e.getMessage());
            return ApiResponse.error(HttpStatus.INTERNAL_SERVER_ERROR, "게시글 삭제에 실패했습니다.", null);
        }
    }
    
    /**
     * 작성자의 게시글 수 조회
     */
    // @GetMapping("/count/{userId}")
    // @Operation(summary = "작성자 게시글 수 조회", description = "특정 작성자가 작성한 게시글의 수를 조회합니다.")
    // public ResponseEntity<ApiResponse<Long>> getPostCountByUserId(
    //         @Parameter(description = "작성자 ID", required = true)
    //         @PathVariable String userId) {
    //     try {
    //         Long count = freePostService.getPostCountByUserId(userId);
    //         return ApiResponse.success("작성자 게시글 수 조회가 성공했습니다.", count);
    //     } catch (Exception e) {
    //         log.error("작성자 게시글 수 조회 실패: userId={}, error={}", userId, e.getMessage());
    //         return ApiResponse.error(HttpStatus.INTERNAL_SERVER_ERROR, "작성자 게시글 수 조회에 실패했습니다.", null);
    //     }
    // }
}
