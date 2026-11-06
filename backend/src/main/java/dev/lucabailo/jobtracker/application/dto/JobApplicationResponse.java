package dev.lucabailo.jobtracker.application.dto;

import dev.lucabailo.jobtracker.application.ApplicationStatus;
import dev.lucabailo.jobtracker.application.EmploymentType;
import dev.lucabailo.jobtracker.application.JobApplication;

import java.time.Instant;
import java.time.LocalDate;

public record JobApplicationResponse(
        Long id,
        String company,
        String role,
        String location,
        String jobUrl,
        EmploymentType type,
        ApplicationStatus status,
        LocalDate appliedOn,
        LocalDate deadline,
        String notes,
        Instant createdAt,
        Instant updatedAt
) {

    public static JobApplicationResponse from(JobApplication a) {
        return new JobApplicationResponse(
                a.getId(), a.getCompany(), a.getRole(), a.getLocation(), a.getJobUrl(),
                a.getType(), a.getStatus(), a.getAppliedOn(), a.getDeadline(), a.getNotes(),
                a.getCreatedAt(), a.getUpdatedAt());
    }
}
