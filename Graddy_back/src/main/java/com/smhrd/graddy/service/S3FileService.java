package com.smhrd.graddy.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;

import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

/**
 * AWS S3를 이용한 파일 업로드 서비스
 * LocalStack과 실제 S3 모두 지원
 */
@Service("s3FileService")
@RequiredArgsConstructor
@Slf4j
public class S3FileService implements FileService {

    private final S3Client s3Client;

    @Value("${aws.s3.bucket-name}")
    private String bucketName;

    @Value("${aws.s3.endpoint:}")
    private String endpoint;

    @Value("${spring.profiles.active:default}")
    private String activeProfile;

    /**
     * 파일을 S3에 업로드
     */
    public String uploadFile(MultipartFile file, String folder) throws IOException {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("파일이 비어있습니다.");
        }

        // 파일명 생성 (UUID + 타임스탬프 + 원본명)
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
        String fileName = UUID.randomUUID().toString() + "_" + timestamp + "_" + file.getOriginalFilename();
        String key = folder + "/" + fileName;

        log.info("S3 파일 업로드 시작: {}", key);
        log.info("파일 크기: {} bytes", file.getSize());
        log.info("Content Type: {}", file.getContentType());

        try {
            // S3에 파일 업로드
            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(key)
                    .contentType(file.getContentType())
                    .contentLength(file.getSize())
                    .build();

            s3Client.putObject(putObjectRequest, 
                    RequestBody.fromInputStream(file.getInputStream(), file.getSize()));

            // 업로드된 파일의 URL 생성
            String fileUrl = generateFileUrl(key);
            
            log.info("S3 파일 업로드 성공: {}", fileUrl);
            return fileUrl;

        } catch (Exception e) {
            log.error("S3 파일 업로드 실패: {}", key, e);
            throw new RuntimeException("파일 업로드에 실패했습니다: " + e.getMessage(), e);
        }
    }

    /**
     * S3에서 파일 삭제
     */
    public boolean deleteFile(String fileUrl) {
        try {
            String key = extractKeyFromUrl(fileUrl);
            if (key == null) {
                log.warn("파일 URL에서 키를 추출할 수 없습니다: {}", fileUrl);
                return false;
            }

            log.info("S3 파일 삭제 시작: {}", key);

            DeleteObjectRequest deleteObjectRequest = DeleteObjectRequest.builder()
                    .bucket(bucketName)
                    .key(key)
                    .build();

            s3Client.deleteObject(deleteObjectRequest);
            
            log.info("S3 파일 삭제 성공: {}", key);
            return true;

        } catch (Exception e) {
            log.error("S3 파일 삭제 실패: {}", fileUrl, e);
            return false;
        }
    }

    /**
     * 파일이 S3에 존재하는지 확인
     */
    public boolean fileExists(String fileUrl) {
        try {
            String key = extractKeyFromUrl(fileUrl);
            if (key == null) {
                return false;
            }

            HeadObjectRequest headObjectRequest = HeadObjectRequest.builder()
                    .bucket(bucketName)
                    .key(key)
                    .build();

            s3Client.headObject(headObjectRequest);
            return true;

        } catch (NoSuchKeyException e) {
            return false;
        } catch (Exception e) {
            log.error("파일 존재 확인 실패: {}", fileUrl, e);
            return false;
        }
    }

    @Override
    public void initializeStorage() {
        ensureBucketExists();
    }

    /**
     * S3 버킷이 존재하는지 확인하고, 없으면 생성
     */
    public void ensureBucketExists() {
        try {
            // 버킷 존재 확인
            HeadBucketRequest headBucketRequest = HeadBucketRequest.builder()
                    .bucket(bucketName)
                    .build();
            
            s3Client.headBucket(headBucketRequest);
            log.info("S3 버킷이 이미 존재합니다: {}", bucketName);

        } catch (NoSuchBucketException e) {
            // 버킷이 없으면 생성 (LocalStack에서만)
            if (isLocalStackEnvironment()) {
                try {
                    CreateBucketRequest createBucketRequest = CreateBucketRequest.builder()
                            .bucket(bucketName)
                            .build();
                    
                    s3Client.createBucket(createBucketRequest);
                    log.info("LocalStack S3 버킷 생성 완료: {}", bucketName);
                    
                    // CORS 설정 (웹에서 접근 가능하도록)
                    setupCorsConfiguration();
                    
                } catch (Exception createError) {
                    log.error("LocalStack S3 버킷 생성 실패: {}", bucketName, createError);
                }
            } else {
                log.error("실제 AWS S3 버킷이 존재하지 않습니다: {}", bucketName);
            }
        } catch (Exception e) {
            log.error("S3 버킷 확인 중 오류 발생: {}", bucketName, e);
        }
    }

    /**
     * CORS 설정 (LocalStack용)
     */
    private void setupCorsConfiguration() {
        try {
            CORSRule corsRule = CORSRule.builder()
                    .allowedHeaders("*")
                    .allowedMethods("GET", "PUT", "POST", "DELETE")
                    .allowedOrigins("*")
                    .exposeHeaders("ETag")
                    .maxAgeSeconds(3600)
                    .build();

            CORSConfiguration corsConfiguration = CORSConfiguration.builder()
                    .corsRules(corsRule)
                    .build();

            PutBucketCorsRequest putBucketCorsRequest = PutBucketCorsRequest.builder()
                    .bucket(bucketName)
                    .corsConfiguration(corsConfiguration)
                    .build();

            s3Client.putBucketCors(putBucketCorsRequest);
            log.info("S3 버킷 CORS 설정 완료: {}", bucketName);

        } catch (Exception e) {
            log.error("S3 버킷 CORS 설정 실패: {}", bucketName, e);
        }
    }

    /**
     * 파일 URL 생성
     */
    private String generateFileUrl(String key) {
        if (isLocalStackEnvironment()) {
            // LocalStack의 경우 직접 URL 구성
            String localstackEndpoint = endpoint.isEmpty() ? "http://localhost:4566" : endpoint;
            return localstackEndpoint + "/" + bucketName + "/" + key;
        } else {
            // 실제 AWS S3의 경우
            return String.format("https://%s.s3.%s.amazonaws.com/%s", 
                    bucketName, 
                    s3Client.serviceClientConfiguration().region().id(), 
                    key);
        }
    }

    /**
     * URL에서 S3 키 추출
     */
    private String extractKeyFromUrl(String fileUrl) {
        try {
            if (isLocalStackEnvironment()) {
                // LocalStack URL 형식: http://localhost:4566/bucket-name/folder/file.ext
                String prefix = "/" + bucketName + "/";
                int index = fileUrl.indexOf(prefix);
                if (index != -1) {
                    return fileUrl.substring(index + prefix.length());
                }
            } else {
                // AWS S3 URL 형식: https://bucket-name.s3.region.amazonaws.com/folder/file.ext
                String prefix = String.format("https://%s.s3.", bucketName);
                int startIndex = fileUrl.indexOf(prefix);
                if (startIndex != -1) {
                    int keyStartIndex = fileUrl.indexOf("/", startIndex + prefix.length() + 20); // region 부분 스킵
                    if (keyStartIndex != -1) {
                        return fileUrl.substring(keyStartIndex + 1);
                    }
                }
            }
            
            log.warn("URL에서 S3 키를 추출할 수 없습니다: {}", fileUrl);
            return null;
            
        } catch (Exception e) {
            log.error("URL에서 S3 키 추출 중 오류: {}", fileUrl, e);
            return null;
        }
    }

    /**
     * LocalStack 환경인지 확인
     */
    private boolean isLocalStackEnvironment() {
        return activeProfile.contains("dev") || 
               activeProfile.contains("test") || 
               activeProfile.contains("local") ||
               !endpoint.isEmpty();
    }
}
