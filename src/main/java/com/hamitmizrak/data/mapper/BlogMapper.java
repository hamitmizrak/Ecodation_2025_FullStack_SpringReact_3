package com.hamitmizrak.data.mapper;

import com.hamitmizrak.business.dto.BlogDto;
import com.hamitmizrak.data.entity.BlogEntity;
import lombok.experimental.UtilityClass;

@UtilityClass
public class BlogMapper {

    public BlogDto toDto(BlogEntity e) {
        if (e == null) return null;
        return BlogDto.builder()
                .blogId(e.getBlogId())
                .header(e.getHeader())
                .title(e.getTitle())
                .content(e.getContent())
                .image(e.getImage())
                .systemCreatedDate(e.getSystemCreatedDate())
                .blogCategoryDto(BlogCategoryMapper.toDto(e.getBlogCategoryBlogEntity()))
                .build();
    }

    public BlogEntity toEntity(BlogDto d) {
        if (d == null) return null;
        return BlogEntity.builder()
                .blogId(d.getBlogId())
                .header(d.getHeader())
                .title(d.getTitle())
                .content(d.getContent())
                .image(d.getImage())
                .build();
    }
}
