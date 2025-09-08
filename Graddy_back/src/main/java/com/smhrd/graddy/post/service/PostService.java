package com.smhrd.graddy.post.service;

import com.smhrd.graddy.post.dto.PostRequest;
import com.smhrd.graddy.post.dto.PostResponse;
import com.smhrd.graddy.post.dto.PostUpdateRequest;
import com.smhrd.graddy.post.entity.Post;
import com.smhrd.graddy.post.repository.PostRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PostService {
    
    private final PostRepository postRepository;
    
    /**
     * 게시글 생성
     */
    @Transactional
    public PostResponse createPost(PostRequest request) {
        log.info("게시글 생성: studyProjectId={}, memberId={}, title={}", request.getStudyProjectId(), request.getMemberId(), request.getTitle());
        
        Post post = Post.builder()
                .studyProjectId(request.getStudyProjectId())
                .memberId(request.getMemberId())
                .title(request.getTitle())
                .content(request.getContent())
                .createdAt(new Timestamp(System.currentTimeMillis()))
                .build();
        
        Post savedPost = postRepository.save(post);
        return convertToResponse(savedPost);
    }
    
    /**
     * 게시글 조회
     */
    public PostResponse getPost(Long postId) {
        log.info("게시글 조회: postId={}", postId);
        
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("게시글을 찾을 수 없습니다: " + postId));
        
        return convertToResponse(post);
    }
    
    /**
     * 스터디프로젝트별 게시글 목록 조회
     */
    public List<PostResponse> getPostsByStudyProjectId(Long studyProjectId) {
        log.info("스터디프로젝트별 게시글 목록 조회: studyProjectId={}", studyProjectId);
        
        List<Post> posts = postRepository.findByStudyProjectIdOrderByCreatedAtDesc(studyProjectId);
        return posts.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    /**
     * 모든 게시글 목록 조회 (최신순)
     */
    public List<PostResponse> getAllPosts() {
        log.info("모든 게시글 목록 조회");
        
        List<Post> posts = postRepository.findAllByOrderByCreatedAtDesc();
        return posts.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    /**
     * 작성자별 게시글 목록 조회
     */
    public List<PostResponse> getPostsByMemberId(String memberId) {
        log.info("작성자별 게시글 목록 조회: memberId={}", memberId);
        
        List<Post> posts = postRepository.findByMemberIdOrderByCreatedAtDesc(memberId);
        return posts.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    /**
     * 스터디프로젝트 내 작성자별 게시글 목록 조회
     */
    public List<PostResponse> getPostsByStudyProjectIdAndMemberId(Long studyProjectId, String memberId) {
        log.info("스터디프로젝트 내 작성자별 게시글 목록 조회: studyProjectId={}, memberId={}", studyProjectId, memberId);
        
        List<Post> posts = postRepository.findByStudyProjectIdAndMemberIdOrderByCreatedAtDesc(studyProjectId, memberId);
        return posts.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    /**
     * 제목으로 게시글 검색
     */
    public List<PostResponse> searchPostsByTitle(String title) {
        log.info("제목으로 게시글 검색: title={}", title);
        
        List<Post> posts = postRepository.findByTitleContainingIgnoreCaseOrderByCreatedAtDesc(title);
        return posts.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    /**
     * 내용으로 게시글 검색
     */
    public List<PostResponse> searchPostsByContent(String content) {
        log.info("내용으로 게시글 검색: content={}", content);
        
        List<Post> posts = postRepository.findByContentContainingIgnoreCaseOrderByCreatedAtDesc(content);
        return posts.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    /**
     * 키워드로 게시글 검색 (제목 + 내용)
     */
    public List<PostResponse> searchPostsByKeyword(String keyword) {
        log.info("키워드로 게시글 검색: keyword={}", keyword);
        
        List<Post> posts = postRepository.findByTitleOrContentContainingIgnoreCaseOrderByCreatedAtDesc(keyword);
        return posts.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    /**
     * 스터디프로젝트 내에서 키워드로 게시글 검색
     */
    public List<PostResponse> searchPostsByStudyProjectIdAndKeyword(Long studyProjectId, String keyword) {
        log.info("스터디프로젝트 내 키워드 검색: studyProjectId={}, keyword={}", studyProjectId, keyword);
        
        List<Post> posts = postRepository.findByStudyProjectIdAndTitleOrContentContainingIgnoreCaseOrderByCreatedAtDesc(studyProjectId, keyword);
        return posts.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    /**
     * 게시글 수정
     */
    @Transactional
    public PostResponse updatePost(Long postId, PostUpdateRequest request, String currentMemberId) {
        log.info("게시글 수정: postId={}, currentMemberId={}", postId, currentMemberId);
        
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("게시글을 찾을 수 없습니다: " + postId));
        
        // 권한 체크: 작성자만 수정 가능
        if (!post.getMemberId().equals(currentMemberId)) {
            throw new IllegalArgumentException("게시글을 수정할 권한이 없습니다. 작성자만 수정할 수 있습니다.");
        }
        
        // null 체크 후 업데이트
        if (request.getTitle() != null) {
            post.setTitle(request.getTitle());
        }
        if (request.getContent() != null) {
            post.setContent(request.getContent());
        }
        
        Post updatedPost = postRepository.save(post);
        return convertToResponse(updatedPost);
    }
    
    /**
     * 게시글 삭제
     */
    @Transactional
    public void deletePost(Long postId, String currentMemberId) {
        log.info("게시글 삭제: postId={}, currentMemberId={}", postId, currentMemberId);
        
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("게시글을 찾을 수 없습니다: " + postId));
        
        // 권한 체크: 작성자만 삭제 가능
        if (!post.getMemberId().equals(currentMemberId)) {
            throw new IllegalArgumentException("게시글을 삭제할 권한이 없습니다. 작성자만 삭제할 수 있습니다.");
        }
        
        postRepository.deleteById(postId);
        log.info("게시글 삭제 완료: postId={}", postId);
    }
    
    /**
     * 작성자의 게시글 수 조회
     */
    public Long getPostCountByMemberId(String memberId) {
        log.info("작성자 게시글 수 조회: memberId={}", memberId);
        
        return postRepository.countByMemberId(memberId);
    }
    
    /**
     * 스터디프로젝트의 게시글 수 조회
     */
    public Long getPostCountByStudyProjectId(Long studyProjectId) {
        log.info("스터디프로젝트 게시글 수 조회: studyProjectId={}", studyProjectId);
        
        return postRepository.countByStudyProjectId(studyProjectId);
    }
    
    /**
     * Post 엔티티를 PostResponse로 변환
     */
    private PostResponse convertToResponse(Post post) {
        return PostResponse.builder()
                .stPrPostId(post.getStPrPostId())
                .studyProjectId(post.getStudyProjectId())
                .memberId(post.getMemberId())
                .title(post.getTitle())
                .content(post.getContent())
                .createdAt(timestampToLocalDateTime(post.getCreatedAt()))
                .build();
    }
    
    /**
     * Timestamp를 LocalDateTime으로 변환
     */
    private LocalDateTime timestampToLocalDateTime(Timestamp timestamp) {
        if (timestamp == null) {
            return null;
        }
        return timestamp.toLocalDateTime();
    }
}
