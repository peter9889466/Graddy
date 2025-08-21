package com.smhrd.graddy.user.repository;

import com.smhrd.graddy.user.entity.Days;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DaysRepository extends JpaRepository<Days, Integer> {
}
