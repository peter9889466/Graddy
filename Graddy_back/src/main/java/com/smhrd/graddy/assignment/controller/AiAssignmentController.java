package com.smhrd.graddy.assignment.controller;

import com.smhrd.graddy.assignment.dto.AiAssignmentRequest;
import com.smhrd.graddy.assignment.dto.AiAssignmentResponse;
import com.smhrd.graddy.assignment.service.AiAssignmentService;
import com.smhrd.graddy.security.jwt.JwtUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/assignments/ai")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "AI 과제 생성 API", description = "AI 과제 생성 API")
public class AiAssignmentController {
    
    private final AiAssignmentService aiAssignmentService;
    private final JwtUtil jwtUtil;
    
    /**
     * AI 과제 생성
     */
    @PostMapping("/generate")
    @Operation(summary = "AI 과제 생성", description = "스터디의 태그, 레벨, 커리큘럼을 기반으로 AI가 과제를 생성합니다.")
    public ResponseEntity<AiAssignmentResponse> generateAiAssignment(
            @RequestHeader("Authorization") String authorization,
            @RequestBody AiAssignmentRequest request) {
        
        String userId = jwtUtil.extractUserId(authorization.replace("Bearer ", ""));
        log.info("AI 과제 생성 요청: userId={}, studyProjectId={}, assignmentType={}", 
                userId, request.getStudyProjectId(), request.getAssignmentType());
        
        AiAssignmentResponse response = aiAssignmentService.generateAiAssignment(request, userId);
        
        log.info("AI 과제 생성 완료: assignmentId={}", response.getAssignmentId());
        return ResponseEntity.ok(response);
    }
}
