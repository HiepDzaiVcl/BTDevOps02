package com.coffeeshop.service;

import com.coffeeshop.dto.TableRequest;
import com.coffeeshop.dto.TableResponse;
import com.coffeeshop.entity.Reservation;
import com.coffeeshop.entity.Table;
import com.coffeeshop.entity.TableStatus;
import com.coffeeshop.repository.ReservationRepository;
import com.coffeeshop.repository.TableRepository;
import org.hibernate.Hibernate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TableService {

    private final TableRepository tableRepository;
    private final ReservationRepository reservationRepository;

    public TableService(TableRepository tableRepository, ReservationRepository reservationRepository) {
        this.tableRepository = tableRepository;
        this.reservationRepository = reservationRepository;
    }

    private TableResponse toTableResponse(Table table) {
        Hibernate.initialize(table.getReservations());
        table.getReservations().forEach(reservation -> {
            Hibernate.initialize(reservation.getUser());
        });

        List<TableResponse.ReservationResponse> reservationResponses = table.getReservations().stream()
                .map(reservation -> new TableResponse.ReservationResponse(
                        reservation.getId(),
                        new TableResponse.UserResponse(
                                reservation.getUser().getId(),
                                reservation.getUser().getEmail()
                        ),
                        reservation.getNumPeople(),
                        reservation.getReservationTime().toString(),
                        reservation.getStatus().name()
                ))
                .collect(Collectors.toList());

        return new TableResponse(
                table.getId(),
                table.getTableName(),
                table.getCapacity(),
                table.getStatus().name(),
                reservationResponses
        );
    }

    public List<TableResponse> getAllTables() {
        List<Table> tables = tableRepository.findAll();
        return tables.stream().map(this::toTableResponse).collect(Collectors.toList());
    }

    public TableResponse createTable(TableRequest request) {
        if (request.capacity() <= 0) {
            throw new IllegalArgumentException("Capacity must be greater than 0");
        }

        Table table = new Table();
        table.setCapacity(request.capacity());
        table.setStatus(TableStatus.NOT_BOOKED);
        table.setTableName(request.tableName());

        Table savedTable = tableRepository.save(table);
        return toTableResponse(tableRepository.save(savedTable));
    }

    public TableResponse updateTable(Long id, TableRequest request) {
        Table existingTable = tableRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Table not found"));

        if (request.capacity() <= 0) {
            throw new IllegalArgumentException("Capacity must be greater than 0");
        }

        if (request.status() == TableStatus.BOOKED) {
            List<Reservation> reservations = reservationRepository.findByTable(existingTable);
            if (reservations.isEmpty()) {
                throw new IllegalStateException("Cannot set table to BOOKED without an active reservation");
            }
        }

        existingTable.setTableName(request.tableName());
        existingTable.setCapacity(request.capacity());
        existingTable.setStatus(request.status());
        return toTableResponse(tableRepository.save(existingTable));
    }

    public void deleteTable(Long id) {
        Table table = tableRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Table not found"));

        List<Reservation> reservations = reservationRepository.findByTable(table);
        if (!reservations.isEmpty()) {
            throw new IllegalStateException("Cannot delete table with active reservations");
        }

        tableRepository.deleteById(id);
    }
}