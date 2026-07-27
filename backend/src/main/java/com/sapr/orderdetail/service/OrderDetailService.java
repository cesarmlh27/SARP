package com.sapr.orderdetail.service;

import com.sapr.orderdetail.dto.OrderDetailRequest;
import com.sapr.orderdetail.entity.OrderDetailEntity;

import java.util.List;

public interface OrderDetailService {
    List<OrderDetailEntity> findByOrder(Long orderId);
    OrderDetailEntity addDetail(OrderDetailRequest request);
    void removeDetail(Long detailId);
}
