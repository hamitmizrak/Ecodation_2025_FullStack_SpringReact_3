package com.hamitmizrak.controller.api;

import com.hamitmizrak.error.ApiResult;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;

import java.util.List;

// D: Dto
public interface ISortingPagingApi<D> {

    // PAGINATION
    public ResponseEntity<ApiResult<Page<?>> >  objectServicePagination(int currentPage, int pageSize);

    // SORTING
    // Database içinde herhangi bir kolona göre yazsın
    public ResponseEntity<ApiResult<List<D>>> objectServiceListSortedBy(String sortedBy);

    // SORTING ASC
    // Database içindeki seçtiğimiz kolona göre küçükten büyüğe doğru sıralansın
    public ResponseEntity<ApiResult<List<D>>>  objectServiceListSortedByAsc();

    // SORTING DESC
    // Database içindeki seçtiğimiz kolona göre büyükten küçüğe doğru sıralansın
    public ResponseEntity<ApiResult<List<D>>>   objectServiceListSortedByDesc();
}
