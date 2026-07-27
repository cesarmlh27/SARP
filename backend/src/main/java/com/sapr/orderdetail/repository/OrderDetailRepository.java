package com.sapr.orderdetail.repository;

import com.sapr.orderdetail.entity.OrderDetailEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface OrderDetailRepository extends JpaRepository<OrderDetailEntity, Long> {

    List<OrderDetailEntity> findByOrderId(Long orderId);

       void deleteByOrderId(Long orderId);

    @Query("SELECT od.product.id, od.product.name, SUM(od.quantity) " +
           "FROM OrderDetailEntity od " +
           "GROUP BY od.product.id, od.product.name " +
           "ORDER BY SUM(od.quantity) DESC")
    List<Object[]> findTopProducts();

    @Query("SELECT od.product.category.id, od.product.category.name, SUM(od.quantity) " +
           "FROM OrderDetailEntity od " +
           "GROUP BY od.product.category.id, od.product.category.name " +
           "ORDER BY SUM(od.quantity) DESC")
    List<Object[]> findTopCategories();
}
