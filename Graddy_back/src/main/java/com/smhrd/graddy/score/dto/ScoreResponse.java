package com.smhrd.graddy.score.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ScoreResponse {
    
    @Schema(description = "점수 ID", example = "1")
    private Long scoreId;
    
    @Schema(description = "사용자 ID", example = "user123")
    private String userId;
    
    @Schema(description = "사용자 종합 점수", example = "1000")
    private Integer userScore;
    
    @Schema(description = "사용자 랭킹", example = "5")
    private Long rank;
    
    @Schema(description = "전체 사용자 수", example = "100")
    private Long totalUsers;
    
    @Schema(description = "마지막 갱신 시각")
    private LocalDateTime lastUpdated;
}
