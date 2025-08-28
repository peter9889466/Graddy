package com.smhrd.graddy.free.service;

import com.smhrd.graddy.free.dto.FreePostRequest;
import com.smhrd.graddy.free.dto.FreePostResponse;
import com.smhrd.graddy.free.dto.FreePostUpdateRequest;
import com.smhrd.graddy.free.entity.FreePost;
import com.smhrd.graddy.free.repository.FreePostRepository;
import com.smhrd.graddy.user.entity.User;
import com.smhrd.graddy.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class FreePostService {
    
    private final FreePostRepository freePostRepository;
    private final UserRepository userRepository;
    
    /**
     * 게시글 생성
     */
    @Transactional
    public FreePostResponse createPost(FreePostRequest request, String userId) {
        log.info("자유게시판 게시글 생성: userId={}, title={}", userId, request.getTitle());
        
        FreePost post = FreePost.builder()
                .userId(userId)
                .title(request.getTitle())
                .content(request.getContent())
                .views(0)
                .createdAt(new Timestamp(System.currentTimeMillis()))
                .build();
        
        FreePost savedPost = freePostRepository.save(post);
        return convertToResponse(savedPost);
    }
    
    /**
     * 게시글 조회 (조회수 증가)
     */
    @Transactional
    public FreePostResponse getPost(Long postId) {
        log.info("자유게시판 게시글 조회: postId={}", postId);
        
        FreePost post = freePostRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("게시글을 찾을 수 없습니다: " + postId));
        
        // 조회수 증가
        freePostRepository.incrementViews(postId);
        
        return convertToResponse(post);
    }
    
    /**
     * 모든 게시글 목록 조회 (최신순)
     */
    public List<FreePostResponse> getAllPosts() {
        log.info("자유게시판 전체 게시글 목록 조회");
        
        List<FreePost> posts = freePostRepository.findAllByOrderByCreatedAtDesc();
        return posts.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    /**
     * 작성자별 게시글 목록 조회
     */
    public List<FreePostResponse> getPostsByUserId(String userId) {
        log.info("자유게시판 작성자별 게시글 목록 조회: userId={}", userId);
        
        List<FreePost> posts = freePostRepository.findByUserIdOrderByCreatedAtDesc(userId);
        return posts.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    /**
     * 제목으로 게시글 검색
     */
    public List<FreePostResponse> searchPostsByTitle(String title) {
        log.info("자유게시판 제목 검색: title={}", title);
        
        List<FreePost> posts = freePostRepository.findByTitleContainingIgnoreCaseOrderByCreatedAtDesc(title);
        return posts.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    /**
     * 내용으로 게시글 검색
     */
    public List<FreePostResponse> searchPostsByContent(String content) {
        log.info("자유게시판 내용 검색: content={}", content);
        
        List<FreePost> posts = freePostRepository.findByContentContainingIgnoreCaseOrderByCreatedAtDesc(content);
        return posts.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    /**
     * 키워드로 게시글 검색 (제목 + 내용)
     */
    public List<FreePostResponse> searchPostsByKeyword(String keyword) {
        log.info("자유게시판 키워드 검색: keyword={}", keyword);
        
        List<FreePost> posts = freePostRepository.findByTitleOrContentContainingIgnoreCaseOrderByCreatedAtDesc(keyword);
        return posts.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    /**
     * 게시글 수정
     */
    @Transactional
    public FreePostResponse updatePost(Long postId, FreePostUpdateRequest request, String currentUserId) {
        log.info("자유게시판 게시글 수정: postId={}, currentUserId={}", postId, currentUserId);
        
        FreePost post = freePostRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("게시글을 찾을 수 없습니다: " + postId));
        
        // 권한 체크: 작성자만 수정 가능
        if (!post.getUserId().equals(currentUserId)) {
            throw new IllegalArgumentException("게시글을 수정할 권한이 없습니다. 작성자만 수정할 수 있습니다.");
        }
        
        // null 체크 후 업데이트
        if (request.getTitle() != null) {
            post.setTitle(request.getTitle());
        }
        if (request.getContent() != null) {
            post.setContent(request.getContent());
        }
        
        FreePost updatedPost = freePostRepository.save(post);
        return convertToResponse(updatedPost);
    }
    
    /**
     * 게시글 삭제
     */
    @Transactional
    public void deletePost(Long postId, String currentUserId) {
        log.info("자유게시판 게시글 삭제: postId={}, currentUserId={}", postId, currentUserId);
        
        FreePost post = freePostRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("게시글을 찾을 수 없습니다: " + postId));
        
        // 권한 체크: 작성자만 삭제 가능
        if (!post.getUserId().equals(currentUserId)) {
            throw new IllegalArgumentException("게시글을 삭제할 권한이 없습니다. 작성자만 삭제할 수 있습니다.");
        }
        
        freePostRepository.deleteById(postId);
        log.info("자유게시판 게시글 삭제 완료: postId={}", postId);
    }
    
    /**
     * 작성자의 게시글 수 조회
     */
    public Long getPostCountByUserId(String userId) {
        log.info("자유게시판 작성자 게시글 수 조회: userId={}", userId);
        
        return freePostRepository.countByUserId(userId);
    }
    
    /**
     * FreePost 엔티티를 FreePostResponse로 변환
     */
    private FreePostResponse convertToResponse(FreePost post) {
        // 사용자 닉네임 조회
        String nick = "";
        Optional<User> user = userRepository.findById(post.getUserId());
        if (user.isPresent()) {
            nick = user.get().getNick();
        }
        
        return FreePostResponse.builder()
                .frPostId(post.getFrPostId())
                .userId(post.getUserId())
                .nick(nick)
                .title(post.getTitle())
                .content(post.getContent())
                .views(post.getViews())
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
