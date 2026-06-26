package com.medicitas.repository;

import com.medicitas.entity.Disability;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface DisabilityRepository extends JpaRepository<Disability, Long> {
    List<Disability> findByPatientIdOrderByStartDateDesc(Long patientId);
}
