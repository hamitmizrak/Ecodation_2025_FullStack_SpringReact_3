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
public class BlogDto extends AuditingAwareBaseDto implements Serializable {

    private static final long serialVersionUID = 1L;

    // Field
    private Long blogId;

    @NotEmpty(message = "{blog.header.unique.validation.constraints.NotNull.message}")
    @Size(min = 3, message = "{blog.header.least.validation.constraints.NotNull.message}")
    private String header;

    @NotEmpty(message = "{blog.title.validation.constraints.NotNull.message}")
    private String title;

    @NotEmpty(message = "{blog.content.validation.constraints.NotNull.message}")
    private String content;

    @Builder.Default
    private String image="resim.png";

    private Date systemCreatedDate;

    /// ///////////////////////////////////////////////////////////////////////////////////
    // RELATION
    // Blog(N) - BlogCategory(1)
    private BlogCategoryDto blogCategoryDto;

}
