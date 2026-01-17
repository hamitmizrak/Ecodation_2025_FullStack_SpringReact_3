package com.hamitmizrak.business.services.interfaces;

import com.hamitmizrak.business.dto.BlogDto;
import com.hamitmizrak.business.services.ICrudService;
import com.hamitmizrak.business.services.IModelMapperService;
import org.springframework.transaction.annotation.Transactional;

// D: Dto
// E: Entity
public interface IBlogServices<D, E>  extends IModelMapperService<D,E>,ICrudService<D,E>{


    // Relation
    // SPEED DATA
    public String blogSpeedData(Long data);

    // ALL DELETE
    public String blogAllDelete();
}
