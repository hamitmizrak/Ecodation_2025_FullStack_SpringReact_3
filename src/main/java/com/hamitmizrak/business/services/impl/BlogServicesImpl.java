package com.hamitmizrak.business.services.impl;

import com.hamitmizrak.bean.ModelMapperBean;
import com.hamitmizrak.business.dto.BlogDto;
import com.hamitmizrak.business.services.interfaces.IBlogCategoryServices;
import com.hamitmizrak.business.services.interfaces.IBlogServices;
import com.hamitmizrak.data.entity.BlogCategoryEntity;
import com.hamitmizrak.data.entity.BlogEntity;
import com.hamitmizrak.data.mapper.BlogMapper;
import com.hamitmizrak.data.repository.IBlogCategoryRepository;
import com.hamitmizrak.data.repository.IBlogRepository;
import com.hamitmizrak.exception.HamitMizrakException;
import com.hamitmizrak.exception._404_NotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

// LOMBOK
@RequiredArgsConstructor
@Log4j2

// Asıl  İş Yükünü Yapn Yer
@Service
public class BlogServicesImpl implements IBlogServices<BlogDto, BlogEntity> {

    // Injection
    private final IBlogRepository iBlogRepository;
    private final IBlogCategoryRepository iBlogCategoryRepository;

    /// ///////////////////////////////////////////////////////////////////////////////
    /// MAPPER
    @Override
    public BlogDto entityToDto(BlogEntity e) {
        // 1.YOL
        // return modelMapperBean.modelMapperMethod().map(e,BlogDto.class);

        // 2.YOL
        return BlogMapper.toDto(e);
    }

    @Override
    public BlogEntity dtoToEntity(BlogDto d) {
        // 1.YOL
        // return modelMapperBean.modelMapperMethod().map(BlogDto,BlogEntity.class);

        // 2.YOL
        return BlogMapper.toEntiy(d);
    }


    /// ///////////////////////////////////////////////////////////////////////////////
    /// SPEED
    @Override
    @Transactional
    public String blogSpeedData(Integer data) {
        return data+" tane blog category oluşturuldu.";
    }

    // DELETE ALL
    @Override
    @Transactional
    public String blogDeleteAll() {
        return "blog category silindi.";
    }

    /// ///////////////////////////////////////////////////////////////////////////////
    /// CRUD
    /// CREATE  (BLOGCATEGORY)
    @Override
    @Transactional
    public BlogDto objectServiceCreate(BlogDto d) {
        validate(d,true);

        // Kategori Bul
        Long catId= d.getBlogCategoryDto()!=null ? d.getBlogCategoryDto().getCategoryId():null;
        if(catId==null)throw  new HamitMizrakException("Kategori Seçiniz");

        BlogCategoryEntity blogCategoryEntity=iBlogCategoryRepository.findById(catId).orElseThrow(()-> new _404_NotFoundException(catId+ " id'li kategori bulunamadı"));

        BlogEntity blogEntity = dtoToEntity(d);
        blogEntity.setBlogCategoryEntity(blogCategoryEntity);

        BlogEntity saved= iBlogRepository.save(blogEntity);
        return  entityToDto(saved);
    }

    // LIST
    @Override
    public List<BlogDto> objectServiceList() {
        return iBlogServices.findAll().stream().map(this::entityToDto).toList();
    }

    // FIND (BLOGCATEGORY)
    @Override
    public BlogDto objectServiceFindById(Long id) {
        BlogEntity find= iBlogServices.findById(id)
                .orElseThrow(() -> new _404_NotFoundException(id +" id'li kategori bulunamadi"));
        return entityToDto(find);
    }

    // UPDATE  (BLOGCATEGORY)
    @Override
    @Transactional
    public BlogDto objectServiceUpdate(Long id, BlogDto d) {
        // Önce Bul
        d find= objectServiceFindById(id);
        find.setCategoryName(d.getCategoryName());
        return entityToDto(iBlogServices.save(dtoToEntity(find)));
    }

    // DELETE  (BLOGCATEGORY)
    @Override
    @Transactional
    public BlogDto objectServiceDelete(Long id) {
        // Önce Bul
        BlogDto find= objectServiceFindById(id);
        iBlogServices.deleteById(id);
        return find;
    }

} // end class BlogCategoryServicesImpl
