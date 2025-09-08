package com.smhrd.graddy.controller;

import com.smhrd.graddy.api.dto.ApiResponse;
import com.smhrd.graddy.service.FileService;
import com.smhrd.graddy.service.LocalFileService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import jakarta.servlet.http.HttpServletRequest;
import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;

/**
 * 파일 업로드/다운로드 컨트롤러
 * 설정에 따라 로컬 파일 시스템 또는 S3를 사용하여 파일을 관리합니다.
 */
@RestController
@RequestMapping("/files")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173", "http://ec2-3-113-246-191.ap-northeast-1.compute.amazonaws.com"}, 
             methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS, RequestMethod.HEAD},
             allowedHeaders = "*", 
             allowCredentials = "true")
@Slf4j
@Tag(name = "File", description = "파일 업로드/다운로드 API")
public class FileController implements InitializingBean {

    private FileService fileService;
    private final LocalFileService localFileService;

    @Value("${file.storage.type:local}")
    private String storageType;

    @Value("${file.storage.service:localFileService}")
    private String fileStorageServiceName;

    @Autowired
    private ApplicationContext applicationContext;

    public FileController(LocalFileService localFileService) {
        this.localFileService = localFileService;
    }

    @Override
    public void afterPropertiesSet() throws Exception {
        try {
            this.fileService = applicationContext.getBean(fileStorageServiceName, FileService.class);
            log.info("FileController - FileService 빈 주입 완료: {}", fileStorageServiceName);
        } catch (Exception e) {
            log.warn("FileController - 지정된 FileService를 찾을 수 없음 ({}), LocalFileService 사용", fileStorageServiceName);
            this.fileService = localFileService;
        }
    }

    @Value("${file.upload.path:uploads}")
    private String uploadPath;

    /**
     * 과제 제출용 파일 업로드
     */
    @PostMapping("/upload/assignment")
    @Operation(summary = "과제 제출 파일 업로드", 
              description = "과제 제출시 첨부할 파일을 업로드합니다.")
    public ResponseEntity<ApiResponse<Map<String, String>>> uploadAssignmentFile(
            @Parameter(description = "업로드할 파일")
            @RequestParam("file") MultipartFile file,
            HttpServletRequest request) {
        
        try {
            log.info("과제 파일 업로드 요청: {} (스토리지 타입: {})", file.getOriginalFilename(), storageType);
            log.info("요청 헤더 - Authorization: {}", request.getHeader("Authorization") != null ? "있음" : "없음");
            log.info("요청 헤더 - Content-Type: {}", request.getHeader("Content-Type"));
            
            String fileUrl = fileService.uploadFile(file, "assignments");
            
            Map<String, String> response = new HashMap<>();
            response.put("fileUrl", fileUrl);
            response.put("fileName", file.getOriginalFilename());
            response.put("storageType", storageType);
            
            return ApiResponse.success("파일이 성공적으로 업로드되었습니다.", response);
            
        } catch (Exception e) {
            log.error("과제 파일 업로드 실패", e);
            return ApiResponse.error(HttpStatus.INTERNAL_SERVER_ERROR, 
                "파일 업로드에 실패했습니다: " + e.getMessage(), null);
        }
    }

    /**
     * 일반 파일 업로드
     */
    @PostMapping("/upload")
    @Operation(summary = "일반 파일 업로드", 
              description = "일반적인 용도의 파일을 업로드합니다.")
    public ResponseEntity<ApiResponse<Map<String, String>>> uploadFile(
            @Parameter(description = "업로드할 파일")
            @RequestParam("file") MultipartFile file,
            @Parameter(description = "저장할 폴더명 (선택사항)")
            @RequestParam(value = "folder", defaultValue = "general") String folder,
            HttpServletRequest request) {
        
        try {
            log.info("파일 업로드 요청: {} -> {} (스토리지 타입: {})", file.getOriginalFilename(), folder, storageType);
            log.info("요청 헤더 - Authorization: {}", request.getHeader("Authorization") != null ? "있음" : "없음");
            log.info("요청 헤더 - Content-Type: {}", request.getHeader("Content-Type"));
            
            String fileUrl = fileService.uploadFile(file, folder);
            
            Map<String, String> response = new HashMap<>();
            response.put("fileUrl", fileUrl);
            response.put("fileName", file.getOriginalFilename());
            response.put("storageType", storageType);
            
            return ApiResponse.success("파일이 성공적으로 업로드되었습니다.", response);
            
        } catch (Exception e) {
            log.error("파일 업로드 실패", e);
            return ApiResponse.error(HttpStatus.INTERNAL_SERVER_ERROR, 
                "파일 업로드에 실패했습니다: " + e.getMessage(), null);
        }
    }

