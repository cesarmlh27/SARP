package com.sapr.role.service;

import com.sapr.role.entity.RoleEntity;

import java.util.List;

public interface RoleService {

    List<RoleEntity> findAll();

    RoleEntity save(RoleEntity role);

}