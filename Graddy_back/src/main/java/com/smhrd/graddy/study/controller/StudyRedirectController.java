package com.smhrd.graddy.study.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 스터디 API 경로 호환성을 위한 리다이렉트 컨트롤러
 * 기존 /study/{id} 경로를 /studies-projects/{id}로 리다이렉트
 */
@RestController
@RequestMapping("/api/study")
public class StudyRedirectController {

    /**
     * 기존 /study/{id} 경로를 /studies-projects/{id}로 리다이렉트
     * @param studyProjectId 스터디/프로젝트 ID
     * @return 리다이렉트 응답
     */
    @GetMapping("/{studyProjectId}")
    public ResponseEntity<Void> redirectToStudyProject(@PathVariable Long studyProjectId) {
        // 301 Permanent Redirect로 리다이렉트
        return ResponseEntity.status(HttpStatus.MOVED_PERMANENTLY)
                .header("Location", "/api/studies-projects/" + studyProjectId)
                .build();
    }
}
