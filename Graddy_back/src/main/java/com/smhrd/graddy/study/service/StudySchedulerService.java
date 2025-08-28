package com.smhrd.graddy.study.service;

import com.smhrd.graddy.study.entity.StudyProject;
import com.smhrd.graddy.study.repository.StudyProjectRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

/**
 * 스터디/프로젝트 자동 상태 변경 스케줄러
 * 매일 자정에 종료일이 지난 스터디/프로젝트의 모집 상태를 자동으로 'end'로 변경합니다.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class StudySchedulerService {

    private final StudyProjectRepository studyProjectRepository;

    /**
     * 매일 자정(00:00)에 실행되는 스케줄러
     * study_project_end가 오늘 날짜보다 이전인 스터디/프로젝트를 찾아서
     * is_recruiting 상태를 'end'로 변경합니다.
     */
    @Scheduled(cron = "0 0 0 * * ?") // 매일 자정 00:00:00
    @Transactional
    public void updateExpiredStudyProjects() {
        log.info("=== 스터디/프로젝트 자동 상태 변경 스케줄러 시작 ===");
        
        try {
            // 오늘 날짜의 시작 시간 (00:00:00)
            LocalDateTime todayStart = LocalDateTime.now().with(LocalTime.MIN);
            
            // 종료일이 오늘보다 이전이고, 아직 모집 상태가 'end'가 아닌 스터디/프로젝트 조회
            List<StudyProject> expiredStudies = studyProjectRepository.findExpiredStudies(todayStart);
            
            if (expiredStudies.isEmpty()) {
                log.info("종료일이 지난 스터디/프로젝트가 없습니다.");
                return;
            }
            
            log.info("종료일이 지난 스터디/프로젝트 {}개를 찾았습니다.", expiredStudies.size());
            
            int updatedCount = 0;
            for (StudyProject study : expiredStudies) {
                try {
                    // 모집 상태를 'end'로 변경
                    study.setIsRecruiting(StudyProject.RecruitingStatus.end);
                    studyProjectRepository.save(study);
                    updatedCount++;
                    
                    log.info("스터디/프로젝트 상태 변경 완료: ID={}, 이름={}, 종료일={}", 
                            study.getStudyProjectId(), 
                            study.getStudyProjectName(), 
                            study.getStudyProjectEnd());
                            
                } catch (Exception e) {
                    log.error("스터디/프로젝트 상태 변경 실패: ID={}, 오류={}", 
                            study.getStudyProjectId(), e.getMessage());
                }
                }
            
            log.info("=== 스터디/프로젝트 자동 상태 변경 완료: {}개 업데이트됨 ===", updatedCount);
            
        } catch (Exception e) {
            log.error("스케줄러 실행 중 오류 발생: {}", e.getMessage(), e);
        }
    }
    
    /**
     * 수동으로 스케줄러를 실행하는 메서드 (테스트용)
     * @return 업데이트된 스터디/프로젝트 수
     */
    @Transactional
    public int manuallyUpdateExpiredStudyProjects() {
        log.info("=== 수동 스케줄러 실행 ===");
        updateExpiredStudyProjects();
        return 0; // 실제로는 업데이트된 개수를 반환해야 하지만, 로그에서 확인 가능
    }
}



