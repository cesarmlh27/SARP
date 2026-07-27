package com.sapr.dashboard.service.impl;

import com.sapr.dashboard.dto.DashboardStatsDto;
import com.sapr.dashboard.service.DashboardService;
import com.sapr.order.entity.OrderStatus;
import com.sapr.order.repository.OrderRepository;
import com.sapr.orderdetail.repository.OrderDetailRepository;
import com.sapr.payment.entity.PaymentStatus;
import com.sapr.payment.repository.PaymentRepository;
import com.sapr.table.entity.TableStatus;
import com.sapr.table.repository.RestaurantTableRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;
    private final OrderDetailRepository orderDetailRepository;
    private final RestaurantTableRepository tableRepository;

    @Override
    public DashboardStatsDto getStats() {
        LocalDate today = LocalDate.now();
        LocalDateTime startOfDay = today.atStartOfDay();
        LocalDateTime endOfDay = today.atTime(LocalTime.MAX);

        YearMonth currentMonth = YearMonth.now();
        LocalDateTime startOfMonth = currentMonth.atDay(1).atStartOfDay();
        LocalDateTime endOfMonth = currentMonth.atEndOfMonth().atTime(LocalTime.MAX);

        Double salesToday = paymentRepository.sumByStatusAndDateRange(
                startOfDay, endOfDay, PaymentStatus.COMPLETED);
        Double salesThisMonth = paymentRepository.sumByStatusAndDateRange(
                startOfMonth, endOfMonth, PaymentStatus.COMPLETED);
        Double totalRevenue = paymentRepository.sumByStatus(PaymentStatus.COMPLETED);

        long activeOrders = orderRepository.countByStatusNotIn(
                List.of(OrderStatus.PAID, OrderStatus.CANCELLED));

        long occupiedTables = tableRepository.findByStatus(TableStatus.OCCUPIED).size()
                + tableRepository.findByStatus(TableStatus.RESERVED).size();

        List<Map<String, Object>> topProducts = new ArrayList<>();
        for (Object[] row : orderDetailRepository.findTopProducts()) {
            topProducts.add(Map.of("id", row[0], "name", row[1], "totalSold", row[2]));
        }

        List<Map<String, Object>> topCategories = new ArrayList<>();
        for (Object[] row : orderDetailRepository.findTopCategories()) {
            topCategories.add(Map.of("id", row[0], "name", row[1], "totalSold", row[2]));
        }

        return DashboardStatsDto.builder()
                .salesToday(salesToday != null ? salesToday : 0.0)
                .salesThisMonth(salesThisMonth != null ? salesThisMonth : 0.0)
                .totalRevenue(totalRevenue != null ? totalRevenue : 0.0)
                .activeOrders(activeOrders)
                .occupiedTables(occupiedTables)
                .topProducts(topProducts)
                .topCategories(topCategories)
                .build();
    }
}
