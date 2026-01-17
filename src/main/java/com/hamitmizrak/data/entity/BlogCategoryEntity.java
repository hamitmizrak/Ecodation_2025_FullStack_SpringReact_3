package com.hamitmizrak.data.entity;

import com.hamitmizrak.audit.AuditingAwareBaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.extern.log4j.Log4j2;
import org.hibernate.annotations.CreationTimestamp;

import java.util.Date;
import java.util.List;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
@Log4j2
@Entity
@Table(name = "blog_categories")
public class BlogCategoryEntity extends AuditingAwareBaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long categoryId;

    @Column(nullable = false, unique = true, length = 150)
    private String categoryName;

    @CreationTimestamp
    @Temporal(TemporalType.TIMESTAMP)
    private Date systemCreatedDate;

    // BlogCategory(1) - Blog(N)
    // BlogEntity içindeki alan adı "blogCategoryBlogEntity" olduğu için mappedBy aynı tutuldu
    @OneToMany(mappedBy = "blogCategoryBlogEntity", fetch = FetchType.LAZY,
            cascade = CascadeType.ALL, orphanRemoval = false)
    private List<BlogEntity> blogCategoryBlogEntityList;
}
