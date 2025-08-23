package com.smhrd.graddy.study.service;

import com.smhrd.graddy.study.dto.AICurriculumResponse;
import com.smhrd.graddy.study.entity.StudyProject;
import com.smhrd.graddy.study.repository.StudyProjectRepository;
import com.smhrd.graddy.tag.entity.Tag;
import com.smhrd.graddy.tag.repository.TagRepository;
import com.smhrd.graddy.interest.entity.Interest;
import com.smhrd.graddy.interest.repository.InterestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.File;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AICurriculumService {

    @Autowired
    private StudyProjectRepository studyProjectRepository;

    @Autowired
    private TagRepository tagRepository;

    @Autowired
    private InterestRepository interestRepository;

    public AICurriculumResponse generateCurriculum(Long studyProjectId) {
        try {
            // 스터디/프로젝트 정보 조회
            StudyProject studyProject = studyProjectRepository.findById(studyProjectId)
                    .orElseThrow(() -> new RuntimeException("스터디/프로젝트를 찾을 수 없습니다."));

            // 스터디/프로젝트의 관심 태그들 조회
            List<Tag> tags = tagRepository.findByStudyProjectId(studyProjectId);
            List<String> interestNames = tags.stream()
                    .map(tag -> {
                        Interest interest = interestRepository.findById(tag.getInterestId())
                                .orElse(null);
                        return interest != null ? interest.getInterestName() : "";
                    })
                    .filter(name -> !name.isEmpty())
                    .collect(Collectors.toList());

            // Python 스크립트 실행을 위한 명령어 구성
            String pythonScript = "python";
            String scriptPath = "Graddy_back/scripts/generate_curriculum.py";
            
            // 명령어 인자 구성
            ProcessBuilder processBuilder = new ProcessBuilder(
                pythonScript, 
                scriptPath,
                studyProjectId.toString(),
                studyProject.getStudyProjectName(),
                studyProject.getStudyProjectTitle(),
                studyProject.getStudyProjectDesc(),
                String.valueOf(studyProject.getStudyLevel()),
                String.join(",", interestNames),
                studyProject.getStudyProjectStart().toString(),
                studyProject.getStudyProjectEnd().toString()
            );
            
            // 프로젝트 루트 디렉토리에서 실행
            processBuilder.directory(new File(".."));
            
            // 환경변수 설정 (현재 Java 프로세스의 환경변수 상속)
            Map<String, String> env = processBuilder.environment();
            
            // 프로세스 실행
            Process process = processBuilder.start();
            
            // 결과 읽기
            BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()));
            StringBuilder output = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) {
                output.append(line).append("\n");
            }

            // 에러 스트림 읽기
            BufferedReader errorReader = new BufferedReader(new InputStreamReader(process.getErrorStream()));
            StringBuilder errorOutput = new StringBuilder();
            while ((line = errorReader.readLine()) != null) {
                errorOutput.append(line).append("\n");
            }

            // 프로세스 완료 대기
            int exitCode = process.waitFor();

            if (exitCode == 0) {
                // 성공적으로 커리큘럼 생성
                String curriculum = output.toString().trim();
                
                // 스터디/프로젝트에 커리큘럼 저장
                studyProject.setCurText(curriculum);
                studyProjectRepository.save(studyProject);

                return AICurriculumResponse.builder()
                        .studyId(studyProjectId)
                        .curriculum(curriculum)
                        .message("AI 커리큘럼이 성공적으로 생성되었습니다.")
                        .success(true)
                        .build();
            } else {
                // 에러 발생
                return AICurriculumResponse.builder()
                        .studyId(studyProjectId)
                        .curriculum(null)
                        .message("AI 커리큘럼 생성 중 오류가 발생했습니다: " + errorOutput.toString())
                        .success(false)
                        .build();
            }

        } catch (Exception e) {
            return AICurriculumResponse.builder()
                    .studyId(studyProjectId)
                    .curriculum(null)
                    .message("AI 커리큘럼 생성 중 오류가 발생했습니다: " + e.getMessage())
                    .success(false)
                    .build();
        }
    }
}
