package com.smhrd.graddy.interest.controller;

import com.smhrd.graddy.api.dto.ApiResponse;
import com.smhrd.graddy.interest.entity.Interest;
import com.smhrd.graddy.interest.service.InterestService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/interests")
// @CrossOrigin(origins = "*")
@Tag(name = "관심 항목 관리", description = "관심 항목 조회 및 관리 API")
public class InterestController {

    @Autowired
    private InterestService interestService;

    // 전체 관심 항목 조회
    @GetMapping
    @Operation(summary = "전체 관심 항목 조회", description = "모든 관심 항목을 조회합니다.")
    public ResponseEntity<ApiResponse<List<Interest>>> getAllInterests() {
        List<Interest> interests = interestService.getAllInterests();
        return ApiResponse.success("전체 관심 항목 조회 성공", interests);
    }

//    // 관심 항목 분류별 조회
//    @GetMapping("/division/{division}")
//    @Operation(summary = "분류별 관심 항목 조회", description = "특정 분류에 속한 관심 항목들을 조회합니다.")
//    public ResponseEntity<ApiResponse<List<Interest>>> getInterestsByDivision(@PathVariable Integer division) {
//        List<Interest> interests = interestService.getInterestsByDivision(division);
//        return ApiResponse.success("분류별 관심 항목 조회 성공", interests);
//    }
//
//    // 특정 관심 항목 ID로 조회
//    @GetMapping("/{interestId}")
//    @Operation(summary = "특정 관심 항목 조회", description = "관심 항목 ID로 특정 관심 항목을 조회합니다.")
//    public ResponseEntity<ApiResponse<Interest>> getInterestById(@PathVariable Long interestId) {
//        Interest interest = interestService.getInterestById(interestId);
//        return ApiResponse.success("관심 항목 조회 성공", interest);
//    }
}
