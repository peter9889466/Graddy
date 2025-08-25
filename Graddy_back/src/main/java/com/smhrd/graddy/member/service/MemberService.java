package com.smhrd.graddy.member.service;

import com.smhrd.graddy.member.dto.MemberInfo;
import com.smhrd.graddy.member.entity.Member;
import com.smhrd.graddy.member.repository.MemberRepository;
import com.smhrd.graddy.study.entity.StudyProject;
import com.smhrd.graddy.study.repository.StudyProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MemberService {

    private final MemberRepository memberRepository;
    private final StudyProjectRepository studyProjectRepository;

    // 일반 멤버 추가
    @Transactional
    public void addMember(Long studyProjectId, String userId) {
        // 이미 멤버인지 확인
        if (memberRepository.existsByUserIdAndStudyProjectId(userId, studyProjectId)) {
            throw new IllegalArgumentException("이미 해당 스터디/프로젝트의 멤버입니다.");
        }
        
        // 리더인지 확인 (리더는 일반 멤버로 추가할 수 없음)
        Optional<Member> existingLeader = memberRepository.findByStudyProjectIdAndMemberType(studyProjectId, Member.MemberType.leader);
        if (existingLeader.isPresent() && existingLeader.get().getUserId().equals(userId)) {
            throw new IllegalArgumentException("이미 해당 스터디/프로젝트의 리더입니다.");
        }
        
        Member member = new Member();
        member.setUserId(userId);
        member.setStudyProjectId(studyProjectId);
        member.setStudyProjectCheck(Member.MemberStatus.approved);
        member.setMemberType(Member.MemberType.member);
        member.setJoinedAt(Timestamp.valueOf(LocalDateTime.now()));
        
        memberRepository.save(member);
    }

    // 멤버 상태 변경 (승인/거부/탈퇴)
    @Transactional
    public void updateMemberStatus(Long studyProjectId, String userId, Member.MemberStatus status) {
        Member member = memberRepository.findByUserIdAndStudyProjectId(userId, studyProjectId)
                .orElseThrow(() -> new IllegalArgumentException("해당 멤버를 찾을 수 없습니다."));
        
        member.setStudyProjectCheck(status);
        memberRepository.save(member);
    }

    // 멤버 타입 변경 (리더 권한 이전)
    @Transactional
    public void changeLeader(Long studyProjectId, String newLeaderId, String currentLeaderId) {
        // 현재 리더 권한 확인
        StudyProject studyProject = studyProjectRepository.findById(studyProjectId)
                .orElseThrow(() -> new IllegalArgumentException("스터디/프로젝트를 찾을 수 없습니다."));
        
        if (!studyProject.getUserId().equals(currentLeaderId)) {
            throw new IllegalArgumentException("리더 권한을 변경할 권한이 없습니다.");
        }

        // 기존 리더를 일반 멤버로 변경
        Member currentLeader = memberRepository.findByUserIdAndStudyProjectId(currentLeaderId, studyProjectId)
                .orElseThrow(() -> new IllegalArgumentException("현재 리더 정보를 찾을 수 없습니다."));
        currentLeader.setMemberType(Member.MemberType.member);
        memberRepository.save(currentLeader);

        // 새로운 리더 설정
        Member newLeader = memberRepository.findByUserIdAndStudyProjectId(newLeaderId, studyProjectId)
                .orElseThrow(() -> new IllegalArgumentException("새로운 리더 정보를 찾을 수 없습니다."));
        newLeader.setMemberType(Member.MemberType.leader);
        memberRepository.save(newLeader);

        // StudyProject의 userId도 업데이트
        studyProject.setUserId(newLeaderId);
        studyProjectRepository.save(studyProject);
    }

    // 스터디/프로젝트의 멤버 정보 목록 조회
    public List<MemberInfo> getMembersByStudyProjectId(Long studyProjectId) {
        List<MemberInfo> members = new ArrayList<>();
        List<Member> memberList = memberRepository.findByStudyProjectIdAndStudyProjectCheck(
                studyProjectId, Member.MemberStatus.approved);
        
        for (Member member : memberList) {
            MemberInfo memberInfo = new MemberInfo(
                    member.getMemberId(),
                    member.getUserId(),
                    member.getMemberType().toString(),
                    member.getStudyProjectCheck().toString(),
                    timestampToLocalDateTime(member.getJoinedAt())
            );
            members.add(memberInfo);
        }
        
        return members;
    }

    // 스터디/프로젝트의 현재 인원수 조회
    public int getCurrentMemberCount(Long studyProjectId) {
        return (int) memberRepository.countByStudyProjectIdAndApproved(studyProjectId);
    }

    // 리더를 멤버로 자동 추가 (스터디 생성 시)
    @Transactional
    public void addLeaderAsMember(Long studyProjectId, String userId) {
        Member leaderMember = new Member();
        leaderMember.setUserId(userId);
        leaderMember.setStudyProjectId(studyProjectId);
        leaderMember.setStudyProjectCheck(Member.MemberStatus.approved);
        leaderMember.setMemberType(Member.MemberType.leader);
        leaderMember.setJoinedAt(Timestamp.valueOf(LocalDateTime.now()));
        
        memberRepository.save(leaderMember);
    }

    // 특정 사용자가 해당 스터디/프로젝트의 리더인지 확인
    public boolean isLeader(Long studyProjectId, String userId) {
        Optional<Member> leaderMember = memberRepository.findByStudyProjectIdAndMemberType(studyProjectId, Member.MemberType.leader);
        return leaderMember.isPresent() && leaderMember.get().getUserId().equals(userId);
    }

    // 스터디/프로젝트의 리더 ID 조회
    public String getLeaderId(Long studyProjectId) {
        Optional<Member> leaderMember = memberRepository.findByStudyProjectIdAndMemberType(studyProjectId, Member.MemberType.leader);
        return leaderMember.map(Member::getUserId).orElse(null);
    }

    // 스터디/프로젝트의 리더 memberId 조회
    public Long getLeaderMemberId(Long studyProjectId) {
        Optional<Member> leaderMember = memberRepository.findByStudyProjectIdAndMemberType(studyProjectId, Member.MemberType.leader);
        return leaderMember.map(Member::getMemberId).orElse(null);
    }

    // 특정 사용자가 해당 스터디/프로젝트의 멤버인지 확인
    public boolean isMember(Long studyProjectId, String userId) {
        return memberRepository.existsByUserIdAndStudyProjectId(userId, studyProjectId);
    }

    // Timestamp를 LocalDateTime으로 변환하는 유틸리티 메서드
    private LocalDateTime timestampToLocalDateTime(Timestamp timestamp) {
        if (timestamp == null) {
            return null;
        }
        return timestamp.toLocalDateTime();
    }

    // 사용자 ID와 스터디 프로젝트 ID로 member_id 조회
    public Long getMemberIdByUserIdAndStudyProjectId(String userId, Long studyProjectId) {
        Optional<Member> member = memberRepository.findByUserIdAndStudyProjectId(userId, studyProjectId);
        return member.map(Member::getMemberId).orElse(null);
    }

    // member_id로 리더 권한 확인
    public boolean isLeaderByMemberId(Long memberId) {
        Optional<Member> member = memberRepository.findById(memberId);
        return member.isPresent() && member.get().getMemberType() == Member.MemberType.leader;
    }
}
