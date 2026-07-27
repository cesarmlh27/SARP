package com.sapr.payment.service;

import com.sapr.payment.dto.PaymentRequest;
import com.sapr.payment.entity.PaymentEntity;

import java.util.List;

public interface PaymentService {
    List<PaymentEntity> findAll();
    PaymentEntity pay(PaymentRequest request);
    PaymentEntity findById(Long id);
    PaymentEntity findByOrder(Long orderId);
}
