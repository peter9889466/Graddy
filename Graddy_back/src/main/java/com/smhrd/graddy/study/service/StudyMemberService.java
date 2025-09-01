package com.smhrd.graddy.study.service;

import com.smhrd.graddy.chat.repository.StudyProjectMemberRepository;
import com.smhrd.graddy.study.dto.StudyMemberResponse;
import com.smhrd.graddy.user.repository.UserInterestRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * 스터디 멤버 조회 서비스
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class StudyMemberService {
    
    private final StudyProjectMemberRepository studyProjectMemberRepository;
    private final UserInterestRepository userInterestRepository;
    
    /**
     * 특정 스터디의 특정 멤버 상세 정보 조회
     * 
     * @param studyProjectId 스터디/프로젝트 ID
     * @param memberId 멤버 ID
     * @return 멤버 상세 정보
     * @throws IllegalArgumentException 멤버를 찾을 수 없는 경우
     */
    public StudyMemberResponse getMemberDetail(Long studyProjectId, Long memberId) {
        log.info("스터디 멤버 상세 정보 조회: studyProjectId={}, memberId={}", studyProjectId, memberId);
        
        // 멤버 기본 정보 조회
        Object[] memberData = studyProjectMemberRepository.findMemberDetailByStudyProjectIdAndMemberId(
                studyProjectId, memberId);
        
        if (memberData == null || memberData.length == 0) {
            throw new IllegalArgumentException("해당 스터디의 멤버를 찾을 수 없습니다: studyProjectId=" + studyProjectId + ", memberId=" + memberId);
        }
        
        // Object 배열에서 데이터 추출
        String userId = (String) memberData[1];
        
        // 관심분야 조회
        List<String> interests = userInterestRepository.findInterestNamesByUserId(userId);
        
        // DTO 생성 및 반환
        StudyMemberResponse response = StudyMemberResponse.builder()
                .memberId((Long) memberData[0])
                .userId(userId)
                .studyProjectId((Long) memberData[2])
                .joinedAt(memberData[3] != null ? memberData[3].toString() : null)
                .nick((String) memberData[4])
                .gitUrl((String) memberData[5])
                .userRefer((String) memberData[6])
                .imgUrl((String) memberData[7])
                .userScore((Integer) memberData[8])
                .interests(interests)
                .build();
        
        log.info("스터디 멤버 상세 정보 조회 완료: userId={}, nick={}", userId, response.getNick());
        return response;
    }
}
