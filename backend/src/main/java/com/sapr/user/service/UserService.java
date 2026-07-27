package com.sapr.user.service;

import com.sapr.user.entity.UserEntity;

import java.util.List;

public interface UserService {

    List<UserEntity> findAll();

    UserEntity save(UserEntity user);

    UserEntity findById(Long id);

    void delete(Long id);
}