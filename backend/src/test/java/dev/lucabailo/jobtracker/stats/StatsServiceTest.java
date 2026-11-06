package dev.lucabailo.jobtracker.stats;

import dev.lucabailo.jobtracker.application.ApplicationStatus;
import org.junit.jupiter.api.Test;

import java.util.List;

import static dev.lucabailo.jobtracker.application.ApplicationStatus.APPLIED;
import static dev.lucabailo.jobtracker.application.ApplicationStatus.INTERVIEW;
import static dev.lucabailo.jobtracker.application.ApplicationStatus.OFFER;
import static dev.lucabailo.jobtracker.application.ApplicationStatus.REJECTED;
import static dev.lucabailo.jobtracker.application.ApplicationStatus.WISHLIST;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.within;

class StatsServiceTest {

    @Test
    void emptyListGivesZeroRatesInsteadOfDividingByZero() {
        StatsResponse stats = StatsService.compute(List.of());

        assertThat(stats.total()).isZero();
        assertThat(stats.responseRate()).isZero();
        assertThat(stats.byStatus()).containsOnlyKeys(ApplicationStatus.values());
    }

    @Test
    void wishlistItemsAreNotCountedAsSubmitted() {
        StatsResponse stats = StatsService.compute(List.of(WISHLIST, WISHLIST, APPLIED));

        assertThat(stats.total()).isEqualTo(3);
        assertThat(stats.submitted()).isEqualTo(1);
        assertThat(stats.responseRate()).isZero();
    }

    @Test
    void ratesAreComputedOnSubmittedApplications() {
        // 4 submitted: 1 still waiting, 1 interview, 1 offer, 1 rejected
        StatsResponse stats = StatsService.compute(
                List.of(WISHLIST, APPLIED, INTERVIEW, OFFER, REJECTED));

        assertThat(stats.submitted()).isEqualTo(4);
        assertThat(stats.responseRate()).isCloseTo(0.75, within(1e-9));
        assertThat(stats.interviewRate()).isCloseTo(0.5, within(1e-9));
        assertThat(stats.byStatus().get(OFFER)).isEqualTo(1L);
    }
}
