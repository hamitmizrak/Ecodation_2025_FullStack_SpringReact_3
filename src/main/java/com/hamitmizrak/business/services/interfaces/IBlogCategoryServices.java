package com.hamitmizrak.business.services.interfaces;

import com.hamitmizrak.business.services.ICrudService;
import com.hamitmizrak.business.services.IModelMapperService;

// D: Dto
// E: Entity
public interface IBlogCategoryServices<D,E> extends IModelMapperService<D,E>, ICrudService<D,E> {

    // SPEED DATA Category
    public String categorySpeedData(Integer data);

    public String categoryDeleteAll();
}
