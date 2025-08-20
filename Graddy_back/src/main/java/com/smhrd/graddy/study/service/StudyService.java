package com.smhrd.graddy.study.service;

import com.smhrd.graddy.study.dto.StudyRequest;
import com.smhrd.graddy.study.dto.StudyResponse;
import com.smhrd.graddy.study.dto.StudyUpdateRequest;
import com.smhrd.graddy.study.entity.Study;
import com.smhrd.graddy.study.repository.StudyRepository;
import com.smhrd.graddy.interest.entity.Interest;
import com.smhrd.graddy.interest.repository.InterestRepository;
import com.smhrd.graddy.tag.entity.Tag;
import com.smhrd.graddy.tag.repository.TagRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;
import java.util.ArrayList;
import java.util.Set;
import java.util.LinkedHashSet;
import java.util.HashSet;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class StudyService {

    private final StudyRepository studyRepository;
    private final InterestRepository interestRepository;
    private final TagRepository tagRepository;

    // 스터디 생성
    @Transactional
    public StudyResponse createStudy(StudyRequest request) {
        Study study = new Study();
        study.setStudyName(request.getStudyName());
        study.setStudyTitle(request.getStudyTitle());
        study.setStudyDesc(request.getStudyDesc());
        study.setStudyLevel(request.getStudyLevel());
        study.setUserId(request.getUserId());
        study.setStudyStart(request.getStudyStart());
        study.setStudyEnd(request.getStudyEnd());
        study.setStudyTotal(request.getStudyTotal());
        study.setSoltStart(request.getSoltStart());
        study.setSoltEnd(request.getSoltEnd());

        Study savedStudy = studyRepository.save(study);
        
        // 태그 정보 저장
        if (request.getInterestIds() != null && !request.getInterestIds().isEmpty()) {
            List<Interest> interests = interestRepository.findByInterestIdIn(request.getInterestIds());
            for (Interest interest : interests) {
                Tag tag = new Tag();
                tag.setStudyId(savedStudy.getStudyId().toString());
                tag.setTagName(interest.getInterestName());
                tagRepository.save(tag);
            }
        }
        
        return convertToResponse(savedStudy);
    }

    // 스터디 조회
    public StudyResponse getStudy(Long studyId) {
        Study study = studyRepository.findById(studyId)
                .orElseThrow(() -> new IllegalArgumentException("스터디를 찾을 수 없습니다: " + studyId));
        return convertToResponse(study);
    }

    // 모든 스터디 목록 조회
    public List<StudyResponse> getAllStudies() {
        List<Study> studies = studyRepository.findAllByOrderByCreatedAtDesc();
        return studies.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    // 모집중인 스터디 목록 조회
    public List<StudyResponse> getRecruitingStudies() {
        List<Study> studies = studyRepository.findByIsRecruitingOrderByCreatedAtDesc("recruitment");
        return studies.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    // 사용자가 리더인 스터디 목록 조회
    public List<StudyResponse> getStudiesByLeader(String userId) {
        List<Study> studies = studyRepository.findByUserIdOrderByCreatedAtDesc(userId);
        return studies.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    // 통합 검색 (제목, 작성자, 태그)
    public List<StudyResponse> searchStudies(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return getAllStudies();
        }
        
        // 제목, 스터디명, 설명으로 검색
        List<Study> studiesByContent = studyRepository.findByStudyTitleContainingIgnoreCaseOrStudyNameContainingIgnoreCaseOrStudyDescContainingIgnoreCaseOrderByCreatedAtDesc(
                keyword, keyword, keyword);
        
        // 작성자로 검색
        List<Study> studiesByUser = studyRepository.findByUserIdContainingIgnoreCaseOrderByCreatedAtDesc(keyword);
        
        // 태그로 검색
        List<Tag> tags = tagRepository.findByTagNameContainingIgnoreCaseOrderByTagName(keyword);
        List<Study> studiesByTag = new ArrayList<>();
        for (Tag tag : tags) {
            try {
                Long studyId = Long.parseLong(tag.getStudyId());
                Study study = studyRepository.findById(studyId).orElse(null);
                if (study != null) {
                    studiesByTag.add(study);
                }
            } catch (NumberFormatException e) {
                // studyId가 숫자가 아닌 경우 무시
            }
        }
        
        // 모든 결과를 합치고 중복 제거
        Set<Study> allStudies = new LinkedHashSet<>();
        allStudies.addAll(studiesByContent);
        allStudies.addAll(studiesByUser);
        allStudies.addAll(studiesByTag);
        
        // 생성일 기준 내림차순 정렬
        return allStudies.stream()
                .sorted((s1, s2) -> s2.getCreatedAt().compareTo(s1.getCreatedAt()))
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    // 레벨별 스터디 목록 조회
    public List<StudyResponse> getStudiesByLevel(Integer level) {
        List<Study> studies = studyRepository.findByStudyLevelOrderByCreatedAtDesc(level);
        return studies.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    // 스터디 수정
    @Transactional
    public StudyResponse updateStudy(Long studyId, StudyUpdateRequest request) {
        Study study = studyRepository.findById(studyId)
                .orElseThrow(() -> new IllegalArgumentException("스터디를 찾을 수 없습니다: " + studyId));

        study.setStudyName(request.getStudyName());
        study.setStudyTitle(request.getStudyTitle());
        study.setStudyDesc(request.getStudyDesc());
        study.setStudyLevel(request.getStudyLevel());
        study.setIsRecruiting(Study.StudyStatus.valueOf(request.getIsRecruiting().toUpperCase()));
        study.setStudyStart(request.getStudyStart());
        study.setStudyEnd(request.getStudyEnd());
        study.setStudyTotal(request.getStudyTotal());
        study.setSoltStart(request.getSoltStart());
        study.setSoltEnd(request.getSoltEnd());

        Study updatedStudy = studyRepository.save(study);
        
        // 기존 태그 삭제 후 새로운 태그 저장
        tagRepository.deleteByStudyId(studyId.toString());
        
        // 새로운 태그 정보 저장 (StudyUpdateRequest에 interestIds가 있다면)
        // 여기서는 StudyUpdateRequest에 태그 정보를 추가해야 함
        
        return convertToResponse(updatedStudy);
    }

    // 스터디 상태 변경
    @Transactional
    public StudyResponse updateStudyStatus(Long studyId, String status) {
        Study study = studyRepository.findById(studyId)
                .orElseThrow(() -> new IllegalArgumentException("스터디를 찾을 수 없습니다: " + studyId));

        study.setIsRecruiting(Study.StudyStatus.valueOf(status.toUpperCase()));
        Study updatedStudy = studyRepository.save(study);
        return convertToResponse(updatedStudy);
    }

    // 스터디 삭제
    @Transactional
    public void deleteStudy(Long studyId) {
        if (!studyRepository.existsById(studyId)) {
            throw new IllegalArgumentException("스터디를 찾을 수 없습니다: " + studyId);
        }
        
        // 스터디 관련 태그 먼저 삭제
        tagRepository.deleteByStudyId(studyId.toString());
        
        // 스터디 삭제
        studyRepository.deleteById(studyId);
    }

    // Entity를 Response DTO로 변환
    private StudyResponse convertToResponse(Study study) {
        // 스터디의 태그 정보 조회
        List<String> tagNames = tagRepository.findByStudyIdOrderByTagName(study.getStudyId().toString())
                .stream()
                .map(Tag::getTagName)
                .collect(Collectors.toList());
        
        return new StudyResponse(
                study.getStudyId(),
                study.getStudyName(),
                study.getStudyTitle(),
                study.getStudyDesc(),
                study.getStudyLevel(),
                study.getUserId(),
                study.getIsRecruiting().getValue(),
                study.getStudyStart(),
                study.getStudyEnd(),
                study.getStudyTotal(),
                study.getSoltStart(),
                study.getSoltEnd(),
                study.getCreatedAt(),
                tagNames
        );
    }
}
