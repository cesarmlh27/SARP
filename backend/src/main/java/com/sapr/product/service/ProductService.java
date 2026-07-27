package com.sapr.product.service;

import com.sapr.product.entity.ProductEntity;

import java.util.List;

import org.springframework.web.multipart.MultipartFile;

public interface ProductService {
    List<ProductEntity> findAll();
    ProductEntity save(ProductEntity product);
    ProductEntity findById(Long id);
    void delete(Long id);
    ProductEntity uploadImage(Long id, MultipartFile file);
}
