package com.medicitas.controller;

import com.medicitas.dto.MedicalRecordDTO;
import com.medicitas.entity.User;
import com.medicitas.service.MedicalRecordService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/medical-records")
public class MedicalRecordController {

    private final MedicalRecordService service;

    public MedicalRecordController(MedicalRecordService service) { this.service = service; }

    @PostMapping
    public ResponseEntity<MedicalRecordDTO.Response> create(@Valid @RequestBody MedicalRecordDTO.Request req,
                                                            @AuthenticationPrincipal User doctor) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(req, doctor));
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<MedicalRecordDTO.Response>> getByPatient(@PathVariable Long patientId) {
        return ResponseEntity.ok(service.getByPatient(patientId));
    }

    @GetMapping("/my-records")
    public ResponseEntity<List<MedicalRecordDTO.Response>> myRecords(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(service.getByPatient(user.getId()));
    }
}
