package com.sapr.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsDto {
    private Double salesToday;
    private Double salesThisMonth;
    private Double totalRevenue;
    private Long activeOrders;
    private Long occupiedTables;
    private List<Map<String, Object>> topProducts;
    private List<Map<String, Object>> topCategories;
}
