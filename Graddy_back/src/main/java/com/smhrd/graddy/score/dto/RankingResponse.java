package com.smhrd.graddy.score.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RankingResponse {
    
    @Schema(description = "랭킹 목록")
    private List<ScoreResponse> rankings;
    
    @Schema(description = "전체 사용자 수", example = "100")
    private Long totalUsers;
    
    @Schema(description = "조회된 랭킹 수", example = "50")
    private Long rankingCount;
    
    @Schema(description = "조회 기준", example = "TOP 50")
    private String criteria;
}
