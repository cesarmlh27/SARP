package com.sapr.auth.controller;

import com.sapr.auth.dto.LoginRequest;
import com.sapr.auth.dto.LoginResponse;
import com.sapr.auth.dto.RecoverPasswordRequest;
import com.sapr.auth.dto.ResetPasswordRequest;
import com.sapr.auth.dto.RegisterRequest;
import com.sapr.auth.service.AuthService;
import com.sapr.user.entity.UserEntity;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/register")
    @PreAuthorize("hasAnyRole('ADMIN','CAJERO')")
    public ResponseEntity<UserEntity> register(@RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/signup")
    @PreAuthorize("hasAnyRole('ADMIN','CAJERO')")
    public ResponseEntity<UserEntity> signup(@RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/recover-password")
    public ResponseEntity<String> recoverPassword(@RequestBody RecoverPasswordRequest request) {
        authService.recoverPassword(request);
        return ResponseEntity.ok("Si el correo existe, enviamos el enlace de recuperacion");
    }

    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request);
        return ResponseEntity.ok("Contrasena actualizada");
    }
}
