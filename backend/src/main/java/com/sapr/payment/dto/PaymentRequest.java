package com.sapr.payment.dto;

import com.sapr.payment.entity.PaymentMethod;
import lombok.Data;

@Data
public class PaymentRequest {
    private Long orderId;
    private PaymentMethod method;
}
