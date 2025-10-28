package com.coffeeshop.service;

import com.coffeeshop.config.JwtTokenProvider;
import com.coffeeshop.entity.RefreshToken;
import com.coffeeshop.entity.User;
import com.coffeeshop.repository.RefreshTokenRepository;
import com.coffeeshop.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Optional;

@Service
public class RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;
    private final UserRepository userRepository;
    private final JwtTokenProvider jwtTokenProvider;

    public RefreshTokenService(RefreshTokenRepository refreshTokenRepository, UserRepository userRepository, JwtTokenProvider jwtTokenProvider) {
        this.refreshTokenRepository = refreshTokenRepository;
        this.userRepository = userRepository;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    public RefreshToken createRefreshToken(Long userId) {
        RefreshToken refreshToken = new RefreshToken();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        refreshToken.setUser(user);
        String token = jwtTokenProvider.generateRefreshToken(user.getEmail());
        refreshToken.setToken(token);
        refreshToken.setExpiryDate(Instant.now().plusMillis(604800000)); // 7 days
        return refreshTokenRepository.save(refreshToken);
    }

    public RefreshToken verifyExpiration(RefreshToken token) {
        if (token.getExpiryDate().compareTo(Instant.now()) < 0) {
            refreshTokenRepository.delete(token);
            throw new RuntimeException("Refresh token expired");
        }
        if (!jwtTokenProvider.validateToken(token.getToken())) {
            refreshTokenRepository.delete(token);
            throw new RuntimeException("Invalid refresh token");
        }
        return token;
    }

    public Optional<RefreshToken> findByToken(String token) {
        return refreshTokenRepository.findByToken(token);
    }

    public void deleteByUserId(Long userId) {
        refreshTokenRepository.deleteByUserId(userId);
    }
}