package com.smhrd.graddy.study;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/studies")
public class StudyController {

    @GetMapping
    public List<String> getStudies() {
        return List.of("스터디 A", "스터디 B");
    }

}
