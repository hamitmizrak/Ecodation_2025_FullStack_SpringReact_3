package com.hamitmizrak.business.services.impl;

import com.hamitmizrak.business.dto.BlogDto;
import com.hamitmizrak.business.services.interfaces.IBlogServices;
import com.hamitmizrak.data.entity.BlogCategoryEntity;
import com.hamitmizrak.data.entity.BlogEntity;
import com.hamitmizrak.data.mapper.BlogMapper;
import com.hamitmizrak.data.repository.IBlogCategoryRepository;
import com.hamitmizrak.data.repository.IBlogRepository;
import com.hamitmizrak.exception.HamitMizrakException;
import com.hamitmizrak.exception._404_NotFoundException;
import com.hamitmizrak.file_upload.ImageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@RequiredArgsConstructor
@Log4j2
@Service
public class BlogServicesImpl implements IBlogServices<BlogDto, BlogEntity> {


    private final IBlogRepository blogRepo;
    private final IBlogCategoryRepository categoryRepo;

    // Silmede dosya temizliği için kullanıyoruz
    private final ImageService imageService;

    // ---------- IModelMapperService ----------
    @Override
    public BlogDto entityToDto(BlogEntity e) {
        return BlogMapper.toDto(e);
    }

    @Override
    public BlogEntity dtoToEntity(BlogDto d) {
        return BlogMapper.toEntity(d);
    }

    // ---------- ICrudService ----------



    @Override
    @Transactional
    public BlogDto objectServiceCreate(BlogDto d) {
        validate(d, true);

        // Kategori bul
        Long catId = d.getBlogCategoryDto() != null ? d.getBlogCategoryDto().getCategoryId() : null;
        if (catId == null) throw new HamitMizrakException("Kategori seçiniz");
        BlogCategoryEntity cat = categoryRepo.findById(catId)
                .orElseThrow(() -> new _404_NotFoundException(catId + " id'li kategori bulunamadı"));

        BlogEntity e = dtoToEntity(d);
        e.setBlogCategoryBlogEntity(cat);

        BlogEntity saved = blogRepo.save(e);
        return entityToDto(saved);
    }

    @Override
    public List<BlogDto> objectServiceList() {
        return blogRepo.findAll().stream().map(this::entityToDto).toList();
    }

    @Override
    public BlogDto objectServiceFindById(Long id) {
        BlogEntity e = blogRepo.findById(id)
                .orElseThrow(() -> new _404_NotFoundException(id + " id'li blog bulunamadı"));
        return entityToDto(e);
    }

    @Override
    @Transactional
    public BlogDto objectServiceUpdate(Long id, BlogDto d) {
        BlogEntity e = blogRepo.findById(id)
                .orElseThrow(() -> new _404_NotFoundException(id + " id'li blog bulunamadı"));

        // Alan bazlı güncelleme
        if (d.getHeader() != null && !d.getHeader().isBlank()) e.setHeader(d.getHeader());
        if (d.getTitle()  != null && !d.getTitle().isBlank())  e.setTitle(d.getTitle());
        if (d.getContent()!= null && !d.getContent().isBlank())e.setContent(d.getContent());
        if (d.getImage()  != null && !d.getImage().isBlank())  e.setImage(d.getImage());

        // Kategori değişimi
        if (d.getBlogCategoryDto() != null && d.getBlogCategoryDto().getCategoryId() != null) {
            Long catId = d.getBlogCategoryDto().getCategoryId();
            BlogCategoryEntity cat = categoryRepo.findById(catId)
                    .orElseThrow(() -> new _404_NotFoundException(catId + " id'li kategori bulunamadı"));
            e.setBlogCategoryBlogEntity(cat);
        }

        return entityToDto(blogRepo.save(e));
    }

    @Override
    @Transactional
    public BlogDto objectServiceDelete(Long id) {
        BlogEntity e = blogRepo.findById(id)
                .orElseThrow(() -> new _404_NotFoundException(id + " id'li blog bulunamadı"));

        // Kayıtla ilişkili dosya varsa sil (sadece /upload/... ise)
        String img = e.getImage();
        if (img != null && img.startsWith("/upload/")) {
            try { imageService.deleteByUrl(img); } catch (Exception ignored) { /* loglanabilir */ }
        }

        BlogDto toReturn = entityToDto(e);
        blogRepo.deleteById(id);
        return toReturn;
    }

    // ---------- Extras ----------
    @Transactional
    @Override
    public String blogSpeedData(Long count) {
        BlogCategoryEntity cat = categoryRepo.findByCategoryNameIgnoreCase("Genel")
                .orElseGet(() -> categoryRepo.save(BlogCategoryEntity.builder().categoryName("Genel").build()));

        for (int i = 1; i <= count; i++) {
            BlogEntity e = BlogEntity.builder()
                    .header("Header " + i)
                    .title("Title " + i)
                    .content("Content " + i)
                    .image("resim.png")
                    .blogCategoryBlogEntity(cat)
                    .build();
            blogRepo.save(e);
        }
        return "Blog speed data eklendi: " + count;
    }

    @Override
    @Transactional
    public String blogAllDelete() {
        blogRepo.deleteAll();
        return "Tüm bloglar silindi";
    }

    // ---------- validate ----------
    private void validate(BlogDto d, boolean creating) {
        if (d == null) throw new HamitMizrakException("Blog verisi boş");
        if (creating) {
            if (d.getHeader() == null || d.getHeader().isBlank()) throw new HamitMizrakException("Header zorunlu");
            if (d.getTitle()  == null || d.getTitle().isBlank())  throw new HamitMizrakException("Başlık zorunlu");
            if (d.getContent()== null || d.getContent().isBlank())throw new HamitMizrakException("İçerik zorunlu");
        }
    }



}
