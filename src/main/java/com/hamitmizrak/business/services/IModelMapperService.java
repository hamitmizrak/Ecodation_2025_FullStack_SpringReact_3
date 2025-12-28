package com.hamitmizrak.business.services;

// D: Dto
// E: Entity
public interface IModelMapperService<D,E> {

    // Model Mapper (Dto <=> Entity)
    public D entityToDto(E e);
    public E dtoToEntity(D d);
}
