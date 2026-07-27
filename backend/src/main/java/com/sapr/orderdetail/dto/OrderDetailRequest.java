package com.sapr.orderdetail.dto;

import lombok.Data;

@Data
public class OrderDetailRequest {
    private Long orderId;
    private Long productId;
    private Integer quantity;
}
