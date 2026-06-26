package com.medicitas.repository;

import com.medicitas.entity.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    List<Appointment> findByPatientIdOrderByDateAscTimeAsc(Long patientId);

    List<Appointment> findByDoctorUserIdOrderByDateAscTimeAsc(Long doctorId);

    @Query(value = "SELECT * FROM appointments WHERE doctor_id = :doctorId AND date = :date ORDER BY time ASC",
           nativeQuery = true)
    List<Appointment> findByDoctorAndDate(@Param("doctorId") Long doctorId,
                                          @Param("date") LocalDate date);

    @Query(value = "SELECT * FROM appointments WHERE doctor_id = :doctorId AND date BETWEEN :fromDate AND :toDate ORDER BY date ASC, time ASC",
           nativeQuery = true)
    List<Appointment> findByDoctorAndWeek(@Param("doctorId") Long doctorId,
                                          @Param("fromDate") LocalDate from,
                                          @Param("toDate") LocalDate to);

    @Query(value = "SELECT * FROM appointments WHERE doctor_id = :doctorId AND date = :date AND time = :time AND status NOT IN ('CANCELLED','RESCHEDULED')",
           nativeQuery = true)
    List<Appointment> findConflict(@Param("doctorId") Long doctorId,
                                   @Param("date") LocalDate date,
                                   @Param("time") LocalTime time);

    @Query(value = "SELECT * FROM appointments WHERE doctor_id = :doctorId AND status = 'PENDING' ORDER BY date ASC, time ASC",
           nativeQuery = true)
    List<Appointment> findPendingByDoctor(@Param("doctorId") Long doctorId);

    @Query(value = "SELECT * FROM appointments WHERE doctor_id = :doctorId AND date = :date AND status NOT IN ('CANCELLED','RESCHEDULED') ORDER BY time ASC",
           nativeQuery = true)
    List<Appointment> findTodayByDoctor(@Param("doctorId") Long doctorId,
                                        @Param("date") LocalDate date);
}
