package com.sapr.order.service.impl;

import com.sapr.order.dto.KitchenTicketDto;
import com.sapr.order.dto.KitchenTicketItemDto;
import com.sapr.order.dto.OrderRequest;
import com.sapr.order.entity.OrderEntity;
import com.sapr.order.entity.OrderStatus;
import com.sapr.order.repository.OrderRepository;
import com.sapr.payment.repository.PaymentRepository;
import com.sapr.order.service.OrderService;
import com.sapr.orderdetail.entity.OrderDetailEntity;
import com.sapr.orderdetail.repository.OrderDetailRepository;
import com.sapr.table.entity.RestaurantTableEntity;
import com.sapr.table.entity.TableStatus;
import com.sapr.table.repository.RestaurantTableRepository;
import com.sapr.user.entity.UserEntity;
import com.sapr.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final RestaurantTableRepository tableRepository;
    private final UserRepository userRepository;
    private final OrderDetailRepository orderDetailRepository;
    private final PaymentRepository paymentRepository;

    @Override
    public List<OrderEntity> findAll(String userEmail, String userRole) {
        if ("ADMIN".equalsIgnoreCase(userRole) || "CAJERO".equalsIgnoreCase(userRole)) {
            return orderRepository.findAll();
        }

        if ("COCINA".equalsIgnoreCase(userRole)) {
            return orderRepository.findByStatusInOrderByCreatedAtAsc(activeStatuses());
        }

        if ("MESERO".equalsIgnoreCase(userRole)) {
            UserEntity user = userRepository.findByEmail(userEmail)
                    .orElseThrow(() -> new RuntimeException("Usuario no encontrado: " + userEmail));

            return orderRepository.findByUserId(user.getId())
                    .stream()
                    .filter(order -> activeStatuses().contains(order.getStatus()))
                    .collect(Collectors.toList());
        }

        return List.of();
    }

    @Override
    public OrderEntity create(OrderRequest request, String userEmail) {
        RestaurantTableEntity table = tableRepository.findById(request.getTableId())
                .orElseThrow(() -> new RuntimeException("Mesa no encontrada: " + request.getTableId()));

        if (table.getStatus() == TableStatus.OCCUPIED) {
            throw new RuntimeException("La mesa ya está ocupada");
        }

        UserEntity user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado: " + userEmail));

        table.setStatus(TableStatus.OCCUPIED);
        tableRepository.save(table);

        return orderRepository.save(OrderEntity.builder()
                .restaurantTable(table)
                .user(user)
                .status(OrderStatus.PENDING)
                .createdAt(LocalDateTime.now())
                .total(0.0)
                .build());
    }

    @Override
    public OrderEntity findById(Long id) {
        return orderRepository.findById(id).orElse(null);
    }

    @Override
    public OrderEntity changeStatus(Long id, OrderStatus status, String userEmail, String userRole) {
        OrderEntity order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pedido no encontrado: " + id));

        enforceRoleStatusRules(order, status, userEmail, userRole);

        validateStatusTransition(order, status);

        order.setStatus(status);

        if (status == OrderStatus.CANCELLED) {
            order.getRestaurantTable().setStatus(TableStatus.AVAILABLE);
            tableRepository.save(order.getRestaurantTable());
        }

        return orderRepository.save(order);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        OrderEntity order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pedido no encontrado: " + id));

        paymentRepository.deleteByOrderId(id);
        orderDetailRepository.deleteByOrderId(id);

        order.getRestaurantTable().setStatus(TableStatus.AVAILABLE);
        tableRepository.save(order.getRestaurantTable());

        orderRepository.delete(order);
    }

    @Override
    public List<OrderEntity> findByStatus(OrderStatus status) {
        return orderRepository.findByStatus(status);
    }

    @Override
    public List<OrderEntity> findByTable(Long tableId) {
        return orderRepository.findByRestaurantTableId(tableId);
    }

    @Override
    public List<KitchenTicketDto> findKitchenTickets() {
        List<OrderStatus> kitchenStatuses = activeStatuses();

        return orderRepository.findByStatusInOrderByCreatedAtAsc(kitchenStatuses)
                .stream()
                .map(order -> {
                    List<KitchenTicketItemDto> items = orderDetailRepository.findByOrderId(order.getId())
                            .stream()
                            .map(this::toKitchenItem)
                            .collect(Collectors.toList());

                    return KitchenTicketDto.builder()
                            .orderId(order.getId())
                            .tableNumber(order.getRestaurantTable().getTableNumber())
                            .waiterName(order.getUser().getFirstName() + " " + order.getUser().getLastName())
                            .status(order.getStatus())
                            .createdAt(order.getCreatedAt())
                            .total(order.getTotal())
                            .items(items)
                            .build();
                })
                .collect(Collectors.toList());
    }

    private KitchenTicketItemDto toKitchenItem(OrderDetailEntity detail) {
        return new KitchenTicketItemDto(detail.getProduct().getName(), detail.getQuantity());
    }

    private void validateStatusTransition(OrderEntity order, OrderStatus nextStatus) {
        OrderStatus currentStatus = order.getStatus();

        if (currentStatus == nextStatus) {
            return;
        }

        if (nextStatus == OrderStatus.IN_PROGRESS && orderDetailRepository.findByOrderId(order.getId()).isEmpty()) {
            throw new RuntimeException("No puedes enviar a cocina una comanda sin productos");
        }

        boolean isValidTransition = switch (currentStatus) {
            case PENDING -> nextStatus == OrderStatus.IN_PROGRESS || nextStatus == OrderStatus.CANCELLED;
            case IN_PROGRESS -> nextStatus == OrderStatus.READY || nextStatus == OrderStatus.CANCELLED;
            case READY -> nextStatus == OrderStatus.DELIVERED;
            case DELIVERED -> nextStatus == OrderStatus.PAID;
            case CANCELLED, PAID -> false;
        };

        if (!isValidTransition) {
            throw new RuntimeException("Transicion de estado no permitida: " + currentStatus + " -> " + nextStatus);
        }
    }

    private void enforceRoleStatusRules(OrderEntity order, OrderStatus nextStatus, String userEmail, String userRole) {
        if ("ADMIN".equalsIgnoreCase(userRole) || "CAJERO".equalsIgnoreCase(userRole)) {
            return;
        }

        if ("COCINA".equalsIgnoreCase(userRole)) {
            if (nextStatus != OrderStatus.IN_PROGRESS && nextStatus != OrderStatus.READY) {
                throw new RuntimeException("Cocina solo puede cambiar pedidos a preparacion o listo");
            }
            return;
        }

        if ("MESERO".equalsIgnoreCase(userRole)) {
            if (!order.getUser().getEmail().equalsIgnoreCase(userEmail)) {
                throw new RuntimeException("No puedes gestionar pedidos de otro mesero");
            }

            if (nextStatus != OrderStatus.CANCELLED && nextStatus != OrderStatus.DELIVERED) {
                throw new RuntimeException("Mesero solo puede cancelar o marcar como entregado");
            }
            return;
        }

        throw new RuntimeException("No autorizado para cambiar estado de pedidos");
    }

    private List<OrderStatus> activeStatuses() {
        return List.of(OrderStatus.PENDING, OrderStatus.IN_PROGRESS, OrderStatus.READY, OrderStatus.DELIVERED);
    }
}
