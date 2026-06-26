package com.medicitas.controller;

import com.medicitas.dto.DisabilityDTO;
import com.medicitas.entity.User;
import com.medicitas.service.DisabilityService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/disabilities")
public class DisabilityController {

    private final DisabilityService service;

    public DisabilityController(DisabilityService service) { this.service = service; }

    @PostMapping
    public ResponseEntity<DisabilityDTO.Response> create(@Valid @RequestBody DisabilityDTO.Request req,
                                                         @AuthenticationPrincipal User doctor) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(req, doctor));
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<DisabilityDTO.Response>> getByPatient(@PathVariable Long patientId) {
        return ResponseEntity.ok(service.getByPatient(patientId));
    }

    @GetMapping("/my-disabilities")
    public ResponseEntity<List<DisabilityDTO.Response>> mine(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(service.getByPatient(user.getId()));
    }
}
