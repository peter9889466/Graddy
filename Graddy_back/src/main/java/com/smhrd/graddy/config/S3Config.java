package com.smhrd.graddy.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;

import java.net.URI;

/**
 * AWS S3 설정 클래스
 * 프로파일에 따라 실제 AWS S3 또는 LocalStack을 사용
 */
@Configuration
@Slf4j
public class S3Config {

    @Value("${aws.s3.region:ap-northeast-2}")
    private String region;

    @Value("${aws.s3.access-key}")
    private String accessKey;

    @Value("${aws.s3.secret-key}")
    private String secretKey;

    @Value("${aws.s3.endpoint:}")
    private String endpoint;

    /**
     * 실제 AWS S3용 클라이언트 (production, staging 환경)
     */
    @Bean
    @Profile({"prod", "staging", "default"})
    public S3Client s3Client() {
        log.info("실제 AWS S3 클라이언트 생성");
        log.info("AWS S3 Region: {}", region);
        
        return S3Client.builder()
                .region(Region.of(region))
                .credentialsProvider(StaticCredentialsProvider.create(
                        AwsBasicCredentials.create(accessKey, secretKey)))
                .build();
    }

    /**
     * LocalStack용 S3 클라이언트 (development, test 환경)
     */
    @Bean
    @Profile({"dev", "test", "local"})
    public S3Client localStackS3Client() {
        log.info("LocalStack S3 클라이언트 생성");
        log.info("LocalStack Endpoint: {}", endpoint);
        log.info("AWS S3 Region: {}", region);
        
        // LocalStack의 경우 임시 자격 증명 사용
        String localAccessKey = "test";
        String localSecretKey = "test";
        
        if (accessKey != null && !accessKey.isEmpty()) {
            localAccessKey = accessKey;
        }
        if (secretKey != null && !secretKey.isEmpty()) {
            localSecretKey = secretKey;
        }
        
        log.info("LocalStack Access Key: {}", localAccessKey);
        
        return S3Client.builder()
                .endpointOverride(URI.create(endpoint.isEmpty() ? "https://s3.ap-northeast-1.amazonaws.com" : endpoint))
                .region(Region.of(region))
                .credentialsProvider(StaticCredentialsProvider.create(
                        AwsBasicCredentials.create(localAccessKey, localSecretKey)))
                .forcePathStyle(true) // LocalStack에서는 path-style 접근 필요
                .build();
    }
}
