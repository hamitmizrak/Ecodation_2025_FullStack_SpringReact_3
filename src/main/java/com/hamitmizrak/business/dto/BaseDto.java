package com.hamitmizrak.business.dto;

import com.hamitmizrak.audit.AuditingAwareBaseDto;
import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;
import java.util.Date;

// LOMBOK
@Getter
@Setter

// Serializable:
// abstract: BaseDto instance(örnek) yapılmasını istemiyorum
abstract public class BaseDto extends AuditingAwareBaseDto {

    // FIELD
    // ID
    protected Long id;

    // DATE
    protected Date systemCreatedDate;
} //end BaseDto
