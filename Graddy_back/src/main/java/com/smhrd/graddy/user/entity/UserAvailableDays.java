package com.smhrd.graddy.user.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;

@Entity
@Table(name = "user_available_days")
@Getter
@Setter
@NoArgsConstructor
public class UserAvailableDays implements Serializable {
    
    @EmbeddedId
    private UserAvailableDaysId id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("userId")
    @JoinColumn(name = "user_id")
    private User user;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("dayId")
    @JoinColumn(name = "day_id")
    private Days days;
    
    @Embeddable
    @Getter
    @Setter
    @NoArgsConstructor
    public static class UserAvailableDaysId implements Serializable {
        private String userId;
        private Integer dayId;
        
        public UserAvailableDaysId(String userId, Integer dayId) {
            this.userId = userId;
            this.dayId = dayId;
        }
    }
}
