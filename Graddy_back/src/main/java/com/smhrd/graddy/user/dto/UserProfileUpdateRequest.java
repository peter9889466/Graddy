package com.smhrd.graddy.user.dto;

import java.util.List;

public class UserProfileUpdateRequest {
    private String newPassword;      // 새 비밀번호 (선택)
    private String newNickname;      // 새 닉네임 (선택)
    private String newTel;           // 새 전화번호 (선택)
    private List<Integer> availableDays;  // 선호 요일 (선택) - [1,2,3] 또는 []
    private Integer soltStartHour;   // 선호 시작 시간 (선택) - 0-23
    private Integer soltEndHour;     // 선호 끝 시간 (선택) - 0-23
    
    public UserProfileUpdateRequest() {}
    
    public UserProfileUpdateRequest(String newPassword, String newNickname, String newTel) {
        this.newPassword = newPassword;
        this.newNickname = newNickname;
        this.newTel = newTel;
    }
    
    public UserProfileUpdateRequest(String newPassword, String newNickname, String newTel, 
                                   List<Integer> availableDays, Integer soltStartHour, Integer soltEndHour) {
        this.newPassword = newPassword;
        this.newNickname = newNickname;
        this.newTel = newTel;
        this.availableDays = availableDays;
        this.soltStartHour = soltStartHour;
        this.soltEndHour = soltEndHour;
    }
    
    // Getters
    public String getNewPassword() {
        return newPassword;
    }
    
    public String getNewNickname() {
        return newNickname;
    }
    
    public String getNewTel() {
        return newTel;
    }
    
    public List<Integer> getAvailableDays() {
        return availableDays;
    }
    
    public Integer getSoltStartHour() {
        return soltStartHour;
    }
    
    public Integer getSoltEndHour() {
        return soltEndHour;
    }
    
    // Setters
    public void setNewPassword(String newPassword) {
        this.newPassword = newPassword;
    }
    
    public void setNewNickname(String newNickname) {
        this.newNickname = newNickname;
    }
    
    public void setNewTel(String newTel) {
        this.newTel = newTel;
    }
    
    public void setAvailableDays(List<Integer> availableDays) {
        this.availableDays = availableDays;
    }
    
    public void setSoltStartHour(Integer soltStartHour) {
        this.soltStartHour = soltStartHour;
    }
    
    public void setSoltEndHour(Integer soltEndHour) {
        this.soltEndHour = soltEndHour;
    }
    
    // 유틸리티 메서드들
    public boolean hasNewPassword() {
        return newPassword != null && !newPassword.trim().isEmpty();
    }
    
    public boolean hasNewNickname() {
        return newNickname != null && !newNickname.trim().isEmpty();
    }
    
    public boolean hasNewTel() {
        return newTel != null && !newTel.trim().isEmpty();
    }
    
    public boolean hasAvailableDays() {
        return availableDays != null;
    }
    
    public boolean hasTimePreference() {
        return soltStartHour != null && soltEndHour != null;
    }
    
    public boolean hasValidTimePreference() {
        return hasTimePreference() && 
               soltStartHour >= 0 && soltStartHour <= 23 &&
               soltEndHour >= 0 && soltEndHour <= 23;
    }
    
    public boolean hasAnyUpdate() {
        return hasNewPassword() || hasNewNickname() || hasNewTel() || 
               hasAvailableDays() || hasTimePreference();
    }
}
