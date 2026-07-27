package com.sapr.order.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class KitchenTicketItemDto {
    private String productName;
    private Integer quantity;
}
