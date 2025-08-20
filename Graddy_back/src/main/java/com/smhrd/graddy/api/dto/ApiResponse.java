package com.smhrd.graddy.api.dto;

import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.net.URI; // URI import 추가

@Getter
public class ApiResponse<T> {

    private final int status;
    private final String message;
    private final T data;

    private ApiResponse(int status, String message, T data) {
        this.status = status;
        this.message = message;
        this.data = data;
    }

    /**
     * 성공 (200 OK) 응답을 생성하는 정적 메서드
     */
    public static <T> ResponseEntity<ApiResponse<T>> success(String message, T data) {
        return ResponseEntity.ok(new ApiResponse<>(HttpStatus.OK.value(), message, data));
    }

    /**
     * [추가] 생성 성공 (201 Created) 응답을 생성하는 정적 메서드
     * @param location 생성된 리소스의 URI
     * @param message 성공 메시지
     * @param data 포함될 데이터
     * @return ResponseEntity<ApiResponse<T>>
     */
    public static <T> ResponseEntity<ApiResponse<T>> created(URI location, String message, T data) {
        return ResponseEntity.created(location)
                .body(new ApiResponse<>(HttpStatus.CREATED.value(), message, data));
    }

    /**
     * 실패 응답을 생성하는 정적 메서드
     */
    public static <T> ResponseEntity<ApiResponse<T>> error(HttpStatus status, String message, T data) {
        return ResponseEntity.status(status)
                .body(new ApiResponse<>(status.value(), message, data));
    }
}