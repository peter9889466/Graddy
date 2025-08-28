package com.smhrd.graddy.user.repository;

import com.smhrd.graddy.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

// JpaRepository<엔티티 클래스, PK의 타입>
@Repository
public interface UserRepository extends JpaRepository<User, String> {
    // 사용자 ID(user_id)로 사용자를 찾는 메소드
    Optional<User> findByUserId(String userId);
    
    // 닉네임으로 사용자를 찾는 메소드
    Optional<User> findByNick(String nick);
    
    // 이름과 전화번호로 사용자를 찾는 메소드
    Optional<User> findByNameAndTel(String name, String tel);
    
    // 전화번호로 사용자를 찾는 메소드
    Optional<User> findByTel(String tel);
    
    /**
     * 사용자 ID로 사용자 정보와 관심분야를 함께 조회
     * 
     * @param userId 사용자 ID
     * @return 사용자 정보 (Optional)
     */
    @Query("SELECT DISTINCT u FROM User u " +
           "LEFT JOIN FETCH u.userInterests ui " +
           "LEFT JOIN FETCH ui.interest " +
           "WHERE u.userId = :userId")
    Optional<User> findByIdWithInterests(@Param("userId") String userId);
}