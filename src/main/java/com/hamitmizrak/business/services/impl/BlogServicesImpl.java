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

// LOMBOK
@RequiredArgsConstructor
@Log4j2

// Asıl  İş Yükünü Yapn Yer
@Service
public class BlogServicesImpl implements IBlogServices<BlogDto, BlogEntity> {

    // Injection
    private final IBlogRepository iBlogRepository;
    private final IBlogCategoryRepository iBlogCategoryRepository;

    // Resim silmesinde dosya temizliği için kullanmak
    private final ImageService imageService;

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
        iBlogRepository.deleteAll();
        return "blog category silindi.";
    }

    /// ///////////////////////////////////////////////////////////////////////////////
    /// VALIDATE
    private void validate(BlogDto dto,  boolean creating){
        if(dto==null) throw new HamitMizrakException("Blog verisi boş");

        if(creating){
            if(dto.getHeader()==null || dto.getHeader().isBlank()) throw new HamitMizrakException("Header verisi zorunlu");
            if(dto.getTitle()==null || dto.getTitle().isBlank()) throw new HamitMizrakException("Title verisi zorunlu");
            if(dto.getContent()==null || dto.getContent().isBlank()) throw new HamitMizrakException("Contnent verisi zorunlu");
        }
    }

    /// ///////////////////////////////////////////////////////////////////////////////
    /// CRUD
    /// CREATE (BLOG)
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


    // LIST (BLOG)
    @Override
    public List<BlogDto> objectServiceList() {
        return iBlogRepository
                .findAll()
                .stream()
                .map(this::entityToDto)
                .toList();
    }

    // FIND (BLOG)
    @Override
    public BlogDto objectServiceFindById(Long id) {
        BlogEntity find= iBlogRepository.findById(id)
                .orElseThrow(() -> new _404_NotFoundException(id +" id'li blog bulunamadi"));
        return entityToDto(find);
    }

    // UPDATE (BLOG)
    @Override
    @Transactional
    public BlogDto objectServiceUpdate(Long id, BlogDto d) {
        // Önce Bul
        // BlogDto find= objectServiceFindById(id);
        BlogEntity find= iBlogRepository.findById(id)
                .orElseThrow(() -> new _404_NotFoundException(id +" id'li blog bulunamadi"));

        // Alan bazlı güncelleme
        if(d.getHeader()!=null && !d.getHeader().isBlank()) find.setHeader(d.getHeader());
        if(d.getTitle()!=null && !d.getTitle().isBlank()) find.setTitle(d.getTitle());
        if(d.getContent()!=null && !d.getContent().isBlank()) find.setContent(d.getContent());
        if(d.getImage()!=null && !d.getImage().isBlank()) find.setImage(d.getImage());

        // Kategori Değişimi
        if(d.getBlogCategoryDto()!=null && d.getBlogCategoryDto().getCategoryId()!=null){
            Long  catId= d.getBlogCategoryDto().getCategoryId();
            BlogCategoryEntity blogCategoryEntity= iBlogCategoryRepository.findById(catId).orElseThrow(()-> new _404_NotFoundException(catId+" id'li kategori bulunamadı"));
            find.setBlogCategoryEntity(blogCategoryEntity);
        }

        return entityToDto(iBlogRepository.save(find));
    }

    // DELETE (BLOG)
    @Override
    @Transactional
    public BlogDto objectServiceDelete(Long id) {
        // Önce Bul
        //BlogDto find= objectServiceFindById(id);
        BlogEntity find= iBlogRepository.findById(id)
                .orElseThrow(() -> new _404_NotFoundException(id +" id'li blog bulunamadi"));

        // Kayıtlı ilişkili dosya varsa sil
        String img= find.getImage();
        if(img!=null && img.startsWith("/upload/")){
            try {
                imageService.deleteByUrl(img);
            }catch (Exception e){
                System.out.println("Resim silmeden bir hata meydana geldi "+e.getMessage());
            }
        }

        BlogDto blogDto = entityToDto(find);
        iBlogRepository.deleteById(id);
        return blogDto;
    }
} // end class BlogCategoryServicesImpl
