package com.sapr.order.dto;

import com.sapr.order.entity.OrderStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class KitchenTicketDto {
    private Long orderId;
    private Integer tableNumber;
    private String waiterName;
    private OrderStatus status;
    private LocalDateTime createdAt;
    private Double total;
    private List<KitchenTicketItemDto> items;
}
