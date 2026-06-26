package com.medicitas.repository;

import com.medicitas.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    List<User> findByRole(User.Role role);

    // Use native query to avoid JPQL enum issues
    @Query(value = "SELECT COUNT(*) FROM users WHERE family_doctor = :doctorName AND role = 'PATIENT'",
           nativeQuery = true)
    long countPatientsByFamilyDoctor(@Param("doctorName") String doctorName);

    @Query(value = "SELECT * FROM users WHERE role = 'DOCTOR' ORDER BY RAND()",
           nativeQuery = true)
    List<User> findAllDoctorsRandom();
}
