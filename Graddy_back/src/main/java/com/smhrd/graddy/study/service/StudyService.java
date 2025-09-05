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
import com.smhrd.graddy.study.entity.StudyProjectStatus;
import com.smhrd.graddy.study.repository.StudyProjectStatusRepository;
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
import java.util.Map;
import java.util.HashMap;
import java.util.Optional;
import com.smhrd.graddy.member.dto.MemberInfo;
import com.smhrd.graddy.member.service.MemberService;
import com.smhrd.graddy.member.repository.MemberRepository;
import com.smhrd.graddy.study.service.StudyApplicationService;
import com.smhrd.graddy.schedule.service.ScheduleService;
import java.util.HashSet;
import java.util.Collections;
import java.util.LinkedHashMap;
import com.smhrd.graddy.study.dto.StudyProjectStatusInfo;
import com.smhrd.graddy.study.service.AICurriculumService;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class StudyService {

    private final StudyProjectRepository studyProjectRepository;
    private final InterestRepository interestRepository;
    private final TagRepository tagRepository;
    private final StudyProjectAvailableDayRepository availableDayRepository;
    private final StudyProjectStatusRepository studyProjectStatusRepository;
    private final MemberService memberService;
    private final MemberRepository memberRepository;
    private final StudyApplicationService studyApplicationRepository;
    private final ScheduleService scheduleService;
    private final AICurriculumService aiCurriculumService;

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
        studyProject.setGitUrl(request.getGitUrl());

        StudyProject savedStudyProject = studyProjectRepository.save(studyProject);
        
        // 스터디/프로젝트 생성자를 리더로 멤버 테이블에 추가
        memberService.addLeaderAsMember(savedStudyProject.getStudyProjectId(), request.getUserId());
        
        // 스터디 시작/종료일에 맞춰 자동으로 일정 추가
        try {
            scheduleService.createStudyPeriodSchedules(
                request.getUserId(),
                savedStudyProject.getStudyProjectId(),
                request.getStudyProjectName(),
                request.getStudyProjectStart(),
                request.getStudyProjectEnd()
            );
            System.out.println("스터디 기간 일정 자동 생성 완료: " + savedStudyProject.getStudyProjectName());
        } catch (Exception e) {
            System.err.println("스터디 기간 일정 자동 생성 실패: " + e.getMessage());
            // 일정 생성 실패해도 스터디 생성은 성공으로 처리
        }
        
        // AI 커리큘럼 자동 생성
        try {
            aiCurriculumService.createAICurriculum(savedStudyProject.getStudyProjectId(), savedStudyProject.getStudyProjectName());
            System.out.println("AI 커리큘럼 자동 생성 완료: " + savedStudyProject.getStudyProjectName());
        } catch (Exception e) {
            System.err.println("AI 커리큘럼 자동 생성 실패: " + e.getMessage());
            // AI 커리큘럼 생성 실패해도 스터디 생성은 성공으로 처리
        }
        
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
        if (request.getGitUrl() != null) {
            studyProject.setGitUrl(request.getGitUrl());
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
        
        // 스터디/프로젝트 삭제
        studyProjectRepository.deleteById(studyProjectId);
    }

    // Entity를 Response DTO로 변환
    private StudyResponse convertToResponse(StudyProject studyProject) {
        return convertToResponse(studyProject, null);
    }

    // Entity를 Response DTO로 변환 (사용자 참여 상태 포함)
    private StudyResponse convertToResponse(StudyProject studyProject, String userId) {
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
        
        // 사용자의 참여 상태 설정
        String userParticipationStatus = "none";
        String applicationStatus = null;
        LocalDateTime applicationDate = null;
        StudyProjectStatusInfo studyProjectStatusInfo = null;
        
        if (userId != null) {
            // 1. 먼저 study_project_member 테이블에서 멤버 상태 확인
            if (memberService.isMember(studyProject.getStudyProjectId(), userId)) {
                // 멤버로 등록된 경우
                if (studyProject.getUserId().equals(userId)) {
                    userParticipationStatus = "approved"; // 리더
                } else {
                    userParticipationStatus = "approved"; // 일반 멤버
                }
            } 
            // 2. 멤버가 아닌 경우 study_project_status 테이블에서 신청 상태 확인
            else if (studyApplicationRepository.findStudyProjectIdsByUserId(userId).contains(studyProject.getStudyProjectId())) {
                userParticipationStatus = "pending"; // 신청 대기
                
                // study_project_status 테이블에서 신청 상태 정보 조회
                Optional<StudyProjectStatus> statusOpt = studyProjectStatusRepository.findByUserIdAndStudyProjectId(
                    userId, studyProject.getStudyProjectId()
                );
                if (statusOpt.isPresent()) {
                    StudyProjectStatus status = statusOpt.get();
                    applicationStatus = status.getStatus().toString();
                    applicationDate = timestampToLocalDateTime(status.getJoinedAt());
                    
                    // study_project_status 정보를 StudyProjectStatusInfo로 변환
                    studyProjectStatusInfo = StudyProjectStatusInfo.builder()
                            .userId(status.getUserId())
                            .studyProjectId(status.getStudyProjectId())
                            .status(status.getStatus().toString())
                            .joinedAt(timestampToLocalDateTime(status.getJoinedAt()))
                            .build();
                }
            }
            // 3. 그 외의 경우는 "none" (참여하지도 신청하지도 않음)
        } else {
            // userId가 null인 경우 (로그인하지 않은 사용자)
            // 해당 스터디에 신청한 모든 사용자의 study_project_status 정보를 조회
            List<StudyProjectStatus> allStatuses = studyProjectStatusRepository.findByStudyProjectId(studyProject.getStudyProjectId());
            if (!allStatuses.isEmpty()) {
                // 첫 번째 신청자의 정보를 기본으로 사용 (또는 모든 신청자 정보를 포함할 수도 있음)
                StudyProjectStatus firstStatus = allStatuses.get(0);
                studyProjectStatusInfo = StudyProjectStatusInfo.builder()
                        .userId(firstStatus.getUserId())
                        .studyProjectId(firstStatus.getStudyProjectId())
                        .status(firstStatus.getStatus().toString())
                        .joinedAt(timestampToLocalDateTime(firstStatus.getJoinedAt()))
                        .build();
            }
        }
        
        // 스터디 상태 판단 (진행중/종료)
        String studyStatus = "active"; // 기본값은 진행중
        
        // 1. study_project_end가 현재 시간보다 이전인 경우 종료
        if (studyProject.getStudyProjectEnd() != null) {
            LocalDateTime endDate = timestampToLocalDateTime(studyProject.getStudyProjectEnd());
            LocalDateTime now = LocalDateTime.now();
            if (endDate != null && endDate.isBefore(now)) {
                studyStatus = "completed"; // 종료됨
            }
        }
        
        // 2. is_recruiting이 'end'인 경우 스터디 종료
        if ("end".equals(studyProject.getIsRecruiting().toString())) {
            studyStatus = "completed";
        }
        // 3. is_recruiting이 'complete'인 경우 모집 완료 (진행중이지만 모집 종료)
        else if ("complete".equals(studyProject.getIsRecruiting().toString())) {
            studyStatus = "recruitment_completed";
        }
        // 4. is_recruiting이 'recruitment'인 경우 모집중 (진행중)
        else if ("recruitment".equals(studyProject.getIsRecruiting().toString())) {
            studyStatus = "active";
        }
        
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
                studyProject.getGitUrl(),
                tagNames,
                availableDays,
                currentMembers,
                members,
                userParticipationStatus,
                applicationStatus,
                applicationDate,
                studyStatus, // 스터디 상태 추가
                studyProjectStatusInfo // study_project_status 정보 추가
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

    /**
     * 사용자가 참여하고 있는 스터디/프로젝트 목록 조회
     * @param userId 사용자 ID
     * @return 참여 중인 스터디/프로젝트 목록
     */
    public List<StudyResponse> getStudiesByParticipant(String userId) {
        System.out.println("   [참여 스터디 조회] 사용자 ID: " + userId);
        
        // 사용자가 멤버로 등록된 스터디/프로젝트 ID 목록 조회 (member 테이블에서)
        List<Long> studyProjectIds = memberRepository.findStudyProjectIdsByUserId(userId);
        System.out.println("   [참여 스터디 조회] member 테이블에서 찾은 study_project_id 목록: " + studyProjectIds);
        
        List<StudyResponse> responses = new ArrayList<>();
        for (Long studyProjectId : studyProjectIds) {
            try {
                // studies_projects 테이블에서 스터디/프로젝트 정보 조회
                StudyProject studyProject = studyProjectRepository.findById(studyProjectId).orElse(null);
                if (studyProject != null) {
                    StudyResponse response = convertToResponse(studyProject, userId);
                    responses.add(response);
                    System.out.println("   [참여 스터디 조회] 추가됨: " + studyProject.getStudyProjectName() + " (ID: " + studyProjectId + ")");
                }
            } catch (Exception e) {
                // 개별 스터디/프로젝트 조회 실패 시 로그만 남기고 계속 진행
                System.err.println("   [참여 스터디 조회] 스터디/프로젝트 조회 실패: " + studyProjectId + ", 오류: " + e.getMessage());
            }
        }
        
        System.out.println("   [참여 스터디 조회] 최종 결과: " + responses.size() + "개");
        return responses;
    }

    /**
     * 사용자가 신청한 스터디/프로젝트 목록 조회
     * @param userId 사용자 ID
     * @return 신청한 스터디/프로젝트 목록 (이미 참여 중인 스터디 제외)
     */
    public List<StudyResponse> getStudiesByApplicant(String userId) {
        System.out.println("   [신청 스터디 조회] 사용자 ID: " + userId);
        
        // 사용자가 신청한 스터디/프로젝트 ID 목록 조회 (study_project_status 테이블에서)
        List<Long> studyProjectIds = studyApplicationRepository.findStudyProjectIdsByUserId(userId);
        System.out.println("   [신청 스터디 조회] study_project_status 테이블에서 찾은 study_project_id 목록: " + studyProjectIds);
        
        // 사용자가 이미 참여 중인 스터디 ID 목록 조회 (member 테이블에서)
        List<Long> participationIds = memberRepository.findStudyProjectIdsByUserId(userId);
        System.out.println("   [신청 스터디 조회] member 테이블에서 찾은 참여 중인 study_project_id 목록: " + participationIds);
        
        // 신청한 스터디 중에서 이미 참여 중이 아닌 것만 필터링
        List<Long> filteredStudyProjectIds = studyProjectIds.stream()
                .filter(id -> !participationIds.contains(id))
                .collect(Collectors.toList());
        
        System.out.println("   [신청 스터디 조회] 중복 제거 후 study_project_id 목록: " + filteredStudyProjectIds);
        
        List<StudyResponse> responses = new ArrayList<>();
        for (Long studyProjectId : filteredStudyProjectIds) {
            try {
                // studies_projects 테이블에서 스터디/프로젝트 정보 조회
                StudyProject studyProject = studyProjectRepository.findById(studyProjectId).orElse(null);
                if (studyProject != null) {
                    StudyResponse response = convertToResponse(studyProject, userId);
                    responses.add(response);
                    System.out.println("   [신청 스터디 조회] 추가됨: " + studyProject.getStudyProjectName() + " (ID: " + studyProjectId + ")");
                }
            } catch (Exception e) {
                // 개별 스터디/프로젝트 조회 실패 시 로그만 남기고 계속 진행
                System.err.println("   [신청 스터디 조회] 스터디/프로젝트 조회 실패: " + studyProjectId + ", 오류: " + e.getMessage());
            }
        }
        
        System.out.println("   [신청 스터디 조회] 최종 결과: " + responses.size() + "개");
        return responses;
    }

    /**
     * 사용자의 스터디/프로젝트 관리 대시보드 정보 조회
     * @param userId 사용자 ID
     * @return 참여 목록과 신청 목록을 통합한 스터디/프로젝트 목록
     */
    public Map<String, Object> getUserDashboard(String userId) {
        Map<String, Object> dashboard = new HashMap<>();
        
        System.out.println("=== 사용자 대시보드 조회 시작 ===");
        System.out.println("사용자 ID: " + userId);
        
        // 1. 사용자가 참여 중인 스터디/프로젝트 ID 목록 조회 (study_project_member 테이블)
        System.out.println("1. 참여 중인 스터디/프로젝트 ID 조회 중...");
        List<Long> participationIds = memberRepository.findStudyProjectIdsByUserId(userId);
        System.out.println("   - 참여 중인 스터디 ID 목록: " + participationIds);
        
        // 2. 사용자가 신청한 스터디/프로젝트 ID 목록 조회 (study_project_status 테이블)
        System.out.println("2. 신청한 스터디/프로젝트 ID 조회 중...");
        List<Long> applicationIds = studyApplicationRepository.findStudyProjectIdsByUserId(userId);
        System.out.println("   - 신청한 스터디 ID 목록: " + applicationIds);
        
        // 3. 모든 study_project_id를 하나의 Set으로 통합 (자동 중복 제거)
        System.out.println("3. 모든 study_project_id 통합 및 중복 제거 중...");
        Set<Long> allStudyProjectIds = new LinkedHashSet<>();
        allStudyProjectIds.addAll(participationIds);
        allStudyProjectIds.addAll(applicationIds);
        
        System.out.println("   - 통합된 고유 study_project_id 목록: " + allStudyProjectIds);
        System.out.println("   - 중복 제거된 ID 수: " + allStudyProjectIds.size());
        System.out.println("   - 원본 참여 ID 수: " + participationIds.size());
        System.out.println("   - 원본 신청 ID 수: " + applicationIds.size());
        
        // 4. 통합된 ID 목록으로 한 번에 상세 정보 조회
        System.out.println("4. 통합된 ID 목록으로 상세 정보 조회 중...");
        List<StudyResponse> allStudies = new ArrayList<>();
        Map<Long, StudyResponse> studyMap = new HashMap<>();
        
        for (Long studyProjectId : allStudyProjectIds) {
            try {
                StudyProject studyProject = studyProjectRepository.findById(studyProjectId).orElse(null);
                if (studyProject != null) {
                    StudyResponse response = convertToResponse(studyProject, userId);
                    allStudies.add(response);
                    studyMap.put(studyProjectId, response);
                    System.out.println("   - 스터디 추가됨: " + studyProject.getStudyProjectName() + " (ID: " + studyProjectId + ")");
                }
            } catch (Exception e) {
                System.err.println("   - 스터디 조회 실패: " + studyProjectId + ", 오류: " + e.getMessage());
            }
        }
        
        System.out.println("   - 조회된 총 스터디 수: " + allStudies.size());
        
        // 5. 참여 목록과 신청 목록 분리
        System.out.println("5. 참여 목록과 신청 목록 분리 중...");
        List<StudyResponse> participations = new ArrayList<>();
        List<StudyResponse> applications = new ArrayList<>();
        
        for (StudyResponse study : allStudies) {
            Long studyId = study.getStudyProjectId();
            if (participationIds.contains(studyId)) {
                participations.add(study);
                System.out.println("   - 참여 목록에 추가: " + study.getStudyProjectName() + " (ID: " + studyId + ")");
            } else if (applicationIds.contains(studyId)) {
                applications.add(study);
                System.out.println("   - 신청 목록에 추가: " + study.getStudyProjectName() + " (ID: " + studyId + ")");
            }
        }
        
        System.out.println("   - 참여 중인 스터디 수: " + participations.size());
        System.out.println("   - 신청한 스터디 수: " + applications.size());
        
        // 6. 최종 중복 검증
        System.out.println("6. 최종 중복 검증 중...");
        Set<Long> finalStudyIds = allStudies.stream()
                .map(StudyResponse::getStudyProjectId)
                .collect(Collectors.toSet());
        
        System.out.println("   - 최종 고유 ID 수: " + finalStudyIds.size());
        System.out.println("   - 중복 검증: " + (finalStudyIds.size() == allStudies.size() ? "통과" : "실패"));
        
        if (finalStudyIds.size() != allStudies.size()) {
            System.err.println("   - ⚠️ 중복이 발견되었습니다!");
            // 중복 제거된 최종 목록 생성
            Map<Long, StudyResponse> uniqueStudiesMap = new LinkedHashMap<>();
            for (StudyResponse study : allStudies) {
                if (!uniqueStudiesMap.containsKey(study.getStudyProjectId())) {
                    uniqueStudiesMap.put(study.getStudyProjectId(), study);
                } else {
                    System.out.println("   - 중복 제거됨: " + study.getStudyProjectId() + " (" + study.getStudyProjectName() + ")");
                }
            }
            allStudies = new ArrayList<>(uniqueStudiesMap.values());
            System.out.println("   - 중복 제거 후 최종 목록 수: " + allStudies.size());
        }
        
        // 7. 대시보드 데이터 구성
        System.out.println("7. 대시보드 데이터 구성 중...");
        dashboard.put("participations", participations);
        dashboard.put("applications", applications);
        dashboard.put("allStudies", allStudies);
        dashboard.put("totalCount", allStudies.size());
        dashboard.put("participationCount", participations.size());
        dashboard.put("applicationCount", applications.size());
        
        System.out.println("=== 최종 결과 ===");
        System.out.println("   - 전체 스터디/프로젝트 수: " + allStudies.size());
        System.out.println("   - 참여 중인 수: " + participations.size());
        System.out.println("   - 신청한 수: " + applications.size());
        System.out.println("   - 중복 제거된 고유 ID 수: " + finalStudyIds.size());
        System.out.println("=== 사용자 대시보드 조회 완료 ===\n");
        
        return dashboard;
    }

    /**
     * 사용자별 스터디/프로젝트 상태별 상세 정보 조회
     * @param userId 사용자 ID
     * @return 참여중, 승인대기중, 종료된 스터디/프로젝트 정보
     */
    public Map<String, Object> getUserStudyStatusDetails(String userId) {
        Map<String, Object> statusDetails = new HashMap<>();
        
        // 1. 참여중인 스터디/프로젝트 (진행중)
        List<StudyResponse> activeStudies = getActiveStudiesByParticipant(userId);
        
        // 2. 승인대기중인 스터디/프로젝트
        List<StudyResponse> pendingStudies = getPendingStudiesByApplicant(userId);
        
        // 3. 종료된 스터디/프로젝트 (참여했던 것들)
        List<StudyResponse> completedStudies = getCompletedStudiesByParticipant(userId);
        
        // 4. 종료된 스터디/프로젝트 (신청했던 것들)
        List<StudyResponse> completedAppliedStudies = getCompletedStudiesByApplicant(userId);
        
        // 통계 정보
        statusDetails.put("activeStudies", activeStudies);
        statusDetails.put("pendingStudies", pendingStudies);
        statusDetails.put("completedStudies", completedStudies);
        statusDetails.put("completedAppliedStudies", completedAppliedStudies);
        
        statusDetails.put("activeCount", activeStudies.size());
        statusDetails.put("pendingCount", pendingStudies.size());
        statusDetails.put("completedCount", completedStudies.size());
        statusDetails.put("completedAppliedCount", completedAppliedStudies.size());
        statusDetails.put("totalCount", activeStudies.size() + pendingStudies.size() + completedStudies.size() + completedAppliedStudies.size());
        
        return statusDetails;
    }

    /**
     * 사용자가 참여중인 활성 스터디/프로젝트 목록 조회 (진행중)
     * @param userId 사용자 ID
     * @return 진행중인 스터디/프로젝트 목록
     */
    public List<StudyResponse> getActiveStudiesByParticipant(String userId) {
        List<Long> studyProjectIds = memberRepository.findStudyProjectIdsByUserId(userId);
        
        List<StudyResponse> responses = new ArrayList<>();
        for (Long studyProjectId : studyProjectIds) {
            try {
                StudyProject studyProject = studyProjectRepository.findById(studyProjectId).orElse(null);
                if (studyProject != null && isStudyActive(studyProject)) {
                    StudyResponse response = convertToResponse(studyProject, userId);
                    responses.add(response);
                }
            } catch (Exception e) {
                System.err.println("활성 스터디/프로젝트 조회 실패: " + studyProjectId + ", 오류: " + e.getMessage());
            }
        }
        
        return responses;
    }

    /**
     * 사용자가 신청한 승인대기중인 스터디/프로젝트 목록 조회
     * @param userId 사용자 ID
     * @return 승인대기중인 스터디/프로젝트 목록
     */
    public List<StudyResponse> getPendingStudiesByApplicant(String userId) {
        List<Long> studyProjectIds = studyApplicationRepository.findStudyProjectIdsByUserId(userId);
        
        List<StudyResponse> responses = new ArrayList<>();
        for (Long studyProjectId : studyProjectIds) {
            try {
                StudyProject studyProject = studyProjectRepository.findById(studyProjectId).orElse(null);
                if (studyProject != null && isStudyActive(studyProject)) {
                    StudyResponse response = convertToResponse(studyProject, userId);
                    responses.add(response);
                }
            } catch (Exception e) {
                System.err.println("승인대기 스터디/프로젝트 조회 실패: " + studyProjectId + ", 오류: " + e.getMessage());
            }
        }
        
        return responses;
    }

    /**
     * 사용자가 참여했던 종료된 스터디/프로젝트 목록 조회
     * @param userId 사용자 ID
     * @return 종료된 스터디/프로젝트 목록
     */
    public List<StudyResponse> getCompletedStudiesByParticipant(String userId) {
        List<Long> studyProjectIds = memberRepository.findStudyProjectIdsByUserId(userId);
        
        List<StudyResponse> responses = new ArrayList<>();
        for (Long studyProjectId : studyProjectIds) {
            try {
                StudyProject studyProject = studyProjectRepository.findById(studyProjectId).orElse(null);
                if (studyProject != null && !isStudyActive(studyProject)) {
                    StudyResponse response = convertToResponse(studyProject, userId);
                    responses.add(response);
                }
            } catch (Exception e) {
                System.err.println("종료된 스터디/프로젝트 조회 실패: " + studyProjectId + ", 오류: " + e.getMessage());
            }
        }
        
        return responses;
    }

    /**
     * 사용자가 신청했던 종료된 스터디/프로젝트 목록 조회
     * @param userId 사용자 ID
     * @return 종료된 스터디/프로젝트 목록 (신청했던 것들)
     */
    public List<StudyResponse> getCompletedStudiesByApplicant(String userId) {
        List<Long> studyProjectIds = studyApplicationRepository.findStudyProjectIdsByUserId(userId);
        
        List<StudyResponse> responses = new ArrayList<>();
        for (Long studyProjectId : studyProjectIds) {
            try {
                StudyProject studyProject = studyProjectRepository.findById(studyProjectId).orElse(null);
                if (studyProject != null && !isStudyActive(studyProject)) {
                    StudyResponse response = convertToResponse(studyProject, userId);
                    responses.add(response);
                }
            } catch (Exception e) {
                System.err.println("종료된 신청 스터디/프로젝트 조회 실패: " + studyProjectId + ", 오류: " + e.getMessage());
            }
        }
        
        return responses;
    }

    /**
     * 스터디/프로젝트가 활성 상태인지 확인
     * @param studyProject 스터디/프로젝트 엔티티
     * @return 활성 상태 여부
     */
    private boolean isStudyActive(StudyProject studyProject) {
        // 현재 시간
        LocalDateTime now = LocalDateTime.now();
        
        // 스터디/프로젝트 종료일이 현재 시간보다 이후이고, 모집 상태가 end가 아닌 경우
        if (studyProject.getStudyProjectEnd() != null) {
            LocalDateTime endDate = timestampToLocalDateTime(studyProject.getStudyProjectEnd());
            return endDate != null && endDate.isAfter(now) && 
                   studyProject.getIsRecruiting() != StudyProject.RecruitingStatus.end;
        }
        
        // 종료일이 설정되지 않은 경우 모집 상태로 판단
        return studyProject.getIsRecruiting() != StudyProject.RecruitingStatus.end;
    }

    /**
     * 스터디/프로젝트 커리큘럼 텍스트 업데이트
     * 특정 스터디/프로젝트의 커리큘럼 텍스트를 직접 수정합니다.
     * 
     * @param studyProjectId 수정할 스터디/프로젝트의 ID
     * @param curText 수정할 커리큘럼 텍스트 (마크다운 형식)
     * @param userId 요청한 사용자 ID (권한 확인용)
     * @return 수정된 스터디/프로젝트 정보
     * @throws IllegalArgumentException 권한이 없거나 스터디/프로젝트를 찾을 수 없는 경우
     */
    @Transactional
    public StudyResponse updateCurriculumText(Long studyProjectId, String curText, String userId) {
        System.out.println("🔍 [DEBUG] StudyService.updateCurriculumText 호출 - studyProjectId: " + studyProjectId + ", userId: " + userId);
        
        // 스터디/프로젝트 조회
        StudyProject studyProject = studyProjectRepository.findById(studyProjectId)
                .orElseThrow(() -> new IllegalArgumentException("스터디/프로젝트를 찾을 수 없습니다: " + studyProjectId));

        System.out.println("🔍 [DEBUG] StudyService.updateCurriculumText - 스터디/프로젝트 조회 성공: " + studyProject.getStudyProjectName());
        System.out.println("🔍 [DEBUG] StudyService.updateCurriculumText - 스터디/프로젝트 생성자 ID: " + studyProject.getUserId());
        System.out.println("🔍 [DEBUG] StudyService.updateCurriculumText - 요청자 ID: " + userId);

        // 권한 확인: 스터디/프로젝트 생성자만 수정 가능
        if (!userId.equals(studyProject.getUserId())) {
            System.out.println("❌ [DEBUG] StudyService.updateCurriculumText - 권한 없음: " + userId + " != " + studyProject.getUserId());
            throw new IllegalArgumentException("커리큘럼 텍스트 수정 권한이 없습니다. 스터디/프로젝트 생성자만 수정할 수 있습니다.");
        }

        System.out.println("✅ [DEBUG] StudyService.updateCurriculumText - 권한 확인 통과");

        // 커리큘럼 텍스트 업데이트
        studyProject.setCurText(curText);
        StudyProject savedStudyProject = studyProjectRepository.save(studyProject);

        System.out.println("✅ [DEBUG] StudyService.updateCurriculumText - 데이터베이스 저장 완료");

        // StudyResponse로 변환하여 반환
        return convertToResponse(savedStudyProject);
    }
}
