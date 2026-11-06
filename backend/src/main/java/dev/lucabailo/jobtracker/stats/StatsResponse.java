package dev.lucabailo.jobtracker.stats;

import dev.lucabailo.jobtracker.application.ApplicationStatus;

import java.util.Map;

/**
 * @param total         every tracked application, wishlist included
 * @param submitted     applications actually sent (status past WISHLIST)
 * @param byStatus      count for each status, always containing every status
 * @param responseRate  share of submitted applications that got an answer (0..1)
 * @param interviewRate share of submitted applications that reached an interview or offer (0..1)
 */
public record StatsResponse(
        long total,
        long submitted,
        Map<ApplicationStatus, Long> byStatus,
        double responseRate,
        double interviewRate
) {
}
