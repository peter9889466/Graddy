package com.smhrd.graddy.study.entity;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Entity
@Table(name = "days")
@Getter
@Setter
@NoArgsConstructor
@ToString
@Schema(description = "요일 정보")
public class Day {

    @Id
    @Column(name = "day_id")
    @Schema(description = "요일 ID", example = "1")
    private Byte dayId;

    @Column(name = "day_name", length = 10, nullable = false)
    @Schema(description = "요일 이름", example = "월요일")
    private String dayName;
}
