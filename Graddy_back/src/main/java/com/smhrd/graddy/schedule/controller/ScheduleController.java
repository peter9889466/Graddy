package com.smhrd.graddy.schedule.controller;

import com.smhrd.graddy.schedule.dto.ScheduleRequest;
import com.smhrd.graddy.schedule.dto.ScheduleResponse;
import com.smhrd.graddy.schedule.service.ScheduleService;
import com.smhrd.graddy.security.jwt.JwtUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/schedules")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "일정 관리 API", description = "일정 관리 API")
public class ScheduleController {
    
    private final ScheduleService scheduleService;
    private final JwtUtil jwtUtil;
    
    /**
     * 개인 일정 생성
     */
    @PostMapping("/personal")
    @Operation(summary = "개인 일정 생성", description = "사용자의 개인 일정을 생성합니다.")
    public ResponseEntity<ScheduleResponse> createPersonalSchedule(
            @RequestHeader("Authorization") String authorization,
            @RequestBody ScheduleRequest request) {
        
        String userId = jwtUtil.extractUserId(authorization.replace("Bearer ", ""));
        request.setUserId(userId);
        
        ScheduleResponse response = scheduleService.createPersonalSchedule(request);
        return ResponseEntity.ok(response);
    }
    
    /**
     * 스터디 일정 생성
     */
    @PostMapping("/study")
    @Operation(summary = "스터디 일정 생성", description = "스터디 관련 일정을 생성합니다.")
    public ResponseEntity<ScheduleResponse> createStudySchedule(
            @RequestHeader("Authorization") String authorization,
            @RequestBody ScheduleRequest request) {
        
        String userId = jwtUtil.extractUserId(authorization.replace("Bearer ", ""));
        request.setUserId(userId);
        
        ScheduleResponse response = scheduleService.createStudySchedule(request);
        return ResponseEntity.ok(response);
    }
    
    /**
     * 사용자의 모든 일정 조회
     */
    @GetMapping("/my")
    @Operation(summary = "사용자 전체 일정 조회", description = "로그인한 사용자의 모든 일정(개인+스터디)을 조회합니다.")
    public ResponseEntity<List<ScheduleResponse>> getAllMySchedules(
            @RequestHeader("Authorization") String authorization) {
        
        String userId = jwtUtil.extractUserId(authorization.replace("Bearer ", ""));
        List<ScheduleResponse> schedules = scheduleService.getAllSchedulesByUserId(userId);
        
        return ResponseEntity.ok(schedules);
    }
    
    /**
     * 사용자의 개인 일정만 조회
     */
    // @GetMapping("/my/personal")
    // @Operation(summary = "사용자 개인 일정 조회", description = "로그인한 사용자의 개인 일정만 조회합니다.")
    // public ResponseEntity<List<ScheduleResponse>> getMyPersonalSchedules(
    //         @RequestHeader("Authorization") String authorization) {
        
    //     String userId = jwtUtil.extractUserId(authorization.replace("Bearer ", ""));
    //     List<ScheduleResponse> schedules = scheduleService.getPersonalSchedulesByUserId(userId);
        
    //     return ResponseEntity.ok(schedules);
    // }
    
    /**
     * 사용자의 스터디 일정만 조회
     */
    @GetMapping("/my/study")
    @Operation(summary = "사용자 스터디 일정 조회", description = "로그인한 사용자의 스터디 일정만 조회합니다.")
    public ResponseEntity<List<ScheduleResponse>> getMyStudySchedules(
            @RequestHeader("Authorization") String authorization) {
        
        String userId = jwtUtil.extractUserId(authorization.replace("Bearer ", ""));
        List<ScheduleResponse> schedules = scheduleService.getStudySchedulesByUserId(userId);
        
        return ResponseEntity.ok(schedules);
    }
    
    /**
     * 특정 스터디의 모든 일정 조회
     */
    @GetMapping("/study/{studyProjectId}")
    @Operation(summary = "스터디 일정 조회", description = "특정 스터디의 모든 일정을 조회합니다.")
    public ResponseEntity<List<ScheduleResponse>> getSchedulesByStudyProjectId(
            @PathVariable Long studyProjectId) {
        
        List<ScheduleResponse> schedules = scheduleService.getSchedulesByStudyProjectId(studyProjectId);
        return ResponseEntity.ok(schedules);
    }
    
    /**
     * 특정 기간의 일정 조회
     */
    // @GetMapping("/my/period")
    // @Operation(summary = "기간별 일정 조회", description = "로그인한 사용자의 특정 기간 일정을 조회합니다.")
    // public ResponseEntity<List<ScheduleResponse>> getSchedulesByPeriod(
    //         @RequestHeader("Authorization") String authorization,
    //         @RequestParam LocalDateTime startTime,
    //         @RequestParam LocalDateTime endTime) {
        
    //     String userId = jwtUtil.extractUserId(authorization.replace("Bearer ", ""));
    //     List<ScheduleResponse> schedules = scheduleService.getSchedulesByUserIdAndPeriod(userId, startTime, endTime);
        
    //     return ResponseEntity.ok(schedules);
    // }
    
    /**
     * 일정 수정
     */
    @PutMapping("/{schId}")
    @Operation(summary = "일정 수정", description = "기존 일정을 수정합니다.")
    public ResponseEntity<ScheduleResponse> updateSchedule(
            @RequestHeader("Authorization") String authorization,
            @PathVariable Long schId,
            @RequestBody ScheduleRequest request) {
        
        String userId = jwtUtil.extractUserId(authorization.replace("Bearer ", ""));
        request.setUserId(userId);
        
        ScheduleResponse response = scheduleService.updateSchedule(schId, request);
        return ResponseEntity.ok(response);
    }
    
    /**
     * 일정 삭제
     */
    @DeleteMapping("/{schId}")
    @Operation(summary = "일정 삭제", description = "기존 일정을 삭제합니다.")
    public ResponseEntity<Void> deleteSchedule(
            @RequestHeader("Authorization") String authorization,
            @PathVariable Long schId) {
        
        String userId = jwtUtil.extractUserId(authorization.replace("Bearer ", ""));
        scheduleService.deleteSchedule(schId, userId);
        
        return ResponseEntity.noContent().build();
    }
}
