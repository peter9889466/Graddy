package com.smhrd.graddy.user.repository;

import com.smhrd.graddy.user.entity.UserInterest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserInterestRepository extends JpaRepository<UserInterest, UserInterest.UserInterestId> {
}
