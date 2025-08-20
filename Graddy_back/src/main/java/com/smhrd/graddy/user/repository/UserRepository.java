package com.smhrd.graddy.user.repository;

import com.smhrd.graddy.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

// JpaRepository<엔티티 클래스, PK의 타입>
@Repository
public interface UserRepository extends JpaRepository<User, String> {
    // 사용자 ID(user_id)로 사용자를 찾는 메소드
    Optional<User> findByUserId(String userId);
    
    // 닉네임으로 사용자를 찾는 메소드
    Optional<User> findByNick(String nick);
}