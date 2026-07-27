package com.sapr.payment.repository;

import com.sapr.payment.entity.PaymentEntity;
import com.sapr.payment.entity.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.Optional;

public interface PaymentRepository extends JpaRepository<PaymentEntity, Long> {

    Optional<PaymentEntity> findByOrderId(Long orderId);

    void deleteByOrderId(Long orderId);

    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM PaymentEntity p " +
           "WHERE p.status = :status AND p.paidAt BETWEEN :start AND :end")
    Double sumByStatusAndDateRange(@Param("start") LocalDateTime start,
                                   @Param("end") LocalDateTime end,
                                   @Param("status") PaymentStatus status);

    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM PaymentEntity p WHERE p.status = :status")
    Double sumByStatus(@Param("status") PaymentStatus status);
}
