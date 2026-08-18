package com.prepwise.mapper;

import com.prepwise.dto.CompanyDto;
import com.prepwise.entity.Company;
import org.springframework.stereotype.Component;

@Component
public class CompanyMapper {

    public CompanyDto toDto(Company company) {
        if (company == null) return null;
        return CompanyDto.builder()
                .id(company.getId())
                .name(company.getName())
                .description(company.getDescription())
                .website(company.getWebsite())
                .industry(company.getIndustry())
                .build();
    }

    public Company toEntity(CompanyDto dto) {
        if (dto == null) return null;
        return Company.builder()
                .id(dto.getId())
                .name(dto.getName())
                .description(dto.getDescription())
                .website(dto.getWebsite())
                .industry(dto.getIndustry())
                .build();
    }
}
