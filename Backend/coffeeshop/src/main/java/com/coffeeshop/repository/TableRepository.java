package com.coffeeshop.repository;

import com.coffeeshop.entity.Table;
import com.coffeeshop.entity.TableStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TableRepository extends JpaRepository<Table, Long> {

    List<Table> findByStatusAndCapacityGreaterThanEqual(TableStatus status, int capacity);
}