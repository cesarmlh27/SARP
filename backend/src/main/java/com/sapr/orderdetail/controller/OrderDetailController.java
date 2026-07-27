package com.sapr.orderdetail.controller;

import com.sapr.orderdetail.dto.OrderDetailRequest;
import com.sapr.orderdetail.entity.OrderDetailEntity;
import com.sapr.orderdetail.service.OrderDetailService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/order-details")
@RequiredArgsConstructor
public class OrderDetailController {

    private final OrderDetailService orderDetailService;

    @GetMapping("/order/{orderId}")
    public List<OrderDetailEntity> findByOrder(@PathVariable Long orderId) {
        return orderDetailService.findByOrder(orderId);
    }

    @PostMapping
    public OrderDetailEntity addDetail(@RequestBody OrderDetailRequest request) {
        return orderDetailService.addDetail(request);
    }

    @DeleteMapping("/{id}")
    public void removeDetail(@PathVariable Long id) {
        orderDetailService.removeDetail(id);
    }
}
