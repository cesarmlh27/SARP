package com.sapr.table.controller;

import com.sapr.table.entity.RestaurantTableEntity;
import com.sapr.table.entity.TableStatus;
import com.sapr.table.service.RestaurantTableService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tables")
@RequiredArgsConstructor
public class RestaurantTableController {

    private final RestaurantTableService tableService;

    @GetMapping
    public List<RestaurantTableEntity> findAll() {
        return tableService.findAll();
    }

    @PostMapping
    public RestaurantTableEntity save(@RequestBody RestaurantTableEntity table) {
        return tableService.save(table);
    }

    @GetMapping("/{id}")
    public RestaurantTableEntity findById(@PathVariable Long id) {
        return tableService.findById(id);
    }

    @PutMapping("/{id}")
    public RestaurantTableEntity update(@PathVariable Long id,
                                        @RequestBody RestaurantTableEntity table) {
        return tableService.update(id, table);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        tableService.delete(id);
    }

    @GetMapping("/status/{status}")
    public List<RestaurantTableEntity> findByStatus(@PathVariable TableStatus status) {
        return tableService.findByStatus(status);
    }

    @PatchMapping("/{id}/status")
    public RestaurantTableEntity changeStatus(@PathVariable Long id,
                                              @RequestParam TableStatus status) {
        return tableService.changeStatus(id, status);
    }
}
