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
    
    /**
     * 사용자에게 추천할 수 있는 스터디/프로젝트 조회
     * 모집 중이고, 해당 사용자가 참여하지 않은 스터디/프로젝트를 반환
     * @param userId 사용자 ID
     * @return 추천 가능한 스터디/프로젝트 목록
     */
    @Query("SELECT sp FROM StudyProject sp " +
           "WHERE sp.isRecruiting = 'recruitment' " +
           "AND sp.userId != :userId " +
           "AND sp.studyProjectId NOT IN " +
           "(SELECT m.studyProjectId FROM Member m WHERE m.userId = :userId) " +
           "ORDER BY sp.createdAt DESC")
    List<StudyProject> findAvailableStudiesForUser(@Param("userId") String userId);
    
    /**
     * 종료일이 지난 스터디/프로젝트 조회
     * study_project_end가 지정된 날짜보다 이전이고, 아직 모집 상태가 'end'가 아닌 스터디/프로젝트를 반환
     * @param date 기준 날짜
     * @return 종료일이 지난 스터디/프로젝트 목록
     */
    @Query("SELECT sp FROM StudyProject sp " +
           "WHERE sp.studyProjectEnd < :date " +
           "AND sp.isRecruiting != 'end' " +
           "ORDER BY sp.studyProjectEnd ASC")
    List<StudyProject> findExpiredStudies(@Param("date") java.time.LocalDateTime date);
}
