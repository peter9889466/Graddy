package com.smhrd.graddy.auth;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class InMemoryVerificationCodeStore implements VerificationCodeStore {
    
    private final Map<String, VerificationInfo> verificationStore = new ConcurrentHashMap<>();
    
    private static class VerificationInfo {
        private final String code;
        private final LocalDateTime expireTime;
        
        public VerificationInfo(String code) {
            this.code = code;
            this.expireTime = LocalDateTime.now().plusMinutes(5);
        }
        
        public boolean isExpired() {
            return LocalDateTime.now().isAfter(expireTime);
        }
    }
    
    @Override
    public void saveCode(String phoneNumber, String code) {
        verificationStore.put(phoneNumber, new VerificationInfo(code));
    }
    
    @Override
    public boolean verifyCode(String phoneNumber, String inputCode) {
        VerificationInfo info = verificationStore.get(phoneNumber);
        
        if (info == null || info.isExpired()) {
            verificationStore.remove(phoneNumber);
            return false;
        }
        
        if (info.code.equals(inputCode)) {
            verificationStore.remove(phoneNumber);
            return true;
        }
        
        return false;
    }
    
    @Override
    public void removeCode(String phoneNumber) {
        verificationStore.remove(phoneNumber);
    }
    
    // 주기적으로 만료된 데이터 정리
    @Scheduled(fixedRate = 60000) // 1분마다 실행
    public void cleanupExpiredCodes() {
        verificationStore.entrySet().removeIf(entry -> entry.getValue().isExpired());
    }
}
