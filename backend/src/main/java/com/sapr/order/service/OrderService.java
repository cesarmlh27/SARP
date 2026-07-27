package com.sapr.order.service;

import com.sapr.order.dto.KitchenTicketDto;
import com.sapr.order.dto.OrderRequest;
import com.sapr.order.entity.OrderEntity;
import com.sapr.order.entity.OrderStatus;

import java.util.List;

public interface OrderService {
    List<OrderEntity> findAll(String userEmail, String userRole);
    OrderEntity create(OrderRequest request, String userEmail);
    OrderEntity findById(Long id);
    OrderEntity changeStatus(Long id, OrderStatus status, String userEmail, String userRole);
    void delete(Long id);
    List<OrderEntity> findByStatus(OrderStatus status);
    List<OrderEntity> findByTable(Long tableId);
    List<KitchenTicketDto> findKitchenTickets();
}
