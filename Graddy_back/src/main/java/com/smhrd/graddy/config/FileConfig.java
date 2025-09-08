package com.smhrd.graddy.config;

import com.smhrd.graddy.service.FileService;
import com.smhrd.graddy.service.LocalFileService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.lang.NonNull;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.context.ApplicationContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.InitializingBean;

import java.nio.file.Path;
import java.nio.file.Paths;

/**
 * 파일 관련 설정
 */
@Configuration
@Slf4j
public class FileConfig implements WebMvcConfigurer, InitializingBean {

    private FileService fileService;
    private final LocalFileService localFileService;

    @Value("${file.storage.type:local}")
    private String storageType;

    @Value("${file.storage.service:localFileService}")
    private String fileStorageServiceName;

    @Autowired
    private ApplicationContext applicationContext;

    public FileConfig(LocalFileService localFileService) {
        this.localFileService = localFileService;
    }

    @Override
    public void afterPropertiesSet() throws Exception {
        try {
            this.fileService = applicationContext.getBean(fileStorageServiceName, FileService.class);
            log.info("FileService 빈 주입 완료: {}", fileStorageServiceName);
        } catch (Exception e) {
            log.warn("지정된 FileService를 찾을 수 없음 ({}), LocalFileService 사용", fileStorageServiceName);
            this.fileService = localFileService;
        }
    }
    
    @Value("${file.upload.path:uploads}")
    private String uploadPath;

    /**
     * 정적 리소스 핸들러 추가 - 파일 서빙을 위해 필요
     */
    @Override
    public void addResourceHandlers(@NonNull ResourceHandlerRegistry registry) {
        log.info("🔧 [DEBUG] 정적 리소스 핸들러 설정 시작 (스토리지 타입: {})", storageType);
        
        // 로컬 스토리지를 사용하는 경우에만 정적 리소스 핸들러 설정
        if ("local".equals(storageType)) {
            log.info("🔧 [DEBUG] 로컬 스토리지 - 업로드 경로: {}", uploadPath);
            
            String uploadLocation = "file:" + Paths.get(uploadPath).toAbsolutePath().toString() + "/";
            log.info("🔧 [DEBUG] 파일 리소스 위치: {}", uploadLocation);
            
            // 우리의 파일 핸들러 추가 (높은 우선순위로)
            registry.addResourceHandler("/files/**")
                    .addResourceLocations(uploadLocation)
                    .setCachePeriod(3600) // 1시간 캐시
                    .resourceChain(true);  // 리소스 체인 활성화
                    
            log.info("✅ [DEBUG] 로컬 스토리지 정적 리소스 핸들러 설정 완료: /files/** -> {}", uploadLocation);
            log.info("🔧 [DEBUG] Context-path 적용으로 실제 경로: /api/files/**");
            
            // 추가 디버깅 정보
            log.info("🔧 [DEBUG] 절대 경로: {}", Paths.get(uploadPath).toAbsolutePath());
            log.info("🔧 [DEBUG] 현재 작업 디렉토리: {}", System.getProperty("user.dir"));
            
            // uploads 디렉토리 존재 확인
            Path uploadsPath = Paths.get(uploadPath);
            if (!uploadsPath.toFile().exists()) {
                log.warn("⚠️ [DEBUG] uploads 디렉토리가 존재하지 않음: {}", uploadsPath.toAbsolutePath());
                try {
                    boolean created = uploadsPath.toFile().mkdirs();
                    log.info("🔧 [DEBUG] uploads 디렉토리 생성 시도: {}", created);
                } catch (Exception e) {
                    log.error("❌ [DEBUG] uploads 디렉토리 생성 실패", e);
                }
            } else {
                log.info("✅ [DEBUG] uploads 디렉토리 존재 확인: {}", uploadsPath.toAbsolutePath());
            }
        } else {
            log.info("🔧 [DEBUG] S3 스토리지 사용 - 정적 리소스 핸들러 설정 생략");
        }
    }

    /**
     * CORS 설정 - 파일 업로드/다운로드를 위한 크로스 오리진 허용
     */
    @Override
    public void addCorsMappings(@NonNull CorsRegistry registry) {
        log.info("🔧 [DEBUG] CORS 설정 시작");
        
        // 파일 관련 엔드포인트에 대한 CORS 설정
        registry.addMapping("/files/**")
                .allowedOrigins(
<<<<<<< HEAD
                    "http://localhost:3000",   // React 기본 포트
                    "http://localhost:5173",   // Vite 기본 포트
                    "http://localhost:8080",   // 같은 서버 (self)
                    "http://127.0.0.1:3000",
                    "http://127.0.0.1:5173"
=======
                    "http://ec2-3-113-246-191.ap-northeast-1.compute.amazonaws.com:80", // 배포 환경 도메인 (HTTP)
                    "https://ec2-3-113-246-191.ap-northeast-1.compute.amazonaws.com:443"  // HTTPS 지원
>>>>>>> fc0f1a701776b413607538a08e4af4cd90bca5ab
                )
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD")
                .allowedHeaders("*")
                .allowCredentials(true)
                .exposedHeaders("Content-Type", "Content-Length", "Content-Disposition")
                .maxAge(3600); // 1시간 캐시
        
        // 일반 API 엔드포인트에 대한 CORS 설정
        registry.addMapping("/api/**")
<<<<<<< HEAD
                .allowedOrigins(
                    "http://localhost:3000",
                    "http://localhost:5173", 
                    "http://127.0.0.1:3000",
                    "http://127.0.0.1:5173"
=======
                .allowedOriginPatterns(
                    "http://ec2-3-113-246-191.ap-northeast-1.compute.amazonaws.com:80", // 배포 환경 도메인 (HTTP)
                    "https://ec2-3-113-246-191.ap-northeast-1.compute.amazonaws.com:443"  // HTTPS 지원
>>>>>>> fc0f1a701776b413607538a08e4af4cd90bca5ab
                )
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
                
        log.info("✅ [DEBUG] CORS 설정 완료 - 파일 업로드/다운로드 크로스 오리진 허용");
    }

    /**
     * 애플리케이션 시작시 파일 스토리지 초기화
     */
    @Bean
    public ApplicationRunner initializeFileStorage() {
        return args -> {
            log.info("파일 스토리지 초기화 시작 (스토리지 타입: {})", storageType);
            fileService.initializeStorage();
            log.info("파일 스토리지 초기화 완료");
        };
    }
}
