package com.smhrd.graddy.auth;

import org.springframework.stereotype.Service;

@Service
public class VerificationService {
    
    private final VerificationCodeStore codeStore;
    private final VerificationCodeGenerator codeGenerator;
    private final SmsService smsService;
    
    public VerificationService(VerificationCodeStore codeStore,
                             VerificationCodeGenerator codeGenerator,
                             SmsService smsService) {
        this.codeStore = codeStore;
        this.codeGenerator = codeGenerator;
        this.smsService = smsService;
    }
    
    public void sendVerificationCode(String phoneNumber) {
        // 인증번호 생성
        String code = codeGenerator.generateCode();
        
        // 저장
        codeStore.saveCode(phoneNumber, code);
        
        // SMS 발송
        smsService.sendVerificationCode(phoneNumber, code);
    }
    
    public boolean verifyCode(String phoneNumber, String inputCode) {
        return codeStore.verifyCode(phoneNumber, inputCode);
    }
}
