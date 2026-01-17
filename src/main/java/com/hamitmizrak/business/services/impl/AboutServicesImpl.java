package com.hamitmizrak.business.services.impl;

import com.hamitmizrak.bean.ModelMapperBean;
import com.hamitmizrak.business.dto.AboutDto;
import com.hamitmizrak.business.services.interfaces.IAboutServices;
import com.hamitmizrak.data.entity.AboutEntity;
import com.hamitmizrak.data.mapper.AboutMapper;
import com.hamitmizrak.data.repository.IAboutRepository;
import com.hamitmizrak.exception.HamitMizrakException;
import com.hamitmizrak.exception._404_NotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.File;
import java.util.ArrayList;
import java.util.List;

// LOMBOK
@RequiredArgsConstructor
@Log4j2

// SERVICES
@Service
public class AboutServicesImpl implements IAboutServices<AboutDto, AboutEntity> {

    // INJECTION (Lombok Constructor Field) => 3.YOL
    private final IAboutRepository iAboutRepository;
    private final ModelMapperBean modelMapperBeanClass;


    @Value("${file.upload-dir}")
    private String uploadDir; // ör: upload

    //////////////////////////////////////////////////////////////////////////////
    // MODEL MAPPER
    @Override
    public AboutDto entityToDto(AboutEntity aboutEntity) {
        // 1.YOL
        // return modelMapperBeanClass.modelMapperMethod().map(aboutEntity, AboutDto.class);

        // 2.YOL
        return AboutMapper.AboutEntityToAboutDto(aboutEntity);
    }

    @Override
    public AboutEntity dtoToEntity(AboutDto aboutDto) {
        // 1.YOL
        // return modelMapperBeanClass.modelMapperMethod().map(aboutDto, AboutEntity.class);

        // 2.YOL
        return AboutMapper.AboutDtoToAboutEntity(aboutDto);
    }

    //////////////////////////////////////////////////////////////////////////////
    // CREATE
    @Override
    @Transactional // create, delete, update
    public AboutDto  objectServiceCreate(AboutDto aboutDto) {
        if(aboutDto!=null){
            AboutEntity aboutEntity=dtoToEntity(aboutDto);
            iAboutRepository.save(aboutEntity);
            aboutDto.setAboutId(aboutEntity.getAboutId());
            aboutDto.setSystemCreatedDate(aboutEntity.getSystemCreatedDate());
        }else{
            throw  new NullPointerException("About Dto boş veri");
        }
        return aboutDto;
    }

    // LIST
    @Override
    public List<AboutDto> objectServiceList() {
        Iterable<AboutEntity> entityIterable=  iAboutRepository.findAll();
        // Dto To entityb List
        List<AboutDto> aboutDtoList=new ArrayList<>();
        for (AboutEntity entity:  entityIterable) {
            AboutDto aboutDto=entityToDto(entity);
            aboutDtoList.add(aboutDto);
        }
        log.info("Liste Sayısı: "+aboutDtoList.size());
        return aboutDtoList;
    }

    // FIND
    @Override
    public AboutDto objectServiceFindById(Long id) {
        // 1.YOL (FIND)
        /*
        Optional<AboutDto> findOptionalAboutDto=  iaboutRepository.findById(id);
        aboutDto aboutDto=entityToDto(findOptionalAboutDto.get());
        if(findOptionalAboutDto.isPresent()){
            return aboutDto;
        }
        */

        // 2.YOL (FIND)
        AboutEntity findAboutEntity=  null;
        if(id!=null){
            findAboutEntity=  iAboutRepository.findById(id)
                    .orElseThrow(() -> new _404_NotFoundException("About not found with id " + id));
        }else if(id==null) {
            throw new HamitMizrakException("İd null olarak geldi");
        }
        return entityToDto(findAboutEntity);
    }


    // UPDATE
    @Override
    @Transactional
    public AboutDto objectServiceUpdate(Long id, AboutDto aboutDto) {
        // Önce Bul
        AboutDto aboutFindDto = objectServiceFindById(id);

        if (aboutFindDto != null) {
            // 1. Eski ve yeni imageUrl'leri al
            String oldImageUrl = aboutFindDto.getImageUrl();
            String newImageUrl = aboutDto.getImageUrl();

            // 2. Eğer image değiştiyse, eski resmi sil
            if (newImageUrl != null && !newImageUrl.isBlank() && !newImageUrl.equals(oldImageUrl)) {
                if (oldImageUrl != null && !oldImageUrl.isBlank()) {
                    String relPath = oldImageUrl.startsWith("/") ? oldImageUrl.substring(1) : oldImageUrl;
                    if (relPath.startsWith("upload/")) relPath = relPath.substring("upload/".length());
                    File oldFile = new File(uploadDir, relPath);
                    System.out.println("Update'de silinecek eski dosya: " + oldFile.getAbsolutePath());
                    if (oldFile.exists()) oldFile.delete();
                }
            }

            // 3. Güncelleme işlemi
            AboutEntity aboutEntity = dtoToEntity(aboutFindDto);
            aboutEntity.setAboutName(aboutDto.getAboutName());
            aboutEntity.setMission(aboutDto.getMission());
            aboutEntity.setVision(aboutDto.getVision());
            aboutEntity.setImageUrl(aboutDto.getImageUrl());
            iAboutRepository.save(aboutEntity);
        }
        return aboutDto;
    }


    // DELETE
    @Override
    @Transactional
    public AboutDto objectServiceDelete(Long id) {
        AboutDto aboutFindDto = objectServiceFindById(id);

        // ---- DOSYA SİLME ----
        String imageUrl = aboutFindDto.getImageUrl();
        if (imageUrl != null && !imageUrl.isBlank()) {
            String relPath = imageUrl.startsWith("/") ? imageUrl.substring(1) : imageUrl; // baştaki "/" kaldır
            if (relPath.startsWith("upload/")) relPath = relPath.substring("upload/".length()); // "register/..." olacak
            File file = new File(uploadDir, relPath);
            System.out.println("Silinecek dosya: " + file.getAbsolutePath());
            if (file.exists()) file.delete();
        }

        // ---- VERİTABANI KAYDI SİLME ----
        iAboutRepository.deleteById(id);

        return aboutFindDto;
    }
} //end class
