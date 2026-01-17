package com.hamitmizrak.controller.api.impl;

import com.hamitmizrak.business.dto.AddressDto;
import com.hamitmizrak.business.services.interfaces.IAddressService;
import com.hamitmizrak.controller.api.interfaces.IAddressApi;
import com.hamitmizrak.error.ApiResult;
import com.hamitmizrak.exception.HamitMizrakException;
import com.hamitmizrak.exception._400_BadRequestException;
import com.hamitmizrak.utily.FrontEnd;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/*
Status Code
CREATE	201 Created	Yeni kaynak başarıyla oluşturuldu.
LIST	200 OK	Kaynaklar başarıyla listelendi.
UPDATE	200 OK	Güncellenen kaynak döndürüldü.
        204 No Content	Güncelleme başarılı, ancak yanıt yok.
DELETE	204 No Content	Başarıyla silindi, ancak yanıt yok.
        200 OK	Silme işlemi başarılı, bilgi döndürüldü.
*/

// LOMBOK
@RequiredArgsConstructor
@Log4j2

// API: Dış dünyaya bağlantı kuran yer
@RestController
@RequestMapping("/api/address/v1.0.0")
@CrossOrigin(origins = {FrontEnd.REACT_URL, FrontEnd.ANGULAR_URL})
public class AddressApiImpl implements IAddressApi<AddressDto> {

    // Injection
    private final IAddressService iAddressService;
    private final MessageSource messageSource;

    /// /////////////////////////////////////////////////////////////////////////////////////
    // CRUD

    // CREATE (Address)
    // http://localhost:4444/api/address/create
    @Override
    @PostMapping("/create")
    public ResponseEntity<ApiResult<?>> objectApiCreate(@Valid @RequestBody AddressDto addressDto) {
        try {
            AddressDto created = (AddressDto) iAddressService.objectServiceCreate(addressDto);
            return ResponseEntity.ok(ApiResult.success(created));
        } catch (Exception ex) {
            return ResponseEntity.ok(ApiResult.error("serverError", ex.getMessage(), "/api/address/create"));
        }
    }

    // LIST (Address)
    // http://localhost:4444/api/address/list
    @Override
    @GetMapping("/list")
    public ResponseEntity<ApiResult<List<AddressDto>>> objectApiList() {
        try {
            List<AddressDto> list = iAddressService.objectServiceList();
            return ResponseEntity.ok(ApiResult.success(list));
        } catch (Exception ex) {
            return ResponseEntity.ok(ApiResult.error("serverError", ex.getMessage(), "/api/address/list"));
        }
    }

    // FIND BY ID (Address)
    // http://localhost:4444/api/address/find
    // http://localhost:4444/api/address/find/0
    // http://localhost:4444/api/address/find/-1
    // http://localhost:4444/api/address/find/%20%  %20%=boşluk
    // http://localhost:4444/api/address/find/1
    @Override
    @GetMapping({"/find/", "/find/{id}"})
    public ResponseEntity<ApiResult<?>> objectApiFindById(@PathVariable(name = "id", required = false) Long id) {
        try {
            if (id == null)
                throw new NullPointerException("Null pointer exception: Null değer");
            if (id == 0)
                throw new _400_BadRequestException("Bad Request Exception: Kötü istek");
            if (id < 0) {
                String message = messageSource.getMessage("error.unauthorized", null, LocaleContextHolder.getLocale());
                return ResponseEntity.ok(ApiResult.unauthorized(message, "/api/address/find"));
            }

            AddressDto found = (AddressDto) iAddressService.objectServiceFindById(id);
            return ResponseEntity.ok(ApiResult.success(found));
        } catch (HamitMizrakException ex) {
            return ResponseEntity.ok(ApiResult.error("unauthorized", ex.getMessage(), "/api/address/find"));
        } catch (Exception ex) {
            return ResponseEntity.ok(ApiResult.error("serverError", ex.getMessage(), "/api/address/find"));
        }
    }

    // UPDATE (Address)
    // http://localhost:4444/api/address/update/1
    @Override
    @PutMapping({"/update/", "/update/{id}"})
    public ResponseEntity<ApiResult<?>> objectApiUpdate(
            @PathVariable(name = "id", required = false) Long id,
            @Valid @RequestBody AddressDto addressDto) {
        try {
            AddressDto updated = (AddressDto) iAddressService.objectServiceUpdate(id, addressDto);
            return ResponseEntity.ok(ApiResult.success(updated));
        } catch (Exception ex) {
            return ResponseEntity.ok(ApiResult.error("serverError", ex.getMessage(), "/api/address/update"));
        }
    }

