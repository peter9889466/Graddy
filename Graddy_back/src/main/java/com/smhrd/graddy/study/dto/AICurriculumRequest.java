package com.smhrd.graddy.study.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
public class AICurriculumRequest {
    private Long studyId;
    private String studyName;
    private String studyTitle;
    private String studyDesc;
    private Integer studyLevel;
    private List<String> interestTags;
    private String studyStart;
    private String studyEnd;
}
