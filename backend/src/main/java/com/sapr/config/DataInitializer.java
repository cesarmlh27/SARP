package com.sapr.config;

import com.sapr.role.entity.RoleEntity;
import com.sapr.role.repository.RoleRepository;
import com.sapr.user.entity.UserEntity;
import com.sapr.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
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
        if (!userRepository.existsByEmail("admin@sapr.com")) {
            RoleEntity adminRole = roleRepository.findByName("ADMIN")
                    .orElseThrow(() -> new RuntimeException("Rol ADMIN no encontrado"));
            userRepository.save(UserEntity.builder()
                    .firstName("Admin")
                    .lastName("SAPR")
                    .email("admin@sapr.com")
                    .password(passwordEncoder.encode("Admin1234!"))
                    .enabled(true)
                    .role(adminRole)
                    .createdAt(LocalDateTime.now())
                    .build());
            log.info("Usuario admin creado: admin@sapr.com / Admin1234!");
        }
    }
}