    // DELETE BY ID (Address)
    // http://localhost:4444/api/address/delete/1
    @Override
    @DeleteMapping({"/delete/", "/delete/{id}"})
    public ResponseEntity<ApiResult<?>> objectApiDelete(@PathVariable(name = "id", required = false) Long id) {
        try {
            String deleted = iAddressService.objectServiceDelete(id).toString();
            return ResponseEntity.ok(ApiResult.success(deleted));
        } catch (Exception ex) {
            return ResponseEntity.ok(ApiResult.error("serverError", ex.getMessage(), "/api/address/delete"));
        }
    }

    ////////////////////////////////////////////////////////////////////////////////////////
    // PAGINATION/SORTING
    /*
     PathVariable ve RequestParam Arasındaki Farklar

    | Özellik             | @PathVariable                                         | @RequestParam                                   |
    |-------------------- |-------------------------------------------------------|----------------------------------------------------|
    | Amaç                | URL yolundaki bir parametreyi alır.                   | Sorgu parametrelerini (query parameters) alır.     |
    | Kullanım Yeri       | URL'nin bir parçası olarak tanımlanır.                | URL'deki `?` işaretinden sonra gelen parametrelerle çalışır. |
    | URL Örneği          | `/api/users/{id}`                                     | `/api/users?name=Hamit`                             |
    | Tanımlama Şekli     | `@PathVariable("id") Long id`                         | `@RequestParam("name") String name`               |
    | Zorunluluk          | Varsayılan olarak zorunludur (opsiyonel yapılabilir). | Varsayılan olarak zorunludur (opsiyonel yapılabilir).|
    | Çoklu Değerler      | Sadece tek bir değer alır.                            | Birden fazla parametreyi kolayca alabilir.         |

     Temel Fark
    - @PathVariable, dinamik bir URL'nin bir parçasını temsil eder.
    - @RequestParam, sorgu parametrelerini alır ve genelde isteğe bağlı parametreler için kullanılır.
  */

    // PAGINATION
    @Override
    @GetMapping("/pagination")
    public ResponseEntity<ApiResult<Page<?>>> objectServicePagination(
            @RequestParam(name = "current_page", required = false, defaultValue = "0") int currentPage,
            @RequestParam(name = "page_size", required = false, defaultValue = "0") int pageSize
    ) {
        try {
            Page<?> page = iAddressService.objectServicePagination(currentPage, pageSize);
            return ResponseEntity.ok(ApiResult.success(page));
        } catch (Exception ex) {
            return ResponseEntity.ok(ApiResult.error("serverError", ex.getMessage(), "/api/address/pagination"));
        }
    }

    // SORTING (Belli Sutuna göre)
    @Override
    @GetMapping("/sorting")
    public ResponseEntity<ApiResult<List<AddressDto>>> objectServiceListSortedBy(
            @RequestParam(name = "sorted_by", required = false, defaultValue = "detailsEmbeddable.city") String sortedBy
    ) {
        try {
            List<AddressDto> list = iAddressService.objectServiceListSortedByDefault(sortedBy);
            return ResponseEntity.ok(ApiResult.success(list));
        } catch (Exception ex) {
            return ResponseEntity.ok(ApiResult.error("serverError", ex.getMessage(), "/api/address/sorting"));
        }
    }

    @Override
    @GetMapping("/sorting/city/asc")
    public ResponseEntity<ApiResult<List<AddressDto>>> objectServiceListSortedByAsc() {
        try {
            List<AddressDto> list = iAddressService.objectServiceListSortedByAsc();
            return ResponseEntity.ok(ApiResult.success(list));
        } catch (Exception ex) {
            return ResponseEntity.ok(ApiResult.error("serverError", ex.getMessage(), "/api/address/sorting/city/asc"));
        }
    }

    @Override
    @GetMapping("/sorting/city/desc")
    public ResponseEntity<ApiResult<List<AddressDto>>> objectServiceListSortedByDesc() {
        try {
            List<AddressDto> list = iAddressService.objectServiceListSortedByDesc();
            return ResponseEntity.ok(ApiResult.success(list));
        } catch (Exception ex) {
            return ResponseEntity.ok(ApiResult.error("serverError", ex.getMessage(), "/api/address/sorting/city/desc"));
        }
    }

} // end AddressApiImpl
