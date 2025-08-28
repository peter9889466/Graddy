package com.smhrd.graddy.free.repository;

import com.smhrd.graddy.free.entity.FreePost;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FreePostRepository extends JpaRepository<FreePost, Long> {
    
    /**
     * 최신 게시글 순으로 조회
     */
    List<FreePost> findAllByOrderByCreatedAtDesc();
    
    /**
     * 작성자 ID로 게시글 목록 조회
     */
    List<FreePost> findByUserIdOrderByCreatedAtDesc(String userId);
    
    /**
     * 제목으로 게시글 검색
     */
    List<FreePost> findByTitleContainingIgnoreCaseOrderByCreatedAtDesc(String title);
    
    /**
     * 내용으로 게시글 검색
     */
    List<FreePost> findByContentContainingIgnoreCaseOrderByCreatedAtDesc(String content);
    
    /**
     * 제목 또는 내용으로 게시글 검색
     */
    @Query("SELECT p FROM FreePost p WHERE p.title LIKE %:keyword% OR p.content LIKE %:keyword% ORDER BY p.createdAt DESC")
    List<FreePost> findByTitleOrContentContainingIgnoreCaseOrderByCreatedAtDesc(@Param("keyword") String keyword);
    
    /**
     * 조회수 증가
     */
    @Modifying
    @Query("UPDATE FreePost p SET p.views = p.views + 1 WHERE p.frPostId = :postId")
    void incrementViews(@Param("postId") Long postId);
    
    /**
     * 특정 작성자의 게시글 수 조회
     */
    Long countByUserId(String userId);
}
