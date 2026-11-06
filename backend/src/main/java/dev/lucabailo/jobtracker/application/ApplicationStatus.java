package dev.lucabailo.jobtracker.application;

/**
 * Stages of a job application, in the order they usually happen.
 */
public enum ApplicationStatus {
    WISHLIST,
    APPLIED,
    INTERVIEW,
    OFFER,
    REJECTED;

    /** True once the application has actually been sent. */
    public boolean isSubmitted() {
        return this != WISHLIST;
    }

    /** True when the company has answered (positively or negatively). */
    public boolean hasResponse() {
        return this == INTERVIEW || this == OFFER || this == REJECTED;
    }
}
