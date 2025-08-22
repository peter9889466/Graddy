package com.smhrd.graddy.auth;

public interface VerificationCodeStore {
    void saveCode(String phoneNumber, String code);
    boolean verifyCode(String phoneNumber, String inputCode);
    void removeCode(String phoneNumber);
}
