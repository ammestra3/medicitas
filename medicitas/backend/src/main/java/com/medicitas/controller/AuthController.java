package com.medicitas.controller;

import com.medicitas.dto.AuthDTO;
import com.medicitas.entity.User;
import com.medicitas.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) { this.authService = authService; }

    @PostMapping("/login")
    public ResponseEntity<AuthDTO.JwtResponse> login(@Valid @RequestBody AuthDTO.LoginRequest req) {
        return ResponseEntity.ok(authService.login(req));
    }

    @PostMapping("/register/patient")
    public ResponseEntity<AuthDTO.JwtResponse> registerPatient(@Valid @RequestBody AuthDTO.RegisterPatientRequest req) {
        return ResponseEntity.ok(authService.registerPatient(req));
    }

    @PostMapping("/register/doctor")
    public ResponseEntity<AuthDTO.JwtResponse> registerDoctor(@Valid @RequestBody AuthDTO.RegisterDoctorRequest req) {
        return ResponseEntity.ok(authService.registerDoctor(req));
    }

    @PutMapping("/change-password")
    public ResponseEntity<Void> changePassword(@AuthenticationPrincipal User user,
                                               @Valid @RequestBody AuthDTO.ChangePasswordRequest req) {
        authService.changePassword(user, req);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Void> resetPassword(@Valid @RequestBody AuthDTO.ResetPasswordRequest req) {
        authService.resetPassword(req);
        return ResponseEntity.noContent().build();
    }
}
