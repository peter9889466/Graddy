package com.smhrd.graddy.study.repository;

import com.smhrd.graddy.study.entity.StudyProject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StudyProjectRepository extends JpaRepository<StudyProject, Long> {

    // 타입별 조회
    List<StudyProject> findByTypeCheck(StudyProject.TypeCheck typeCheck);
    
    // 모집 상태별 조회
    List<StudyProject> findByIsRecruiting(StudyProject.RecruitingStatus isRecruiting);
    
    // 리더별 조회
    List<StudyProject> findByUserId(String userId);
    
    // 레벨별 조회
    List<StudyProject> findByStudyLevel(Integer studyLevel);
    
    // 제목으로 검색
    List<StudyProject> findByStudyProjectTitleContainingIgnoreCase(String title);
    
    // 설명으로 검색
    List<StudyProject> findByStudyProjectDescContainingIgnoreCase(String description);
    
    // 모집 중인 스터디/프로젝트만 조회
    List<StudyProject> findByIsRecruitingAndTypeCheck(StudyProject.RecruitingStatus isRecruiting, StudyProject.TypeCheck typeCheck);
    
    // 최신순으로 정렬
    @Query("SELECT sp FROM StudyProject sp ORDER BY sp.createdAt DESC")
    List<StudyProject> findAllOrderByCreatedAtDesc();
    
    // 제목, 스터디명, 설명으로 통합 검색
    @Query("SELECT sp FROM StudyProject sp WHERE " +
           "LOWER(sp.studyProjectTitle) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(sp.studyProjectName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(sp.studyProjectDesc) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "ORDER BY sp.createdAt DESC")
    List<StudyProject> findByStudyProjectTitleContainingIgnoreCaseOrStudyProjectNameContainingIgnoreCaseOrStudyProjectDescContainingIgnoreCaseOrderByCreatedAtDesc(
            @Param("keyword") String keyword1, 
            @Param("keyword") String keyword2, 
            @Param("keyword") String keyword3);
    
    // 사용자 ID로 검색
    @Query("SELECT sp FROM StudyProject sp WHERE LOWER(sp.userId) LIKE LOWER(CONCAT('%', :keyword, '%')) ORDER BY sp.createdAt DESC")
    List<StudyProject> findByUserIdContainingIgnoreCaseOrderByCreatedAtDesc(@Param("keyword") String keyword);
}
