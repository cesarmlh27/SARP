package com.sapr.user.controller;

import com.sapr.auth.dto.RegisterRequest;
import com.sapr.auth.service.AuthService;
import com.sapr.role.entity.RoleEntity;
import com.sapr.role.repository.RoleRepository;
import com.sapr.user.entity.UserEntity;
import com.sapr.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final AuthService authService;
    private final RoleRepository roleRepository;

    @Value("${app.security.main-admin-email:admin@sapr.com}")
    private String mainAdminEmail;

    @GetMapping
    public List<UserEntity> getAllUsers() {
        return userService.findAll();
    }

    @PostMapping
    public UserEntity createUser(@RequestBody UserEntity user) {

        if (user.getRole() == null || user.getRole().getName() == null) {
            throw new RuntimeException("Debes indicar el rol del empleado");
        }

        RegisterRequest request = new RegisterRequest();
        request.setFirstName(user.getFirstName());
        request.setLastName(user.getLastName());
        request.setEmail(user.getEmail());
        request.setPassword(user.getPassword());
        request.setRoleName(user.getRole().getName());

        return authService.register(request);
    }

    @GetMapping("/{id}")
    public UserEntity getUserById(@PathVariable Long id) {
        return userService.findById(id);
    }

    @PutMapping("/{id}")
    public UserEntity updateUser(@PathVariable Long id,
                                 @RequestBody UserEntity user) {
        UserEntity existingUser = userService.findById(id);

        if (existingUser == null) {
            return null;
        }

        if (isMainAdmin(existingUser.getEmail())) {
            throw new RuntimeException("No se puede modificar el administrador principal");
        }

        if (user.getRole() == null || user.getRole().getId() == null) {
            throw new RuntimeException("Debes indicar un rol valido");
        }

        RoleEntity role = roleRepository.findById(user.getRole().getId())
                .orElseThrow(() -> new RuntimeException("Rol no encontrado"));

        if ("ADMIN".equalsIgnoreCase(role.getName())) {
            throw new RuntimeException("No se pueden crear administradores adicionales");
        }

        existingUser.setFirstName(user.getFirstName());
        existingUser.setLastName(user.getLastName());
        existingUser.setEmail(user.getEmail());
        existingUser.setEnabled(user.getEnabled());
        existingUser.setRole(role);

        return userService.save(existingUser);
    }

    @DeleteMapping("/{id}")
    public void deleteUser(@PathVariable Long id) {
        UserEntity existingUser = userService.findById(id);
        if (existingUser == null) {
            return;
        }

        if (isMainAdmin(existingUser.getEmail())) {
            throw new RuntimeException("No se puede eliminar el administrador principal");
        }

        userService.delete(id);
    }

    private boolean isMainAdmin(String email) {
        return email != null && email.equalsIgnoreCase(mainAdminEmail);
    }
}