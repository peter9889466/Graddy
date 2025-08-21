package com.smhrd.graddy.study.dto;

public class AICurriculumResponse {
    private Long studyId;
    private String curriculum;
    private String message;
    private boolean success;

    // 기본 생성자
    public AICurriculumResponse() {
        this.success = false;
    }

    // 전체 생성자
    public AICurriculumResponse(Long studyId, String curriculum, String message, boolean success) {
        this.studyId = studyId;
        this.curriculum = curriculum;
        this.message = message;
        this.success = success;
    }

    // 빌더 패턴
    public static Builder builder() {
        return new Builder();
    }

    // Getter와 Setter
    public Long getStudyId() { return studyId; }
    public void setStudyId(Long studyId) { this.studyId = studyId; }

    public String getCurriculum() { return curriculum; }
    public void setCurriculum(String curriculum) { this.curriculum = curriculum; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }

    // 빌더 클래스
    public static class Builder {
        private Long studyId;
        private String curriculum;
        private String message;
        private boolean success = false;

        public Builder studyId(Long studyId) {
            this.studyId = studyId;
            return this;
        }

        public Builder curriculum(String curriculum) {
            this.curriculum = curriculum;
            return this;
        }

        public Builder message(String message) {
            this.message = message;
            return this;
        }

        public Builder success(boolean success) {
            this.success = success;
            return this;
        }

        public AICurriculumResponse build() {
            return new AICurriculumResponse(studyId, curriculum, message, success);
        }
    }
}
