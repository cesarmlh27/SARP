package com.sapr.payment.controller;

import com.sapr.payment.dto.PaymentRequest;
import com.sapr.payment.entity.PaymentEntity;
import com.sapr.payment.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @GetMapping
    public List<PaymentEntity> findAll() {
        return paymentService.findAll();
    }

    @PostMapping
    public PaymentEntity pay(@RequestBody PaymentRequest request) {
        return paymentService.pay(request);
    }

    @GetMapping("/{id}")
    public PaymentEntity findById(@PathVariable Long id) {
        return paymentService.findById(id);
    }

    @GetMapping("/order/{orderId}")
    public PaymentEntity findByOrder(@PathVariable Long orderId) {
        return paymentService.findByOrder(orderId);
    }
}
