package com.medicitas.controller;

import com.medicitas.dto.AppointmentDTO;
import com.medicitas.entity.User;
import com.medicitas.service.AppointmentService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
public class AppointmentController {

    private final AppointmentService service;

    public AppointmentController(AppointmentService service) { this.service = service; }

    /* ════════════════════════════════════
       PATIENT endpoints - /api/appointments
       ════════════════════════════════════ */

    @GetMapping("/api/appointments")
    public ResponseEntity<List<AppointmentDTO.Response>> getAll(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(service.getByPatient(user));
    }

    @PostMapping("/api/appointments")
    public ResponseEntity<AppointmentDTO.Response> create(
            @Valid @RequestBody AppointmentDTO.CreateRequest req,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(req, user));
    }

    @PutMapping("/api/appointments/{id}/cancel")
    public ResponseEntity<AppointmentDTO.Response> cancel(
            @PathVariable Long id,
            @RequestBody AppointmentDTO.CancelRequest req,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(service.cancel(id, user, req.getReason()));
    }

    @PutMapping("/api/appointments/{id}/reschedule")
    public ResponseEntity<AppointmentDTO.Response> reschedule(
            @PathVariable Long id,
            @Valid @RequestBody AppointmentDTO.RescheduleRequest req,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(service.reschedule(id, user, req));
    }

    @PutMapping("/api/appointments/{id}/confirm")
    public ResponseEntity<AppointmentDTO.Response> confirm(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(service.confirm(id, user));
    }

    @PutMapping("/api/appointments/{id}/complete")
    public ResponseEntity<AppointmentDTO.Response> complete(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(service.complete(id, user));
    }

    @PutMapping("/api/appointments/{id}/cancel-doctor")
    public ResponseEntity<AppointmentDTO.Response> cancelByDoctor(
            @PathVariable Long id,
            @RequestBody AppointmentDTO.CancelRequest req,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(service.cancelByDoctor(id, user, req.getReason()));
    }

    /* ════════════════════════════════════
       DOCTOR endpoints - /api/doctor/appointments
       Separados para evitar conflicto con /{id}
       ════════════════════════════════════ */

    @GetMapping("/api/doctor/appointments/today")
    public ResponseEntity<List<AppointmentDTO.Response>> doctorToday(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(service.getDoctorToday(user));
    }

    @GetMapping("/api/doctor/appointments/pending")
    public ResponseEntity<List<AppointmentDTO.Response>> doctorPending(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(service.getDoctorPending(user));
    }

    @GetMapping("/api/doctor/appointments/week")
    public ResponseEntity<List<AppointmentDTO.Response>> doctorWeek(
            @AuthenticationPrincipal User user,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResponseEntity.ok(service.getDoctorWeek(user, from, to));
    }

    /* ════════════════════════════════════
       PUBLIC - /api/appointments/slots
       ════════════════════════════════════ */

    @GetMapping("/api/appointments/slots")
    public ResponseEntity<List<AppointmentDTO.SlotResponse>> slots(
            @RequestParam Long doctorId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(service.getSlots(doctorId, date));
    }
}
