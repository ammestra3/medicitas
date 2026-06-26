package com.medicitas.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "chat_messages")
public class ChatMessage {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "sender_id", nullable = false)
    private User sender;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "receiver_id", nullable = false)
    private User receiver;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(name = "sent_at", nullable = false)
    private LocalDateTime sentAt;

    @Column(name = "is_read")
    private boolean read;

    @PrePersist
    void prePersist() { sentAt = LocalDateTime.now(); read = false; }

    public ChatMessage() {}

    public static Builder builder() { return new Builder(); }
    public static class Builder {
        private User sender, receiver; private String content;
        public Builder sender(User v)   { this.sender = v; return this; }
        public Builder receiver(User v) { this.receiver = v; return this; }
        public Builder content(String v){ this.content = v; return this; }
        public ChatMessage build() {
            ChatMessage m = new ChatMessage();
            m.sender = sender; m.receiver = receiver; m.content = content;
            return m;
        }
    }

    public Long getId()              { return id; }
    public User getSender()          { return sender; }
    public User getReceiver()        { return receiver; }
    public String getContent()       { return content; }
    public LocalDateTime getSentAt() { return sentAt; }
    public boolean isRead()          { return read; }
    public void setRead(boolean v)   { this.read = v; }
}
