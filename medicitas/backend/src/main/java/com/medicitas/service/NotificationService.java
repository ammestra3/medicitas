package com.medicitas.service;

import com.medicitas.dto.NotificationDTO;
import com.medicitas.entity.Notification;
import com.medicitas.entity.User;
import com.medicitas.repository.NotificationRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificationService {

    private final NotificationRepository repository;

    public NotificationService(NotificationRepository repository) {
        this.repository = repository;
    }

    public List<NotificationDTO.Response> getByUser(User user) {
        return repository.findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream().map(NotificationDTO.Response::from).toList();
    }

    public void markAllRead(User user) {
        List<Notification> unread = repository.findByUserIdAndReadFalse(user.getId());
        unread.forEach(n -> n.setRead(true));
        repository.saveAll(unread);
    }
}
