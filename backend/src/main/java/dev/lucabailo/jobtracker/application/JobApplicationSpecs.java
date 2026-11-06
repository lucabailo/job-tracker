package dev.lucabailo.jobtracker.application;

import org.springframework.data.jpa.domain.Specification;

/**
 * Optional filters for the list endpoint. Each one is skipped when its value is null,
 * so the same query works with any combination of filters.
 */
final class JobApplicationSpecs {

    private JobApplicationSpecs() {
    }

    static Specification<JobApplication> hasStatus(ApplicationStatus status) {
        return (root, query, cb) -> status == null ? null : cb.equal(root.get("status"), status);
    }

    static Specification<JobApplication> hasType(EmploymentType type) {
        return (root, query, cb) -> type == null ? null : cb.equal(root.get("type"), type);
    }

    /** Case-insensitive match on company or role. */
    static Specification<JobApplication> matches(String text) {
        return (root, query, cb) -> {
            if (text == null || text.isBlank()) {
                return null;
            }
            String pattern = "%" + text.trim().toLowerCase() + "%";
            return cb.or(
                    cb.like(cb.lower(root.<String>get("company")), pattern),
                    cb.like(cb.lower(root.<String>get("role")), pattern));
        };
    }
}
