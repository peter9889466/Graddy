package com.smhrd.graddy.user.dto;

public class UserProfileUpdateRequest {
    private String newPassword;      // 새 비밀번호 (선택)
    private String newNickname;      // 새 닉네임 (선택)
    private String newTel;           // 새 전화번호 (선택)
    
    public UserProfileUpdateRequest() {}
    
    public UserProfileUpdateRequest(String newPassword, String newNickname, String newTel) {
        this.newPassword = newPassword;
        this.newNickname = newNickname;
        this.newTel = newTel;
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
    
    public boolean hasAnyUpdate() {
        return hasNewPassword() || hasNewNickname() || hasNewTel();
    }
}
