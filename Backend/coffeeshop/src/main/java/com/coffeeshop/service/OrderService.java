package com.coffeeshop.service;

import com.coffeeshop.dto.OrderRequest;
import com.coffeeshop.dto.OrderItemRequest;
import com.coffeeshop.dto.OrderResponse;
import com.coffeeshop.dto.ReservationRequest;
import com.coffeeshop.entity.*;
import com.coffeeshop.repository.OrderItemRepository;
import com.coffeeshop.repository.OrderRepository;
import com.coffeeshop.repository.PaymentRepository;
import com.coffeeshop.repository.ProductRepository;
import com.coffeeshop.repository.UserRepository;
import com.coffeeshop.repository.TableRepository;
import org.hibernate.Hibernate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class OrderService {

    private static final Logger logger = LoggerFactory.getLogger(OrderService.class);

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final PaymentRepository paymentRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final TableRepository tableRepository;
    private final ReservationService reservationService;

    public OrderService(OrderRepository orderRepository, OrderItemRepository orderItemRepository,
                        PaymentRepository paymentRepository, UserRepository userRepository,
                        ProductRepository productRepository, TableRepository tableRepository,
                        ReservationService reservationService) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.paymentRepository = paymentRepository;
        this.userRepository = userRepository;
        this.productRepository = productRepository;
        this.tableRepository = tableRepository;
        this.reservationService = reservationService;
    }

    private OrderResponse toOrderResponse(Order order) {
        OrderResponse.UserResponse userResponse = new OrderResponse.UserResponse(
                order.getUser().getId(),
                order.getUser().getEmail()
        );

        OrderResponse.TableResponse tableResponse = order.getTable() != null ? new OrderResponse.TableResponse(
                order.getTable().getId(),
                order.getTable().getTableName(),
                order.getTable().getCapacity(),
                order.getTable().getStatus().name(),
                order.getTable().getReservations().stream().map(reservation -> new OrderResponse.ReservationResponse(
                        reservation.getId(),
                        new OrderResponse.UserResponse(
                                reservation.getUser().getId(),
                                reservation.getUser().getEmail()
                        ),
                        reservation.getNumPeople(),
                        reservation.getReservationTime(),
                        reservation.getStatus().name()
                )).collect(Collectors.toList())
        ) : null;

        List<OrderResponse.OrderItemResponse> itemResponses = order.getItems().stream().map(item ->
                new OrderResponse.OrderItemResponse(
                        item.getId(),
                        new OrderResponse.ProductResponse(
                                item.getProduct().getId(),
                                item.getProduct().getName(),
                                item.getProduct().getPrice(),
                                item.getProduct().getImageUrl()
                        ),
                        item.getQuantity(),
                        item.getPrice()
                )
        ).collect(Collectors.toList());

        return new OrderResponse(
                order.getId(),
                userResponse,
                tableResponse,
                order.getOrderTime(),
                order.getTotalAmount(),
                order.getStatus().name(),
                itemResponses
        );
    }

    public List<OrderResponse> getAllOrders() {
        List<Order> orders = orderRepository.findAll();
        return orders.stream().map(this::toOrderResponse).collect(Collectors.toList());
    }

    public List<OrderResponse> getOrdersByUserId(Long userId) {
        User currentUser = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (!currentUser.getId().equals(userId) && !currentUser.getRole().equals(Role.ADMIN)) {
            throw new RuntimeException("Access denied.");
        }
        List<Order> orders = orderRepository.findByUserId(userId);
        return orders.stream().map(this::toOrderResponse).collect(Collectors.toList());
    }

    public OrderResponse getOrderById(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found."));
        User currentUser = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (!currentUser.getId().equals(order.getUser().getId()) && !currentUser.getRole().equals(Role.ADMIN)) {
            throw new RuntimeException("Access denied.");
        }
        return toOrderResponse(order);
    }

    public OrderResponse createOrder(OrderRequest request) {
        User currentUser = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new RuntimeException("User not found."));

        Table table = null;
        if (request.tableId() != null) {
            table = tableRepository.findById(request.tableId())
                    .orElseThrow(() -> new RuntimeException("Table not found."));
        }

        Order order = new Order();
        order.setUser(user);
        order.setOrderTime(LocalDateTime.now());

        if (request.orderStatus() != null && request.orderStatus().equals("CANCELLED")) {
            order.setStatus(OrderStatus.CANCELLED);
            if (table != null) {
                table.setStatus(TableStatus.NOT_BOOKED);
                tableRepository.save(table);
            }
        } else {
            order.setStatus(OrderStatus.PENDING);
        }
        order.setTotalAmount(0.0);
        order.setTable(table);
        order = orderRepository.save(order);

        double totalAmount = 0.0;
        for (OrderItemRequest itemRequest : request.items()) {
            Product product = productRepository.findById(itemRequest.productId())
                    .orElseThrow(() -> new RuntimeException("Product not found."));
            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setProduct(product);
            orderItem.setQuantity(itemRequest.quantity());
            orderItem.setPrice(product.getPrice());
            totalAmount += product.getPrice() * itemRequest.quantity();
            orderItemRepository.save(orderItem);
        }

        order.setTotalAmount(totalAmount);
        order = orderRepository.save(order);

        Payment payment = new Payment();
        payment.setOrder(order);
        payment.setAmount(totalAmount);
        payment.setStatus(PaymentStatus.PENDING);
        payment.setPaymentTime(LocalDateTime.now());
        payment.setTransactionId("PENDING_" + order.getId());
        if (order.getPayments() == null) {
            order.setPayments(new ArrayList<>());
        }
        order.getPayments().add(payment);
        paymentRepository.save(payment);

        if (request.tableId() != null && order.getStatus() != OrderStatus.CANCELLED) {
            if (request.numPeople() == null || request.numPeople() <= 0) {
                throw new IllegalArgumentException("Number of people must be provided and greater than 0 for reservation.");
            }

            ReservationRequest reservationRequest = new ReservationRequest(
                    currentUser.getId(),
                    request.tableId(),
                    request.numPeople(),
                    order.getOrderTime(),
                    request.reservationContent()
            );

            reservationService.createReservation(reservationRequest);
        }

        return toOrderResponse(order);
    }
    public OrderResponse updateOrderStatus(Long id, OrderStatus status) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found."));
        order.setStatus(status);
        order = orderRepository.save(order);
        return toOrderResponse(order);
    }

    public void deleteOrder(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found."));
        User currentUser = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (!currentUser.getId().equals(order.getUser().getId()) && !currentUser.getRole().equals(Role.ADMIN)) {
            throw new RuntimeException("Access denied.");
        }
        if (order.getStatus() == OrderStatus.COMPLETED) {
            throw new RuntimeException("Cannot delete completed order.");
        }
        orderRepository.deleteById(id);
    }
}