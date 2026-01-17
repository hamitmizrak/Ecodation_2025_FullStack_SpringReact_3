package com.hamitmizrak.data.mapper;

import com.hamitmizrak.business.dto.BlogCategoryDto;
import com.hamitmizrak.data.entity.BlogCategoryEntity;
import lombok.experimental.UtilityClass;

@UtilityClass
public class BlogCategoryMapper {

    public BlogCategoryDto toDto(BlogCategoryEntity e) {
        if (e == null) return null;
        return BlogCategoryDto.builder()
                .categoryId(e.getCategoryId())
                .categoryName(e.getCategoryName())
                .systemCreatedDate(e.getSystemCreatedDate())
                .build();
    }

    public BlogCategoryEntity toEntity(BlogCategoryDto d) {
        if (d == null) return null;
        return BlogCategoryEntity.builder()
                .categoryId(d.getCategoryId())
                .categoryName(d.getCategoryName())
                .build();
    }
}
