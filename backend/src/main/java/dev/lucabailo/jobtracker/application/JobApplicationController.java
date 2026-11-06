package dev.lucabailo.jobtracker.application;

import dev.lucabailo.jobtracker.application.dto.ImportRequest;
import dev.lucabailo.jobtracker.application.dto.ImportResult;
import dev.lucabailo.jobtracker.application.dto.JobApplicationRequest;
import dev.lucabailo.jobtracker.application.dto.JobApplicationResponse;
import dev.lucabailo.jobtracker.application.dto.StatusUpdateRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/applications")
public class JobApplicationController {

    private final JobApplicationService service;

    public JobApplicationController(JobApplicationService service) {
        this.service = service;
    }

    @GetMapping
    public List<JobApplicationResponse> list(
            @RequestParam(required = false) ApplicationStatus status,
            @RequestParam(required = false) EmploymentType type,
            @RequestParam(required = false, name = "q") String search) {
        return service.list(status, type, search).stream()
                .map(JobApplicationResponse::from)
                .toList();
    }

    @GetMapping("/{id}")
    public JobApplicationResponse get(@PathVariable long id) {
        return JobApplicationResponse.from(service.get(id));
    }

    @PostMapping
    public ResponseEntity<JobApplicationResponse> create(@Valid @RequestBody JobApplicationRequest request) {
        JobApplication created = service.create(request);
        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(created.getId())
                .toUri();
        return ResponseEntity.created(location).body(JobApplicationResponse.from(created));
    }

    @PostMapping("/import")
    public ImportResult importAll(@Valid @RequestBody ImportRequest request) {
        return service.importAll(request.applications());
    }

    @PutMapping("/{id}")
    public JobApplicationResponse update(@PathVariable long id,
                                         @Valid @RequestBody JobApplicationRequest request) {
        return JobApplicationResponse.from(service.update(id, request));
    }

    @PatchMapping("/{id}/status")
    public JobApplicationResponse changeStatus(@PathVariable long id,
                                               @Valid @RequestBody StatusUpdateRequest request) {
        return JobApplicationResponse.from(service.changeStatus(id, request.status()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
