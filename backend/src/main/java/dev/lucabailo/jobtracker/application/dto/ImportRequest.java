package dev.lucabailo.jobtracker.application.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;

import java.util.List;

/** Body of POST /api/applications/import: several applications at once. */
public record ImportRequest(
        @NotEmpty @Size(max = 200) List<@Valid JobApplicationRequest> applications
) {
}
