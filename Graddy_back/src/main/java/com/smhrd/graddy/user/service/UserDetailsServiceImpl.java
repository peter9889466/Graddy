package com.smhrd.graddy.user.service;

import com.smhrd.graddy.user.entity.User;
import com.smhrd.graddy.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {


    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String userId) throws UsernameNotFoundException {
        // UserDetailsService의 loadUserByUsername 메소드의 파라미터 이름은 'username'이지만,
        // 실제로는 로그인 폼에서 입력된 ID값이 전달되므로 여기서는 'userId'로 간주합니다.
        User user = userRepository.findByUserId(userId)
                .orElseThrow(() -> new UsernameNotFoundException("사용자를 찾을 수 없습니다: " + userId));
        System.out.println("User : " + user);
        // 조회된 사용자 정보를 바탕으로 UserDetails 객체 생성 후 반환
        return org.springframework.security.core.userdetails.User.builder()
                .username(user.getUserId()) // Spring Security가 인식할 사용자 이름
                .password(user.getPassword()) // DB에 저장된 암호화된 비밀번호
                .roles(user.getRole()) // "USER", "ADMIN" 등
                .build();
    }
}
