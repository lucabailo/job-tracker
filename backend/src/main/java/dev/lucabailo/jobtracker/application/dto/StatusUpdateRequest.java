package dev.lucabailo.jobtracker.application.dto;

import dev.lucabailo.jobtracker.application.ApplicationStatus;
import jakarta.validation.constraints.NotNull;

public record StatusUpdateRequest(@NotNull ApplicationStatus status) {
}
