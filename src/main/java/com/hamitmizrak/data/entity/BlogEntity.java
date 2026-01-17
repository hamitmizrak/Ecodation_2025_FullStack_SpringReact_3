package com.hamitmizrak.data.entity;

import com.hamitmizrak.audit.AuditingAwareBaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.extern.log4j.Log4j2;
import org.hibernate.annotations.CreationTimestamp;

import java.util.Date;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
@Log4j2
@Entity
@Table(name = "blogs")
public class BlogEntity extends AuditingAwareBaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long blogId;

    @Column(nullable = false, length = 150)
    private String header;

    @Column(nullable = false, length = 200)
    private String title;

    @Lob
    @Column(nullable = false)
    private String content;

    /** About ile paralel tutmak için isim 'image' (imageUrl değil). Relative URL: /upload/blog/... */
    @Column(nullable = false, length = 300)
    private String image;

    @CreationTimestamp
    @Temporal(TemporalType.TIMESTAMP)
    private Date systemCreatedDate;

    // Blog(N)  - BlogCategory(1)
    // Projendeki isimlendirme ile uyumlu alan adı:
    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "category_id", nullable = false)
    private BlogCategoryEntity blogCategoryBlogEntity;
}
