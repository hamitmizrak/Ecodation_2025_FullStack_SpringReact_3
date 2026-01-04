package com.hamitmizrak.data.entity;

import com.hamitmizrak.audit.AuditingAwareBaseEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.extern.log4j.Log4j2;
import org.hibernate.annotations.CreationTimestamp;

import java.io.Serial;
import java.io.Serializable;
import java.util.Date;

// LOMBOK
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Log4j2

//DATAS
@Entity
@Table(name="blogs")
//Blog(N) - BlogCategory(1)
public class BlogEntity extends AuditingAwareBaseEntity implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    // Field

    // ID
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long blogId;

    // HEADER
    @Column(nullable = false, unique = true,length = 400,name = "header")
    private String header;

    // TITLE
    private String title;

    // CONTENT
    @Column(nullable = false)
    private String content;

    // IMAGE
    private String image;

    // SYSTEM DATE
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


