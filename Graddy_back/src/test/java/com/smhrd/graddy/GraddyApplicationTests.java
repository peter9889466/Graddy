package com.smhrd.graddy;

import com.smhrd.graddy.study.EvenNumberFilter;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import static org.junit.jupiter.api.Assertions.*;

import java.util.List;

@SpringBootTest
class GraddyApplicationTests {

	@Test
	void contextLoads() {
	}

    @Test
    void 짝수만_반환한다() {
        EvenNumberFilter filter = new EvenNumberFilter();
        List<Integer> result = filter.getEvenNumbers(List.of(1, 2, 3, 4, 5, 6));

        assertEquals(List.of(2, 4, 6), result);
    }

    @Test
    void 빈리스트_입력시_빈리스트_반환() {
        EvenNumberFilter filter = new EvenNumberFilter();
        List<Integer> result = filter.getEvenNumbers(List.of());

        assertTrue(result.isEmpty());
    }

    @Test
    void null_입력시_예외발생() {
        EvenNumberFilter filter = new EvenNumberFilter();
        assertThrows(IllegalArgumentException.class, () -> filter.getEvenNumbers(null));
    }


}
