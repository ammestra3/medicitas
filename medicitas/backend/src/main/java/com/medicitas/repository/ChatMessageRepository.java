package com.medicitas.repository;

import com.medicitas.entity.ChatMessage;
import com.medicitas.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    @Query("SELECT m FROM ChatMessage m WHERE " +
           "(m.sender.id = :a AND m.receiver.id = :b) OR " +
           "(m.sender.id = :b AND m.receiver.id = :a) " +
           "ORDER BY m.sentAt ASC")
    List<ChatMessage> findConversation(@Param("a") Long a, @Param("b") Long b);

    @Query(value =
           "SELECT DISTINCT u.* FROM users u WHERE u.id IN " +
           "(SELECT receiver_id FROM chat_messages WHERE sender_id = :userId " +
           "UNION " +
           "SELECT sender_id FROM chat_messages WHERE receiver_id = :userId)",
           nativeQuery = true)
    List<User> findContacts(@Param("userId") Long userId);
}
