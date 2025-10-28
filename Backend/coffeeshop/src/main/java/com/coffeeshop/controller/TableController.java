package com.coffeeshop.controller;

import com.coffeeshop.dto.TableRequest;
import com.coffeeshop.dto.TableResponse;
import com.coffeeshop.service.TableService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tables")
public class TableController {

    private final TableService tableService;

    public TableController(TableService tableService) {
        this.tableService = tableService;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<TableResponse> getAllTables() {
        return tableService.getAllTables();
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public TableResponse createTable(@RequestBody TableRequest request) {
        return tableService.createTable(request);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public TableResponse updateTable(@PathVariable Long id, @RequestBody TableRequest request) {
        return tableService.updateTable(id, request);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteTable(@PathVariable Long id) {
        tableService.deleteTable(id);
        return ResponseEntity.noContent().build();
    }
}