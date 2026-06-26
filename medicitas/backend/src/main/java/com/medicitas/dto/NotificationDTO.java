package com.medicitas.dto;

import com.medicitas.entity.Notification;

public class NotificationDTO {

    public static class Response {
        private Long id; private String title, message, type, createdAt; private boolean read;
        public static Response from(Notification n) {
            Response r = new Response();
            r.id=n.getId(); r.title=n.getTitle(); r.message=n.getMessage();
            r.type=n.getType(); r.read=n.isRead(); r.createdAt=n.getCreatedAt().toString();
            return r;
        }
        public Long    getId()        { return id; }
        public String  getTitle()     { return title; }
        public String  getMessage()   { return message; }
        public String  getType()      { return type; }
        public boolean isRead()       { return read; }
        public String  getCreatedAt() { return createdAt; }
    }
}
