package dev.lucabailo.jobtracker.demo;

import dev.lucabailo.jobtracker.application.ApplicationStatus;
import dev.lucabailo.jobtracker.application.EmploymentType;
import dev.lucabailo.jobtracker.application.JobApplicationRepository;
import dev.lucabailo.jobtracker.application.JobApplicationService;
import dev.lucabailo.jobtracker.application.dto.JobApplicationRequest;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

/**
 * Fills an empty database with a few fictional applications, so the app has
 * something to show. Runs only with the "demo" profile.
 */
@Component
@Profile("demo")
class DemoDataLoader implements CommandLineRunner {

    private final JobApplicationRepository repository;
    private final JobApplicationService service;

    DemoDataLoader(JobApplicationRepository repository, JobApplicationService service) {
        this.repository = repository;
        this.service = service;
    }

    @Override
    public void run(String... args) {
        if (repository.count() > 0) {
            return;
        }
        LocalDate today = LocalDate.now();
        add("Nordlys Software", "Junior Full-Stack Developer", EmploymentType.FULL_TIME,
                ApplicationStatus.INTERVIEW, today.minusDays(12), null, "Technical interview next week");
        add("Havn Robotics", "Graduate Embedded Engineer", EmploymentType.FULL_TIME,
                ApplicationStatus.APPLIED, today.minusDays(5), null, "Master thesis possible");
        add("Bølge Energy", "Software Engineer, Platform", EmploymentType.FULL_TIME,
                ApplicationStatus.WISHLIST, null, today.plusDays(4), "Java / Spring Boot");
        add("Kanal Analytics", "Student Data Assistant", EmploymentType.PART_TIME,
                ApplicationStatus.REJECTED, today.minusDays(30), null, null);
        add("Lys Health", "Student Developer", EmploymentType.PART_TIME,
                ApplicationStatus.OFFER, today.minusDays(21), null, "15-20 h/week");
        add("Fjord Logistics", "Junior Backend Developer", EmploymentType.FULL_TIME,
                ApplicationStatus.WISHLIST, null, today.plusDays(15), null);
    }

    private void add(String company, String role, EmploymentType type, ApplicationStatus status,
                     LocalDate appliedOn, LocalDate deadline, String notes) {
        service.create(new JobApplicationRequest(company, role, "Copenhagen", null, type,
                status, appliedOn, deadline, notes));
    }
}
