package com.sapr.role.controller;

import com.sapr.role.entity.RoleEntity;
import com.sapr.role.service.RoleService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/roles")
@RequiredArgsConstructor
public class RoleController {

    private final RoleService roleService;

    @GetMapping
    public List<RoleEntity> getAllRoles() {
        return roleService.findAll();
    }

    @PostMapping
    public RoleEntity saveRole(@RequestBody RoleEntity role) {
        return roleService.save(role);
    }
}