package dev.lucabailo.jobtracker.application.dto;

import dev.lucabailo.jobtracker.application.ApplicationStatus;
import dev.lucabailo.jobtracker.application.EmploymentType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.hibernate.validator.constraints.URL;

import java.time.LocalDate;

/** Body of POST and PUT requests. {@code status} is optional and defaults to WISHLIST. */
public record JobApplicationRequest(
        @NotBlank @Size(max = 120) String company,
        @NotBlank @Size(max = 160) String role,
        @Size(max = 120) String location,
        @URL @Size(max = 500) String jobUrl,
        @NotNull EmploymentType type,
        ApplicationStatus status,
        LocalDate appliedOn,
        LocalDate deadline,
        @Size(max = 4000) String notes
) {
}
