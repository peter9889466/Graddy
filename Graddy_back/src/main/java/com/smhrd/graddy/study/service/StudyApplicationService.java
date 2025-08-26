package com.smhrd.graddy.study.service;

import com.smhrd.graddy.study.dto.StudyApplicationRequest;
import com.smhrd.graddy.study.dto.StudyApplicationResponse;
import com.smhrd.graddy.study.dto.StudyApplicationApprovalRequest;
import com.smhrd.graddy.study.entity.StudyProject;
import com.smhrd.graddy.study.entity.StudyProjectStatus;
import com.smhrd.graddy.study.repository.StudyProjectRepository;
import com.smhrd.graddy.study.repository.StudyProjectStatusRepository;
import com.smhrd.graddy.member.service.MemberService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class StudyApplicationService {

    private final StudyProjectStatusRepository statusRepository;
    private final StudyProjectRepository studyProjectRepository;
    private final MemberService memberService;

    /**
     * 스터디/프로젝트 신청
     */
    @Transactional
    public StudyApplicationResponse applyToStudyProject(String userId, StudyApplicationRequest request) {
        Long studyProjectId = request.getStudyProjectId();
        
        // 스터디/프로젝트 존재 확인
        StudyProject studyProject = studyProjectRepository.findById(studyProjectId)
                .orElseThrow(() -> new IllegalArgumentException("스터디/프로젝트를 찾을 수 없습니다."));
        
        // 모집 중인지 확인
        if (!studyProject.getIsRecruiting().equals(StudyProject.RecruitingStatus.recruitment)) {
            throw new IllegalArgumentException("현재 모집 중이 아닙니다.");
        }
        
        // 이미 신청했는지 확인
        if (statusRepository.existsByUserIdAndStudyProjectId(userId, studyProjectId)) {
            throw new IllegalArgumentException("이미 신청한 스터디/프로젝트입니다.");
        }
        
        // 이미 멤버인지 확인
        if (memberService.isMember(studyProjectId, userId)) {
            throw new IllegalArgumentException("이미 해당 스터디/프로젝트의 멤버입니다.");
        }
        
        // 신청 상태 생성
        StudyProjectStatus application = new StudyProjectStatus();
        application.setUserId(userId);
        application.setStudyProjectId(studyProjectId);
        application.setStatus(StudyProjectStatus.Status.PENDING);
        application.setJoinedAt(new Timestamp(System.currentTimeMillis()));
        
        StudyProjectStatus savedApplication = statusRepository.save(application);
        
        return convertToResponse(savedApplication, request.getMessage());
    }

    /**
     * 신청 승인/거부 처리
     */
    @Transactional
    public void processApplication(Long studyProjectId, StudyApplicationApprovalRequest request, String leaderId) {
        // 리더 권한 확인
        if (!memberService.isLeader(studyProjectId, leaderId)) {
            throw new IllegalArgumentException("해당 스터디/프로젝트의 리더만 신청을 처리할 수 있습니다.");
        }
        
        // 신청 상태 조회
        StudyProjectStatus application = statusRepository.findByUserIdAndStudyProjectId(
                request.getUserId(), studyProjectId)
                .orElseThrow(() -> new IllegalArgumentException("신청 정보를 찾을 수 없습니다."));
        
        // 이미 처리된 신청인지 확인
        if (application.getStatus() != StudyProjectStatus.Status.PENDING) {
            throw new IllegalArgumentException("이미 처리된 신청입니다.");
        }
        
        StudyProjectStatus.Status newStatus = StudyProjectStatus.Status.valueOf(request.getStatus());
        
        if (newStatus == StudyProjectStatus.Status.REJECTED) {
            // 거부된 경우 상태만 변경
            application.setStatus(newStatus);
            statusRepository.save(application);
        } else {
            // 승인된 경우 (APPROVED가 아닌 다른 상태로 처리)
            // 멤버로 추가하고 신청 상태 삭제
            memberService.addMember(studyProjectId, request.getUserId());
            statusRepository.delete(application);
        }
    }

    /**
     * 스터디/프로젝트의 신청 목록 조회
     */
    public List<StudyApplicationResponse> getApplicationsByStudyProject(Long studyProjectId) {
        List<StudyProjectStatus> applications = statusRepository.findByStudyProjectId(studyProjectId);
        return applications.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    /**
     * 사용자의 신청 목록 조회
     */
    public List<StudyApplicationResponse> getApplicationsByUser(String userId) {
        List<StudyProjectStatus> applications = statusRepository.findByUserId(userId);
        return applications.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    /**
     * 사용자가 신청한 스터디/프로젝트 ID 목록 조회
     */
    public List<Long> findStudyProjectIdsByUserId(String userId) {
        List<StudyProjectStatus> applications = statusRepository.findByUserId(userId);
        return applications.stream()
                .map(StudyProjectStatus::getStudyProjectId)
                .collect(Collectors.toList());
    }

    /**
     * 신청 취소
     */
    @Transactional
    public void cancelApplication(String userId, Long studyProjectId) {
        StudyProjectStatus application = statusRepository.findByUserIdAndStudyProjectId(userId, studyProjectId)
                .orElseThrow(() -> new IllegalArgumentException("신청 정보를 찾을 수 없습니다."));
        
        // PENDING 상태인 경우에만 취소 가능
        if (application.getStatus() != StudyProjectStatus.Status.PENDING) {
            throw new IllegalArgumentException("처리된 신청은 취소할 수 없습니다.");
        }
        
        statusRepository.delete(application);
    }

    /**
     * Entity를 Response DTO로 변환
     */
    private StudyApplicationResponse convertToResponse(StudyProjectStatus application) {
        return convertToResponse(application, null);
    }

    private StudyApplicationResponse convertToResponse(StudyProjectStatus application, String message) {
        return new StudyApplicationResponse(
                application.getUserId(),
                application.getStudyProjectId(),
                application.getStatus().toString(),
                message,
                application.getJoinedAt().toLocalDateTime()
        );
    }
}



