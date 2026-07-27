package com.sapr.category.service;
import com.sapr.category.entity.CategoryEntity;
import java.util.List;

public interface CategoryService {
    List<CategoryEntity> findAll();
    CategoryEntity save(CategoryEntity category);
    CategoryEntity findById(Long id);
    void delete(Long id);
}

