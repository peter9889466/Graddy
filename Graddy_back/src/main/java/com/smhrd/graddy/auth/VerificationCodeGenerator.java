package com.smhrd.graddy.auth;

import org.springframework.stereotype.Component;

import java.util.Random;

@Component
public class VerificationCodeGenerator {
    
    public String generateCode() {
        // 6자리 랜덤 숫자 생성
        Random random = new Random();
        StringBuilder code = new StringBuilder();
        
        for (int i = 0; i < 6; i++) {
            code.append(random.nextInt(10));
        }
        
        return code.toString();
    }
}
