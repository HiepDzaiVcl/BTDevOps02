package com.coffeeshop.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.coffeeshop.entity.Menu;
import com.coffeeshop.entity.Product;
import com.coffeeshop.repository.MenuRepository;
import com.coffeeshop.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final MenuRepository menuRepository;
    private final Cloudinary cloudinary;

    public ProductService(ProductRepository productRepository, MenuRepository menuRepository, Cloudinary cloudinary) {
        this.productRepository = productRepository;
        this.menuRepository = menuRepository;
        this.cloudinary = cloudinary;
    }

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    public List<Product> getProductsByCategory(Long categoryId) {
        return productRepository.findByCategoryId(categoryId);
    }

    public Product getProductById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found."));
    }

    public Product createProduct(Product product, Long categoryId, MultipartFile imageFile) throws IOException {
        Menu category = menuRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Menu category not found."));
        product.setCategory(category);

        if (imageFile != null && !imageFile.isEmpty()) {
            Map uploadResult = cloudinary.uploader().upload(imageFile.getBytes(), ObjectUtils.asMap(
                    "folder", "coffee-shop/products",
                    "resource_type", "image"
            ));
            product.setImageUrl((String) uploadResult.get("secure_url"));
        }

        return productRepository.save(product);
    }

    public Product updateProduct(Long id, Product product, Long categoryId, MultipartFile imageFile) throws IOException {
        Product existing = getProductById(id);
        existing.setName(product.getName());
        existing.setPrice(product.getPrice());
        existing.setDescription(product.getDescription());
        if (categoryId != null) {
            Menu category = menuRepository.findById(categoryId)
                    .orElseThrow(() -> new RuntimeException("Menu category not found."));
            existing.setCategory(category);
        }
        if (imageFile != null && !imageFile.isEmpty()) {
            Map uploadResult = cloudinary.uploader().upload(imageFile.getBytes(), ObjectUtils.asMap(
                    "folder", "coffee-shop/products",
                    "resource_type", "image"
            ));
            existing.setImageUrl((String) uploadResult.get("secure_url"));
        }
        return productRepository.save(existing);
    }

    public void deleteProduct(Long id) {
        Product product = getProductById(id);
        if (product.getImageUrl() != null) {
            try {
                String publicId = extractPublicId(product.getImageUrl());
                cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
            } catch (IOException e) {
                throw new RuntimeException("Failed to delete image from Cloudinary", e);
            }
        }
        productRepository.deleteById(id);
    }

    private String extractPublicId(String imageUrl) {
        String[] parts = imageUrl.split("/");
        String fileName = parts[parts.length - 1];
        return "coffee-shop/products/" + fileName.substring(0, fileName.lastIndexOf("."));
    }
}