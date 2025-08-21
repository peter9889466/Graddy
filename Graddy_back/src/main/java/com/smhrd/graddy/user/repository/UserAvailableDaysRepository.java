package com.smhrd.graddy.user.repository;

import com.smhrd.graddy.user.entity.UserAvailableDays;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserAvailableDaysRepository extends JpaRepository<UserAvailableDays, UserAvailableDays.UserAvailableDaysId> {
}
