package com.hamitmizrak.data.entity;

import com.hamitmizrak.audit.AuditingAwareBaseEntity;
import jakarta.persistence.*;
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

// DATA
@Entity
@Table(name="blog_categories")
public class BlogCategoryEntity  extends AuditingAwareBaseEntity implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    // Field

    // ID
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long categoryId;


    // CATEGORY NAME
    @Column(nullable = false, unique = true,length = 200,name = "category_name")
    private String categoryName;

    // SYSTEM DATE
    @CreationTimestamp
    @Temporal(TemporalType.TIMESTAMP)
    private Date systemCreatedDate;
} // end BlogCategoryEntity
