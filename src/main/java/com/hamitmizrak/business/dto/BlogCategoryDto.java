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
public class BlogCategoryDto extends AuditingAwareBaseDto implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    // Field

    // ID
    private Long categoryId;

    // CATEGORY NAME
    @NotEmpty(message = "{blog.category.unique.validation.constraints.NotNull.message}")
    @Size(min = 3, message = "{blog.category.least.validation.constraints.NotNull.message}")
    private String categoryName;

    // SYSYEM DATE
    private Date systemCreatedDate;

} //end BlogCategoryDto
