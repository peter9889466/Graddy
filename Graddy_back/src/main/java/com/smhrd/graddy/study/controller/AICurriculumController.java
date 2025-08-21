package com.smhrd.graddy.study.controller;

import com.smhrd.graddy.study.dto.AICurriculumResponse;
import com.smhrd.graddy.study.service.AICurriculumService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai-curriculum")
@CrossOrigin(origins = "*")
public class AICurriculumController {

    @Autowired
    private AICurriculumService aiCurriculumService;

    @PostMapping("/generate/{studyId}")
    public ResponseEntity<AICurriculumResponse> generateCurriculum(@PathVariable Long studyId) {
        AICurriculumResponse response = aiCurriculumService.generateCurriculum(studyId);
        return ResponseEntity.ok(response);
    }
}
