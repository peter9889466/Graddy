package com.smhrd.graddy.service;

import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

/**
 * 파일 서비스 인터페이스
 * 로컬 파일 시스템 또는 S3 스토리지를 추상화
 */
public interface FileService {
    
    /**
     * 파일을 업로드
     * 
     * @param file 업로드할 파일
     * @param folder 저장할 폴더명
     * @return 업로드된 파일의 URL
     * @throws IOException 업로드 실패 시
     */
    String uploadFile(MultipartFile file, String folder) throws IOException;
    
    /**
     * 파일을 삭제
     * 
     * @param fileUrl 삭제할 파일의 URL
     * @return 삭제 성공 여부
     */
    boolean deleteFile(String fileUrl);
    
    /**
     * 파일 존재 여부 확인
     * 
     * @param fileUrl 확인할 파일의 URL
     * @return 파일 존재 여부
     */
    boolean fileExists(String fileUrl);
    
    /**
     * 저장소 초기화 (필요한 경우)
     */
    void initializeStorage();
}
