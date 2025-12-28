package com.hamitmizrak.business.services.impl;

import com.hamitmizrak.bean.ModelMapperBean;
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
    private final IBlogCategoryRepository iBlogCategoryRepository;

    private final ModelMapperBean modelMapperBean;

    /// ///////////////////////////////////////////////////////////////////////////////
    /// MAPPER
    @Override
    public BlogCategoryDto entityToDto(BlogCategoryEntity blogCategoryEntity) {
        // 1.YOL
        // return modelMapperBean.modelMapperMethod().map(blogCategoryEntity,BlogCategoryDto.class);

        // 2.YOL
        return BlogCategoryMapper.toDto(blogCategoryEntity);
    }

    @Override
    public BlogCategoryEntity dtoToEntity(BlogCategoryDto blogCategoryDto) {
        // 1.YOL
        // return modelMapperBean.modelMapperMethod().map(blogCategoryDto,BlogCategoryEntity.class);

        // 2.YOL
        return BlogCategoryMapper.toEntiy(blogCategoryDto);
    }


    /// ///////////////////////////////////////////////////////////////////////////////
    /// SPEED
    @Override
    @Transactional
    public String categorySpeedData(Integer data) {
        if(data!=null){
            for (int i = 1; i <=data ; i++) {
                BlogCategoryEntity blogCategoryEntity = new BlogCategoryEntity();
                blogCategoryEntity.setCategoryName("category "+i);
                iBlogCategoryRepository.save(blogCategoryEntity);
            }
        } else{
            throw  new NullPointerException("Blog categor is null");
        }
        return data+" tane blog category oluşturuldu.";
    }

    // DELETE ALL
    @Override
    @Transactional
    public String categoryDeleteAll() {
        iBlogCategoryRepository.deleteAll();
        return "blog category silindi.";
    }

    /// ///////////////////////////////////////////////////////////////////////////////
    /// CRUD

    /// CREATE  (BLOGCATEGORY)
    @Override
    @Transactional
    public BlogCategoryDto objectServiceCreate(BlogCategoryDto blogCategoryDto) {
        if(blogCategoryDto.getCategoryName()==null || blogCategoryDto.getCategoryName().isBlank()){
            throw new HamitMizrakException("Kategori alanı zorunludur.");
        }
        if(iBlogCategoryRepository.existsByCategoryNameIgnoreCase(blogCategoryDto.getCategoryName())){
            throw new HamitMizrakException("Kategori zaten var"+  blogCategoryDto.getCategoryName());
        }

        BlogCategoryEntity blogCategoryEntity = iBlogCategoryRepository.save(dtoToEntity(blogCategoryDto));
        return  entityToDto(blogCategoryEntity);
    }

    // LIST
    @Override
    public List<BlogCategoryDto> objectServiceList() {
        return iBlogCategoryRepository.findAll().stream().map(this::entityToDto).toList();
    }

    // FIND (BLOGCATEGORY)
    @Override
    public BlogCategoryDto objectServiceFindById(Long id) {
        BlogCategoryEntity find= iBlogCategoryRepository.findById(id)
                .orElseThrow(() -> new _404_NotFoundException(id +" id'li kategori bulunamadi"));
        return entityToDto(find);
    }

    // UPDATE  (BLOGCATEGORY)
    @Override
    @Transactional
    public BlogCategoryDto objectServiceUpdate(Long id, BlogCategoryDto blogCategoryDto) {
        // Önce Bul
        BlogCategoryDto find= objectServiceFindById(id);
        return entityToDto(iBlogCategoryRepository.save(dtoToEntity(find)));
    }

    // DELETE  (BLOGCATEGORY)
    @Override
    @Transactional
    public BlogCategoryDto objectServiceDelete(Long id) {
        // Önce Bul
        BlogCategoryDto find= objectServiceFindById(id);
        iBlogCategoryRepository.deleteById(id);
        return find;
    }

} // end class BlogCategoryServicesImpl
