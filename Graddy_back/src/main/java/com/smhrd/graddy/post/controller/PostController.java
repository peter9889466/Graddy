package com.smhrd.graddy.post.controller;

import com.smhrd.graddy.api.dto.ApiResponse;
import com.smhrd.graddy.post.dto.PostRequest;
import com.smhrd.graddy.post.dto.PostResponse;
import com.smhrd.graddy.post.dto.PostUpdateRequest;
import com.smhrd.graddy.post.service.PostService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/posts")
@RequiredArgsConstructor
@Tag(name = "스터디 커뮤니티", description = "스터디프로젝트 커뮤니티 게시글 관리 API")
public class PostController {
    
    private final PostService postService;
    
    /**
     * 게시글 생성
     */
    @PostMapping
    @Operation(summary = "게시글 생성", description = "새로운 스터디 커뮤니티 게시글을 생성합니다.")
    public ResponseEntity<ApiResponse<PostResponse>> createPost(@RequestBody PostRequest request) {
        try {
            PostResponse response = postService.createPost(request);
            return ApiResponse.success("게시글 생성이 성공했습니다.", response);
        } catch (Exception e) {
            log.error("게시글 생성 실패: error={}", e.getMessage());
            return ApiResponse.error(HttpStatus.INTERNAL_SERVER_ERROR, "게시글 생성에 실패했습니다.", null);
        }
    }
    
    /**
     * 게시글 조회
     */
    @GetMapping("/{postId}")
    @Operation(summary = "게시글 조회", description = "특정 게시글의 상세 내용을 조회합니다.")
    public ResponseEntity<ApiResponse<PostResponse>> getPost(
            @Parameter(description = "게시글 ID", required = true)
            @PathVariable Long postId) {
        try {
            PostResponse response = postService.getPost(postId);
            return ApiResponse.success("게시글 조회가 성공했습니다.", response);
        } catch (IllegalArgumentException e) {
            log.warn("게시글 조회 실패 (존재하지 않음): postId={}, error={}", postId, e.getMessage());
            return ApiResponse.error(HttpStatus.NOT_FOUND, e.getMessage(), null);
        } catch (Exception e) {
            log.error("게시글 조회 실패: postId={}, error={}", postId, e.getMessage());
            return ApiResponse.error(HttpStatus.INTERNAL_SERVER_ERROR, "게시글 조회에 실패했습니다.", null);
        }
    }
    
    /**
     * 스터디프로젝트별 게시글 목록 조회
     */
    @GetMapping("/study-project/{studyProjectId}")
    @Operation(summary = "스터디프로젝트별 게시글 조회", description = "특정 스터디프로젝트의 모든 게시글을 최신순으로 조회합니다.")
    public ResponseEntity<ApiResponse<List<PostResponse>>> getPostsByStudyProjectId(
            @Parameter(description = "스터디프로젝트 ID", required = true)
            @PathVariable Long studyProjectId) {
        try {
            List<PostResponse> response = postService.getPostsByStudyProjectId(studyProjectId);
            return ApiResponse.success("스터디프로젝트별 게시글 조회가 성공했습니다.", response);
        } catch (Exception e) {
            log.error("스터디프로젝트별 게시글 조회 실패: studyProjectId={}, error={}", studyProjectId, e.getMessage());
            return ApiResponse.error(HttpStatus.INTERNAL_SERVER_ERROR, "스터디프로젝트별 게시글 조회에 실패했습니다.", null);
        }
    }
    
    /**
     * 모든 게시글 목록 조회
     */
    @GetMapping
    @Operation(summary = "게시글 목록 조회", description = "모든 게시글을 최신순으로 조회합니다.")
    public ResponseEntity<ApiResponse<List<PostResponse>>> getAllPosts() {
        try {
            List<PostResponse> response = postService.getAllPosts();
            return ApiResponse.success("게시글 목록 조회가 성공했습니다.", response);
        } catch (Exception e) {
            log.error("게시글 목록 조회 실패: error={}", e.getMessage());
            return ApiResponse.error(HttpStatus.INTERNAL_SERVER_ERROR, "게시글 목록 조회에 실패했습니다.", null);
        }
    }
    
    /**
     * 작성자별 게시글 목록 조회
     */
    // @GetMapping("/member/{memberId}")
    // @Operation(summary = "작성자별 게시글 조회", description = "특정 작성자의 게시글 목록을 조회합니다.")
    // public ResponseEntity<ApiResponse<List<PostResponse>>> getPostsByMemberId(
    //         @Parameter(description = "작성자 ID", required = true)
    //         @PathVariable String memberId) {
    //     try {
    //         List<PostResponse> response = postService.getPostsByMemberId(memberId);
    //         return ApiResponse.success("작성자별 게시글 조회가 성공했습니다.", response);
    //     } catch (Exception e) {
    //         log.error("작성자별 게시글 조회 실패: memberId={}, error={}", memberId, e.getMessage());
    //         return ApiResponse.error(HttpStatus.INTERNAL_SERVER_ERROR, "작성자별 게시글 조회에 실패했습니다.", null);
    //     }
    // }
    
