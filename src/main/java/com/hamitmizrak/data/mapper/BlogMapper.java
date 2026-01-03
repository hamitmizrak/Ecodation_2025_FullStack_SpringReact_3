package com.hamitmizrak.data.mapper;

import com.hamitmizrak.business.dto.BlogCategoryDto;
import com.hamitmizrak.data.entity.BlogCategoryEntity;
import lombok.experimental.UtilityClass;

@UtilityClass
public class BlogMapper {


    // Entity ==> DTO
    public BlogCategoryDto toDto(BlogCategoryEntity e) {
        // Entity boşsa
        if (e == null) return null;

        return BlogCategoryDto.builder()
                .categoryId(e.getCategoryId())
                .categoryName(e.getCategoryName())
                .systemCreatedDate(e.getSystemCreatedDate())
                .build();
    }


    // Entity ==> DTO
    public BlogCategoryEntity toEntiy(BlogCategoryDto d) {
        // Dto boşsa
        if (d == null) return null;

        return BlogCategoryEntity.builder()
                .categoryId(d.getCategoryId())
                .categoryName(d.getCategoryName())
                .systemCreatedDate(d.getSystemCreatedDate())
                .build();
    }

}
