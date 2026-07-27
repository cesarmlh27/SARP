package com.sapr.category.controller;
import com.sapr.category.entity.CategoryEntity;
import com.sapr.category.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;
@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {
    private final CategoryService categoryService;

    @GetMapping
    public List<CategoryEntity> findAll() {
        return categoryService.findAll();
    }

    @PostMapping
    public CategoryEntity save(@RequestBody CategoryEntity category) {
        return categoryService.save(category);
    }

    @GetMapping("/{id}")
    public CategoryEntity findById(@PathVariable Long id) {
        return categoryService.findById(id);
    }

    @PutMapping("/{id}")
public CategoryEntity update(@PathVariable Long id,
                             @RequestBody CategoryEntity category) {

    CategoryEntity existingCategory = categoryService.findById(id);

    if (existingCategory == null) {
        return null;
    }

    existingCategory.setName(category.getName());
    existingCategory.setDescription(category.getDescription());
    existingCategory.setActive(category.getActive());

    return categoryService.save(existingCategory);
}

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        categoryService.delete(id);
    }
}
