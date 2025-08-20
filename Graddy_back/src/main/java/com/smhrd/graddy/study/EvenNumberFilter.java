package com.smhrd.graddy.study;

import java.util.List;
import java.util.stream.Collectors;

public class EvenNumberFilter {
    public List<Integer> getEvenNumbers(List<Integer> numbers) {
        return numbers.stream()
                .filter(n -> n % 2 == 0)
                .collect(Collectors.toList());
    }
    public static void main(String[] args) {
        EvenNumberFilter filter = new EvenNumberFilter();
        System.out.println(filter.getEvenNumbers(List.of(1, 2, 3, 4, 5, 6)));
        // 출력 예상: [2, 4, 6]
    }
}

// 실행 예시 (메인 메서드에서 수동 확인)
