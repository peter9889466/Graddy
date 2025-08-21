package com.smhrd.graddy.user.entity;

import com.smhrd.graddy.interest.entity.Interest;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;

@Entity
@Table(name = "user_interest")
@Getter
@Setter
@NoArgsConstructor
public class UserInterest implements Serializable {

    @EmbeddedId
    private UserInterestId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("userId")
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("interestId")
    @JoinColumn(name = "interest_id")
    private Interest interest;

    @Column(name = "interest_level", nullable = false)
    private int interestLevel;

    @Embeddable
    @Getter
    @Setter
    @NoArgsConstructor
    public static class UserInterestId implements Serializable {
        private String userId;
        private Long interestId;
        
        public UserInterestId(String userId, Long interestId) {
            this.userId = userId;
            this.interestId = interestId;
        }
    }
}
