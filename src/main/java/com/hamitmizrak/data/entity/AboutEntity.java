package com.hamitmizrak.data.entity;

import com.hamitmizrak.audit.AuditingAwareBaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.extern.log4j.Log4j2;
import org.hibernate.annotations.CreationTimestamp;

import java.io.Serializable;
import java.util.Date;

// LOMBOK
//@Data
@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Log4j2

// ENTITY
@Entity(name = "Abouts") // Sql JOIN için yazdım
@Table(name = "about")

// About (1) - Admin(1)
public class AboutEntity extends AuditingAwareBaseEntity implements Serializable {

    // SERILEŞTIRME
    public static final Long serialVersionUID = 1L;

    // ID
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "about_id", unique = true, nullable = false, insertable = true, updatable = false)
    private Long aboutId;


    // Hakkımızda
    @Column(
            name = "about",
            nullable = false,
            unique = true,
            length = 1500,
            insertable = true,
            updatable = true,
            columnDefinition = "varchar(1500) default 'about için başlık girilmedi'")
    private String aboutName;

    // Vizyon
    @Column(
            name = "vision",
            nullable = false,
            unique = true,
            length = 1500,
            insertable = true,
            updatable = true,
            columnDefinition = "varchar(1500) default 'vision için başlık girilmedi'")
    private String vision;

    // Misyon
    @Column(
            name = "mission",
            nullable = false,
            unique = true,
            length = 1500,
            insertable = true,
            updatable = true,
            columnDefinition = "varchar(1500) default 'mission için başlık girilmedi'")
    private String mission;

    // IMAGE
    @Column(length = 512)
    private String imageUrl;

   /*
   Javada olsun Database(Entity) olmasının
   @Transient
    private Object specialData;
    */

    // DATE
    @CreationTimestamp
    @Temporal(TemporalType.TIMESTAMP)
    private Date systemCreatedDate;

    //  RELATION


} //end class
