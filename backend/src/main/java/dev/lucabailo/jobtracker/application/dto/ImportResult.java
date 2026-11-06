package dev.lucabailo.jobtracker.application.dto;

/**
 * @param imported applications created
 * @param skipped  applications ignored because their job link was already tracked
 */
public record ImportResult(int imported, int skipped) {
}
