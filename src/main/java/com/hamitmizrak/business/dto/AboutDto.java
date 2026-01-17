package com.hamitmizrak.business.dto;

import com.hamitmizrak.audit.AuditingAwareBaseDto;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.extern.log4j.Log4j2;

import java.io.Serializable;
import java.util.Date;

// LOMBOK
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Log4j2

public class AboutDto  extends AuditingAwareBaseDto implements Serializable {

    // serileştirme
    public static final Long serialVersionUID=1L;

    // FIELD

    // NOT: ID ayrıca yazdım çünkü relationda sıkıntı olabiliyor.
    // ID
    private Long aboutId;

    // Hakkımızda
    @NotEmpty(message ="{about.aboutName.validation.constraints.NotNull.message}")
    @Size(min=20, message = "{about.aboutName.least.validation.constraints.NotNull.message}")
    private String aboutName;

    // Vizyon
    @NotEmpty(message ="{about.vision.validation.constraints.NotNull.message}")
    @Size(min=10,message = "{about.vision.least.validation.constraints.NotNull.message}")
    private String vision;

    // Misyon
    @NotEmpty(message ="{about.mission.validation.constraints.NotNull.message}")
    @Size(min=10,message = "{about.mission.least.validation.constraints.NotNull.message}")
    private String mission;


    // IMAGE
    //@NotEmpty(message = "{about.pictures.validation.constraints.NotNull.message}")
    @Builder.Default
    private String imageUrl="resim.png";


    // DATE
    @Builder.Default
    private Date systemCreatedDate=new Date(System.currentTimeMillis());

    /// //////////////////////////////////////////////////////////////////
    // Relation

}
