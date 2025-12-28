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
public class BlogCategoryDto extends AuditingAwareBaseDto implements Serializable {

    private static final long serialVersionUID = 1L;

    // Field
    private Long categoryId;

    @NotEmpty(message = "{blog.category.unique.validation.constraints.NotNull.message}")
    @Size(min = 3, message = "{blog.category.least.validation.constraints.NotNull.message}")
    private String categoryName;


    private Date systemCreatedDate;

}