    /**
     * 파일 다운로드/조회
     */
    @GetMapping("/{folder}/{fileName}")
    @Operation(summary = "파일 다운로드", 
              description = "업로드된 파일을 다운로드하거나 조회합니다.")
    public ResponseEntity<Resource> downloadFile(
            @Parameter(description = "폴더명")
            @PathVariable String folder,
            @Parameter(description = "파일명")
            @PathVariable String fileName,
            HttpServletRequest request) {
        
        try {
            log.info("🔍 [DEBUG] 파일 다운로드 요청: {}/{}", folder, fileName);
            log.info("🔍 [DEBUG] 요청 URL: {}", request.getRequestURL());
            log.info("🔍 [DEBUG] 요청 URI: {}", request.getRequestURI());
            log.info("🔍 [DEBUG] 컨텍스트 패스: {}", request.getContextPath());
            log.info("🔍 [DEBUG] 스토리지 타입: {}", storageType);
            log.info("🔍 [DEBUG] 업로드 경로: {}", uploadPath);
            log.info("🔍 [DEBUG] 현재 작업 디렉토리: {}", System.getProperty("user.dir"));
            
            Path filePath = Paths.get(uploadPath).resolve(folder).resolve(fileName);
            log.info("🔍 [DEBUG] 파일 전체 경로: {}", filePath.toAbsolutePath());
            log.info("🔍 [DEBUG] 파일 존재 여부: {}", Files.exists(filePath));
            log.info("🔍 [DEBUG] 파일 읽기 가능 여부: {}", Files.isReadable(filePath));
            
            if (Files.exists(filePath)) {
                log.info("🔍 [DEBUG] 파일 크기: {} bytes", Files.size(filePath));
                log.info("🔍 [DEBUG] 파일 마지막 수정일: {}", Files.getLastModifiedTime(filePath));
                try {
                    log.info("🔍 [DEBUG] 파일 권한: {}", Files.getPosixFilePermissions(filePath));
                } catch (UnsupportedOperationException e) {
                    log.info("🔍 [DEBUG] POSIX 권한 확인 불가 (Windows 환경)");
                }
            }
            
            Resource resource = new UrlResource(filePath.toUri());
            log.info("🔍 [DEBUG] Resource 생성 완료: {}", resource.getURI());
            
            if (!resource.exists() || !resource.isReadable()) {
                log.warn("❌ [DEBUG] 파일을 찾을 수 없거나 읽을 수 없습니다: {}", filePath);
                log.warn("❌ [DEBUG] Resource exists: {}, isReadable: {}", resource.exists(), resource.isReadable());
                
                // 추가 진단 정보
                if (!Files.exists(filePath)) {
                    log.error("💥 [DEBUG] 물리적 파일이 존재하지 않음: {}", filePath.toAbsolutePath());
                } else if (!Files.isReadable(filePath)) {
                    log.error("💥 [DEBUG] 파일 읽기 권한 없음: {}", filePath.toAbsolutePath());
                } else {
                    log.error("💥 [DEBUG] Resource 생성 문제: {}", resource.getURI());
                }
                
                return ResponseEntity.notFound().build();
            }
            
            // 파일의 MIME 타입 결정
            String contentType;
            try {
                contentType = Files.probeContentType(filePath);
                if (contentType == null) {
                    contentType = "application/octet-stream";
                }
                log.info("🔍 [DEBUG] 감지된 Content-Type: {}", contentType);
            } catch (IOException e) {
                contentType = "application/octet-stream";
                log.warn("🔍 [DEBUG] Content-Type 감지 실패, 기본값 사용: {}", contentType);
            }
            
            log.info("✅ [DEBUG] 파일 서빙 준비 완료: {}", fileName);
            
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, 
                           "inline; filename=\"" + resource.getFilename() + "\"")
                    .body(resource);
                    
        } catch (MalformedURLException e) {
            log.error("💥 [DEBUG] MalformedURLException 파일 다운로드 실패: {}/{}", folder, fileName, e);
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("💥 [DEBUG] 예상치 못한 오류 발생: {}/{}", folder, fileName, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * 파일 삭제
     */
    @DeleteMapping("/delete")
    @Operation(summary = "파일 삭제", 
              description = "업로드된 파일을 삭제합니다.")
    public ResponseEntity<ApiResponse<String>> deleteFile(
            @Parameter(description = "삭제할 파일의 URL")
            @RequestParam("fileUrl") String fileUrl) {
        
        try {
            log.info("파일 삭제 요청: {} (스토리지 타입: {})", fileUrl, storageType);
            
            boolean deleted = fileService.deleteFile(fileUrl);
            
            if (deleted) {
                return ApiResponse.success("파일이 성공적으로 삭제되었습니다.", fileUrl);
            } else {
                return ApiResponse.error(HttpStatus.NOT_FOUND, "삭제할 파일을 찾을 수 없습니다.", fileUrl);
            }
            
        } catch (Exception e) {
            log.error("파일 삭제 실패: {}", fileUrl, e);
            return ApiResponse.error(HttpStatus.INTERNAL_SERVER_ERROR, 
                "파일 삭제에 실패했습니다: " + e.getMessage(), fileUrl);
        }
    }
}
