package com.smhrd.graddy.auth;

import io.github.cdimascio.dotenv.Dotenv;

import net.nurigo.sdk.message.model.Message;
import net.nurigo.sdk.message.request.SingleMessageSendingRequest;
import net.nurigo.sdk.message.service.DefaultMessageService;
import org.springframework.stereotype.Service;

@Service
public class SmsService {
    
    private final String senderNumber;
    private final String apiKey;
    private final String apiSecret;
    
    public SmsService() {
        Dotenv dotenv = Dotenv.load();
        this.senderNumber = dotenv.get("SOLAPI_SENDER_NUMBER");
        this.apiKey = dotenv.get("SOLAPI_API_KEY");
        this.apiSecret = dotenv.get("SOLAPI_API_SECRET");
    }
    
    public void sendVerificationCode(String phoneNumber, String verificationCode) {
        // TODO: 솔라피 SDK 의존성 설치 후 실제 SMS 발송 구현
        System.out.println("SMS 발송 시뮬레이션: " + phoneNumber + "로 인증번호 " + verificationCode + " 발송");
        System.out.println("실제 SMS 발송을 위해서는 솔라피 SDK 의존성을 설치하고 주석을 해제하세요.");
        

        // 실제 SMS 발송 코드 (의존성 설치 후 주석 해제)
        DefaultMessageService messageService = new DefaultMessageService(apiKey, apiSecret, "https://api.solapi.com");
        
        Message message = new Message();
        message.setFrom(senderNumber);
        message.setTo(phoneNumber);
        message.setText("Graddy 인증번호: " + verificationCode + "\n5분 내에 입력해주세요.");
        
        try {
            messageService.sendOne(new SingleMessageSendingRequest(message));
            System.out.println("SMS 발송 성공");
        } catch (Exception exception) {
            throw new RuntimeException("SMS 발송 중 오류 발생: " + exception.getMessage());
        }

    }
}
