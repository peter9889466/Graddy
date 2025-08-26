package com.smhrd.graddy.schedule.service;

import com.smhrd.graddy.schedule.dto.ScheduleRequest;
import com.smhrd.graddy.schedule.dto.ScheduleResponse;
import com.smhrd.graddy.schedule.entity.Schedule;
import com.smhrd.graddy.schedule.repository.ScheduleRepository;
import com.smhrd.graddy.study.entity.StudyProject;
import com.smhrd.graddy.study.repository.StudyProjectRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class ScheduleService {
    
    private final ScheduleRepository scheduleRepository;
    private final StudyProjectRepository studyProjectRepository;
    
    /**
     * 개인 일정 생성
     */
    @Transactional
    public ScheduleResponse createPersonalSchedule(ScheduleRequest request) {
        log.info("개인 일정 생성 시작: userId={}, content={}, schTime={}", 
                request.getUserId(), request.getContent(), request.getSchTime());
        
        Schedule schedule = Schedule.builder()
                .userId(request.getUserId())
                .studyProjectId(null) // 개인 일정
                .content(request.getContent())
                .schTime(localDateTimeToTimestamp(request.getSchTime()))
                .build();
        
        Schedule savedSchedule = scheduleRepository.save(schedule);
        log.info("개인 일정 생성 완료: schId={}", savedSchedule.getSchId());
        
        return convertToResponse(savedSchedule);
    }
    
    /**
     * 스터디 일정 생성
     */
    @Transactional
    public ScheduleResponse createStudySchedule(ScheduleRequest request) {
        log.info("스터디 일정 생성 시작: userId={}, studyProjectId={}, content={}, schTime={}", 
                request.getUserId(), request.getStudyProjectId(), request.getContent(), request.getSchTime());
        
        // 스터디 프로젝트 존재 여부 확인
        StudyProject studyProject = studyProjectRepository.findById(request.getStudyProjectId())
                .orElseThrow(() -> new IllegalArgumentException("스터디 프로젝트를 찾을 수 없습니다: " + request.getStudyProjectId()));
        
        Schedule schedule = Schedule.builder()
                .userId(request.getUserId())
                .studyProjectId(request.getStudyProjectId())
                .content(request.getContent())
                .schTime(localDateTimeToTimestamp(request.getSchTime()))
                .build();
        
        Schedule savedSchedule = scheduleRepository.save(schedule);
        log.info("스터디 일정 생성 완료: schId={}", savedSchedule.getSchId());
        
        return convertToResponse(savedSchedule, studyProject);
    }
    
    /**
     * 과제 제출일에 맞춰 자동으로 일정 추가
     */
    @Transactional
    public ScheduleResponse createAssignmentSchedule(String userId, Long studyProjectId, String assignmentTitle, LocalDateTime deadline) {
        log.info("과제 제출일 일정 자동 생성: userId={}, studyProjectId={}, assignmentTitle={}, deadline={}", 
                userId, studyProjectId, assignmentTitle, deadline);
        
        // 과제 제출일 당일 일정만 생성
        String submissionContent = String.format("[과제 제출일] %s - %s", 
                getStudyProjectName(studyProjectId), assignmentTitle);
        
        Schedule submissionSchedule = Schedule.builder()
                .userId(userId)
                .studyProjectId(studyProjectId)
                .content(submissionContent)
                .schTime(localDateTimeToTimestamp(deadline))
                .build();
        
        Schedule savedSubmissionSchedule = scheduleRepository.save(submissionSchedule);
        log.info("과제 제출일 일정 생성 완료: schId={}", savedSubmissionSchedule.getSchId());
        
        return convertToResponse(savedSubmissionSchedule);
    }
    
    /**
     * 스터디 시작/종료일에 맞춰 자동으로 일정 추가
     */
    @Transactional
    public void createStudyPeriodSchedules(String userId, Long studyProjectId, String studyProjectName, 
                                         LocalDateTime startDate, LocalDateTime endDate) {
        log.info("스터디 기간 일정 자동 생성: userId={}, studyProjectId={}, startDate={}, endDate={}", 
                userId, studyProjectId, startDate, endDate);
        
        // 스터디 시작일 일정
        String startContent = String.format("[스터디 시작] %s", studyProjectName);
        Schedule startSchedule = Schedule.builder()
                .userId(userId)
                .studyProjectId(studyProjectId)
                .content(startContent)
                .schTime(localDateTimeToTimestamp(startDate))
                .build();
        
        scheduleRepository.save(startSchedule);
        log.info("스터디 시작일 일정 생성 완료");
        
        // 스터디 종료일 일정
        String endContent = String.format("[스터디 종료] %s", studyProjectName);
        Schedule endSchedule = Schedule.builder()
                .userId(userId)
                .studyProjectId(studyProjectId)
                .content(endContent)
                .schTime(localDateTimeToTimestamp(endDate))
                .build();
        
        scheduleRepository.save(endSchedule);
        log.info("스터디 종료일 일정 생성 완료");
    }
    
    /**
     * 사용자의 모든 일정 조회
     */
    public List<ScheduleResponse> getAllSchedulesByUserId(String userId) {
        log.info("사용자 전체 일정 조회: userId={}", userId);
        
        List<Schedule> schedules = scheduleRepository.findByUserIdOrderBySchTimeAsc(userId);
        List<ScheduleResponse> responses = schedules.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
        
        log.info("사용자 전체 일정 조회 완료: {}개", responses.size());
        return responses;
    }
    
    /**
     * 사용자의 개인 일정만 조회
     */
    public List<ScheduleResponse> getPersonalSchedulesByUserId(String userId) {
        log.info("사용자 개인 일정 조회: userId={}", userId);
        
        List<Schedule> schedules = scheduleRepository.findPersonalSchedulesByUserIdOrderBySchTimeAsc(userId);
        List<ScheduleResponse> responses = schedules.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
        
        log.info("사용자 개인 일정 조회 완료: {}개", responses.size());
        return responses;
    }
    
    /**
     * 사용자의 스터디 일정만 조회
     */
    public List<ScheduleResponse> getStudySchedulesByUserId(String userId) {
        log.info("사용자 스터디 일정 조회: userId={}", userId);
        
        List<Schedule> schedules = scheduleRepository.findStudySchedulesByUserIdOrderBySchTimeAsc(userId);
        List<ScheduleResponse> responses = schedules.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
        
        log.info("사용자 스터디 일정 조회 완료: {}개", responses.size());
        return responses;
    }
    
    /**
     * 특정 스터디의 모든 일정 조회
     */
    public List<ScheduleResponse> getSchedulesByStudyProjectId(Long studyProjectId) {
        log.info("스터디 일정 조회: studyProjectId={}", studyProjectId);
        
        List<Schedule> schedules = scheduleRepository.findByStudyProjectIdOrderBySchTimeAsc(studyProjectId);
        List<ScheduleResponse> responses = schedules.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
        
        log.info("스터디 일정 조회 완료: {}개", responses.size());
        return responses;
    }
    
    /**
     * 특정 기간의 일정 조회
     */
    public List<ScheduleResponse> getSchedulesByUserIdAndPeriod(String userId, LocalDateTime startTime, LocalDateTime endTime) {
        log.info("사용자 기간별 일정 조회: userId={}, startTime={}, endTime={}", userId, startTime, endTime);
        
        List<Schedule> schedules = scheduleRepository.findByUserIdAndSchTimeBetweenOrderBySchTimeAsc(
                userId, localDateTimeToTimestamp(startTime), localDateTimeToTimestamp(endTime));
        
        List<ScheduleResponse> responses = schedules.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
        
        log.info("사용자 기간별 일정 조회 완료: {}개", responses.size());
        return responses;
    }
    
    /**
     * 일정 수정
     */
    @Transactional
    public ScheduleResponse updateSchedule(Long schId, ScheduleRequest request) {
        log.info("일정 수정: schId={}", schId);
        
        Schedule schedule = scheduleRepository.findById(schId)
                .orElseThrow(() -> new IllegalArgumentException("일정을 찾을 수 없습니다: " + schId));
        
        // 권한 체크: 본인의 일정만 수정 가능
        if (!schedule.getUserId().equals(request.getUserId())) {
            throw new IllegalArgumentException("일정을 수정할 권한이 없습니다.");
        }
        
        schedule.setContent(request.getContent());
        schedule.setSchTime(localDateTimeToTimestamp(request.getSchTime()));
        
        Schedule updatedSchedule = scheduleRepository.save(schedule);
        log.info("일정 수정 완료: schId={}", updatedSchedule.getSchId());
        
        return convertToResponse(updatedSchedule);
    }
    
    /**
     * 일정 삭제
     */
    @Transactional
    public void deleteSchedule(Long schId, String userId) {
        log.info("일정 삭제: schId={}, userId={}", schId, userId);
        
        Schedule schedule = scheduleRepository.findById(schId)
                .orElseThrow(() -> new IllegalArgumentException("일정을 찾을 수 없습니다: " + schId));
        
        // 권한 체크: 본인의 일정만 삭제 가능
        if (!schedule.getUserId().equals(userId)) {
            throw new IllegalArgumentException("일정을 삭제할 권한이 없습니다.");
        }
        
        scheduleRepository.deleteById(schId);
        log.info("일정 삭제 완료: schId={}", schId);
    }
    
    // Entity를 Response DTO로 변환
    private ScheduleResponse convertToResponse(Schedule schedule) {
        return convertToResponse(schedule, null);
    }
    
    // Entity를 Response DTO로 변환 (스터디 정보 포함)
    private ScheduleResponse convertToResponse(Schedule schedule, StudyProject studyProject) {
        String scheduleType = schedule.isStudySchedule() ? "study" : "personal";
        String studyProjectName = null;
        
        if (schedule.isStudySchedule() && studyProject != null) {
            studyProjectName = studyProject.getStudyProjectName();
        } else if (schedule.isStudySchedule()) {
            studyProjectName = getStudyProjectName(schedule.getStudyProjectId());
        }
        
        return ScheduleResponse.builder()
                .schId(schedule.getSchId())
                .userId(schedule.getUserId())
                .studyProjectId(schedule.getStudyProjectId())
                .content(schedule.getContent())
                .schTime(timestampToLocalDateTime(schedule.getSchTime()))
                .scheduleType(scheduleType)
                .studyProjectName(studyProjectName)
                .build();
    }
    
    // 스터디 프로젝트명 조회
    private String getStudyProjectName(Long studyProjectId) {
        if (studyProjectId == null) return null;
        
        try {
            StudyProject studyProject = studyProjectRepository.findById(studyProjectId).orElse(null);
            return studyProject != null ? studyProject.getStudyProjectName() : "알 수 없는 스터디";
        } catch (Exception e) {
            log.warn("스터디 프로젝트명 조회 실패: studyProjectId={}", studyProjectId, e);
            return "알 수 없는 스터디";
        }
    }
    
    // LocalDateTime을 Timestamp로 변환
    private Timestamp localDateTimeToTimestamp(LocalDateTime localDateTime) {
        if (localDateTime == null) return null;
        return Timestamp.valueOf(localDateTime);
    }
    
    // Timestamp를 LocalDateTime으로 변환
    private LocalDateTime timestampToLocalDateTime(Timestamp timestamp) {
        if (timestamp == null) return null;
        return timestamp.toLocalDateTime();
    }
}
