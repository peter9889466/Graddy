package com.smhrd.graddy.member.service;

import com.smhrd.graddy.member.dto.MemberInfo;
import com.smhrd.graddy.member.entity.Member;
import com.smhrd.graddy.member.repository.MemberRepository;
import com.smhrd.graddy.study.entity.StudyProject;
import com.smhrd.graddy.study.repository.StudyProjectRepository;
import com.smhrd.graddy.user.entity.User;
import com.smhrd.graddy.user.repository.UserRepository;
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
    private final UserRepository userRepository;

    // 스터디/프로젝트의 멤버 정보 목록 조회
    public List<MemberInfo> getMembersByStudyProjectId(Long studyProjectId) {
        List<MemberInfo> members = new ArrayList<>();
        List<Member> memberList = memberRepository.findByStudyProjectIdAndStudyProjectCheck(
                studyProjectId, Member.MemberStatus.approved);
        
        for (Member member : memberList) {
            // 사용자의 nick 정보 조회
            String nick = "";
            Optional<User> user = userRepository.findById(member.getUserId());
            if (user.isPresent()) {
                nick = user.get().getNick();
            }
            
            MemberInfo memberInfo = new MemberInfo(
                    member.getMemberId(),
                    member.getUserId(),
                    nick,                           // 사용자 닉네임
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

    // 특정 사용자가 해당 스터디/프로젝트의 리더인지 확인
    public boolean isLeader(Long studyProjectId, String userId) {
        Optional<Member> leaderMember = memberRepository.findByStudyProjectIdAndMemberType(studyProjectId, Member.MemberType.leader);
        return leaderMember.isPresent() && leaderMember.get().getUserId().equals(userId);
    }

    // 사용자 ID와 스터디 프로젝트 ID로 member_id 조회
    public Long getMemberIdByUserIdAndStudyProjectId(String userId, Long studyProjectId) {
        Optional<Member> member = memberRepository.findByUserIdAndStudyProjectId(userId, studyProjectId);
        return member.map(Member::getMemberId).orElse(null);
    }

    // member_id로 userId 조회
    public String getUserIdByMemberId(Long memberId) {
        Optional<Member> member = memberRepository.findById(memberId);
        return member.map(Member::getUserId).orElse(null);
    }

    // 스터디/프로젝트의 리더 memberId 조회
    public Long getLeaderMemberId(Long studyProjectId) {
        Optional<Member> leaderMember = memberRepository.findByStudyProjectIdAndMemberType(studyProjectId, Member.MemberType.leader);
        return leaderMember.map(Member::getMemberId).orElse(null);
    }

    // member_id로 리더 권한 확인
    public boolean isLeaderByMemberId(Long memberId) {
        Optional<Member> member = memberRepository.findById(memberId);
        return member.isPresent() && member.get().getMemberType() == Member.MemberType.leader;
    }

    // 특정 사용자가 해당 스터디/프로젝트의 멤버인지 확인
    public boolean isMember(Long studyProjectId, String userId) {
        return memberRepository.existsByUserIdAndStudyProjectId(userId, studyProjectId);
    }

    // 스터디/프로젝트에 새 멤버 추가
    @Transactional
    public void addMember(Long studyProjectId, String userId) {
        Member member = new Member();
        member.setUserId(userId);
        member.setStudyProjectId(studyProjectId);
        member.setStudyProjectCheck(Member.MemberStatus.approved);
        member.setMemberType(Member.MemberType.member);
        member.setJoinedAt(Timestamp.valueOf(LocalDateTime.now()));
        
        memberRepository.save(member);
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

    // 멤버 상태 업데이트 (승인/거부/탈퇴)
    @Transactional
    public void updateMemberStatus(Long studyProjectId, String userId, Member.MemberStatus memberStatus) {
        Optional<Member> member = memberRepository.findByUserIdAndStudyProjectId(userId, studyProjectId);
        if (member.isPresent()) {
            Member existingMember = member.get();
            existingMember.setStudyProjectCheck(memberStatus);
            memberRepository.save(existingMember);
        }
    }

    // 리더 변경
    @Transactional
    public void changeLeader(Long studyProjectId, String newLeaderId, String currentLeaderId) {
        // 기존 리더를 일반 멤버로 변경
        Optional<Member> currentLeader = memberRepository.findByUserIdAndStudyProjectId(currentLeaderId, studyProjectId);
        if (currentLeader.isPresent()) {
            Member leaderMember = currentLeader.get();
            leaderMember.setMemberType(Member.MemberType.member);
            memberRepository.save(leaderMember);
        }

        // 새로운 리더 설정
        Optional<Member> newLeader = memberRepository.findByUserIdAndStudyProjectId(newLeaderId, studyProjectId);
        if (newLeader.isPresent()) {
            Member newLeaderMember = newLeader.get();
            newLeaderMember.setMemberType(Member.MemberType.leader);
            memberRepository.save(newLeaderMember);
        }

        // StudyProject의 userId도 업데이트
        Optional<StudyProject> studyProject = studyProjectRepository.findById(studyProjectId);
        if (studyProject.isPresent()) {
            StudyProject project = studyProject.get();
            project.setUserId(newLeaderId);
            studyProjectRepository.save(project);
        }
    }

    // Timestamp를 LocalDateTime으로 변환하는 유틸리티 메서드
    private LocalDateTime timestampToLocalDateTime(Timestamp timestamp) {
        if (timestamp == null) {
            return null;
        }
        return timestamp.toLocalDateTime();
    }
}
