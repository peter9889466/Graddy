package com.smhrd.graddy.study.repository;

import com.smhrd.graddy.study.entity.Day;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DayRepository extends JpaRepository<Day, Byte> {

    // 요일명으로 조회
    Day findByDayName(String dayName);
    
    // 모든 요일을 ID 순으로 정렬하여 조회
    List<Day> findAllByOrderByDayId();
}
