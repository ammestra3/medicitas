package com.medicitas.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
public class Notification {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 100)
    private String title;

    @Column(nullable = false, length = 500)
    private String message;

    @Column(nullable = false, length = 20)
    private String type;

    @Column(name = "is_read", nullable = false)
    private boolean read;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    void prePersist() { createdAt = LocalDateTime.now(); read = false; }

    public Notification() {}

    public static Builder builder() { return new Builder(); }
    public static class Builder {
        private User user; private String title, message, type;
        public Builder user(User v)     { this.user = v; return this; }
        public Builder title(String v)  { this.title = v; return this; }
        public Builder message(String v){ this.message = v; return this; }
        public Builder type(String v)   { this.type = v; return this; }
        public Notification build() {
            Notification n = new Notification();
            n.user = user; n.title = title; n.message = message; n.type = type;
            return n;
        }
    }

    public Long getId()                { return id; }
    public User getUser()              { return user; }
    public String getTitle()           { return title; }
    public String getMessage()         { return message; }
    public String getType()            { return type; }
    public boolean isRead()            { return read; }
    public void setRead(boolean v)     { this.read = v; }
    public LocalDateTime getCreatedAt(){ return createdAt; }
}
