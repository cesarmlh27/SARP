package com.sapr.payment.service.impl;

import com.sapr.order.entity.OrderEntity;
import com.sapr.order.entity.OrderStatus;
import com.sapr.order.repository.OrderRepository;
import com.sapr.payment.dto.PaymentRequest;
import com.sapr.payment.entity.PaymentEntity;
import com.sapr.payment.entity.PaymentStatus;
import com.sapr.payment.repository.PaymentRepository;
import com.sapr.payment.service.PaymentService;
import com.sapr.table.entity.TableStatus;
import com.sapr.table.repository.RestaurantTableRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;
    private final RestaurantTableRepository tableRepository;

    @Override
    public List<PaymentEntity> findAll() {
        return paymentRepository.findAll();
    }

    @Override
    public PaymentEntity pay(PaymentRequest request) {
        OrderEntity order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new RuntimeException("Pedido no encontrado: " + request.getOrderId()));

        if (order.getStatus() == OrderStatus.PAID) {
            throw new RuntimeException("El pedido ya fue pagado");
        }
        if (paymentRepository.findByOrderId(request.getOrderId()).isPresent()) {
            throw new RuntimeException("Ya existe un pago para este pedido");
        }

        PaymentEntity payment = PaymentEntity.builder()
                .order(order)
                .method(request.getMethod())
                .status(PaymentStatus.COMPLETED)
                .amount(order.getTotal())
                .paidAt(LocalDateTime.now())
                .build();

        PaymentEntity saved = paymentRepository.save(payment);

        order.setStatus(OrderStatus.PAID);
        orderRepository.save(order);

        order.getRestaurantTable().setStatus(TableStatus.AVAILABLE);
        tableRepository.save(order.getRestaurantTable());

        return saved;
    }

    @Override
    public PaymentEntity findById(Long id) {
        return paymentRepository.findById(id).orElse(null);
    }

    @Override
    public PaymentEntity findByOrder(Long orderId) {
        return paymentRepository.findByOrderId(orderId).orElse(null);
    }
}
