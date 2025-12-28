package com.hamitmizrak.business.services.impl;

import com.hamitmizrak.business.dto.BlogCategoryDto;
import com.hamitmizrak.business.services.interfaces.IBlogCategoryServices;
import com.hamitmizrak.data.entity.BlogCategoryEntity;
import com.hamitmizrak.data.mapper.BlogCategoryMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

// LOMBOK
@RequiredArgsConstructor
@Log4j2

// Asıl  İş Yükünü Yapn Yer
@Service
public class BlogCategoryServicesImpl implements IBlogCategoryServices<BlogCategoryDto, BlogCategoryEntity> {

    // Injection
    // 1.YOL
    /*@Autowired
    private final IBlogCategoryServices iBlogCategoryServices;*/

    // 2.YOL
    /*private final IBlogCategoryServices iBlogCategoryServices;
    @Autowired
    public BlogCategoryServicesImpl(IBlogCategoryServices iBlogCategoryServices) {
        this.iBlogCategoryServices = iBlogCategoryServices;
    }*/

    // 3.YOL
    private final IBlogCategoryServices<BlogCategoryDto,BlogCategoryEntity> iBlogCategoryServices;

    /// ///////////////////////////////////////////////////////////////////////////////
    /// MAPPER
    @Override
    public BlogCategoryDto entityToDto(BlogCategoryEntity blogCategoryEntity) {
        // 1.YOL

        // 2.YOL
        return BlogCategoryMapper.toDto(blogCategoryEntity);
    }

    @Override
    public BlogCategoryEntity dtoToEntity(BlogCategoryDto blogCategoryDto) {
        return BlogCategoryMapper.toEntiy(blogCategoryDto);
    }


    /// ///////////////////////////////////////////////////////////////////////////////
    /// SPEED
    @Override
    public String categorySpeedData(Integer data) {
        return "";
    }

    @Override
    public String categoryDeleteAll() {
        return "";
    }

    /// ///////////////////////////////////////////////////////////////////////////////
    /// CRUD
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



} // end class BlogCategoryServicesImpl