    /**
     * 스터디프로젝트 내 작성자별 게시글 목록 조회
     */
    // @GetMapping("/study-project/{studyProjectId}/member/{memberId}")
    // @Operation(summary = "스터디프로젝트 내 작성자별 게시글 조회", description = "특정 스터디프로젝트 내에서 특정 작성자의 게시글 목록을 조회합니다.")
    // public ResponseEntity<ApiResponse<List<PostResponse>>> getPostsByStudyProjectIdAndMemberId(
    //         @Parameter(description = "스터디프로젝트 ID", required = true)
    //         @PathVariable Long studyProjectId,
    //         @Parameter(description = "작성자 ID", required = true)
    //         @PathVariable String memberId) {
    //     try {
    //         List<PostResponse> response = postService.getPostsByStudyProjectIdAndMemberId(studyProjectId, memberId);
    //         return ApiResponse.success("스터디프로젝트 내 작성자별 게시글 조회가 성공했습니다.", response);
    //     } catch (Exception e) {
    //         log.error("스터디프로젝트 내 작성자별 게시글 조회 실패: studyProjectId={}, memberId={}, error={}", studyProjectId, memberId, e.getMessage());
    //         return ApiResponse.error(HttpStatus.INTERNAL_SERVER_ERROR, "스터디프로젝트 내 작성자별 게시글 조회에 실패했습니다.", null);
    //     }
    // }
    
    /**
     * 제목으로 게시글 검색
     */
    // @GetMapping("/search/title")
    // @Operation(summary = "제목으로 게시글 검색", description = "제목에 특정 키워드가 포함된 게시글을 검색합니다.")
    // public ResponseEntity<ApiResponse<List<PostResponse>>> searchPostsByTitle(
    //         @Parameter(description = "검색할 제목 키워드", required = true)
    //         @RequestParam String title) {
    //     try {
    //         List<PostResponse> response = postService.searchPostsByTitle(title);
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
    // public ResponseEntity<ApiResponse<List<PostResponse>>> searchPostsByContent(
    //         @Parameter(description = "검색할 내용 키워드", required = true)
    //         @RequestParam String content) {
    //     try {
    //         List<PostResponse> response = postService.searchPostsByContent(content);
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
    // public ResponseEntity<ApiResponse<List<PostResponse>>> searchPostsByKeyword(
    //         @Parameter(description = "검색할 키워드", required = true)
    //         @RequestParam String keyword) {
    //     try {
    //         List<PostResponse> response = postService.searchPostsByKeyword(keyword);
    //         return ApiResponse.success("키워드 검색이 성공했습니다.", response);
    //     } catch (Exception e) {
    //         log.error("키워드 검색 실패: keyword={}, error={}", keyword, e.getMessage());
    //         return ApiResponse.error(HttpStatus.INTERNAL_SERVER_ERROR, "키워드 검색에 실패했습니다.", null);
    //     }
    // }
    
    /**
     * 스터디프로젝트 내에서 키워드로 게시글 검색
     */
    // @GetMapping("/study-project/{studyProjectId}/search/keyword")
    // @Operation(summary = "스터디프로젝트 내 키워드 검색", description = "특정 스터디프로젝트 내에서 제목과 내용으로 키워드를 검색합니다.")
    // public ResponseEntity<ApiResponse<List<PostResponse>>> searchPostsByStudyProjectIdAndKeyword(
    //         @Parameter(description = "스터디프로젝트 ID", required = true)
    //         @PathVariable Long studyProjectId,
    //         @Parameter(description = "검색할 키워드", required = true)
    //         @RequestParam String keyword) {
    //     try {
    //         List<PostResponse> response = postService.searchPostsByStudyProjectIdAndKeyword(studyProjectId, keyword);
    //         return ApiResponse.success("스터디프로젝트 내 키워드 검색이 성공했습니다.", response);
    //     } catch (Exception e) {
    //         log.error("스터디프로젝트 내 키워드 검색 실패: studyProjectId={}, keyword={}, error={}", studyProjectId, keyword, e.getMessage());
    //         return ApiResponse.error(HttpStatus.INTERNAL_SERVER_ERROR, "스터디프로젝트 내 키워드 검색에 실패했습니다.", null);
    //     }
    // }
    
