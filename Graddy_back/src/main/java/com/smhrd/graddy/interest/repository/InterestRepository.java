package com.smhrd.graddy.interest.repository;

import com.smhrd.graddy.interest.entity.Interest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InterestRepository extends JpaRepository<Interest, Long> {
    
    // 관심사 분류별로 조회
    List<Interest> findByInterestDivisionOrderByInterestName(Integer interestDivision);
    
    // 관심사 이름으로 검색
    List<Interest> findByInterestNameContainingIgnoreCaseOrderByInterestName(String interestName);
    
    // 특정 interest_id 리스트로 조회
    List<Interest> findByInterestIdIn(List<Long> interestIds);
}
