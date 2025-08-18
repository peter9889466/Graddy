package com.smhrd.graddy.user.service;


import com.smhrd.graddy.user.dto.JoinRequest;
import com.smhrd.graddy.user.entity.User;
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
    private final PasswordEncoder passwordEncoder;

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

        // 역할은 User엔티티의 기본값 사용됨

        // 3. UserRepository를 통해 DB에 저장
        return userRepository.save(newUser);
    }
}