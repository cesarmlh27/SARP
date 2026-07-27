package com.sapr.product.controller;

import com.sapr.product.entity.ProductEntity;
import com.sapr.product.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.MediaTypeFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @Value("${app.upload.dir:uploads/products}")
    private String uploadDir;

    @GetMapping
    public List<ProductEntity> findAll() {
        return productService.findAll();
    }

    @PostMapping
    public ProductEntity save(@RequestBody ProductEntity product) {
        return productService.save(product);
    }

    @GetMapping("/{id}")
    public ProductEntity findById(@PathVariable Long id) {
        return productService.findById(id);
    }

    @PutMapping("/{id}")
    public ProductEntity update(@PathVariable Long id,
                                @RequestBody ProductEntity product) {
        ProductEntity existingProduct = productService.findById(id);

        if (existingProduct == null) {
            return null;
        }

        existingProduct.setName(product.getName());
        existingProduct.setDescription(product.getDescription());
        existingProduct.setPrice(product.getPrice());
        if (product.getStock() != null) {
            existingProduct.setStock(product.getStock());
        }
        existingProduct.setActive(product.getActive());
        existingProduct.setCategory(product.getCategory());

        return productService.save(existingProduct);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        productService.delete(id);
    }

    @PostMapping("/{id}/image")
    public ResponseEntity<ProductEntity> uploadImage(@PathVariable Long id,
                                                     @RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(productService.uploadImage(id, file));
    }

    @GetMapping("/{id}/image")
    public ResponseEntity<Resource> getImage(@PathVariable Long id) {
        ProductEntity product = productService.findById(id);
        if (product == null || product.getImagePath() == null) {
            return ResponseEntity.notFound().build();
        }
        try {
            Path uploadsBasePath = Path.of(uploadDir).toAbsolutePath().normalize();
            Path filePath = uploadsBasePath.resolve(product.getImagePath()).normalize();
            if (!filePath.startsWith(uploadsBasePath)) {
                return ResponseEntity.badRequest().build();
            }
            Resource resource = new UrlResource(filePath.toUri());
            if (!resource.exists()) {
                return ResponseEntity.notFound().build();
            }

            MediaType mediaType = MediaTypeFactory
                    .getMediaType(resource)
                    .orElseGet(() -> {
                        try {
                            String detected = Files.probeContentType(filePath);
                            return detected != null ? MediaType.parseMediaType(detected) : MediaType.APPLICATION_OCTET_STREAM;
                        } catch (Exception ignored) {
                            return MediaType.APPLICATION_OCTET_STREAM;
                        }
                    });

            return ResponseEntity.ok()
                    .contentType(mediaType)
                    .header(HttpHeaders.CACHE_CONTROL, "no-cache, no-store, must-revalidate")
                    .header(HttpHeaders.PRAGMA, "no-cache")
                    .header(HttpHeaders.EXPIRES, "0")
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "inline; filename=\"" + resource.getFilename() + "\"")
                    .body(resource);
        } catch (MalformedURLException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
