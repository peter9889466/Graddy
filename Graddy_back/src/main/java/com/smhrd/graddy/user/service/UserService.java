package com.smhrd.graddy.user.service;


import com.smhrd.graddy.user.dto.JoinRequest;
import com.smhrd.graddy.user.dto.UserInterestRequest;
import com.smhrd.graddy.user.dto.UserProfileUpdateRequest;
import com.smhrd.graddy.user.dto.UserWithdrawalRequest;
import com.smhrd.graddy.user.entity.User;
import com.smhrd.graddy.user.entity.UserInterest;
import com.smhrd.graddy.user.entity.UserAvailableDays;
import com.smhrd.graddy.user.entity.Days;
import com.smhrd.graddy.interest.entity.Interest;
import com.smhrd.graddy.user.repository.UserInterestRepository;
import com.smhrd.graddy.user.repository.UserRepository;
import com.smhrd.graddy.user.repository.UserAvailableDaysRepository;
import com.smhrd.graddy.user.repository.DaysRepository;
import com.smhrd.graddy.interest.repository.InterestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.ArrayList;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserService {

    private final UserRepository userRepository;
    private final UserInterestRepository userInterestRepository;
    private final UserAvailableDaysRepository userAvailableDaysRepository;
    private final InterestRepository interestRepository;
    private final PasswordEncoder passwordEncoder;
    private final DaysRepository daysRepository;

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
}