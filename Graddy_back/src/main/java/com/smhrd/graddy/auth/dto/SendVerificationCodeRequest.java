package com.smhrd.graddy.auth.dto;

public class SendVerificationCodeRequest {
    private String phoneNumber;
    
    public SendVerificationCodeRequest() {}
    
    public SendVerificationCodeRequest(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }
    
    public String getPhoneNumber() {
        return phoneNumber;
    }
    
    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }
}
