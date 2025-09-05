package com.smhrd.graddy.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

/**
 * 로컬 파일 스토리지 서비스
 * AWS S3 대신 로컬 디스크에 파일을 저장합니다.
 */
@Service("localFileService")
@Slf4j
public class LocalFileService implements FileService {

    @Value("${file.upload.path:uploads}")
    private String uploadPath;

    /**
     * 파일을 로컬 디스크에 저장합니다.
     * 
     * @param file 업로드할 파일
     * @param folder 저장할 폴더 (예: "assignments", "submissions")
     * @return 저장된 파일의 URL
     */
    public String uploadFile(MultipartFile file, String folder) {
        try {
            if (file == null || file.isEmpty()) {
                throw new IllegalArgumentException("파일이 비어있습니다.");
            }

            // 업로드 디렉토리 생성
            String uploadDir = uploadPath + File.separator + folder;
            Path uploadDirPath = Paths.get(uploadDir);
            if (!Files.exists(uploadDirPath)) {
                Files.createDirectories(uploadDirPath);
                log.info("디렉토리 생성: {}", uploadDirPath);
            }

            // 파일명 생성 (중복 방지를 위해 UUID + 현재 시간 사용)
            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            
            String fileName = UUID.randomUUID().toString() + 
                            "_" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss")) + 
                            extension;

            // 파일 저장
            Path filePath = uploadDirPath.resolve(fileName);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            // 저장된 파일의 URL 반환 (웹에서 접근 가능한 경로)
            String fileUrl = "/api/files/" + folder + "/" + fileName;
            
            log.info("파일 업로드 완료: {} -> {}", originalFilename, fileUrl);
            return fileUrl;

        } catch (IOException e) {
            log.error("파일 업로드 실패: {}", file.getOriginalFilename(), e);
            throw new RuntimeException("파일 업로드에 실패했습니다: " + e.getMessage(), e);
        }
    }

    /**
     * 저장된 파일을 삭제합니다.
     * 
     * @param fileUrl 삭제할 파일의 URL
     * @return 삭제 성공 여부
     */
    public boolean deleteFile(String fileUrl) {
        try {
            if (fileUrl == null || !fileUrl.startsWith("/api/files/")) {
                return false;
            }

            // URL에서 실제 파일 경로 추출
            String relativePath = fileUrl.replace("/api/files/", "");
            Path filePath = Paths.get(uploadPath, relativePath);

            if (Files.exists(filePath)) {
                Files.delete(filePath);
                log.info("파일 삭제 완료: {}", fileUrl);
                return true;
            } else {
                log.warn("삭제할 파일이 존재하지 않습니다: {}", fileUrl);
                return false;
            }

        } catch (IOException e) {
            log.error("파일 삭제 실패: {}", fileUrl, e);
            return false;
        }
    }

    /**
     * 파일 존재 여부를 확인합니다.
     * 
     * @param fileUrl 확인할 파일의 URL
     * @return 파일 존재 여부
     */
    public boolean fileExists(String fileUrl) {
        try {
            if (fileUrl == null || !fileUrl.startsWith("/api/files/")) {
                return false;
            }

            String relativePath = fileUrl.replace("/api/files/", "");
            Path filePath = Paths.get(uploadPath, relativePath);
            return Files.exists(filePath);

        } catch (Exception e) {
            log.error("파일 존재 확인 실패: {}", fileUrl, e);
            return false;
        }
    }

    /**
     * 업로드 디렉토리 초기화
     */
    public void initializeUploadDirectory() {
        initializeStorage();
    }
    
    @Override
    public void initializeStorage() {
        try {
            Path uploadDirPath = Paths.get(uploadPath);
            if (!Files.exists(uploadDirPath)) {
                Files.createDirectories(uploadDirPath);
                log.info("업로드 디렉토리 생성: {}", uploadDirPath);
            }
        } catch (IOException e) {
            log.error("업로드 디렉토리 생성 실패: {}", uploadPath, e);
        }
    }
}
