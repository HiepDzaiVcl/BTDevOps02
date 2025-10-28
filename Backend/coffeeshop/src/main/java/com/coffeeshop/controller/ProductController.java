package com.coffeeshop.controller;

import com.coffeeshop.entity.Product;
import com.coffeeshop.service.ProductService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService productService;
    private final ObjectMapper objectMapper;

    public ProductController(ProductService productService, ObjectMapper objectMapper) {
        this.productService = productService;
        this.objectMapper = objectMapper;
    }

    @GetMapping
    public List<Product> getAllProducts(@RequestParam(required = false) Long categoryId) {
        if (categoryId != null) {
            return productService.getProductsByCategory(categoryId);
        }
        return productService.getAllProducts();
    }

    @GetMapping("/{id}")
    public Product getProductById(@PathVariable Long id) {
        return productService.getProductById(id);
    }

    @PostMapping(consumes = { MediaType.MULTIPART_FORM_DATA_VALUE })
    @PreAuthorize("hasRole('ADMIN')")
    public Product createProduct(
            @RequestPart("product") String productJson,
            @RequestPart("categoryId") String categoryId,
            @RequestPart(value = "imageFile", required = false) MultipartFile imageFile) throws IOException {
        Product product = objectMapper.readValue(productJson, Product.class);
        Long catId = Long.parseLong(categoryId);
        return productService.createProduct(product, catId, imageFile);
    }

    @PutMapping(value = "/{id}", consumes = { MediaType.MULTIPART_FORM_DATA_VALUE })
    @PreAuthorize("hasRole('ADMIN')")
    public Product updateProduct(
            @PathVariable Long id,
            @RequestPart("product") String productJson,
            @RequestPart(value = "categoryId", required = false) String categoryId,
            @RequestPart(value = "imageFile", required = false) MultipartFile imageFile) throws IOException {
        Product product = objectMapper.readValue(productJson, Product.class);
        Long catId = categoryId != null ? Long.parseLong(categoryId) : null;
        return productService.updateProduct(id, product, catId, imageFile);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }
}