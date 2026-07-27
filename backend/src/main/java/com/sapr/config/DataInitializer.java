package com.sapr.config;

import com.sapr.role.entity.RoleEntity;
import com.sapr.role.repository.RoleRepository;
import com.sapr.user.entity.UserEntity;
import com.sapr.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.security.main-admin-email:admin@sapr.com}")
    private String mainAdminEmail;

    @Value("${app.security.main-admin-password:Admin1234!}")
    private String mainAdminPassword;

    @Override
    public void run(String... args) {
        initRoles();
        initAdminUser();
    }

    private void initRoles() {
        List<String> roles = List.of("ADMIN", "MESERO", "CAJERO", "COCINA");
        roles.forEach(name -> {
            if (roleRepository.findByName(name).isEmpty()) {
                roleRepository.save(RoleEntity.builder().name(name).build());
                log.info("Rol creado: {}", name);
            }
        });
    }

    private void initAdminUser() {
        if (!userRepository.existsByEmail(mainAdminEmail)) {
            RoleEntity adminRole = roleRepository.findByName("ADMIN")
                    .orElseThrow(() -> new RuntimeException("Rol ADMIN no encontrado"));
            userRepository.save(UserEntity.builder()
                    .firstName("Admin")
                    .lastName("SAPR")
                .email(mainAdminEmail)
                .password(passwordEncoder.encode(mainAdminPassword))
                    .enabled(true)
                    .role(adminRole)
                    .createdAt(LocalDateTime.now())
                    .build());
            log.info("Usuario admin inicial creado: {}", mainAdminEmail);
        }
    }
}
