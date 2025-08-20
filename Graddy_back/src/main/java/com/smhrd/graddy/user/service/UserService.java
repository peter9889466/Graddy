package com.smhrd.graddy.user.service;


import com.smhrd.graddy.user.dto.JoinRequest;
import com.smhrd.graddy.user.dto.UserInterestRequest;
import com.smhrd.graddy.user.entity.User;
import com.smhrd.graddy.user.entity.UserInterest;
import com.smhrd.graddy.user.repository.UserInterestRepository;
import com.smhrd.graddy.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserService {

    private final UserRepository userRepository;
    private final UserInterestRepository userInterestRepository;
    private final PasswordEncoder passwordEncoder;

    /**
     * [추가] 사용자 아이디 중복 확인 메서드
     * @param userId 확인할 사용자 아이디
     * @return 사용 가능하면 true, 중복이면 false
     */
    public boolean isUserIdAvailable(String userId) {
        // userRepository.findByUserId() 결과가 비어있으면(isPresent()가 false) 사용 가능한 아이디
        return !userRepository.findByUserId(userId).isPresent();
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
                UserInterest userInterest = new UserInterest();
                userInterest.setUser(savedUser); // 위에서 저장된 User 엔티티를 연결
                userInterest.setInterestId(userInterestRequest.getInterestId());
                userInterest.setInterstName(userInterestRequest.getInterestName());
                userInterest.setInterestLevel(userInterestRequest.getInterestLevel());

                // user_interest 테이블에 저장
                userInterestRepository.save(userInterest);
            }
        }
        return savedUser; // 저장된 User 정보를 컨트롤러로 반환
    }
}