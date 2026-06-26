package com.medicitas.dto;

import com.medicitas.entity.ChatMessage;
import com.medicitas.entity.User;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class ChatDTO {

    public static class MessageRequest {
        @NotNull  private Long receiverId;
        @NotBlank private String content;
        public Long   getReceiverId(){ return receiverId; }
        public String getContent()   { return content; }
        public void setReceiverId(Long v)  { this.receiverId = v; }
        public void setContent(String v)   { this.content = v; }
    }

    public static class MessageResponse {
        private Long id, senderId, receiverId; private String senderName, content, sentAt; private boolean read;
        public static MessageResponse from(ChatMessage m) {
            MessageResponse r = new MessageResponse();
            r.id=m.getId(); r.senderId=m.getSender().getId();
            r.senderName=m.getSender().getName()+" "+m.getSender().getLastName();
            r.receiverId=m.getReceiver().getId(); r.content=m.getContent();
            r.sentAt=m.getSentAt().toString(); r.read=m.isRead();
            return r;
        }
        public Long    getId()         { return id; }
        public Long    getSenderId()   { return senderId; }
        public String  getSenderName() { return senderName; }
        public Long    getReceiverId() { return receiverId; }
        public String  getContent()    { return content; }
        public String  getSentAt()     { return sentAt; }
        public boolean isRead()        { return read; }
    }

    public static class ContactResponse {
        private Long id; private String name, role;
        public static ContactResponse from(User u) {
            ContactResponse r = new ContactResponse();
            r.id=u.getId(); r.name=u.getName()+" "+u.getLastName(); r.role=u.getRole().name();
            return r;
        }
        public Long   getId()  { return id; }
        public String getName(){ return name; }
        public String getRole(){ return role; }
    }
}
