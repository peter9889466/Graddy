package com.smhrd.graddy.tag.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Entity
@Table(name = "tag")
@Getter
@Setter
@NoArgsConstructor
@ToString
public class Tag {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "tag_id")
    private Long tagId;

    @Column(name = "study_id", length = 50, nullable = false)
    private String studyId;

    @Column(name = "tag_name", length = 50, nullable = false)
    private String tagName;
}
