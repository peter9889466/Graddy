package com.smhrd.graddy.user.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "days")
@Getter
@Setter
@NoArgsConstructor
public class Days {
    
    @Id
    @Column(name = "day_id")
    private Integer dayId;
    
    @Column(name = "day_name", length = 10, nullable = false)
    private String dayName;
}
