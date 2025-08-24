package com.smhrd.graddy.study.service;

import com.smhrd.graddy.study.dto.StudyRequest;
import com.smhrd.graddy.study.dto.StudyResponse;
import com.smhrd.graddy.study.dto.StudyUpdateRequest;
import com.smhrd.graddy.study.entity.StudyProject;
import com.smhrd.graddy.study.repository.StudyProjectRepository;
import com.smhrd.graddy.interest.entity.Interest;
import com.smhrd.graddy.interest.repository.InterestRepository;
import com.smhrd.graddy.tag.entity.Tag;
import com.smhrd.graddy.tag.repository.TagRepository;
import com.smhrd.graddy.study.entity.StudyProjectAvailableDay;
import com.smhrd.graddy.study.repository.StudyProjectAvailableDayRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
import java.util.ArrayList;
import java.util.Set;
import java.util.LinkedHashSet;
import com.smhrd.graddy.member.dto.MemberInfo;
import com.smhrd.graddy.member.service.MemberService;
import com.smhrd.graddy.member.repository.MemberRepository;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class StudyService {

    private final StudyProjectRepository studyProjectRepository;
    private final InterestRepository interestRepository;
    private final TagRepository tagRepository;
    private final StudyProjectAvailableDayRepository availableDayRepository;
    private final MemberService memberService;
    private final MemberRepository memberRepository;

    // 스터디/프로젝트 생성
    @Transactional
    public StudyResponse createStudy(StudyRequest request) {
        StudyProject studyProject = new StudyProject();
        studyProject.setStudyProjectName(request.getStudyProjectName());
        studyProject.setStudyProjectTitle(request.getStudyProjectTitle());
        studyProject.setStudyProjectDesc(request.getStudyProjectDesc());
        studyProject.setStudyLevel(request.getStudyLevel());
        studyProject.setTypeCheck(StudyProject.TypeCheck.valueOf(request.getTypeCheck()));
        studyProject.setUserId(request.getUserId());
        studyProject.setIsRecruiting(StudyProject.RecruitingStatus.recruitment);
        studyProject.setStudyProjectStart(localDateTimeToTimestamp(request.getStudyProjectStart()));
        studyProject.setStudyProjectEnd(localDateTimeToTimestamp(request.getStudyProjectEnd()));
        studyProject.setStudyProjectTotal(request.getStudyProjectTotal());
        studyProject.setSoltStart(localDateTimeToTimestamp(request.getSoltStart()));
        studyProject.setSoltEnd(localDateTimeToTimestamp(request.getSoltEnd()));

        StudyProject savedStudyProject = studyProjectRepository.save(studyProject);
        
        // 관심 항목 태그 저장
        if (request.getInterestIds() != null && !request.getInterestIds().isEmpty()) {
            for (Long interestId : request.getInterestIds()) {
                Tag tag = new Tag();
                tag.setStudyProjectId(savedStudyProject.getStudyProjectId());
                tag.setInterestId(interestId);
                tagRepository.save(tag);
            }
        }
        
        // 선호 요일 저장
        if (request.getDayIds() != null && !request.getDayIds().isEmpty()) {
            for (Byte dayId : request.getDayIds()) {
                StudyProjectAvailableDay availableDay = new StudyProjectAvailableDay();
                availableDay.setStudyProjectId(savedStudyProject.getStudyProjectId());
                availableDay.setDayId(dayId);
                availableDayRepository.save(availableDay);
            }
        }
        
        // 리더를 멤버 테이블에 자동 추가
        memberService.addLeaderAsMember(savedStudyProject.getStudyProjectId(), savedStudyProject.getUserId());
        
        return convertToResponse(savedStudyProject);
    }

    // 스터디/프로젝트 조회
    public StudyResponse getStudy(Long studyProjectId) {
        StudyProject studyProject = studyProjectRepository.findById(studyProjectId)
                .orElseThrow(() -> new IllegalArgumentException("스터디/프로젝트를 찾을 수 없습니다: " + studyProjectId));
        return convertToResponse(studyProject);
    }

    // 모든 스터디/프로젝트 목록 조회
    public List<StudyResponse> getAllStudies() {
        List<StudyProject> studyProjects = studyProjectRepository.findAllOrderByCreatedAtDesc();
        return studyProjects.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    // 모집중인 스터디/프로젝트 목록 조회
    public List<StudyResponse> getRecruitingStudies() {
        List<StudyProject> studyProjects = studyProjectRepository.findByIsRecruiting(StudyProject.RecruitingStatus.recruitment);
        return studyProjects.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    // 사용자가 리더인 스터디/프로젝트 목록 조회
    public List<StudyResponse> getStudiesByLeader(String userId) {
        List<StudyProject> studyProjects = studyProjectRepository.findByUserId(userId);
        return studyProjects.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    // 통합 검색 (제목, 작성자, 태그)
    public List<StudyResponse> searchStudies(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return getAllStudies();
        }
        
        // 제목, 스터디명, 설명으로 검색
        List<StudyProject> studiesByContent = studyProjectRepository.findByStudyProjectTitleContainingIgnoreCaseOrStudyProjectNameContainingIgnoreCaseOrStudyProjectDescContainingIgnoreCaseOrderByCreatedAtDesc(
                keyword, keyword, keyword);
        
        // 작성자로 검색
        List<StudyProject> studiesByUser = studyProjectRepository.findByUserIdContainingIgnoreCaseOrderByCreatedAtDesc(keyword);
        
        // 관심 항목명으로 검색
        List<Interest> interests = interestRepository.findByInterestNameContainingIgnoreCaseOrderByInterestName(keyword);
        List<StudyProject> studiesByInterest = new ArrayList<>();
        for (Interest interest : interests) {
            List<Tag> tags = tagRepository.findByInterestId(interest.getInterestId());
            for (Tag tag : tags) {
                StudyProject studyProject = studyProjectRepository.findById(tag.getStudyProjectId()).orElse(null);
                if (studyProject != null) {
                    studiesByInterest.add(studyProject);
                }
            }
        }
        
        // 모든 결과를 합치고 중복 제거
        Set<StudyProject> allStudies = new LinkedHashSet<>();
        allStudies.addAll(studiesByContent);
        allStudies.addAll(studiesByUser);
        allStudies.addAll(studiesByInterest);
        
        // 생성일 기준 내림차순 정렬
        return allStudies.stream()
                .sorted((s1, s2) -> {
                    if (s1.getCreatedAt() == null && s2.getCreatedAt() == null) return 0;
                    if (s1.getCreatedAt() == null) return 1;
                    if (s2.getCreatedAt() == null) return -1;
                    return s2.getCreatedAt().compareTo(s1.getCreatedAt());
                })
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    // 레벨별 스터디/프로젝트 목록 조회
    public List<StudyResponse> getStudiesByLevel(Integer level) {
        List<StudyProject> studyProjects = studyProjectRepository.findByStudyLevel(level);
        return studyProjects.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    // 스터디/프로젝트 수정
    @Transactional
    public StudyResponse updateStudy(Long studyProjectId, StudyUpdateRequest request, String currentUserId) {
        StudyProject studyProject = studyProjectRepository.findById(studyProjectId)
                .orElseThrow(() -> new IllegalArgumentException("스터디/프로젝트를 찾을 수 없습니다: " + studyProjectId));

        // 권한 체크: 현재 로그인한 사용자가 해당 스터디/프로젝트의 리더인지 확인
        if (!studyProject.getUserId().equals(currentUserId)) {
            throw new IllegalArgumentException("스터디/프로젝트를 수정할 권한이 없습니다. 리더만 수정할 수 있습니다.");
        }

        // null 체크 후 업데이트
        if (request.getStudyProjectName() != null) {
            studyProject.setStudyProjectName(request.getStudyProjectName());
        }
        if (request.getStudyProjectTitle() != null) {
            studyProject.setStudyProjectTitle(request.getStudyProjectTitle());
        }
        if (request.getStudyProjectDesc() != null) {
            studyProject.setStudyProjectDesc(request.getStudyProjectDesc());
        }
        if (request.getStudyLevel() != null) {
            studyProject.setStudyLevel(request.getStudyLevel());
        }
        if (request.getTypeCheck() != null) {
            studyProject.setTypeCheck(StudyProject.TypeCheck.valueOf(request.getTypeCheck()));
        }
        if (request.getIsRecruiting() != null) {
            studyProject.setIsRecruiting(StudyProject.RecruitingStatus.valueOf(request.getIsRecruiting()));
        }
        if (request.getStudyProjectStart() != null) {
            studyProject.setStudyProjectStart(localDateTimeToTimestamp(request.getStudyProjectStart()));
        }
        if (request.getStudyProjectEnd() != null) {
            studyProject.setStudyProjectEnd(localDateTimeToTimestamp(request.getStudyProjectEnd()));
        }
        if (request.getStudyProjectTotal() != null) {
            studyProject.setStudyProjectTotal(request.getStudyProjectTotal());
        }
        if (request.getSoltStart() != null) {
            studyProject.setSoltStart(localDateTimeToTimestamp(request.getSoltStart()));
        }
        if (request.getSoltEnd() != null) {
            studyProject.setSoltEnd(localDateTimeToTimestamp(request.getSoltEnd()));
        }

        StudyProject updatedStudyProject = studyProjectRepository.save(studyProject);
        
        // 기존 태그 삭제 후 새로운 태그 저장
        if (request.getInterestIds() != null) {
            tagRepository.deleteByStudyProjectId(studyProjectId);
            
            // 새로운 태그 정보 저장
            for (Long interestId : request.getInterestIds()) {
                Tag tag = new Tag();
                tag.setStudyProjectId(studyProjectId);
                tag.setInterestId(interestId);
                tagRepository.save(tag);
            }
        }
        
        // 기존 선호 요일 삭제 후 새로운 선호 요일 저장
        if (request.getDayIds() != null) {
            availableDayRepository.deleteByStudyProjectId(studyProjectId);
            
            // 새로운 선호 요일 정보 저장
            for (Byte dayId : request.getDayIds()) {
                StudyProjectAvailableDay availableDay = new StudyProjectAvailableDay();
                availableDay.setStudyProjectId(studyProjectId);
                availableDay.setDayId(dayId);
                availableDayRepository.save(availableDay);
            }
        }
        
        return convertToResponse(updatedStudyProject);
    }

    // 스터디/프로젝트 상태 변경
    @Transactional
    public StudyResponse updateStudyStatus(Long studyProjectId, String status, String currentUserId) {
        StudyProject studyProject = studyProjectRepository.findById(studyProjectId)
                .orElseThrow(() -> new IllegalArgumentException("스터디/프로젝트를 찾을 수 없습니다: " + studyProjectId));

        // 권한 체크: 현재 로그인한 사용자가 해당 스터디/프로젝트의 리더인지 확인
        if (!studyProject.getUserId().equals(currentUserId)) {
            throw new IllegalArgumentException("스터디/프로젝트 상태를 변경할 권한이 없습니다. 리더만 변경할 수 있습니다.");
        }

        studyProject.setIsRecruiting(StudyProject.RecruitingStatus.valueOf(status));
        StudyProject updatedStudyProject = studyProjectRepository.save(studyProject);
        return convertToResponse(updatedStudyProject);
    }

    // 스터디/프로젝트 삭제
    @Transactional
    public void deleteStudy(Long studyProjectId, String currentUserId) {
        StudyProject studyProject = studyProjectRepository.findById(studyProjectId)
                .orElseThrow(() -> new IllegalArgumentException("스터디/프로젝트를 찾을 수 없습니다: " + studyProjectId));

        // 권한 체크: 현재 로그인한 사용자가 해당 스터디/프로젝트의 리더인지 확인
        if (!studyProject.getUserId().equals(currentUserId)) {
            throw new IllegalArgumentException("스터디/프로젝트를 삭제할 권한이 없습니다. 리더만 삭제할 수 있습니다.");
        }
        
        // 스터디/프로젝트 관련 데이터 먼저 삭제
        tagRepository.deleteByStudyProjectId(studyProjectId);
        availableDayRepository.deleteByStudyProjectId(studyProjectId);
        
        // 멤버 테이블 데이터 삭제
        memberRepository.deleteByStudyProjectId(studyProjectId);
        
        // 스터디/프로젝트 삭제
        studyProjectRepository.deleteById(studyProjectId);
    }

    // Entity를 Response DTO로 변환
    private StudyResponse convertToResponse(StudyProject studyProject) {
        // 스터디/프로젝트의 태그 정보 조회 (관심 항목명으로)
        List<String> tagNames = new ArrayList<>();
        List<Tag> tags = tagRepository.findByStudyProjectId(studyProject.getStudyProjectId());
        for (Tag tag : tags) {
            Interest interest = interestRepository.findById(tag.getInterestId()).orElse(null);
            if (interest != null) {
                tagNames.add(interest.getInterestName());
            }
        }
        
        // 스터디/프로젝트의 선호 요일 정보 조회
        List<Byte> availableDays = new ArrayList<>();
        List<StudyProjectAvailableDay> availableDayList = availableDayRepository.findByStudyProjectId(studyProject.getStudyProjectId());
        for (StudyProjectAvailableDay availableDay : availableDayList) {
            availableDays.add(availableDay.getDayId());
        }
        
        // 현재 인원수와 멤버 정보는 MemberService에서 조회
        int currentMembers = memberService.getCurrentMemberCount(studyProject.getStudyProjectId());
        List<MemberInfo> members = memberService.getMembersByStudyProjectId(studyProject.getStudyProjectId());
        
        return new StudyResponse(
                studyProject.getStudyProjectId(),
                studyProject.getStudyProjectName(),
                studyProject.getStudyProjectTitle(),
                studyProject.getStudyProjectDesc(),
                studyProject.getStudyLevel(),
                studyProject.getTypeCheck().toString(),
                studyProject.getUserId(),
                studyProject.getIsRecruiting().toString(),
                timestampToLocalDateTime(studyProject.getStudyProjectStart()),
                timestampToLocalDateTime(studyProject.getStudyProjectEnd()),
                studyProject.getStudyProjectTotal(),
                timestampToLocalDateTime(studyProject.getSoltStart()),
                timestampToLocalDateTime(studyProject.getSoltEnd()),
                timestampToLocalDateTime(studyProject.getCreatedAt()),
                studyProject.getCurText(),
                tagNames,
                availableDays,
                currentMembers,
                members
        );
    }

    /**
     * LocalDateTime을 Timestamp로 변환하는 유틸리티 메서드
     * @param localDateTime 변환할 LocalDateTime
     * @return Timestamp 객체, localDateTime이 null이면 null 반환
     */
    private Timestamp localDateTimeToTimestamp(LocalDateTime localDateTime) {
        if (localDateTime == null) {
            return null;
        }
        return Timestamp.valueOf(localDateTime);
    }

    /**
     * Timestamp를 LocalDateTime으로 변환하는 유틸리티 메서드
     * @param timestamp 변환할 Timestamp
     * @return LocalDateTime 객체, timestamp가 null이면 null 반환
     */
    private LocalDateTime timestampToLocalDateTime(Timestamp timestamp) {
        if (timestamp == null) {
            return null;
        }
        return timestamp.toLocalDateTime();
    }
}
