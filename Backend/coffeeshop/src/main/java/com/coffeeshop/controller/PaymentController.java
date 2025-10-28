package com.coffeeshop.controller;

import com.coffeeshop.entity.*;
import com.coffeeshop.repository.OrderRepository;
import com.coffeeshop.repository.PaymentRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private static final Logger logger = LoggerFactory.getLogger(PaymentController.class);

    private final OrderRepository orderRepository;
    private final PaymentRepository paymentRepository;

    public PaymentController(OrderRepository orderRepository, PaymentRepository paymentRepository) {
        this.orderRepository = orderRepository;
        this.paymentRepository = paymentRepository;
    }

    @GetMapping("/success")
    public ResponseEntity<Map<String, Object>> paymentSuccess(@RequestParam("orderId") Long orderId,
                                                              @RequestParam("paymentId") String paymentId,
                                                              @RequestParam("PayerID") String payerId) {
        try {
            Order order = orderRepository.findById(orderId)
                    .orElseThrow(() -> new RuntimeException("Order not found."));

            Payment paymentEntity = order.getPayments().stream()
                    .filter(p -> p.getTransactionId() == null || p.getTransactionId().equals(paymentId))
                    .findFirst()
                    .orElseGet(() -> {
                        Payment newPayment = new Payment();
                        newPayment.setOrder(order);
                        newPayment.setAmount(order.getTotalAmount());
                        newPayment.setStatus(PaymentStatus.PENDING);
                        newPayment.setPaymentTime(LocalDateTime.now());
                        if (order.getPayments() == null) {
                            order.setPayments(new ArrayList<>());
                        }
                        order.getPayments().add(newPayment);
                        return newPayment;
                    });

            paymentEntity.setTransactionId(paymentId);
            paymentEntity.setStatus(PaymentStatus.COMPLETED);
            paymentEntity.setPaymentTime(LocalDateTime.now());
            paymentRepository.save(paymentEntity);


            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("message", "Payment successful! Your order is being processed.");
            response.put("orderId", orderId);
            return ResponseEntity.ok(response);

        } catch (Exception e) {

            Map<String, Object> response = new HashMap<>();
            response.put("status", "error");
            response.put("message", "Payment processing failed: " + e.getMessage());
            response.put("orderId", orderId);
            return ResponseEntity.status(500).body(response);
        }
    }

    @GetMapping("/cancel")
    public ResponseEntity<Map<String, Object>> paymentCancel(@RequestParam("orderId") Long orderId) {
        try {
            Order order = orderRepository.findById(orderId)
                    .orElseThrow(() -> new RuntimeException("Order not found."));

            // Tìm hoặc tạo bản ghi Payment
            Payment paymentEntity = order.getPayments().stream()
                    .findFirst()
                    .orElseGet(() -> {
                        Payment newPayment = new Payment();
                        newPayment.setOrder(order);
                        newPayment.setAmount(order.getTotalAmount());
                        newPayment.setStatus(PaymentStatus.PENDING);
                        newPayment.setPaymentTime(LocalDateTime.now());
                        if (order.getPayments() == null) {
                            order.setPayments(new ArrayList<>());
                        }
                        order.getPayments().add(newPayment);
                        return newPayment;
                    });

            // Cập nhật trạng thái thanh toán thành CANCELLED
            paymentEntity.setStatus(PaymentStatus.CANCELLED);
            paymentEntity.setPaymentTime(LocalDateTime.now());
            paymentRepository.save(paymentEntity);

            logger.info("Payment cancelled for orderId: {}", orderId);

            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("message", "Payment cancelled successfully.");
            response.put("orderId", orderId);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            logger.error("Error cancelling payment for orderId: {}", orderId, e);

            Map<String, Object> response = new HashMap<>();
            response.put("status", "error");
            response.put("message", "Failed to cancel payment: " + e.getMessage());
            response.put("orderId", orderId);
            return ResponseEntity.status(500).body(response);
        }
    }
}