    /**
     * 게시글 수정
     */
    @PutMapping("/{postId}")
    @Operation(summary = "게시글 수정", description = "기존 게시글을 수정합니다. 작성자만 수정할 수 있습니다.")
    public ResponseEntity<ApiResponse<PostResponse>> updatePost(
            @Parameter(description = "게시글 ID", required = true)
            @PathVariable Long postId,
            @RequestBody PostUpdateRequest request,
            @Parameter(description = "현재 로그인한 사용자 ID", required = true)
            @RequestParam String currentMemberId) {
        try {
            PostResponse response = postService.updatePost(postId, request, currentMemberId);
            return ApiResponse.success("게시글 수정이 성공했습니다.", response);
        } catch (IllegalArgumentException e) {
            log.warn("게시글 수정 실패 (권한 없음 또는 존재하지 않음): postId={}, currentMemberId={}, error={}", postId, currentMemberId, e.getMessage());
            return ApiResponse.error(HttpStatus.BAD_REQUEST, e.getMessage(), null);
        } catch (Exception e) {
            log.error("게시글 수정 실패: postId={}, currentMemberId={}, error={}", postId, currentMemberId, e.getMessage());
            return ApiResponse.error(HttpStatus.INTERNAL_SERVER_ERROR, "게시글 수정에 실패했습니다.", null);
        }
    }
    
    /**
     * 게시글 삭제
     */
    @DeleteMapping("/{postId}")
    @Operation(summary = "게시글 삭제", description = "게시글을 삭제합니다. 작성자만 삭제할 수 있습니다.")
    public ResponseEntity<ApiResponse<Void>> deletePost(
            @Parameter(description = "게시글 ID", required = true)
            @PathVariable Long postId,
            @Parameter(description = "현재 로그인한 사용자 ID", required = true)
            @RequestParam String currentMemberId) {
        try {
            postService.deletePost(postId, currentMemberId);
            return ApiResponse.success("게시글 삭제가 성공했습니다.", null);
        } catch (IllegalArgumentException e) {
            log.warn("게시글 삭제 실패 (권한 없음 또는 존재하지 않음): postId={}, currentMemberId={}, error={}", postId, currentMemberId, e.getMessage());
            return ApiResponse.error(HttpStatus.BAD_REQUEST, e.getMessage(), null);
        } catch (Exception e) {
            log.error("게시글 삭제 실패: postId={}, currentMemberId={}, error={}", postId, currentMemberId, e.getMessage());
            return ApiResponse.error(HttpStatus.INTERNAL_SERVER_ERROR, "게시글 삭제에 실패했습니다.", null);
        }
    }
    
    /**
     * 작성자의 게시글 수 조회
     */
    // @GetMapping("/count/{memberId}")
    // @Operation(summary = "작성자 게시글 수 조회", description = "특정 작성자가 작성한 게시글의 수를 조회합니다.")
    // public ResponseEntity<ApiResponse<Long>> getPostCountByMemberId(
    //         @Parameter(description = "작성자 ID", required = true)
    //         @PathVariable String memberId) {
    //     try {
    //         Long count = postService.getPostCountByMemberId(memberId);
    //         return ApiResponse.success("작성자 게시글 수 조회가 성공했습니다.", count);
    //     } catch (Exception e) {
    //         log.error("작성자 게시글 수 조회 실패: memberId={}, error={}", memberId, e.getMessage());
    //         return ApiResponse.error(HttpStatus.INTERNAL_SERVER_ERROR, "작성자 게시글 수 조회에 실패했습니다.", null);
    //     }
    // }
    
    /**
     * 스터디프로젝트의 게시글 수 조회
     */
    // @GetMapping("/study-project/{studyProjectId}/count")
    // @Operation(summary = "스터디프로젝트 게시글 수 조회", description = "특정 스터디프로젝트에 작성된 게시글의 수를 조회합니다.")
    // public ResponseEntity<ApiResponse<Long>> getPostCountByStudyProjectId(
    //         @Parameter(description = "스터디프로젝트 ID", required = true)
    //         @PathVariable Long studyProjectId) {
    //     try {
    //         Long count = postService.getPostCountByStudyProjectId(studyProjectId);
    //         return ApiResponse.success("스터디프로젝트 게시글 수 조회가 성공했습니다.", count);
    //     } catch (Exception e) {
    //         log.error("스터디프로젝트 게시글 수 조회 실패: studyProjectId={}, error={}", studyProjectId, e.getMessage());
    //         return ApiResponse.error(HttpStatus.INTERNAL_SERVER_ERROR, "스터디프로젝트 게시글 수 조회에 실패했습니다.", null);
    //     }
    // }
}
