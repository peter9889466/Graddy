package com.smhrd.graddy.study.service;

import com.smhrd.graddy.study.entity.*;
import com.smhrd.graddy.study.repository.*;
import com.smhrd.graddy.member.entity.Member;
import com.smhrd.graddy.member.repository.MemberRepository;
import com.smhrd.graddy.tag.entity.Tag;
import com.smhrd.graddy.tag.repository.TagRepository;
import com.smhrd.graddy.interest.entity.Interest;
import com.smhrd.graddy.interest.repository.InterestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class StudyProjectService {

    @Autowired
    private StudyProjectRepository studyProjectRepository;

    @Autowired
    private StudyProjectStatusRepository statusRepository;

    @Autowired
    private MemberRepository memberRepository;

    @Autowired
    private TagRepository tagRepository;

    @Autowired
    private InterestRepository interestRepository;

    @Autowired
    private StudyProjectAvailableDayRepository availableDayRepository;

    // 스터디/프로젝트 생성
    public StudyProject createStudyProject(StudyProject studyProject, List<Long> interestIds, List<Byte> dayIds) {
        // 스터디/프로젝트 저장
        StudyProject savedStudyProject = studyProjectRepository.save(studyProject);

        // 태그 저장
        if (interestIds != null) {
            for (Long interestId : interestIds) {
                Tag tag = new Tag();
                tag.setStudyProjectId(savedStudyProject.getStudyProjectId());
                tag.setInterestId(interestId);
                tagRepository.save(tag);
            }
        }

        // 선호 요일 저장
        if (dayIds != null) {
            for (Byte dayId : dayIds) {
                StudyProjectAvailableDay availableDay = new StudyProjectAvailableDay();
                availableDay.setStudyProjectId(savedStudyProject.getStudyProjectId());
                availableDay.setDayId(dayId);
                availableDayRepository.save(availableDay);
            }
        }

        return savedStudyProject;
    }

    // 스터디/프로젝트 신청
    public StudyProjectStatus applyToStudyProject(String userId, Long studyProjectId) {
        // 이미 신청했는지 확인
        Optional<StudyProjectStatus> existingStatus = statusRepository
                .findByUserIdAndStudyProjectId(userId, studyProjectId);
        
        if (existingStatus.isPresent()) {
            throw new RuntimeException("이미 신청한 스터디/프로젝트입니다.");
        }

        // 신청 상태 생성
        StudyProjectStatus status = new StudyProjectStatus();
        status.setUserId(userId);
        status.setStudyProjectId(studyProjectId);
        status.setStatus(StudyProjectStatus.Status.PENDING);
        status.setJoinedAt(new Timestamp(System.currentTimeMillis()));

        return statusRepository.save(status);
    }

    // 신청 승인 처리
    @Transactional
    public void approveApplication(String userId, Long studyProjectId) {
        // 신청 상태 조회
        StudyProjectStatus status = statusRepository
                .findByUserIdAndStudyProjectId(userId, studyProjectId)
                .orElseThrow(() -> new RuntimeException("신청 정보를 찾을 수 없습니다."));

        // 멤버 테이블에 추가
        Member member = new Member();
        member.setUserId(userId);
        member.setStudyProjectId(studyProjectId);
        member.setStudyProjectCheck(Member.MemberStatus.approved);
        member.setMemberType(Member.MemberType.member);
        member.setJoinedAt(new Timestamp(System.currentTimeMillis()));
        memberRepository.save(member);

        // 신청 상태 테이블에서 삭제
        statusRepository.delete(status);
    }

    // 신청 거부 처리
    public void rejectApplication(String userId, Long studyProjectId) {
        StudyProjectStatus status = statusRepository
                .findByUserIdAndStudyProjectId(userId, studyProjectId)
                .orElseThrow(() -> new RuntimeException("신청 정보를 찾을 수 없습니다."));

        status.setStatus(StudyProjectStatus.Status.REJECTED);
        statusRepository.save(status);
    }

    // 스터디/프로젝트 조회
    public StudyProject getStudyProjectById(Long studyProjectId) {
        return studyProjectRepository.findById(studyProjectId)
                .orElseThrow(() -> new RuntimeException("스터디/프로젝트를 찾을 수 없습니다."));
    }

    // 모든 스터디/프로젝트 조회
    public List<StudyProject> getAllStudyProjects() {
        return studyProjectRepository.findAllOrderByCreatedAtDesc();
    }

    // 타입별 스터디/프로젝트 조회
    public List<StudyProject> getStudyProjectsByType(StudyProject.TypeCheck typeCheck) {
        return studyProjectRepository.findByTypeCheck(typeCheck);
    }

    // 모집 중인 스터디/프로젝트 조회
    public List<StudyProject> getRecruitingStudyProjects() {
        return studyProjectRepository.findByIsRecruiting(StudyProject.RecruitingStatus.recruitment);
    }

    // 스터디/프로젝트 수정
    @Transactional
    public StudyProject updateStudyProject(Long studyProjectId, StudyProject updateData, 
                                        List<Long> interestIds, List<Byte> dayIds) {
        StudyProject existingProject = getStudyProjectById(studyProjectId);

        // 기본 정보 업데이트
        if (updateData.getStudyProjectName() != null) {
            existingProject.setStudyProjectName(updateData.getStudyProjectName());
        }
        if (updateData.getStudyProjectTitle() != null) {
            existingProject.setStudyProjectTitle(updateData.getStudyProjectTitle());
        }
        if (updateData.getStudyProjectDesc() != null) {
            existingProject.setStudyProjectDesc(updateData.getStudyProjectDesc());
        }
        if (updateData.getStudyLevel() != null) {
            existingProject.setStudyLevel(updateData.getStudyLevel());
        }
        if (updateData.getTypeCheck() != null) {
            existingProject.setTypeCheck(updateData.getTypeCheck());
        }
        if (updateData.getStudyProjectStart() != null) {
            existingProject.setStudyProjectStart(updateData.getStudyProjectStart());
        }
        if (updateData.getStudyProjectEnd() != null) {
            existingProject.setStudyProjectEnd(updateData.getStudyProjectEnd());
        }
        if (updateData.getStudyProjectTotal() != null) {
            existingProject.setStudyProjectTotal(updateData.getStudyProjectTotal());
        }
        if (updateData.getSoltStart() != null) {
            existingProject.setSoltStart(updateData.getSoltStart());
        }
        if (updateData.getSoltEnd() != null) {
            existingProject.setSoltEnd(updateData.getSoltEnd());
        }

        // 태그 업데이트
        if (interestIds != null) {
            // 기존 태그 삭제
            tagRepository.deleteByStudyProjectId(studyProjectId);
            
            // 새 태그 추가
            for (Long interestId : interestIds) {
                Tag tag = new Tag();
                tag.setStudyProjectId(studyProjectId);
                tag.setInterestId(interestId);
                tagRepository.save(tag);
            }
        }

        // 선호 요일 업데이트
        if (dayIds != null) {
            // 기존 선호 요일 삭제
            availableDayRepository.deleteByStudyProjectId(studyProjectId);
            
            // 새 선호 요일 추가
            for (Byte dayId : dayIds) {
                StudyProjectAvailableDay availableDay = new StudyProjectAvailableDay();
                availableDay.setStudyProjectId(studyProjectId);
                availableDay.setDayId(dayId);
                availableDayRepository.save(availableDay);
            }
        }

        return studyProjectRepository.save(existingProject);
    }

    // 스터디/프로젝트 삭제
    @Transactional
    public void deleteStudyProject(Long studyProjectId) {
        // 관련 데이터 삭제
        tagRepository.deleteByStudyProjectId(studyProjectId);
        availableDayRepository.deleteByStudyProjectId(studyProjectId);
        statusRepository.deleteByStudyProjectId(studyProjectId);
        memberRepository.deleteByStudyProjectId(studyProjectId);
        
        // 스터디/프로젝트 삭제
        studyProjectRepository.deleteById(studyProjectId);
    }

    // 스터디/프로젝트의 태그 목록 조회
    public List<String> getStudyProjectTags(Long studyProjectId) {
        List<Tag> tags = tagRepository.findByStudyProjectId(studyProjectId);
        return tags.stream()
                .map(tag -> {
                    Interest interest = interestRepository.findById(tag.getInterestId()).orElse(null);
                    return interest != null ? interest.getInterestName() : "";
                })
                .filter(name -> !name.isEmpty())
                .toList();
    }

    // 스터디/프로젝트의 선호 요일 조회
    public List<Byte> getStudyProjectAvailableDays(Long studyProjectId) {
        List<StudyProjectAvailableDay> availableDays = availableDayRepository.findByStudyProjectId(studyProjectId);
        return availableDays.stream()
                .map(StudyProjectAvailableDay::getDayId)
                .toList();
    }

    // 스터디/프로젝트의 신청자 목록 조회
    public List<StudyProjectStatus> getStudyProjectApplications(Long studyProjectId) {
        return statusRepository.findByStudyProjectId(studyProjectId);
    }

    // 스터디/프로젝트의 멤버 목록 조회
    public List<Member> getStudyProjectMembers(Long studyProjectId) {
        return memberRepository.findByStudyProjectId(studyProjectId);
    }
}
