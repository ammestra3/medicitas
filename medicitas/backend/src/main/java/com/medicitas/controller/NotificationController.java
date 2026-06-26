package com.medicitas.controller;

import com.medicitas.dto.NotificationDTO;
import com.medicitas.entity.User;
import com.medicitas.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService service;

    public NotificationController(NotificationService service) { this.service = service; }

    @GetMapping
    public ResponseEntity<List<NotificationDTO.Response>> getAll(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(service.getByUser(user));
    }

    @PutMapping("/read-all")
    public ResponseEntity<Void> markAllRead(@AuthenticationPrincipal User user) {
        service.markAllRead(user);
        return ResponseEntity.noContent().build();
    }
}
