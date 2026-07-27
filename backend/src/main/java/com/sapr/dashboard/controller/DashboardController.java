package com.sapr.dashboard.controller;

import com.sapr.dashboard.dto.DashboardStatsDto;
import com.sapr.dashboard.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping
    public DashboardStatsDto getStats() {
        return dashboardService.getStats();
    }
}
