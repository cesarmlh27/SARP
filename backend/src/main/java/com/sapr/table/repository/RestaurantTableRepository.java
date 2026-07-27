package com.sapr.table.repository;

import com.sapr.table.entity.RestaurantTableEntity;
import com.sapr.table.entity.TableStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RestaurantTableRepository extends JpaRepository<RestaurantTableEntity, Long> {
    Optional<RestaurantTableEntity> findByTableNumber(Integer tableNumber);
    boolean existsByTableNumber(Integer tableNumber);
    List<RestaurantTableEntity> findByStatus(TableStatus status);
}
