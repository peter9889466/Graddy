package com.smhrd.graddy.interest.entity;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Entity
@Table(name = "interest")
@Getter
@Setter
@NoArgsConstructor
@ToString
@Schema(description = "관심 항목 정보")
public class Interest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "interest_id")
    @Schema(description = "관심 항목 ID", example = "1")
    private Long interestId;

    @Column(name = "interest_division", nullable = false)
    @Schema(description = "관심 항목 분류", example = "1")
    private Integer interestDivision;

    @Column(name = "interest_name", length = 50, nullable = false)
    @Schema(description = "관심 항목 이름", example = "웹개발")
    private String interestName;
}
