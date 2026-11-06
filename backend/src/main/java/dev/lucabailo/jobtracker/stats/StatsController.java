package dev.lucabailo.jobtracker.stats;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class StatsController {

    private final StatsService service;

    public StatsController(StatsService service) {
        this.service = service;
    }

    @GetMapping("/api/stats")
    public StatsResponse stats() {
        return service.compute();
    }
}
