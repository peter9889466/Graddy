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
        
        // 스터디/프로젝트 생성자를 리더로 멤버 테이블에 추가
        memberService.addLeaderAsMember(savedStudyProject.getStudyProjectId(), request.getUserId());
        
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
        
        if (userId != null) {
            if (studyProject.getUserId().equals(userId)) {
                userParticipationStatus = "leader";
            } else if (memberService.isMember(studyProject.getStudyProjectId(), userId)) {
                userParticipationStatus = "participating";
            } else if (studyApplicationRepository.findStudyProjectIdsByUserId(userId).contains(studyProject.getStudyProjectId())) {
                userParticipationStatus = "applied";
                
                // study_project_status 테이블에서 신청 상태 정보 조회
                Optional<StudyProjectStatus> statusOpt = studyProjectStatusRepository.findById(
                    new StudyProjectStatus.StudyProjectStatusId(userId, studyProject.getStudyProjectId())
                );
                if (statusOpt.isPresent()) {
                    StudyProjectStatus status = statusOpt.get();
                    applicationStatus = status.getStatus().toString();
                    applicationDate = timestampToLocalDateTime(status.getJoinedAt());
                }
            }
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
                tagNames,
                availableDays,
                currentMembers,
                members,
                userParticipationStatus,
                applicationStatus,
                applicationDate
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
        // 사용자가 멤버로 등록된 스터디/프로젝트 ID 목록 조회
        List<Long> studyProjectIds = memberRepository.findStudyProjectIdsByUserId(userId);
        
        List<StudyResponse> responses = new ArrayList<>();
        for (Long studyProjectId : studyProjectIds) {
            try {
                StudyProject studyProject = studyProjectRepository.findById(studyProjectId).orElse(null);
                if (studyProject != null) {
                    StudyResponse response = convertToResponse(studyProject, userId);
                    responses.add(response);
                }
            } catch (Exception e) {
                // 개별 스터디/프로젝트 조회 실패 시 로그만 남기고 계속 진행
                System.err.println("스터디/프로젝트 조회 실패: " + studyProjectId + ", 오류: " + e.getMessage());
            }
        }
        
        return responses;
    }

    /**
     * 사용자가 신청한 스터디/프로젝트 목록 조회
     * @param userId 사용자 ID
     * @return 신청한 스터디/프로젝트 목록
     */
    public List<StudyResponse> getStudiesByApplicant(String userId) {
        // 사용자가 신청한 스터디/프로젝트 ID 목록 조회
        List<Long> studyProjectIds = studyApplicationRepository.findStudyProjectIdsByUserId(userId);
        
        List<StudyResponse> responses = new ArrayList<>();
        for (Long studyProjectId : studyProjectIds) {
            try {
                StudyProject studyProject = studyProjectRepository.findById(studyProjectId).orElse(null);
                if (studyProject != null) {
                    StudyResponse response = convertToResponse(studyProject, userId);
                    responses.add(response);
                }
            } catch (Exception e) {
                // 개별 스터디/프로젝트 조회 실패 시 로그만 남기고 계속 진행
                System.err.println("스터디/프로젝트 조회 실패: " + studyProjectId + ", 오류: " + e.getMessage());
            }
        }
        
        return responses;
    }

    /**
     * 사용자의 스터디/프로젝트 관리 대시보드 정보 조회
     * @param userId 사용자 ID
     * @return 참여 목록과 신청 목록을 통합한 스터디/프로젝트 목록
     */
    public Map<String, Object> getUserDashboard(String userId) {
        Map<String, Object> dashboard = new HashMap<>();
        
        // 참여 중인 스터디/프로젝트 목록
        List<StudyResponse> participations = getStudiesByParticipant(userId);
        
        // 신청한 스터디/프로젝트 목록
        List<StudyResponse> applications = getStudiesByApplicant(userId);
        
        // 통합된 목록 생성 (참여중인 것과 신청한 것을 합침)
        List<StudyResponse> allStudies = new ArrayList<>();
        allStudies.addAll(participations);
        allStudies.addAll(applications);
        
        // 중복 제거 (같은 스터디에 참여중이면서 동시에 신청한 경우)
        allStudies = allStudies.stream()
                .collect(Collectors.toMap(
                        StudyResponse::getStudyProjectId,
                        study -> study,
                        (existing, replacement) -> {
                            // 참여중인 것이 우선 (userParticipationStatus가 "참여중"인 것)
                            if ("참여중".equals(existing.getUserParticipationStatus())) {
                                return existing;
                            } else {
                                return replacement;
                            }
                        }
                ))
                .values()
                .stream()
                .collect(Collectors.toList());
        
        // 참여 목록과 신청 목록도 별도로 제공
        dashboard.put("participations", participations);
        dashboard.put("applications", applications);
        
        // 통합된 전체 목록 제공
        dashboard.put("allStudies", allStudies);
        
        // 통계 정보 추가
        dashboard.put("totalCount", allStudies.size());
        dashboard.put("participationCount", participations.size());
        dashboard.put("applicationCount", applications.size());
        
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
}
