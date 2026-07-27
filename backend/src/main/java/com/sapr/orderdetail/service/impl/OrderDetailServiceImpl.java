package com.sapr.orderdetail.service.impl;

import com.sapr.order.entity.OrderEntity;
import com.sapr.order.repository.OrderRepository;
import com.sapr.orderdetail.dto.OrderDetailRequest;
import com.sapr.orderdetail.entity.OrderDetailEntity;
import com.sapr.orderdetail.repository.OrderDetailRepository;
import com.sapr.orderdetail.service.OrderDetailService;
import com.sapr.product.entity.ProductEntity;
import com.sapr.product.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderDetailServiceImpl implements OrderDetailService {

    private final OrderDetailRepository orderDetailRepository;
    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;

    @Override
    public List<OrderDetailEntity> findByOrder(Long orderId) {
        return orderDetailRepository.findByOrderId(orderId);
    }

    @Override
    public OrderDetailEntity addDetail(OrderDetailRequest request) {
        OrderEntity order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new RuntimeException("Pedido no encontrado: " + request.getOrderId()));

        ProductEntity product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new RuntimeException("Producto no encontrado: " + request.getProductId()));

        double subtotal = product.getPrice() * request.getQuantity();

        OrderDetailEntity detail = OrderDetailEntity.builder()
                .order(order)
                .product(product)
                .quantity(request.getQuantity())
                .unitPrice(product.getPrice())
                .subtotal(subtotal)
                .build();

        OrderDetailEntity saved = orderDetailRepository.save(detail);
        recalculateTotal(order);
        return saved;
    }

    @Override
    public void removeDetail(Long detailId) {
        OrderDetailEntity detail = orderDetailRepository.findById(detailId)
                .orElseThrow(() -> new RuntimeException("Detalle no encontrado: " + detailId));
        OrderEntity order = detail.getOrder();
        orderDetailRepository.deleteById(detailId);
        recalculateTotal(order);
    }

    private void recalculateTotal(OrderEntity order) {
        double total = orderDetailRepository.findByOrderId(order.getId())
                .stream()
                .mapToDouble(OrderDetailEntity::getSubtotal)
                .sum();
        order.setTotal(total);
        orderRepository.save(order);
    }
}
