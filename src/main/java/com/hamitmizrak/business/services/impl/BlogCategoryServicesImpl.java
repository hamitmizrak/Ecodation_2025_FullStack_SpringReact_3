package com.hamitmizrak.business.services.impl;

import com.hamitmizrak.business.dto.BlogCategoryDto;
import com.hamitmizrak.business.services.interfaces.IBlogCategoryServices;
import com.hamitmizrak.data.entity.BlogCategoryEntity;
import com.hamitmizrak.data.mapper.BlogCategoryMapper;
import com.hamitmizrak.data.repository.IBlogCategoryRepository;
import com.hamitmizrak.exception.HamitMizrakException;
import com.hamitmizrak.exception._404_NotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@RequiredArgsConstructor
@Log4j2
@Service
public class BlogCategoryServicesImpl
        implements IBlogCategoryServices<BlogCategoryDto, BlogCategoryEntity> {

    private final IBlogCategoryRepository iBlogCategoryRepository;



    // ---------- IModelMapperService ----------
    @Override
    public BlogCategoryDto entityToDto(BlogCategoryEntity e) {
        return BlogCategoryMapper.toDto(e);
    }
    @Override
    public BlogCategoryEntity dtoToEntity(BlogCategoryDto d) {
        return BlogCategoryMapper.toEntity(d);
    }

    // ---------- ICrudService ----------
    @Override
    @Transactional
    public BlogCategoryDto objectServiceCreate(BlogCategoryDto d) {
        if (d == null || d.getCategoryName() == null || d.getCategoryName().isBlank())
            throw new HamitMizrakException("Kategori adı zorunludur");
        if (iBlogCategoryRepository.existsByCategoryNameIgnoreCase(d.getCategoryName()))
            throw new HamitMizrakException("Kategori zaten var: " + d.getCategoryName());

        BlogCategoryEntity saved = iBlogCategoryRepository.save(dtoToEntity(d));
        return entityToDto(saved);
    }

    @Override
    public List<BlogCategoryDto> objectServiceList() {
        return iBlogCategoryRepository.findAll().stream().map(this::entityToDto).toList();
    }

    @Override
    public BlogCategoryDto objectServiceFindById(Long id) {
        BlogCategoryEntity e = iBlogCategoryRepository.findById(id)
                .orElseThrow(() -> new _404_NotFoundException(id + " id'li kategori bulunamadı"));
        return entityToDto(e);
    }

    @Override
    @Transactional
    public BlogCategoryDto objectServiceUpdate(Long id, BlogCategoryDto d) {
        BlogCategoryEntity e = iBlogCategoryRepository.findById(id)
                .orElseThrow(() -> new _404_NotFoundException(id + " id'li kategori bulunamadı"));
        if (d.getCategoryName() != null && !d.getCategoryName().isBlank()) {
            if (iBlogCategoryRepository.existsByCategoryNameIgnoreCase(d.getCategoryName())
                    && !d.getCategoryName().equalsIgnoreCase(e.getCategoryName())) {
                throw new HamitMizrakException("Kategori zaten var: " + d.getCategoryName());
            }
            e.setCategoryName(d.getCategoryName());
        }
        return entityToDto(iBlogCategoryRepository.save(e));
    }

    @Override
    @Transactional
    public BlogCategoryDto objectServiceDelete(Long id) {
        BlogCategoryDto found = objectServiceFindById(id);
        iBlogCategoryRepository.deleteById(id);
        return found;
    }

    // ---------- Extras ----------

    // SPEED DATA
    @Override
    @Transactional
    public String categorySpeedData(Integer data) {
        if (data != null) {
            for (int i = 1; i <= data; i++) {
                BlogCategoryEntity categoryEntity = new BlogCategoryEntity();
                categoryEntity.setCategoryName("category" + i);
                iBlogCategoryRepository.save(categoryEntity);
            }//end for
        } else {
            throw new NullPointerException("Integer have not be null");
        }
        return data + " tane veri yüklendi";
    }

    // DELETE ALL
    @Override
    @Transactional
    public String categoryDeleteAll() {
        iBlogCategoryRepository.deleteAll();
        return "Silindi.";
    }

}
