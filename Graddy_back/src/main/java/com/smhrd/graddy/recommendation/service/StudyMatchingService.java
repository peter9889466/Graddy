package com.smhrd.graddy.recommendation.service;

import com.smhrd.graddy.recommendation.dto.StudyRecommendationDto;
import com.smhrd.graddy.study.entity.StudyProject;
import com.smhrd.graddy.member.entity.Member;
import com.smhrd.graddy.study.repository.StudyProjectRepository;
import com.smhrd.graddy.member.repository.MemberRepository;
import com.smhrd.graddy.tag.entity.Tag;
import com.smhrd.graddy.tag.repository.TagRepository;
import com.smhrd.graddy.user.entity.User;
import com.smhrd.graddy.user.entity.UserInterest;
import com.smhrd.graddy.user.repository.UserRepository;
import com.smhrd.graddy.user.repository.UserAvailableDaysRepository;
import com.smhrd.graddy.user.repository.UserInterestRepository;
import com.smhrd.graddy.study.repository.StudyProjectAvailableDayRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 스터디 매칭 추천 서비스
 * 하이브리드 추천 알고리즘을 구현하여 사용자에게 최적의 스터디/프로젝트를 추천
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class StudyMatchingService {
    
    // 가중치 상수 정의
    private static final double CONTENT_BASED_WEIGHT = 0.7;
    private static final double COLLABORATIVE_WEIGHT = 0.3;
    
    // 콘텐츠 기반 필터링 가중치
    private static final double INTEREST_MATCH_WEIGHT = 0.35;
    private static final double LEVEL_MATCH_WEIGHT = 0.25;
    private static final double DAY_MATCH_WEIGHT = 0.2;
    private static final double TIME_MATCH_WEIGHT = 0.2;

    private final UserRepository userRepository;
    private final StudyProjectRepository studyProjectRepository;
    private final MemberRepository memberRepository;
    private final TagRepository tagRepository;
    private final UserAvailableDaysRepository userAvailableDaysRepository;
    private final StudyProjectAvailableDayRepository studyProjectAvailableDayRepository;
    private final UserInterestRepository userInterestRepository;
    
    /**
     * 사용자에게 스터디 추천 (프로젝트 제외)
     * @param userId 사용자 ID
     * @param limit 추천 개수 제한
     * @return 추천된 스터디 목록
     */
    @Transactional(readOnly = true)
    public List<StudyRecommendationDto> recommendStudies(String userId, int limit) {
        log.info("사용자 {}에게 스터디 추천 시작", userId);
        
        try {
            // 1. 사용자 정보 조회 (트랜잭션 내에서)
            User user = userRepository.findByUserId(userId)
                    .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다: " + userId));
            
            // 2. 추천 가능한 스터디 조회 (모집 중이고 참여하지 않은 스터디만, 프로젝트 제외)
            List<StudyProject> availableStudies = studyProjectRepository.findAvailableStudiesForUser(userId);
            
            if (availableStudies.isEmpty()) {
                log.info("사용자 {}에게 추천할 수 있는 스터디가 없습니다", userId);
                return new ArrayList<>();
            }
            
            // 3. 각 스터디에 대해 추천 점수 계산
            List<StudyRecommendationDto> recommendations = availableStudies.stream()
                    .map(study -> calculateRecommendationScore(user, study))
                    .sorted((a, b) -> Double.compare(b.getFinalScore(), a.getFinalScore()))
                    .limit(limit)
                    .collect(Collectors.toList());
            
            log.info("사용자 {}에게 {}개의 스터디를 추천했습니다", userId, recommendations.size());
            return recommendations;
            
        } catch (Exception e) {
            log.error("스터디 추천 중 오류 발생: {}", e.getMessage(), e);
            throw new RuntimeException("스터디 추천 중 오류가 발생했습니다", e);
        }
    }
    
    /**
     * 개별 스터디/프로젝트에 대한 추천 점수 계산
     * @param user 사용자 정보
     * @param study 스터디/프로젝트 정보
     * @return 추천 점수가 포함된 DTO
     */
    private StudyRecommendationDto calculateRecommendationScore(User user, StudyProject study) {
        log.debug("스터디 {}에 대한 추천 점수 계산 시작", study.getStudyProjectId());
        
        // 1. 콘텐츠 기반 점수 계산
        double contentBasedScore = calculateContentBasedScore(user, study);
        
        // 2. 협업 기반 점수 계산
        double collaborativeScore = calculateCollaborativeScore(user, study);
        
        // 3. 최종 점수 계산 (가중 평균)
        double finalScore = (contentBasedScore * CONTENT_BASED_WEIGHT) + (collaborativeScore * COLLABORATIVE_WEIGHT);
        
        // 4. 세부 점수들 계산
        double dayMatchScore = calculateDayMatchScore(user, study);
        double timeMatchScore = calculateTimeMatchScore(user, study);
        double interestMatchScore = calculateInterestMatchScore(user, study);
        double levelMatchScore = calculateLevelMatchScore(user, study);
        
        // 5. 리더 닉네임 조회
        String leaderNickname = getLeaderNickname(study.getUserId());
        
        // 6. DTO 생성 및 반환
        return StudyRecommendationDto.builder()
                .studyProjectId(study.getStudyProjectId())
                .studyProjectName(study.getStudyProjectName())
                .studyProjectTitle(study.getStudyProjectTitle())
                .studyProjectDesc(study.getStudyProjectDesc())
                .studyLevel(study.getStudyLevel())
                .typeCheck(study.getTypeCheck().name())
                .userId(study.getUserId())
                .userNickname(leaderNickname)
                .isRecruiting(study.getIsRecruiting().name())
                .studyProjectStart(timestampToLocalDateTime(study.getStudyProjectStart()))
                .studyProjectEnd(timestampToLocalDateTime(study.getStudyProjectEnd()))
                .studyProjectTotal(study.getStudyProjectTotal())
                .soltStart(timestampToLocalDateTime(study.getSoltStart()))
                .soltEnd(timestampToLocalDateTime(study.getSoltEnd()))
                .createdAt(timestampToLocalDateTime(study.getCreatedAt()))
                .curText(study.getCurText())
                .finalScore(finalScore)
                .contentBasedScore(contentBasedScore)
                .collaborativeScore(collaborativeScore)
                .dayMatchScore(dayMatchScore)
                .timeMatchScore(timeMatchScore)
                .interestMatchScore(interestMatchScore)
                .levelMatchScore(levelMatchScore)
                .tags(getStudyTags(study.getStudyProjectId()))
                .availableDays(getStudyAvailableDays(study.getStudyProjectId()))
                .currentMemberCount(getCurrentMemberCount(study.getStudyProjectId()))
                .build();
    }
    
    /**
     * 콘텐츠 기반 점수 계산
     * @param user 사용자 정보
     * @param study 스터디/프로젝트 정보
     * @return 콘텐츠 기반 점수 (0.0 ~ 1.0)
     */
    private double calculateContentBasedScore(User user, StudyProject study) {
        double dayMatchScore = calculateDayMatchScore(user, study);
        double timeMatchScore = calculateTimeMatchScore(user, study);
        double interestMatchScore = calculateInterestMatchScore(user, study);
        double levelMatchScore = calculateLevelMatchScore(user, study);
        
        // 가중 평균으로 최종 콘텐츠 기반 점수 계산
        double contentBasedScore = (dayMatchScore * DAY_MATCH_WEIGHT) +
                                 (timeMatchScore * TIME_MATCH_WEIGHT) +
                                 (interestMatchScore * INTEREST_MATCH_WEIGHT) +
                                 (levelMatchScore * LEVEL_MATCH_WEIGHT);
        
        log.debug("콘텐츠 기반 점수 계산: 요일({}), 시간({}), 관심사({}), 레벨({}) -> 최종({})",
                dayMatchScore, timeMatchScore, interestMatchScore, levelMatchScore, contentBasedScore);
        
        return contentBasedScore;
    }
    
    /**
     * 요일 일치도 점수 계산
     * @param user 사용자 정보
     * @param study 스터디/프로젝트 정보
     * @return 요일 일치도 점수 (0.0 ~ 1.0)
     */
    private double calculateDayMatchScore(User user, StudyProject study) {
        try {
            // 사용자의 가능 요일 조회
            List<Byte> userDays = userAvailableDaysRepository.findDayIdsByUserId(user.getUserId());
            
            // 스터디의 가능 요일 조회
            List<Byte> studyDays = studyProjectAvailableDayRepository.findDayIdsByStudyProjectId(study.getStudyProjectId());
            
            if (userDays.isEmpty() || studyDays.isEmpty()) {
                return 0.0;
            }
            
            // Jaccard 유사도 계산: |A ∩ B| / |A ∪ B|
            Set<Byte> userDaysSet = new HashSet<>(userDays);
            Set<Byte> studyDaysSet = new HashSet<>(studyDays);
            
            Set<Byte> intersection = new HashSet<>(userDaysSet);
            intersection.retainAll(studyDaysSet);
            
            Set<Byte> union = new HashSet<>(userDaysSet);
            union.addAll(studyDaysSet);
            
            double dayMatchScore = union.isEmpty() ? 0.0 : (double) intersection.size() / union.size();
            
            log.debug("요일 일치도 계산: 사용자 요일={}, 스터디 요일={}, 교집합={}, 합집합={}, 점수={}",
                    userDays, studyDays, intersection.size(), union.size(), dayMatchScore);
            
            return dayMatchScore;
            
        } catch (Exception e) {
            log.warn("요일 일치도 계산 중 오류 발생: {}", e.getMessage());
            return 0.0;
        }
    }
    
    /**
     * 시간 일치도 점수 계산
     * @param user 사용자 정보
     * @param study 스터디/프로젝트 정보
     * @return 시간 일치도 점수 (0.0 ~ 1.0)
     */
    private double calculateTimeMatchScore(User user, StudyProject study) {
        try {
            // 사용자와 스터디의 선호 시간대가 모두 설정되어 있는지 확인
            if (user.getSoltStart() == null || user.getSoltEnd() == null ||
                study.getSoltStart() == null || study.getSoltEnd() == null) {
                return 0.0;
            }
            
            // 시간대 겹침 계산
            LocalDateTime userStart = timestampToLocalDateTime(user.getSoltStart());
            LocalDateTime userEnd = timestampToLocalDateTime(user.getSoltEnd());
            LocalDateTime studyStart = timestampToLocalDateTime(study.getSoltStart());
            LocalDateTime studyEnd = timestampToLocalDateTime(study.getSoltEnd());
            
            // 겹치는 시작 시간과 끝 시간 계산
            LocalDateTime overlapStart = userStart.isAfter(studyStart) ? userStart : studyStart;
            LocalDateTime overlapEnd = userEnd.isBefore(studyEnd) ? userEnd : studyEnd;
            
            // 겹치는 시간이 있는지 확인
            if (overlapStart.isAfter(overlapEnd)) {
                return 0.0;
            }
            
            // 겹치는 시간과 전체 시간 범위 계산
            long overlapMinutes = ChronoUnit.MINUTES.between(overlapStart, overlapEnd);
            long totalUserMinutes = ChronoUnit.MINUTES.between(userStart, userEnd);
            long totalStudyMinutes = ChronoUnit.MINUTES.between(studyStart, studyEnd);
            long totalMinutes = totalUserMinutes + totalStudyMinutes - overlapMinutes;
            
            double timeMatchScore = totalMinutes > 0 ? (double) overlapMinutes / totalMinutes : 0.0;
            
            log.debug("시간 일치도 계산: 겹치는 시간={}분, 전체 시간={}분, 점수={}",
                    overlapMinutes, totalMinutes, timeMatchScore);
            
            return timeMatchScore;
            
        } catch (Exception e) {
            log.warn("시간 일치도 계산 중 오류 발생: {}", e.getMessage());
            return 0.0;
        }
    }
    
    /**
     * 관심사 일치도 점수 계산
     * @param user 사용자 정보
     * @param study 스터디/프로젝트 정보
     * @return 관심사 일치도 점수 (0.0 ~ 1.0)
     */
    private double calculateInterestMatchScore(User user, StudyProject study) {
        try {
            // 사용자의 관심사 조회 - 직접 Repository에서 조회하여 최신 데이터 보장
            List<Long> userInterestIds = new ArrayList<>();
            try {
                // UserInterestRepository에서 직접 조회하여 Lazy Loading 문제 해결
                List<UserInterest> userInterests = userInterestRepository.findByIdUserId(user.getUserId());
                userInterestIds = userInterests.stream()
                        .map(userInterest -> userInterest.getInterest().getInterestId())
                        .collect(Collectors.toList());
                
                log.debug("사용자 {}의 최신 관심사 조회: {}", user.getUserId(), userInterestIds);
            } catch (Exception e) {
                log.warn("사용자 관심사 조회 중 오류 발생: {}", e.getMessage());
                // 오류 발생 시 빈 리스트 사용
                userInterestIds = new ArrayList<>();
            }
            
            // 스터디의 태그 조회
            List<Long> studyTagIds = tagRepository.findInterestIdsByStudyProjectId(study.getStudyProjectId());
            
            if (userInterestIds.isEmpty() || studyTagIds.isEmpty()) {
                return 0.0;
            }
            
            // Jaccard 유사도 계산: |A ∩ B| / |A ∪ B|
            Set<Long> userInterestSet = new HashSet<>(userInterestIds);
            Set<Long> studyTagSet = new HashSet<>(studyTagIds);
            
            Set<Long> intersection = new HashSet<>(userInterestSet);
            intersection.retainAll(studyTagSet);
            
            Set<Long> union = new HashSet<>(userInterestSet);
            union.addAll(studyTagSet);
            
            double interestMatchScore = union.isEmpty() ? 0.0 : (double) intersection.size() / union.size();
            
            log.debug("관심사 일치도 계산: 사용자 관심사={}, 스터디 태그={}, 교집합={}, 합집합={}, 점수={}",
                    userInterestIds, studyTagIds, intersection.size(), union.size(), interestMatchScore);
            
            return interestMatchScore;
            
        } catch (Exception e) {
            log.warn("관심사 일치도 계산 중 오류 발생: {}", e.getMessage());
            return 0.0;
        }
    }
    
    /**
     * 레벨 근접도 점수 계산
     * @param user 사용자 정보
     * @param study 스터디/프로젝트 정보
     * @return 레벨 근접도 점수 (0.0 ~ 1.0)
     */
    private double calculateLevelMatchScore(User user, StudyProject study) {
        try {
            // 스터디 레벨이 설정되지 않은 경우
            if (study.getStudyLevel() == null) {
                return 0.5; // 중간 점수 반환
            }
            
            // 사용자의 관심사별 평균 레벨 계산 - 직접 Repository에서 조회하여 최신 데이터 보장
            List<UserInterest> userInterests = new ArrayList<>();
            try {
                // UserInterestRepository에서 직접 조회하여 Lazy Loading 문제 해결
                userInterests = userInterestRepository.findByIdUserId(user.getUserId());
                log.debug("사용자 {}의 최신 관심사 레벨 조회: {}", user.getUserId(), 
                    userInterests.stream().map(ui -> ui.getInterest().getInterestName() + ":" + ui.getInterestLevel()).collect(Collectors.toList()));
            } catch (Exception e) {
                log.warn("사용자 관심사 조회 중 오류 발생: {}", e.getMessage());
                userInterests = new ArrayList<>();
            }
            
            if (userInterests.isEmpty()) {
                return 0.5; // 관심사가 없는 경우 중간 점수 반환
            }
            
            double averageUserLevel = userInterests.stream()
                    .mapToInt(UserInterest::getInterestLevel)
                    .average()
                    .orElse(0.0);
            
            // 레벨 차이 계산 (1~3 범위)
            double levelDifference = Math.abs(averageUserLevel - study.getStudyLevel());
            
            // 레벨 근접도 점수 계산: 1 - (차이 / 최대 차이)
            // 최대 차이는 2 (1과 3의 차이)
            double levelMatchScore = 1.0 - (levelDifference / 2.0);
            
            // 점수를 0.0 ~ 1.0 범위로 제한
            levelMatchScore = Math.max(0.0, Math.min(1.0, levelMatchScore));
            
            log.debug("레벨 근접도 계산: 사용자 평균 레벨={}, 스터디 레벨={}, 차이={}, 점수={}",
                    averageUserLevel, study.getStudyLevel(), levelDifference, levelMatchScore);
            
            return levelMatchScore;
            
        } catch (Exception e) {
            log.warn("레벨 근접도 계산 중 오류 발생: {}", e.getMessage());
            return 0.5;
        }
    }
    
    /**
     * 협업 기반 점수 계산
     * @param user 사용자 정보
     * @param study 스터디/프로젝트 정보
     * @return 협업 기반 점수 (0.0 ~ 1.0)
     */
    private double calculateCollaborativeScore(User user, StudyProject study) {
        try {
            // 사용자의 스터디 참여 이력 조회
            List<Long> userStudyIds = memberRepository.findStudyProjectIdsByUserId(user.getUserId());
            
            // 콜드 스타트 처리: 참여 이력이 없는 경우
            if (userStudyIds.isEmpty()) {
                log.debug("사용자 {}의 스터디 참여 이력이 없어 협업 기반 점수는 0.0", user.getUserId());
                return 0.0;
            }
            
            // 유사 사용자들 찾기 (Jaccard 유사도 기반)
            Map<String, Double> similarUsers = findSimilarUsers(user.getUserId(), userStudyIds);
            
            if (similarUsers.isEmpty()) {
                return 0.0;
            }
            
            // 유사 사용자들이 해당 스터디에 참여했는지 확인하고 점수 계산
            double collaborativeScore = 0.0;
            double totalSimilarity = 0.0;
            
            for (Map.Entry<String, Double> entry : similarUsers.entrySet()) {
                String similarUserId = entry.getKey();
                double similarity = entry.getValue();
                
                // 유사 사용자가 해당 스터디에 참여했는지 확인
                boolean isParticipating = memberRepository.existsByUserIdAndStudyProjectId(similarUserId, study.getStudyProjectId());
                
                if (isParticipating) {
                    collaborativeScore += similarity;
                }
                totalSimilarity += similarity;
            }
            
            // 최종 점수 계산
            double finalScore = totalSimilarity > 0 ? collaborativeScore / totalSimilarity : 0.0;
            
            log.debug("협업 기반 점수 계산: 유사 사용자 수={}, 참여한 유사 사용자 점수={}, 총 유사도={}, 최종 점수={}",
                    similarUsers.size(), collaborativeScore, totalSimilarity, finalScore);
            
            return finalScore;
            
        } catch (Exception e) {
            log.warn("협업 기반 점수 계산 중 오류 발생: {}", e.getMessage());
            return 0.0;
        }
    }
    
    /**
     * 유사 사용자 찾기 (Jaccard 유사도 기반)
     * @param userId 현재 사용자 ID
     * @param userStudyIds 현재 사용자의 스터디 참여 이력
     * @return 유사 사용자 ID와 유사도 점수 맵
     */
    private Map<String, Double> findSimilarUsers(String userId, List<Long> userStudyIds) {
        try {
            // 모든 사용자의 스터디 참여 이력 조회
            List<Member> allMembers = memberRepository.findAll();
            
            // 사용자별 스터디 참여 이력 정리
            Map<String, Set<Long>> userStudyMap = new HashMap<>();
            for (Member member : allMembers) {
                userStudyMap.computeIfAbsent(member.getUserId(), k -> new HashSet<>())
                           .add(member.getStudyProjectId());
            }
            
            // 현재 사용자와 다른 사용자들 간의 유사도 계산
            Map<String, Double> similarUsers = new HashMap<>();
            Set<Long> currentUserStudies = new HashSet<>(userStudyIds);
            
            for (Map.Entry<String, Set<Long>> entry : userStudyMap.entrySet()) {
                String otherUserId = entry.getKey();
                
                // 자기 자신은 제외
                if (otherUserId.equals(userId)) {
                    continue;
                }
                
                Set<Long> otherUserStudies = entry.getValue();
                
                // Jaccard 유사도 계산
                Set<Long> intersection = new HashSet<>(currentUserStudies);
                intersection.retainAll(otherUserStudies);
                
                Set<Long> union = new HashSet<>(currentUserStudies);
                union.addAll(otherUserStudies);
                
                double similarity = union.isEmpty() ? 0.0 : (double) intersection.size() / union.size();
                
                // 유사도가 0보다 큰 경우만 추가
                if (similarity > 0) {
                    similarUsers.put(otherUserId, similarity);
                }
            }
            
            // 유사도 순으로 정렬하고 상위 10명만 반환
            return similarUsers.entrySet().stream()
                    .sorted(Map.Entry.<String, Double>comparingByValue().reversed())
                    .limit(10)
                    .collect(Collectors.toMap(
                            Map.Entry::getKey,
                            Map.Entry::getValue,
                            (e1, e2) -> e1,
                            LinkedHashMap::new
                    ));
            
        } catch (Exception e) {
            log.warn("유사 사용자 찾기 중 오류 발생: {}", e.getMessage());
            return new HashMap<>();
        }
    }
    
    /**
     * 스터디의 태그 목록 조회
     * @param studyProjectId 스터디/프로젝트 ID
     * @return 태그 이름 목록
     */
    private List<String> getStudyTags(Long studyProjectId) {
        try {
            List<Tag> tags = tagRepository.findByStudyProjectId(studyProjectId);
            return tags.stream()
                    .map(tag -> tag.getInterest().getInterestName())
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.warn("스터디 태그 조회 중 오류 발생: {}", e.getMessage());
            return new ArrayList<>();
        }
    }
    
    /**
     * 스터디의 가능 요일 목록 조회
     * @param studyProjectId 스터디/프로젝트 ID
     * @return 가능 요일 ID 목록
     */
    private List<Byte> getStudyAvailableDays(Long studyProjectId) {
        try {
            return studyProjectAvailableDayRepository.findDayIdsByStudyProjectId(studyProjectId);
        } catch (Exception e) {
            log.warn("스터디 가능 요일 조회 중 오류 발생: {}", e.getMessage());
            return new ArrayList<>();
        }
    }
    
    /**
     * 스터디의 현재 참여 멤버 수 조회
     * @param studyProjectId 스터디/프로젝트 ID
     * @return 현재 참여 멤버 수
     */
    private Long getCurrentMemberCount(Long studyProjectId) {
        try {
            return memberRepository.countByStudyProjectIdAndApproved(studyProjectId);
        } catch (Exception e) {
            log.warn("스터디 멤버 수 조회 중 오류 발생: {}", e.getMessage());
            return 0L;
        }
    }
    
    /**
     * Timestamp를 LocalDateTime으로 변환하는 유틸리티 메서드
     * @param timestamp 변환할 Timestamp
     * @return LocalDateTime 객체, timestamp가 null이면 null 반환
     */
    private LocalDateTime timestampToLocalDateTime(Timestamp timestamp) {
        if (timestamp == null) {
            return null;
        }
        return timestamp.toLocalDateTime();
    }
    
    /**
     * 리더의 닉네임 조회
     * @param userId 리더의 사용자 ID
     * @return 리더의 닉네임, 사용자를 찾을 수 없으면 "알 수 없음" 반환
     */
    private String getLeaderNickname(String userId) {
        try {
            return userRepository.findByUserId(userId)
                    .map(user -> user.getNick() != null ? user.getNick() : "알 수 없음")
                    .orElse("알 수 없음");
        } catch (Exception e) {
            log.warn("리더 닉네임 조회 중 오류 발생 (userId: {}): {}", userId, e.getMessage());
            return "알 수 없음";
        }
    }
} 
