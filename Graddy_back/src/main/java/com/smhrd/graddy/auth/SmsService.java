package com.smhrd.graddy.auth;

import net.nurigo.sdk.message.model.Message;
import net.nurigo.sdk.message.request.SingleMessageSendingRequest;
import net.nurigo.sdk.message.service.DefaultMessageService;
import org.springframework.stereotype.Service;

import org.springframework.beans.factory.annotation.Value;
// Dotenv import는 제거합니다.
// import io.github.cdimascio.dotenv.Dotenv;

@Service
public class SmsService {

    @Value("${SOLAPI_SENDER_NUMBER}")
    private String solapiSenderNumber;
    @Value("${SOLAPI_API_KEY}")
    private String apiKey;
    @Value("${SOLAPI_API_SECRET}")
    private String apiSecret;

    // @Value 어노테이션을 사용하여 생성자로 값을 주입받습니다.
    // 이 방식이 Spring에서 권장하는 '생성자 주입(Constructor Injection)' 방식입니다.
    // public SmsService(

    // @Value("${solapi.api.key}") String apiKey,
    // @Value("${solapi.api.secret}") String apiSecret) {
    // this.apiKey = apiKey;
    // this.apiSecret = apiSecret;
    // }

    public void sendVerificationCode(String phoneNumber, String verificationCode) {
        // TODO: 솔라피 SDK 의존성 설치 후 실제 SMS 발송 구현
        System.out.println("SMS 발송 시뮬레이션: " + phoneNumber + "로 인증번호 " + verificationCode + " 발송");
        System.out.println("실제 SMS 발송을 위해서는 솔라피 SDK 의존성을 설치하고 주석을 해제하세요.");

        // 실제 SMS 발송 코드 (의존성 설치 후 주석 해제)
        DefaultMessageService messageService = new DefaultMessageService(apiKey, apiSecret, "https://api.solapi.com");

        Message message = new Message();
        message.setFrom(solapiSenderNumber);
        message.setTo(phoneNumber);
        message.setText("Graddy 인증번호: " + verificationCode + "\n5분 내에 입력해주세요.");

        try {
            messageService.sendOne(new SingleMessageSendingRequest(message));
            System.out.println("SMS 발송 성공");
        } catch (Exception exception) {
            throw new RuntimeException("SMS 발송 중 오류 발생: " + exception.getMessage());
        }

    }
    
    /**
     * 스케줄 알림 문자 발송
     */
    public void sendScheduleNotification(String phoneNumber, String message) {
        // TODO: 솔라피 SDK 의존성 설치 후 실제 SMS 발송 구현
        System.out.println("스케줄 알림 SMS 발송 시뮬레이션: " + phoneNumber + "로 메시지 " + message + " 발송");
        System.out.println("실제 SMS 발송을 위해서는 솔라피 SDK 의존성을 설치하고 주석을 해제하세요.");

        // 실제 SMS 발송 코드 (의존성 설치 후 주석 해제)
        /*
        DefaultMessageService messageService = new DefaultMessageService(apiKey, apiSecret, "https://api.solapi.com");

        Message smsMessage = new Message();
        smsMessage.setFrom(solapiSenderNumber);
        smsMessage.setTo(phoneNumber);
        smsMessage.setText(message);

        try {
            messageService.sendOne(new SingleMessageSendingRequest(smsMessage));
            System.out.println("스케줄 알림 SMS 발송 성공");
        } catch (Exception e) {
            System.err.println("스케줄 알림 SMS 발송 실패: " + e.getMessage());
        }
        */
    }
}
