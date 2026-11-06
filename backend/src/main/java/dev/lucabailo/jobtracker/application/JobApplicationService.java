package dev.lucabailo.jobtracker.application;

import dev.lucabailo.jobtracker.application.dto.ImportResult;
import dev.lucabailo.jobtracker.application.dto.JobApplicationRequest;
import dev.lucabailo.jobtracker.common.NotFoundException;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@Transactional
public class JobApplicationService {

    private final JobApplicationRepository repository;
    private final Clock clock;

    public JobApplicationService(JobApplicationRepository repository, Clock clock) {
        this.repository = repository;
        this.clock = clock;
    }

    @Transactional(readOnly = true)
    public List<JobApplication> list(ApplicationStatus status, EmploymentType type, String search) {
        Specification<JobApplication> spec = Specification
                .where(JobApplicationSpecs.hasStatus(status))
                .and(JobApplicationSpecs.hasType(type))
                .and(JobApplicationSpecs.matches(search));
        return repository.findAll(spec, Sort.by(Sort.Direction.DESC, "updatedAt"));
    }

    @Transactional(readOnly = true)
    public JobApplication get(long id) {
        return repository.findById(id)
                .orElseThrow(() -> new NotFoundException("No application with id " + id));
    }

    public JobApplication create(JobApplicationRequest request) {
        JobApplication application = new JobApplication();
        apply(application, request);
        return repository.save(application);
    }

    /**
     * Creates several applications in one transaction. An application whose job link is
     * already tracked (or appears twice in the batch) is skipped, so importing the same
     * file twice does not create duplicates.
     */
    public ImportResult importAll(List<JobApplicationRequest> requests) {
        Set<String> seenUrls = new HashSet<>();
        int imported = 0;
        int skipped = 0;
        for (JobApplicationRequest request : requests) {
            String url = blankToNull(request.jobUrl());
            if (url != null && (!seenUrls.add(url) || repository.existsByJobUrl(url))) {
                skipped++;
                continue;
            }
            create(request);
            imported++;
        }
        return new ImportResult(imported, skipped);
    }

    public JobApplication update(long id, JobApplicationRequest request) {
        JobApplication application = get(id);
        apply(application, request);
        return application;
    }

    public JobApplication changeStatus(long id, ApplicationStatus status) {
        JobApplication application = get(id);
        application.changeStatus(status, LocalDate.now(clock));
        return application;
    }

    public void delete(long id) {
        repository.delete(get(id));
    }

    private void apply(JobApplication target, JobApplicationRequest request) {
        target.setCompany(request.company().trim());
        target.setRole(request.role().trim());
        target.setLocation(blankToNull(request.location()));
        target.setJobUrl(blankToNull(request.jobUrl()));
        target.setType(request.type());
        target.setAppliedOn(request.appliedOn());
        target.setDeadline(request.deadline());
        target.setNotes(blankToNull(request.notes()));
        ApplicationStatus status = request.status() != null ? request.status() : ApplicationStatus.WISHLIST;
        target.changeStatus(status, LocalDate.now(clock));
    }

    private static String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
