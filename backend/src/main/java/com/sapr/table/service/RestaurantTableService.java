package com.sapr.table.service;

import com.sapr.table.entity.RestaurantTableEntity;
import com.sapr.table.entity.TableStatus;

import java.util.List;

public interface RestaurantTableService {
    List<RestaurantTableEntity> findAll();
    RestaurantTableEntity save(RestaurantTableEntity table);
    RestaurantTableEntity findById(Long id);
    RestaurantTableEntity update(Long id, RestaurantTableEntity table);
    void delete(Long id);
    List<RestaurantTableEntity> findByStatus(TableStatus status);
    RestaurantTableEntity changeStatus(Long id, TableStatus status);
}
