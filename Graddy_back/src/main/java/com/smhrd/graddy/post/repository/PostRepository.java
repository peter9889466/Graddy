package com.smhrd.graddy.post.repository;

import com.smhrd.graddy.post.entity.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {
    
    /**
     * 스터디프로젝트 ID로 게시글 목록 조회
     */
    List<Post> findByStudyProjectIdOrderByCreatedAtDesc(Long studyProjectId);
    
    /**
     * 작성자 ID로 게시글 목록 조회
     */
    List<Post> findByMemberIdOrderByCreatedAtDesc(String memberId);
    
    /**
     * 스터디프로젝트 ID와 작성자 ID로 게시글 목록 조회
     */
    List<Post> findByStudyProjectIdAndMemberIdOrderByCreatedAtDesc(Long studyProjectId, String memberId);
    
    /**
     * 제목으로 게시글 검색
     */
    List<Post> findByTitleContainingIgnoreCaseOrderByCreatedAtDesc(String title);
    
    /**
     * 내용으로 게시글 검색
     */
    List<Post> findByContentContainingIgnoreCaseOrderByCreatedAtDesc(String content);
    
    /**
     * 제목 또는 내용으로 게시글 검색
     */
    @Query("SELECT p FROM Post p WHERE p.title LIKE %:keyword% OR p.content LIKE %:keyword% ORDER BY p.createdAt DESC")
    List<Post> findByTitleOrContentContainingIgnoreCaseOrderByCreatedAtDesc(@Param("keyword") String keyword);
    
    /**
     * 스터디프로젝트 내에서 키워드로 게시글 검색
     */
    @Query("SELECT p FROM Post p WHERE p.studyProjectId = :studyProjectId AND (p.title LIKE %:keyword% OR p.content LIKE %:keyword%) ORDER BY p.createdAt DESC")
    List<Post> findByStudyProjectIdAndTitleOrContentContainingIgnoreCaseOrderByCreatedAtDesc(@Param("studyProjectId") Long studyProjectId, @Param("keyword") String keyword);
    
    /**
     * 최신 게시글 순으로 조회
     */
    List<Post> findAllByOrderByCreatedAtDesc();
    
    /**
     * 특정 작성자의 게시글 수 조회
     */
    Long countByMemberId(String memberId);
    
    /**
     * 특정 스터디프로젝트의 게시글 수 조회
     */
    Long countByStudyProjectId(Long studyProjectId);
}
