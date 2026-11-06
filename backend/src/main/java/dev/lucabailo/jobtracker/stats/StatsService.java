package dev.lucabailo.jobtracker.stats;

import dev.lucabailo.jobtracker.application.ApplicationStatus;
import dev.lucabailo.jobtracker.application.JobApplication;
import dev.lucabailo.jobtracker.application.JobApplicationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collection;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;

@Service
public class StatsService {

    private final JobApplicationRepository repository;

    public StatsService(JobApplicationRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public StatsResponse compute() {
        List<ApplicationStatus> statuses = repository.findAll().stream()
                .map(JobApplication::getStatus)
                .toList();
        return compute(statuses);
    }

    /** Pure calculation, kept separate so it can be unit-tested without a database. */
    static StatsResponse compute(Collection<ApplicationStatus> statuses) {
        Map<ApplicationStatus, Long> byStatus = new EnumMap<>(ApplicationStatus.class);
        for (ApplicationStatus s : ApplicationStatus.values()) {
            byStatus.put(s, 0L);
        }
        for (ApplicationStatus s : statuses) {
            byStatus.merge(s, 1L, Long::sum);
        }

        long submitted = statuses.stream().filter(ApplicationStatus::isSubmitted).count();
        long responded = statuses.stream().filter(ApplicationStatus::hasResponse).count();
        long interviews = byStatus.get(ApplicationStatus.INTERVIEW) + byStatus.get(ApplicationStatus.OFFER);

        return new StatsResponse(
                statuses.size(),
                submitted,
                byStatus,
                ratio(responded, submitted),
                ratio(interviews, submitted));
    }

    private static double ratio(long part, long whole) {
        return whole == 0 ? 0.0 : (double) part / whole;
    }
}
