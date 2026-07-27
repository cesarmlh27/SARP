package com.sapr.table.service.impl;

import com.sapr.table.entity.RestaurantTableEntity;
import com.sapr.table.entity.TableStatus;
import com.sapr.table.repository.RestaurantTableRepository;
import com.sapr.table.service.RestaurantTableService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RestaurantTableServiceImpl implements RestaurantTableService {

    private final RestaurantTableRepository tableRepository;

    @Override
    public List<RestaurantTableEntity> findAll() {
        return tableRepository.findAll();
    }

    @Override
    public RestaurantTableEntity save(RestaurantTableEntity table) {
        if (tableRepository.existsByTableNumber(table.getTableNumber())) {
            throw new RuntimeException("Ya existe una mesa con el número: " + table.getTableNumber());
        }
        table.setStatus(TableStatus.AVAILABLE);
        return tableRepository.save(table);
    }

    @Override
    public RestaurantTableEntity findById(Long id) {
        return tableRepository.findById(id).orElse(null);
    }

    @Override
    public RestaurantTableEntity update(Long id, RestaurantTableEntity table) {
        RestaurantTableEntity existing = tableRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Mesa no encontrada: " + id));
        existing.setTableNumber(table.getTableNumber());
        existing.setCapacity(table.getCapacity());
        return tableRepository.save(existing);
    }

    @Override
    public void delete(Long id) {
        tableRepository.deleteById(id);
    }

    @Override
    public List<RestaurantTableEntity> findByStatus(TableStatus status) {
        return tableRepository.findByStatus(status);
    }

    @Override
    public RestaurantTableEntity changeStatus(Long id, TableStatus status) {
        RestaurantTableEntity table = tableRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Mesa no encontrada: " + id));
        table.setStatus(status);
        return tableRepository.save(table);
    }
}
