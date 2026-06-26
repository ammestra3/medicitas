package com.medicitas.controller;

import com.medicitas.dto.UserDTO;
import com.medicitas.entity.User;
import com.medicitas.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) { this.userService = userService; }

    @GetMapping("/profile")
    public ResponseEntity<UserDTO.ProfileResponse> profile(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(userService.getProfile(user));
    }

    @PutMapping("/profile/patient")
    public ResponseEntity<UserDTO.ProfileResponse> updatePatient(
            @AuthenticationPrincipal User user,
            @RequestBody UserDTO.UpdatePatientRequest req) {
        return ResponseEntity.ok(userService.updatePatientProfile(user, req));
    }

    @PutMapping("/profile/doctor")
    public ResponseEntity<UserDTO.ProfileResponse> updateDoctor(
            @AuthenticationPrincipal User user,
            @RequestBody UserDTO.UpdateDoctorRequest req) {
        return ResponseEntity.ok(userService.updateDoctorProfile(user, req));
    }

    @GetMapping("/patients")
    public ResponseEntity<List<UserDTO.SimpleUserResponse>> patients() {
        return ResponseEntity.ok(userService.getPatients());
    }

    @GetMapping("/doctors")
    public ResponseEntity<List<UserDTO.SimpleUserResponse>> doctors() {
        return ResponseEntity.ok(userService.getDoctors());
    }
}
