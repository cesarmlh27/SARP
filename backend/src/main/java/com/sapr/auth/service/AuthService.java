package com.sapr.auth.service;

import com.sapr.auth.dto.LoginRequest;
import com.sapr.auth.dto.LoginResponse;
import com.sapr.auth.dto.RecoverPasswordRequest;
import com.sapr.auth.dto.ResetPasswordRequest;
import com.sapr.auth.dto.RegisterRequest;
import com.sapr.user.entity.UserEntity;

public interface AuthService {
    LoginResponse login(LoginRequest request);
    UserEntity register(RegisterRequest request);
    void recoverPassword(RecoverPasswordRequest request);
    void resetPassword(ResetPasswordRequest request);
}
