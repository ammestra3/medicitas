package com.medicitas.service;

import com.medicitas.dto.ChatDTO;
import com.medicitas.entity.ChatMessage;
import com.medicitas.entity.User;
import com.medicitas.repository.ChatMessageRepository;
import com.medicitas.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ChatService {

    private final ChatMessageRepository chatRepository;
    private final UserRepository userRepository;

    public ChatService(ChatMessageRepository chatRepository, UserRepository userRepository) {
        this.chatRepository = chatRepository;
        this.userRepository = userRepository;
    }

    public ChatDTO.MessageResponse send(ChatDTO.MessageRequest req, User sender) {
        User receiver = userRepository.findById(req.getReceiverId())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        ChatMessage msg = ChatMessage.builder()
                .sender(sender).receiver(receiver).content(req.getContent()).build();
        return ChatDTO.MessageResponse.from(chatRepository.save(msg));
    }

    public List<ChatDTO.MessageResponse> getConversation(Long userId, Long otherId) {
        return chatRepository.findConversation(userId, otherId)
                .stream().map(ChatDTO.MessageResponse::from).toList();
    }

    public List<ChatDTO.ContactResponse> getContacts(Long userId) {
        return chatRepository.findContacts(userId)
                .stream().map(ChatDTO.ContactResponse::from).toList();
    }
}
