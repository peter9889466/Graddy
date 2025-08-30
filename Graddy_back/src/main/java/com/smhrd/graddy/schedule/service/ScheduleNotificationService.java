package com.smhrd.graddy.schedule.service;

import com.smhrd.graddy.auth.SmsService;
import com.smhrd.graddy.schedule.entity.Schedule;
import com.smhrd.graddy.schedule.repository.ScheduleRepository;
import com.smhrd.graddy.user.entity.User;
import com.smhrd.graddy.user.repository.UserRepository;
import com.smhrd.graddy.study.entity.StudyProject;
import com.smhrd.graddy.study.repository.StudyProjectRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.time.Duration;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ScheduleNotificationService {

    private final ScheduleRepository scheduleRepository;
    private final UserRepository userRepository;
    private final StudyProjectRepository studyProjectRepository;
    private final SmsService smsService;

    /**
     * 매시간 실행되는 스케줄 알림
     */
    @Scheduled(cron = "0 0 * * * ?") // 매시간 실행
    public void sendHourlyScheduleNotifications() {
        LocalDateTime now = LocalDateTime.now();
        log.info("스케줄 알림 시작: {}", now);
        
        // 과제 제출일 알림 (48시간 이하)
        sendAssignmentNotifications(now);
        
        // 스터디 일정 알림 (24시간 이하)
        sendStudyScheduleNotifications(now);
        
        log.info("스케줄 알림 완료");
    }

    /**
     * 과제 제출일 알림 (48시간 이하)
     */
    private void sendAssignmentNotifications(LocalDateTime now) {
        log.info("과제 제출일 알림 시작");
        
        // content가 "[과제 제출일]"로 시작하고 아직 알림을 보내지 않은 스케줄 중 48시간 이하인 것만 조회
        Timestamp endTime = Timestamp.valueOf(now.plusHours(48));
        List<Schedule> assignmentSchedules = scheduleRepository.findByContentStartingWithAndSchTimeBeforeAndAramChkFalse(
            "[과제 제출일]", 
            endTime
        );
        
        for (Schedule schedule : assignmentSchedules) {
            try {
                // 현재 시간과의 차이 계산
                long hoursUntilDue = Duration.between(now, schedule.getSchTime().toLocalDateTime()).toHours();
                
                // 48시간 이하인 경우만 처리
                if (hoursUntilDue <= 48 && hoursUntilDue > 0) {
                    sendAssignmentNotification(schedule, hoursUntilDue);
                }
            } catch (Exception e) {
                log.error("과제 제출일 알림 처리 실패: scheduleId={}, error={}", 
                    schedule.getSchId(), e.getMessage());
            }
        }
    }

    /**
     * 스터디 일정 알림 (24시간 이하)
     */
    private void sendStudyScheduleNotifications(LocalDateTime now) {
        log.info("스터디 일정 알림 시작");
        
        // content가 "[스터디 일정]"으로 시작하고 아직 알림을 보내지 않은 스케줄 중 24시간 이하인 것만 조회
        Timestamp endTime = Timestamp.valueOf(now.plusHours(24));
        List<Schedule> studySchedules = scheduleRepository.findByContentStartingWithAndSchTimeBeforeAndAramChkFalse(
            "[스터디 일정]", 
            endTime
        );
        
        for (Schedule schedule : studySchedules) {
            try {
                // 현재 시간과의 차이 계산
                long hoursUntilStudy = Duration.between(now, schedule.getSchTime().toLocalDateTime()).toHours();
                
                // 24시간 이하인 경우만 처리
                if (hoursUntilStudy <= 24 && hoursUntilStudy > 0) {
                    sendStudyNotification(schedule, hoursUntilStudy);
                }
            } catch (Exception e) {
                log.error("스터디 일정 알림 처리 실패: scheduleId={}, error={}", 
                    schedule.getSchId(), e.getMessage());
            }
        }
    }

    /**
     * 과제 제출일 알림 발송
     */
    @Transactional
    private void sendAssignmentNotification(Schedule schedule, long hoursUntilDue) {
        try {
            // 사용자 정보 조회
            User user = userRepository.findByUserId(schedule.getUserId()).orElse(null);
            
            if (user != null) {
                // 메시지 생성
                String message = createAssignmentMessage(hoursUntilDue);
                
                // 문자 알림 발송 (테스트를 위해 주석처리)
                // smsService.sendScheduleNotification(user.getTel(), message);
                
                // 테스트용 로그 출력
                log.info("과제 제출일 알림 테스트 (SMS 발송 비활성화): userId={}, hoursUntil={}, phone={}, message={}", 
                    user.getUserId(), hoursUntilDue, user.getTel(), message);
                
                // 알림 발송 완료 표시
                schedule.setAramChk(true);
                scheduleRepository.save(schedule);
                
                log.info("과제 제출일 알림 처리 완료: userId={}, hoursUntil={}, phone={}", 
                    user.getUserId(), hoursUntilDue, user.getTel());
            }
        } catch (Exception e) {
            log.error("과제 제출일 알림 처리 실패: scheduleId={}, error={}", 
                schedule.getSchId(), e.getMessage());
        }
    }

    /**
     * 스터디 일정 알림 발송
     */
    @Transactional
    private void sendStudyNotification(Schedule schedule, long hoursUntilStudy) {
        try {
            // 사용자 정보 조회 (매번 최신 정보 확인)
            User user = userRepository.findByUserId(schedule.getUserId()).orElse(null);
            
            if (user != null && schedule.getStudyProjectId() != null) {
                // 스터디 정보 조회
                StudyProject studyProject = studyProjectRepository.findById(schedule.getStudyProjectId()).orElse(null);
                
                if (studyProject != null) {
                    // 현재 사용자 알람 설정 확인
                    if (user.isAlarmType()) {
                        // 메시지 생성
                        String message = createStudyScheduleMessage(hoursUntilStudy, studyProject.getStudyProjectName());
                        
                        // 문자 알림 발송 (테스트를 위해 주석처리)
                        // smsService.sendScheduleNotification(user.getTel(), message);
                        
                        // 테스트용 로그 출력
                        log.info("스터디 일정 알림 테스트 (SMS 발송 비활성화): userId={}, studyProject={}, hoursUntil={}, phone={}, message={}", 
                            user.getUserId(), studyProject.getStudyProjectName(), hoursUntilStudy, user.getTel(), message);
                    } else {
                        log.info("사용자가 알림을 거부함: userId={}, studyProject={}", 
                            user.getUserId(), studyProject.getStudyProjectName());
                    }
                    
                    // 알림 발송 완료 표시 (발송 여부와 관계없이)
                    schedule.setAramChk(true);
                    scheduleRepository.save(schedule);
                }
            }
        } catch (Exception e) {
            log.error("스터디 일정 알림 처리 실패: scheduleId={}, error={}", 
                schedule.getSchId(), e.getMessage());
        }
    }

    /**
     * 사용자 알람 설정 변경 시 스케줄 재활성화
     */
    @Transactional
    public void reactivateUserSchedules(String userId) {
        try {
            // 해당 사용자의 이미 처리된 스케줄 조회
            List<Schedule> schedules = scheduleRepository.findByUserIdAndAramChkTrue(userId);
            
            LocalDateTime now = LocalDateTime.now();
            int reactivatedCount = 0;
            
            for (Schedule schedule : schedules) {
                // 24시간 이내의 스터디 일정만 재활성화
                if (schedule.getContent().startsWith("[스터디 일정]")) {
                    long hoursUntil = Duration.between(now, schedule.getSchTime().toLocalDateTime()).toHours();
                    if (hoursUntil <= 24 && hoursUntil > 0) {
                        schedule.setAramChk(false);
                        scheduleRepository.save(schedule);
                        reactivatedCount++;
                        
                        log.info("스케줄 재활성화: scheduleId={}, userId={}, hoursUntil={}", 
                            schedule.getSchId(), userId, hoursUntil);
                    }
                }
            }
            
            if (reactivatedCount > 0) {
                log.info("사용자 스케줄 재활성화 완료: userId={}, 재활성화된 스케줄 수={}", 
                    userId, reactivatedCount);
            }
            
        } catch (Exception e) {
            log.error("사용자 스케줄 재활성화 실패: userId={}, error={}", userId, e.getMessage());
        }
    }

    /**
     * 과제 제출일 알림 메시지 생성
     */
    private String createAssignmentMessage(long hoursUntilDue) {
        if (hoursUntilDue >= 24) {
            return "모레는 과제 제출일입니다. 잊지 않으셨죠?";
        } else if (hoursUntilDue >= 12) {
            return "내일은 과제 제출일입니다. 잊지 않으셨죠?";
        } else if (hoursUntilDue >= 6) {
            return "오늘 오후 과제 제출일입니다. 준비하셨나요?";
        } else if (hoursUntilDue >= 1) {
            return String.format("약 %d시간 후 과제 제출 마감입니다!", hoursUntilDue);
        } else {
            return "과제 제출 마감 시간입니다! 지금 바로 제출하세요.";
        }
    }

    /**
     * 스터디 일정 알림 메시지 생성
     */
    private String createStudyScheduleMessage(long hoursUntilStudy, String studyProjectName) {
        if (hoursUntilStudy >= 12) {
            return String.format("내일 **%s** 스터디 일정이 있습니다. 잊지 마세요!", studyProjectName);
        } else if (hoursUntilStudy >= 6) {
            return String.format("오늘 오후 **%s** 스터디 일정이 있습니다. 참여 준비되셨나요?", studyProjectName);
        } else if (hoursUntilStudy >= 2) {
            return String.format("**%s** 스터디가 약 %d시간 후에 시작됩니다. 참여 준비하세요!", studyProjectName, hoursUntilStudy);
        } else if (hoursUntilStudy >= 1) {
            return String.format("**%s** 스터디가 1시간 후에 시작됩니다! 서둘러주세요!", studyProjectName);
        } else {
            return String.format("**%s** 스터디가 곧 시작됩니다! 지금 바로 참여하세요!", studyProjectName);
        }
    }
}
