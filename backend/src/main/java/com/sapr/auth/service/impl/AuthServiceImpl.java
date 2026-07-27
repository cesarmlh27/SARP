package com.sapr.auth.service.impl;

import com.sapr.auth.dto.LoginRequest;
import com.sapr.auth.dto.LoginResponse;
import com.sapr.auth.dto.RecoverPasswordRequest;
import com.sapr.auth.dto.ResetPasswordRequest;
import com.sapr.auth.dto.RegisterRequest;
import com.sapr.auth.entity.PasswordResetTokenEntity;
import com.sapr.auth.repository.PasswordResetTokenRepository;
import com.sapr.auth.service.AuthService;
import com.sapr.role.entity.RoleEntity;
import com.sapr.role.repository.RoleRepository;
import com.sapr.security.jwt.JwtProvider;
import com.sapr.user.entity.UserEntity;
import com.sapr.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthServiceImpl implements AuthService {

    private static final Set<String> FORBIDDEN_ASSIGNABLE_ROLES = Set.of("ADMIN");

    private final AuthenticationManager authenticationManager;
    private final JwtProvider jwtProvider;
    private final UserRepository userRepository;
        private final RoleRepository roleRepository;
        private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final PasswordEncoder passwordEncoder;
        private final JavaMailSender mailSender;

        @Value("${app.frontend.url}")
        private String frontendUrl;

        @Value("${app.security.password-reset-expiration-minutes:30}")
        private long passwordResetExpirationMinutes;

        @Value("${spring.mail.username:}")
        private String mailFrom;

    @Override
    public LoginResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );
        String token = jwtProvider.generateToken(authentication);
        UserEntity user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        return new LoginResponse(token, user.getEmail(), user.getRole().getName(),
                user.getFirstName(), user.getLastName());
    }

    @Override
    public UserEntity register(RegisterRequest request) {
        if (request.getRoleName() == null || request.getRoleName().isBlank()) {
            throw new RuntimeException("Debes indicar el rol del empleado");
        }

        String normalizedRoleName = request.getRoleName().trim().toUpperCase();
        if (FORBIDDEN_ASSIGNABLE_ROLES.contains(normalizedRoleName)) {
            throw new RuntimeException("No se pueden crear administradores adicionales");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("El email ya está registrado");
        }
        RoleEntity role = roleRepository.findByName(normalizedRoleName)
                .orElseThrow(() -> new RuntimeException("Rol no encontrado: " + normalizedRoleName));
        UserEntity user = UserEntity.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .enabled(true)
                .role(role)
                .createdAt(LocalDateTime.now())
                .build();
        return userRepository.save(user);
    }

    @Override
    @Transactional
    public void recoverPassword(RecoverPasswordRequest request) {
        UserEntity user = userRepository.findByEmail(request.getEmail())
                .orElse(null);

        // Always return success semantics to avoid leaking user existence.
        if (user == null) {
            log.info("Password reset requested for unknown email: {}", request.getEmail());
            return;
        }

        passwordResetTokenRepository.deleteByUserId(user.getId());

        String token = UUID.randomUUID().toString();
        LocalDateTime now = LocalDateTime.now();

        PasswordResetTokenEntity resetToken = PasswordResetTokenEntity.builder()
                .token(token)
                .user(user)
                .createdAt(now)
                .expiresAt(now.plusMinutes(passwordResetExpirationMinutes))
                .used(false)
                .build();
        passwordResetTokenRepository.save(resetToken);

        sendResetPasswordEmail(user.getEmail(), token);
    }

    @Override
    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        PasswordResetTokenEntity resetToken = passwordResetTokenRepository.findByToken(request.getToken())
                .orElseThrow(() -> new RuntimeException("Token invalido o expirado"));

        if (resetToken.isUsed() || resetToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Token invalido o expirado");
        }

        UserEntity user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        resetToken.setUsed(true);
        passwordResetTokenRepository.save(resetToken);
    }

    private void sendResetPasswordEmail(String toEmail, String token) {
        String encodedToken = URLEncoder.encode(token, StandardCharsets.UTF_8);
        String resetUrl = String.format("%s/restablecer-contrasena?token=%s", frontendUrl, encodedToken);

        if (mailFrom == null || mailFrom.isBlank()) {
            log.warn("MAIL_USERNAME no configurado. Enlace de reset para {}: {}", toEmail, resetUrl);
            return;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(mailFrom);
            message.setTo(toEmail);
            message.setSubject("Recuperacion de contrasena SAPR");
            message.setText(
                    "Hola,\n\n" +
                    "Recibimos una solicitud para restablecer tu contrasena en SAPR.\n" +
                    "Usa este enlace (valido por " + passwordResetExpirationMinutes + " minutos):\n\n" +
                    resetUrl + "\n\n" +
                    "Si no solicitaste este cambio, ignora este mensaje."
            );

            mailSender.send(message);
        } catch (Exception ex) {
            // Do not fail the endpoint in dev environments; log error for SMTP configuration troubleshooting.
            log.error("No se pudo enviar correo de recuperacion a {}. Error: {}", toEmail, ex.getMessage());
        }
    }
}
