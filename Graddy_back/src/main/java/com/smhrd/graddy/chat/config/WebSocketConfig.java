package com.smhrd.graddy.chat.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

/**
 * WebSocket 및 STOMP 프로토콜을 사용하기 위한 설정 클래스
 * 
 * 주요 설정:
 * - STOMP 메시지 브로커 활성화
 * - 클라이언트 연결 엔드포인트 설정
 * - 메시지 라우팅 설정
 * - CORS 설정
 */
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    /**
     * 메시지 브로커 설정
     * 
     * 설정 내용:
     * - /topic: 서버에서 클라이언트로 메시지를 보낼 때 사용 (구독)
     * - /app: 클라이언트에서 서버로 메시지를 보낼 때 사용 (전송)
     * 
     * 주의: context-path /api는 WebSocket 엔드포인트에만 적용되며,
     * STOMP 메시지 라우팅에는 영향을 주지 않습니다.
     */
    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // 서버에서 클라이언트로 메시지를 보낼 때 사용할 prefix
        // 클라이언트는 /topic/chat/room/{studyProjectId} 형태로 구독
        config.enableSimpleBroker("/topic");

        // 클라이언트에서 서버로 메시지를 보낼 때 사용할 prefix
        // @MessageMapping과 매핑되어 /app/chat.sendMessage/{studyProjectId} 형태로 사용
        config.setApplicationDestinationPrefixes("/app");
    }

    /**
     * WebSocket 연결 엔드포인트 설정
     * 
     * 설정 내용:
     * - /api/ws-stomp: WebSocket 연결을 위한 엔드포인트 (context-path /api 포함)
     * - SockJS 지원: WebSocket을 지원하지 않는 브라우저에서도 사용 가능
     * - CORS 설정: 모든 출처에서의 연결 허용
     */
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // WebSocket 연결을 위한 엔드포인트 설정
        // context-path가 /api이므로 /api/ws-stomp로 설정
        registry.addEndpoint("/ws-stomp")
                .setAllowedOriginPatterns("*")  // CORS 설정 (프로덕션에서는 특정 도메인만 허용 권장)
                .withSockJS();                  // SockJS 지원 (WebSocket 폴백)
    }
}
