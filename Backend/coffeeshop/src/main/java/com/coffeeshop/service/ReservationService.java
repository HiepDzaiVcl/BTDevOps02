package com.coffeeshop.service;

import com.coffeeshop.dto.ReservationRequest;
import com.coffeeshop.entity.*;
import com.coffeeshop.repository.ReservationRepository;
import com.coffeeshop.repository.TableRepository;
import com.coffeeshop.repository.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ReservationService {

    private final ReservationRepository reservationRepository;
    private final TableRepository tableRepository;
    private final UserRepository userRepository;

    public ReservationService(ReservationRepository reservationRepository, TableRepository tableRepository, UserRepository userRepository) {
        this.reservationRepository = reservationRepository;
        this.tableRepository = tableRepository;
        this.userRepository = userRepository;
    }


    public Reservation createReservation(ReservationRequest request) {
        User currentUser = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (currentUser == null) {
            throw new RuntimeException("User not authenticated.");
        }

        User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new RuntimeException("User not found."));

        Table selectedTable = tableRepository.findById(request.tableId())
                .orElseThrow(() -> new RuntimeException("Table not found."));

        if (selectedTable.getCapacity() < request.numPeople()) {
            throw new RuntimeException("Table capacity is not sufficient for the number of people.");
        }

        LocalDateTime startTime = request.reservationTime();
        LocalDateTime endTime = startTime.plusHours(2);
        List<Reservation> overlappingReservations = reservationRepository.findByTableIdAndReservationTimeBetween(
                selectedTable.getId(),
                startTime.minusHours(2),
                endTime
        );

        boolean hasOverlap = overlappingReservations.stream().anyMatch(reservation ->
                reservation.getStatus() == ReservationStatus.BOOKED &&
                        (startTime.isBefore(reservation.getReservationTime().plusHours(2)) &&
                                endTime.isAfter(reservation.getReservationTime()))
        );

        if (hasOverlap) {
            throw new RuntimeException("The selected table is already booked for the requested time.");
        }

        if (selectedTable.getStatus() == TableStatus.BOOKED) {
            throw new RuntimeException("The selected table is already booked.");
        }

        selectedTable.setStatus(TableStatus.BOOKED);
        tableRepository.save(selectedTable);

        Reservation reservation = new Reservation();
        reservation.setTable(selectedTable);
        reservation.setUser(user);
        reservation.setNumPeople(request.numPeople());
        reservation.setReservationTime(request.reservationTime());
        reservation.setStatus(ReservationStatus.BOOKED);
        reservation.setContent(request.content());

        return reservationRepository.save(reservation);
    }

    public List<Reservation> getReservationsByUserId(Long userId) {
        User currentUser = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (!currentUser.getId().equals(userId) && !currentUser.getRole().equals(Role.ADMIN)) {
            throw new RuntimeException("Access denied.");
        }
        return reservationRepository.findByUserId(userId);
    }

    public List<Reservation> getReservations() {
        return reservationRepository.findAll();
    }

    public void cancelReservation(Long reservationId) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new RuntimeException("Reservation not found."));
        User currentUser = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (!currentUser.getId().equals(reservation.getUser().getId()) && !currentUser.getRole().equals(Role.ADMIN)) {
            throw new RuntimeException("Access denied.");
        }
        Table table = reservation.getTable();
        table.setStatus(TableStatus.NOT_BOOKED);
        tableRepository.save(table);
        reservationRepository.deleteById(reservationId);
    }
}