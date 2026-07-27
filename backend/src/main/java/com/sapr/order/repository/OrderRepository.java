package com.sapr.order.repository;

import com.sapr.order.entity.OrderEntity;
import com.sapr.order.entity.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface OrderRepository extends JpaRepository<OrderEntity, Long> {
    List<OrderEntity> findByStatus(OrderStatus status);
    List<OrderEntity> findByStatusInOrderByCreatedAtAsc(List<OrderStatus> statuses);
    List<OrderEntity> findByRestaurantTableId(Long tableId);
    List<OrderEntity> findByUserId(Long userId);
    List<OrderEntity> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end);
    long countByStatusNotIn(List<OrderStatus> statuses);
}
