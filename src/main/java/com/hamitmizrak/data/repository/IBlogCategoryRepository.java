package com.hamitmizrak.data.repository;


import com.hamitmizrak.data.entity.BlogCategoryEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface IBlogCategoryRepository extends JpaRepository<BlogCategoryEntity, Long> {

    // Delivery Query
   Optional<BlogCategoryEntity>  findByCategoryNameIgnoreCase(String categoryName);

   // Blog category var mı , yok mu ?
   boolean existsByCategoryNameIgnoreCase(String categoryName);
}
