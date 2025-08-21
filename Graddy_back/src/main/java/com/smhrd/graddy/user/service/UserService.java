package com.smhrd.graddy.user.service;


import com.smhrd.graddy.user.dto.JoinRequest;
import com.smhrd.graddy.user.dto.UserInterestRequest;
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

import java.util.Optional;

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
}