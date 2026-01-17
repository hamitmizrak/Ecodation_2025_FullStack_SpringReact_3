package com.hamitmizrak.data.repository;

import com.hamitmizrak.data.entity.AboutEntity;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;


// CrudRepository<RegisterEntity,Long>
// JpaRepository<RegisterEntity,Long>
// PagingAndSortingRepository<RegisterEntity,Long>
@Repository
public interface IAboutRepository extends CrudRepository<AboutEntity,Long> {

}