package com.hamitmizrak.business.services.impl;

import com.hamitmizrak.business.dto.BlogCategoryDto;
import com.hamitmizrak.business.services.interfaces.IBlogCategoryServices;
import com.hamitmizrak.data.entity.BlogCategoryEntity;

import java.util.List;

public class BlogCategoryServicesImpl implements IBlogCategoryServices<BlogCategoryDto, BlogCategoryEntity> {



    /// ///////////////////////////////////////////////////////////////////////////////
    @Override
    public BlogCategoryDto entityToDto(BlogCategoryEntity blogCategoryEntity) {
        return null;
    }

    @Override
    public BlogCategoryEntity dtoToEntity(BlogCategoryDto blogCategoryDto) {
        return null;
    }


    /// ///////////////////////////////////////////////////////////////////////////////
    @Override
    public BlogCategoryDto objectServiceCreate(BlogCategoryDto blogCategoryDto) {
        return null;
    }

    @Override
    public List<BlogCategoryDto> objectServiceList() {
        return List.of();
    }

    @Override
    public BlogCategoryDto objectServiceFindById(Long id) {
        return null;
    }

    @Override
    public BlogCategoryDto objectServiceUpdate(Long id, BlogCategoryDto blogCategoryDto) {
        return null;
    }

    @Override
    public BlogCategoryDto objectServiceDelete(Long id) {
        return null;
    }


}
