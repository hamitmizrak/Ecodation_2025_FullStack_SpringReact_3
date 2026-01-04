package com.hamitmizrak.business.dto;


import com.hamitmizrak.audit.AuditingAwareBaseDto;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.extern.log4j.Log4j2;

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
// BlogCategoryDto(1) - BlogDto(N)
public class BlogDto extends AuditingAwareBaseDto implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    // Field

    // ID
    private Long blogId;

    // HEADER
    @NotEmpty(message = "{blog.header.unique.validation.constraints.NotNull.message}")
    @Size(min = 3, message = "{blog.header.least.validation.constraints.NotNull.message}")
    private String header;

    // TITLE
    @NotEmpty(message = "{blog.title.validation.constraints.NotNull.message}")
    private String title;

    // CONTENT
    @NotEmpty(message = "{blog.content.validation.constraints.NotNull.message}")
    private String content;

    // IMAGE
    @Builder.Default
    private String image="resim.png";

    private Date systemCreatedDate;

    /// ///////////////////////////////////////////////////////////////////////////////////
    // RELATION (COMPOSITON)
    // Blog(N) - BlogCategory(1)
    private BlogCategoryDto blogCategoryDto;

} //end BlogDto
