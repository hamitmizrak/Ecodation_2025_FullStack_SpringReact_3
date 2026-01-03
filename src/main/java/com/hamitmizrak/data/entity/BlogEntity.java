package com.hamitmizrak.data.entity;

import com.hamitmizrak.audit.AuditingAwareBaseEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.extern.log4j.Log4j2;
import org.hibernate.annotations.CreationTimestamp;

import java.io.Serializable;
import java.util.Date;

// LOMBOK
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Log4j2

@Entity
@Table(name="blog")
//Blog(N) - BlogCategory(1)
public class BlogEntity extends AuditingAwareBaseEntity implements Serializable {

    private static final long serialVersionUID = 1L;

    // Field
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long blogId;


    @Column(nullable = false, unique = true,length = 400,name = "header")
    private String header;

    private String title;

    @Column(nullable = false)
    private String content;

    private String image;

    @CreationTimestamp
    @Temporal(TemporalType.TIMESTAMP)
    private Date systemCreatedDate;

    /// ///////////////////////////////////////////////////////////////////////////////////
    // RELATION
    // Blog(N) - BlogCategory(1)
    @ManyToOne(fetch = FetchType.EAGER,optional = false)
    @JoinColumn(name="category_id",nullable = false)
    private BlogCategoryEntity blogCategoryEntity;
}


