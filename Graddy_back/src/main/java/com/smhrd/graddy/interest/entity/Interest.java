package com.smhrd.graddy.interest.entity;

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
public class Interest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "interest_id")
    private Long interestId;

    @Column(name = "interest_division", nullable = false)
    private Integer interestDivision;

    @Column(name = "interest_name", length = 50, nullable = false)
    private String interestName;
}
