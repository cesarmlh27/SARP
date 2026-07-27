package com.sapr.order.controller;

import com.sapr.order.dto.KitchenTicketDto;
import com.sapr.order.dto.OrderRequest;
import com.sapr.order.entity.OrderEntity;
import com.sapr.order.entity.OrderStatus;
import com.sapr.order.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @GetMapping
    public List<OrderEntity> findAll(Authentication authentication) {
        return orderService.findAll(authentication.getName(), resolveRole(authentication));
    }

    @PostMapping
    public OrderEntity create(@RequestBody OrderRequest request, Authentication authentication) {
        return orderService.create(request, authentication.getName());
    }

    @GetMapping("/{id}")
    public OrderEntity findById(@PathVariable Long id) {
        return orderService.findById(id);
    }

    @PatchMapping("/{id}/status")
    public OrderEntity changeStatus(@PathVariable Long id, @RequestParam OrderStatus status, Authentication authentication) {
        return orderService.changeStatus(id, status, authentication.getName(), resolveRole(authentication));
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        orderService.delete(id);
    }

    @GetMapping("/status/{status}")
    public List<OrderEntity> findByStatus(@PathVariable OrderStatus status) {
        return orderService.findByStatus(status);
    }

    @GetMapping("/table/{tableId}")
    public List<OrderEntity> findByTable(@PathVariable Long tableId) {
        return orderService.findByTable(tableId);
    }

    @GetMapping("/kitchen/tickets")
    public List<KitchenTicketDto> findKitchenTickets() {
        return orderService.findKitchenTickets();
    }

    private String resolveRole(Authentication authentication) {
        return authentication.getAuthorities().stream()
                .findFirst()
                .map(authority -> authority.getAuthority().replace("ROLE_", ""))
                .orElse("");
    }
}
