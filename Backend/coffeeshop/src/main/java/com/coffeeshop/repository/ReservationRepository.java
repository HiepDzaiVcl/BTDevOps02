package com.coffeeshop.repository;

import com.coffeeshop.entity.Reservation;
import com.coffeeshop.entity.Table;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, Long> {

    List<Reservation> findByUserId(Long userId);

    List<Reservation> findByReservationTimeBetween(LocalDateTime start, LocalDateTime end);
    List<Reservation> findByTable(Table table);

    List<Reservation> findByTableIdAndReservationTimeBetween(Long tableId, LocalDateTime start, LocalDateTime end);
}