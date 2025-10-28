package com.coffeeshop.service;

import com.coffeeshop.config.JwtTokenProvider;
import com.coffeeshop.dto.LoginRequest;
import com.coffeeshop.dto.RegisterRequest;
import com.coffeeshop.dto.TokenResponse;
import com.coffeeshop.dto.UserResponse;
import com.coffeeshop.entity.RefreshToken;
import com.coffeeshop.entity.Role;
import com.coffeeshop.entity.User;
import com.coffeeshop.repository.UserRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final RefreshTokenService refreshTokenService;

    public AuthService(AuthenticationManager authenticationManager, JwtTokenProvider jwtTokenProvider, UserRepository userRepository, BCryptPasswordEncoder passwordEncoder, RefreshTokenService refreshTokenService) {
        this.authenticationManager = authenticationManager;
        this.jwtTokenProvider = jwtTokenProvider;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.refreshTokenService = refreshTokenService;
    }

    @Transactional
    public TokenResponse login(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.email(), loginRequest.password())
        );
        String accessToken = jwtTokenProvider.generateToken(authentication);
        User user = userRepository.findByEmail(loginRequest.email())
                .orElseThrow(() -> new RuntimeException("User not found"));
        refreshTokenService.deleteByUserId(user.getId());
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(user.getId());
        return new TokenResponse(accessToken, refreshToken.getToken());
    }

    public String register(RegisterRequest registerRequest) {
        if (userRepository.findByEmail(registerRequest.email()).isPresent()) {
            throw new RuntimeException("Email already exists.");
        }

        User user = new User();
        user.setName(registerRequest.name());
        user.setPhoneNumber(registerRequest.phoneNumber());
        user.setEmail(registerRequest.email());
        user.setPassword(passwordEncoder.encode(registerRequest.password()));
        user.setRole(Role.CUSTOMER);

        userRepository.save(user);
        return "User registered successfully.";
    }

    @Transactional
    public TokenResponse refreshToken(String refreshToken) {
        System.out.println("Refreshing token: " + refreshToken);
        RefreshToken token = refreshTokenService.findByToken(refreshToken)
                .orElseThrow(() -> new RuntimeException("Invalid refresh token"));
        refreshTokenService.verifyExpiration(token);
        String accessToken = jwtTokenProvider.generateTokenFromUsername(token.getUser().getEmail());
        refreshTokenService.deleteByUserId(token.getUser().getId());
        RefreshToken newRefreshToken = refreshTokenService.createRefreshToken(token.getUser().getId());
        System.out.println("New refresh token created: " + newRefreshToken.getToken());
        return new TokenResponse(accessToken, newRefreshToken.getToken());
    }

    public UserResponse getCurrentUser(String token) {
        String email = jwtTokenProvider.getUsernameFromJWT(token);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return new UserResponse(user.getId(), user.getName(), user.getEmail(),  user.getPhoneNumber(), user.getRole().name());
    }
}