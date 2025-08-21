package com.smhrd.graddy.interest.service;

import com.smhrd.graddy.interest.entity.Interest;
import com.smhrd.graddy.interest.repository.InterestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class InterestService {

    @Autowired
    private InterestRepository interestRepository;

    // 전체 관심 항목 조회
    public List<Interest> getAllInterests() {
        return interestRepository.findAll();
    }

    // 관심 항목 분류별 조회
    public List<Interest> getInterestsByDivision(Integer division) {
        return interestRepository.findByInterestDivisionOrderByInterestName(division);
    }

    // 특정 관심 항목 ID로 조회
    public Interest getInterestById(Long interestId) {
        return interestRepository.findById(interestId)
                .orElseThrow(() -> new IllegalArgumentException("관심 항목을 찾을 수 없습니다: " + interestId));
    }

    // 관심 항목명으로 검색
    public List<Interest> searchInterestsByName(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return getAllInterests();
        }
        return interestRepository.findByInterestNameContainingIgnoreCaseOrderByInterestName(keyword);
    }
}
