package com.medicitas.controller;

import com.medicitas.dto.ChatDTO;
import com.medicitas.entity.User;
import com.medicitas.service.ChatService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private final ChatService chatService;

    public ChatController(ChatService chatService) { this.chatService = chatService; }

    @PostMapping("/send")
    public ResponseEntity<ChatDTO.MessageResponse> send(@Valid @RequestBody ChatDTO.MessageRequest req,
                                                        @AuthenticationPrincipal User sender) {
        return ResponseEntity.ok(chatService.send(req, sender));
    }

    @GetMapping("/conversation/{otherId}")
    public ResponseEntity<List<ChatDTO.MessageResponse>> conversation(@PathVariable Long otherId,
                                                                      @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(chatService.getConversation(user.getId(), otherId));
    }

    @GetMapping("/contacts")
    public ResponseEntity<List<ChatDTO.ContactResponse>> contacts(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(chatService.getContacts(user.getId()));
    }
}
