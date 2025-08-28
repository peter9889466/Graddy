package com.smhrd.graddy.study.service;

import com.smhrd.graddy.study.entity.StudyProject;
import com.smhrd.graddy.study.repository.StudyProjectRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class StudyProjectStatusScheduler {

    private final StudyProjectRepository studyProjectRepository;

    /**
     * 매일 자정(00:00)에 실행되어 study_project_end가 지난 프로젝트들의 상태를 'end'로 변경
     * cron 표현식: "0 0 0 * * ?" (초 분 시 일 월 요일)
     */
    @Scheduled(cron = "0 0 0 * * ?")
    @Transactional
    public void updateExpiredStudyProjects() {
        try {
            log.info("만료된 스터디/프로젝트 상태 업데이트 시작");
            
            // 현재 시간 기준으로 만료된 프로젝트들 조회
            LocalDateTime currentTime = LocalDateTime.now();
            List<StudyProject> expiredProjects = studyProjectRepository.findExpiredStudies(currentTime);
            
            if (expiredProjects.isEmpty()) {
                log.info("만료된 스터디/프로젝트가 없습니다.");
                return;
            }
            
            int updatedCount = 0;
            for (StudyProject project : expiredProjects) {
                try {
                    // 모집 상태를 'end'로 변경
                    project.setIsRecruiting(StudyProject.RecruitingStatus.end);
                    studyProjectRepository.save(project);
                    updatedCount++;
                    
                    log.info("스터디/프로젝트 상태 업데이트 완료: projectId={}, projectName={}, endDate={}", 
                            project.getStudyProjectId(), project.getStudyProjectName(), project.getStudyProjectEnd());
                    
                } catch (Exception e) {
                    log.error("스터디/프로젝트 상태 업데이트 실패: projectId={}, error={}", 
                            project.getStudyProjectId(), e.getMessage());
                }
            }
            
            log.info("만료된 스터디/프로젝트 상태 업데이트 완료: 총 {}개 프로젝트 업데이트됨", updatedCount);
            
        } catch (Exception e) {
            log.error("스케줄러 실행 중 오류 발생: {}", e.getMessage(), e);
        }
    }

    /**
     * 애플리케이션 시작 시 한 번 실행되어 현재 만료된 프로젝트들의 상태를 즉시 업데이트
     */
    @Scheduled(initialDelay = 10000, fixedDelay = Long.MAX_VALUE) // 10초 후 한 번만 실행
    @Transactional
    public void initializeExpiredProjectsOnStartup() {
        try {
            log.info("애플리케이션 시작 시 만료된 스터디/프로젝트 상태 초기화 시작");
            updateExpiredStudyProjects();
            log.info("애플리케이션 시작 시 만료된 스터디/프로젝트 상태 초기화 완료");
        } catch (Exception e) {
            log.error("애플리케이션 시작 시 초기화 중 오류 발생: {}", e.getMessage(), e);
        }
    }
}
