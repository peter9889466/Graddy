package com.smhrd.graddy.user.service;


import com.smhrd.graddy.user.dto.JoinRequest;
import com.smhrd.graddy.user.dto.UserInterestRequest;
import com.smhrd.graddy.user.dto.UserProfileUpdateRequest;
import com.smhrd.graddy.user.entity.User;
import com.smhrd.graddy.user.entity.UserInterest;
import com.smhrd.graddy.user.entity.UserAvailableDays;
import com.smhrd.graddy.user.entity.Days;
import com.smhrd.graddy.user.entity.UserScore;
import com.smhrd.graddy.interest.entity.Interest;
import com.smhrd.graddy.user.repository.UserInterestRepository;
import com.smhrd.graddy.user.repository.UserRepository;
import com.smhrd.graddy.user.repository.UserAvailableDaysRepository;
import com.smhrd.graddy.user.repository.DaysRepository;
import com.smhrd.graddy.user.repository.UserScoreRepository;
import com.smhrd.graddy.interest.repository.InterestRepository;
import com.smhrd.graddy.auth.VerificationService;
import com.smhrd.graddy.schedule.service.ScheduleNotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.ArrayList;
import java.util.stream.Collectors;
import com.smhrd.graddy.auth.dto.UnifiedPhoneVerificationResponse;
import com.smhrd.graddy.user.dto.MyPageResponse;
import com.smhrd.graddy.study.repository.StudyProjectRepository;
import com.smhrd.graddy.study.entity.StudyProject;
import com.smhrd.graddy.user.dto.StudyProjectListResponse;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserService {

    private final UserRepository userRepository;
    private final UserInterestRepository userInterestRepository;
    private final UserAvailableDaysRepository userAvailableDaysRepository;
    private final UserScoreRepository userScoreRepository;
    private final InterestRepository interestRepository;
    private final PasswordEncoder passwordEncoder;
    private final DaysRepository daysRepository;
    private final VerificationService verificationService;
    private final StudyProjectRepository studyProjectRepository;
    private final ScheduleNotificationService scheduleNotificationService;

    /**
     * [추가] 사용자 아이디 중복 확인 메서드
     * @param userId 확인할 사용자 아이디
     * @return 사용 가능하면 true, 중복이면 false
     */
    public boolean isUserIdAvailable(String userId) {
        // userRepository.findByUserId() 결과가 비어있으면(isPresent()가 false) 사용 가능한 아이디
        return !userRepository.findByUserId(userId).isPresent();
    }

    /**
     * [추가] 사용자 닉네임 중복 확인 메서드
     * @param nick 확인할 사용자 닉네임
     * @return 사용 가능하면 true, 중복이면 false
     */
    public boolean isNickAvailable(String nick) {
        // userRepository.findByNick() 결과가 비어있으면(isPresent()가 false) 사용 가능한 닉네임
        return !userRepository.findByNick(nick).isPresent();
    }

    /**
     * [추가] 아이디 찾기 메서드
     * @param name 사용자 이름
     * @param tel 사용자 전화번호
     * @return 찾은 사용자의 아이디, 없으면 null
     */
    public String findUserIdByNameAndTel(String name, String tel) {
        Optional<User> user = userRepository.findByNameAndTel(name, tel);
        return user.map(User::getUserId).orElse(null);
    }

    /**
     * [추가] 사용자 점수 조회 메서드
     * @param userId 사용자 ID
     * @return 사용자 점수 정보
     */
    public UserScore getUserScore(String userId) {
        return userScoreRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자 점수 정보를 찾을 수 없습니다: " + userId));
    }

    /**
     * [추가] 사용자 점수 증가 메서드
     * @param userId 사용자 ID
     * @param amount 증가할 점수
     * @return 업데이트된 점수 정보
     */
    @Transactional
    public UserScore addUserScore(String userId, int amount) {
        UserScore userScore = getUserScore(userId);
        userScore.addScore(amount);
        return userScoreRepository.save(userScore);
    }

    /**
     * [추가] 사용자 점수 감소 메서드
     * @param userId 사용자 ID
     * @param amount 감소할 점수
     * @return 업데이트된 점수 정보
     */
    @Transactional
    public UserScore subtractUserScore(String userId, int amount) {
        UserScore userScore = getUserScore(userId);
        userScore.subtractScore(amount);
        return userScoreRepository.save(userScore);
    }

    /**
     * [추가] 상위 사용자 점수 조회 메서드
     * @param limit 조회할 상위 사용자 수
     * @return 상위 사용자 점수 목록
     */
    public List<UserScore> getTopUsersByScore(int limit) {
        return userScoreRepository.findTopUsersByScore(limit);
    }

    /**
     * [추가] 특정 점수 이상의 사용자들 조회 메서드
     * @param minScore 최소 점수
     * @return 점수 정보 목록
     */
    public List<UserScore> getUsersByMinScore(int minScore) {
        return userScoreRepository.findByUserScoreGreaterThanEqualOrderByUserScoreDesc(minScore);
    }






    /**
     * [추가] 사용자 관심분야 수정 메서드
     * @param currentUserId 현재 사용자 아이디
     * @param interests 새로운 관심분야 목록
     * @return 수정된 관심분야 정보
     */
    @Transactional
    public List<UserInterest> updateUserInterests(String currentUserId, List<UserInterestRequest> interests) {
        // 기존 사용자 조회
        User user = userRepository.findByUserId(currentUserId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
        
        // 기존 관심분야 데이터 삭제
        userInterestRepository.deleteByIdUserId(currentUserId);
        
        // 새로운 관심분야 데이터 저장
        List<UserInterest> savedInterests = new ArrayList<>();
        if (interests != null && !interests.isEmpty()) {
            for (UserInterestRequest userInterestRequest : interests) {
                Optional<Interest> interestOpt = interestRepository.findById(userInterestRequest.getInterestId());
                if (interestOpt.isPresent()) {
                    UserInterest userInterest = new UserInterest();
                    UserInterest.UserInterestId id = new UserInterest.UserInterestId(currentUserId, userInterestRequest.getInterestId());
                    userInterest.setId(id);
                    userInterest.setUser(user);
                    userInterest.setInterest(interestOpt.get());
                    userInterest.setInterestLevel(userInterestRequest.getInterestLevel());
                    UserInterest savedInterest = userInterestRepository.save(userInterest);
                    savedInterests.add(savedInterest);
                }
            }
        }
        
        return savedInterests;
    }


    @Transactional
    public User join(JoinRequest joinRequest) {
        if (userRepository.findByUserId(joinRequest.getUserId()).isPresent()) {
            //이미 존재하는 아이디일 경우 예외 발생
            throw new IllegalArgumentException("이미 존재하는 아이디입니다.");
        }

        // 2.User 엔티티 생성
        User newUser = new User();
        newUser.setUserId(joinRequest.getUserId());
        //비밀번호는 암호화하여 저장
        newUser.setPassword(passwordEncoder.encode(joinRequest.getPassword()));
        newUser.setName(joinRequest.getName());
        newUser.setNick(joinRequest.getNick());
        newUser.setTel(joinRequest.getTel());
        newUser.setGitUrl(joinRequest.getGitUrl());
        newUser.setUserRefer(joinRequest.getUserRefer());
        newUser.setAlarmType(joinRequest.isAlarmType());
        newUser.setSoltStart(joinRequest.getSoltStart());
        newUser.setSoltEnd(joinRequest.getSoltEnd());
        User savedUser = userRepository.save(newUser);

        // 역할은 User엔티티의 기본값 사용됨
        // 3. [변경] 사용자의 관심사 정보를 user_interest 테이블에 저장합니다.
        if (joinRequest.getInterests() != null && !joinRequest.getInterests().isEmpty()) {
            // DTO에 포함된 interests 리스트를 하나씩 꺼내서 처리합니다.
            for (UserInterestRequest userInterestRequest : joinRequest.getInterests()) {
                // Interest 엔티티 조회
                Optional<Interest> interestOpt = interestRepository.findById(userInterestRequest.getInterestId());
                if (interestOpt.isPresent()) {
                    UserInterest userInterest = new UserInterest();
                    UserInterest.UserInterestId id = new UserInterest.UserInterestId(savedUser.getUserId(), userInterestRequest.getInterestId());
                    userInterest.setId(id);
                    userInterest.setUser(savedUser);
                    userInterest.setInterest(interestOpt.get());
                    userInterest.setInterestLevel(userInterestRequest.getInterestLevel());

                    // user_interest 테이블에 저장
                    userInterestRepository.save(userInterest);
                }
            }
        }
        
        // 4. 사용자의 가능한 요일 정보를 user_available_days 테이블에 저장합니다.
        if (joinRequest.getAvailableDays() != null && !joinRequest.getAvailableDays().isEmpty()) {
            for (Integer dayId : joinRequest.getAvailableDays()) {
                // Days 엔티티 조회
                Optional<Days> daysOpt = daysRepository.findById(dayId);
                if (daysOpt.isPresent()) {
                    UserAvailableDays userAvailableDays = new UserAvailableDays();
                    UserAvailableDays.UserAvailableDaysId id = new UserAvailableDays.UserAvailableDaysId(savedUser.getUserId(), dayId);
                    userAvailableDays.setId(id);
                    userAvailableDays.setUser(savedUser);
                    userAvailableDays.setDays(daysOpt.get());
                    
                    // user_available_days 테이블에 저장
                    userAvailableDaysRepository.save(userAvailableDays);
                }
            }
        }
        
        // 5. 사용자의 기본 점수 1000점을 생성합니다.
        UserScore userScore = new UserScore();
        userScore.setUserId(savedUser.getUserId());
        userScore.setScore(1000);
        userScoreRepository.save(userScore);
        
        return savedUser; // 저장된 User 정보를 컨트롤러로 반환
    }

    /**
     * [추가] 통합된 회원 정보 수정 메서드
     * @param currentUserId 현재 사용자 아이디
     * @param request 수정 요청 정보
     * @return 수정된 사용자 정보
     */
    @Transactional
    public User updateUserProfile(String currentUserId, UserProfileUpdateRequest request) {
        // 기존 사용자 조회
        User user = userRepository.findByUserId(currentUserId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
        
        // 수정할 내용이 있는지 확인
        if (!request.hasAnyUpdate()) {
            throw new IllegalArgumentException("수정할 내용이 없습니다.");
        }
        
        // 새 비밀번호 수정
        if (request.hasNewPassword()) {
            user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        }
        
        // 새 닉네임 수정
        if (request.hasNewNickname()) {
            // 닉네임 중복 확인
            if (userRepository.findByNick(request.getNewNickname()).isPresent()) {
                throw new IllegalArgumentException("이미 사용 중인 닉네임입니다.");
            }
            user.setNick(request.getNewNickname());
        }
        
        // 새 전화번호 수정
        if (request.hasNewTel()) {
            user.setTel(request.getNewTel());
        }
        
        // 수정된 사용자 정보 저장
        return userRepository.save(user);
    }

    /**
     * [추가] 회원탈퇴 메서드
     * @param currentUserId 현재 사용자 아이디
     * @return 삭제된 사용자 정보
     */
    @Transactional
    public User withdrawUser(String currentUserId) {
        // 기존 사용자 조회
        User user = userRepository.findByUserId(currentUserId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
        
        // 1. CASCADE로 자동 삭제되는 테이블들:
        // - user_interest (사용자 관심분야)
        // - user_available_days (사용자 가능 요일)
        // - scores (사용자 점수)
        // - schedule (사용자 일정)
        // - study_project_status (스터디 신청 상태)
        
        // 2. CASCADE가 설정되지 않은 테이블들 (수동 삭제 필요):
        // - study_project_member (스터디 멤버)
        // - assignments (과제)
        // - submissions (과제 제출)
        // - feedbacks (피드백)
        // - chat_messages (채팅 메시지)
        // - free_posts (자유게시판)
        // - study_posts (스터디 커뮤니티)
        
        // 3. 댓글(comments)은 남겨둠 (회원탈퇴해도 댓글은 유지)
        
        // 4. 최종적으로 users 테이블에서 사용자 삭제
        // CASCADE 설정된 테이블들은 자동으로 삭제됨
        userRepository.delete(user);
        
        return user;
    }

    /**
     * [추가] 비밀번호 찾기 1단계: 사용자 존재 여부 확인
     * @param userId 사용자 아이디
     * @param tel 사용자 전화번호
     * @return 사용자 존재 여부
     */
    public boolean verifyUserForPasswordFind(String userId, String tel) {
        Optional<User> user = userRepository.findByUserId(userId);
        if (user.isPresent()) {
            return user.get().getTel().equals(tel);
        }
        return false;
    }

    /**
     * [추가] 비밀번호 찾기 3단계: 비밀번호 변경
     * @param userId 사용자 아이디
     * @param newPassword 새로운 비밀번호
     * @return 변경된 사용자 정보
     */
    @Transactional
    public User resetPassword(String userId, String newPassword) {
        User user = userRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
        
        // 새 비밀번호 암호화하여 저장
        user.setPassword(passwordEncoder.encode(newPassword));
        
        return userRepository.save(user);
    }

    /**
     * [추가] 통합 전화번호 인증 메서드
     * 회원가입 시 전화번호 중복 확인과 SMS 인증을 동시에 처리
     * @param tel 전화번호
     * @param purpose 사용 목적 (JOIN: 회원가입, PASSWORD_FIND: 비밀번호 찾기)
     * @return 통합 전화번호 인증 응답
     */
    public UnifiedPhoneVerificationResponse unifiedPhoneVerification(String tel, String purpose) {
        // 1. 전화번호 중복 확인
        boolean isPhoneAvailable = !userRepository.findByTel(tel).isPresent();
        
        if (!isPhoneAvailable) {
            // 전화번호가 이미 사용 중인 경우
            if ("JOIN".equals(purpose)) {
                return new UnifiedPhoneVerificationResponse(
                    false, false, 
                    "이미 사용 중인 전화번호입니다.", tel
                );
            } else if ("PASSWORD_FIND".equals(purpose)) {
                // 비밀번호 찾기의 경우 전화번호가 존재해야 함
                isPhoneAvailable = true;
            }
        }
        
        // 2. SMS 인증번호 발송
        try {
            verificationService.sendVerificationCode(tel);
            return new UnifiedPhoneVerificationResponse(
                isPhoneAvailable, true,
                isPhoneAvailable ? 
                    "전화번호 사용 가능하며 인증번호가 발송되었습니다." :
                    "인증번호가 발송되었습니다. (비밀번호 찾기용)",
                tel
            );
        } catch (Exception e) {
            return new UnifiedPhoneVerificationResponse(
                isPhoneAvailable, false,
                "인증번호 발송에 실패했습니다: " + e.getMessage(), tel
            );
        }
    }
    
    /**
     * 현재 로그인한 사용자의 마이페이지 정보를 조회
     * 
     * @param userId 사용자 ID
     * @return 마이페이지 응답 DTO
     * @throws IllegalArgumentException 사용자를 찾을 수 없는 경우
     */
    public MyPageResponse getMyPageInfo(String userId) {
        System.out.println("마이페이지 정보 조회 시작: userId=" + userId);
        
        // 사용자 정보와 관심분야를 함께 조회
        User user = userRepository.findByIdWithInterests(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다: " + userId));
        
        // 사용자 점수 조회
        UserScore userScore = userScoreRepository.findByUserId(userId)
                .orElse(new UserScore()); // 점수가 없으면 빈 객체로 설정
        
        // 관심분야 목록 추출
        List<String> interests = user.getUserInterests().stream()
                .map(userInterest -> userInterest.getInterest().getInterestName())
                .collect(Collectors.toList());
        
        // 마이페이지 응답 생성
        MyPageResponse response = MyPageResponse.builder()
                .nick(user.getNick())
                .gitUrl(user.getGitUrl())
                .userScore(userScore.getUserScore() != null ? userScore.getUserScore() : 0)
                .interests(interests)
                .userRefer(user.getUserRefer())
                .build();
        
        System.out.println("마이페이지 정보 조회 완료: userId=" + userId + ", nick=" + user.getNick() + ", score=" + (userScore.getUserScore() != null ? userScore.getUserScore() : 0) + ", interests=" + interests);
        
        return response;
    }
    
    /**
     * 현재 로그인한 사용자의 스터디/프로젝트 목록을 조회
     * 
     * @param userId 사용자 ID
     * @param status 필터링할 상태 (ALL, RECRUITING, COMPLETE, END)
     * @return 스터디/프로젝트 목록 응답 DTO 리스트
     */
    public List<StudyProjectListResponse> getStudyProjectList(String userId, String status) {
        System.out.println("스터디/프로젝트 목록 조회 시작: userId=" + userId + ", status=" + status);
        
        List<StudyProject> studyProjects;
        
        // 상태에 따른 필터링
        switch (status.toUpperCase()) {
            case "RECRUITING":
                studyProjects = studyProjectRepository.findStudyProjectsByUserIdAndRecruitingStatus(
                    userId, StudyProject.RecruitingStatus.recruitment);
                break;
            case "COMPLETE":
                studyProjects = studyProjectRepository.findStudyProjectsByUserIdAndRecruitingStatus(
                    userId, StudyProject.RecruitingStatus.complete);
                break;
            case "END":
                studyProjects = studyProjectRepository.findStudyProjectsByUserIdAndRecruitingStatus(
                    userId, StudyProject.RecruitingStatus.end);
                break;
            case "ALL":
            default:
                studyProjects = studyProjectRepository.findStudyProjectsByUserId(userId);
                break;
        }
        
        // DTO로 변환
        List<StudyProjectListResponse> responseList = studyProjects.stream()
                .map(sp -> StudyProjectListResponse.builder()
                        .studyProjectId(sp.getStudyProjectId())
                        .studyProjectName(sp.getStudyProjectName())
                        .studyProjectTitle(sp.getStudyProjectTitle())
                        .studyProjectDesc(sp.getStudyProjectDesc())
                        .typeCheck(sp.getTypeCheck().name())
                        .userId(sp.getUserId())
                        .isRecruiting(sp.getIsRecruiting().name())
                        .studyProjectStart(sp.getStudyProjectStart())
                        .studyProjectEnd(sp.getStudyProjectEnd())
                        .studyProjectTotal(sp.getStudyProjectTotal())
                        .soltStart(sp.getSoltStart() != null ? sp.getSoltStart().toString() : null)
                        .soltEnd(sp.getSoltEnd() != null ? sp.getSoltEnd().toString() : null)
                        .build())
                .collect(Collectors.toList());
        
        System.out.println("스터디/프로젝트 목록 조회 완료: userId=" + userId + ", count=" + responseList.size());
        
        return responseList;
    }
    
    /**
     * 현재 로그인한 사용자의 회원 정보 수정 페이지에 필요한 기본 정보를 조회
     * 
     * @param userId 사용자 ID
     * @return 이름, 아이디, 전화번호, 닉네임을 포함한 Map
     * @throws IllegalArgumentException 사용자를 찾을 수 없는 경우
     */
    public Map<String, String> getUpdatePageInfo(String userId) {
        System.out.println("회원 정보 수정 페이지 데이터 조회 시작: userId=" + userId);
        
        // 사용자 정보 조회
        User user = userRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다: " + userId));
        
        // 필요한 정보만 포함하여 Map 생성 (닉네임 추가)
        Map<String, String> updatePageInfo = Map.of(
            "name", user.getName(),
            "userId", user.getUserId(),
            "tel", user.getTel(),
            "nick", user.getNick()
        );
        
        System.out.println("회원 정보 수정 페이지 데이터 조회 완료: userId=" + userId + 
                          ", name=" + user.getName() + ", tel=" + user.getTel() + ", nick=" + user.getNick());
        
        return updatePageInfo;
    }
    
    /**
     * 사용자 알람 설정 변경
     * 
     * @param userId 사용자 ID
     * @param alarmType 새로운 알람 설정 (true: ON, false: OFF)
     * @return 업데이트된 사용자 정보
     * @throws IllegalArgumentException 사용자를 찾을 수 없는 경우
     */
    @Transactional
    public User updateUserAlarmSetting(String userId, boolean alarmType) {
        System.out.println("사용자 알람 설정 변경 시작: userId=" + userId + ", alarmType=" + alarmType);
        
        // 사용자 정보 조회
        User user = userRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다: " + userId));
        
        // 기존 알람 설정과 다른 경우에만 처리
        if (user.isAlarmType() != alarmType) {
            // 알람 설정 변경
            user.setAlarmType(alarmType);
            User updatedUser = userRepository.save(user);
            
            // 알람을 켠 경우, 해당 사용자의 스케줄 재활성화
            if (alarmType) {
                scheduleNotificationService.reactivateUserSchedules(userId);
                System.out.println("사용자 알람 설정 변경 완료: userId=" + userId + ", alarmType=" + alarmType + ", 스케줄 재활성화 완료");
            } else {
                System.out.println("사용자 알람 설정 변경 완료: userId=" + userId + ", alarmType=" + alarmType);
            }
            
            return updatedUser;
        } else {
            System.out.println("알람 설정이 동일하여 변경하지 않음: userId=" + userId + ", alarmType=" + alarmType);
            return user;
        }
    }

    /**
     * [추가] 사용자 Git 정보 수정 메서드
     * @param currentUserId 현재 사용자 아이디
     * @param request Git 정보 수정 요청
     * @return 수정된 사용자 정보
     */
    @Transactional
    public User updateUserGitInfo(String currentUserId, com.smhrd.graddy.user.dto.UserGitInfoUpdateRequest request) {
        // 기존 사용자 조회
        User user = userRepository.findByUserId(currentUserId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
        
        // 수정할 내용이 있는지 확인
        if (!request.hasNewGitUrl() && !request.hasNewUserRefer()) {
            throw new IllegalArgumentException("수정할 내용이 없습니다.");
        }
        
        // Git URL 수정
        if (request.hasNewGitUrl()) {
            user.setGitUrl(request.getGitUrl());
        }
        
        // 추천인 정보 수정
        if (request.hasNewUserRefer()) {
            user.setUserRefer(request.getUserRefer());
        }
        
        // 수정된 사용자 정보 저장
        return userRepository.save(user);
    }
}