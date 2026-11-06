package dev.lucabailo.jobtracker.application;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;

import static org.hamcrest.Matchers.endsWith;
import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class JobApplicationApiTest {

    /** "Today" is frozen so the automatic applied date can be asserted. */
    @TestConfiguration
    static class FixedClock {
        @Bean
        @Primary
        Clock fixedClock() {
            return Clock.fixed(Instant.parse("2026-11-06T10:00:00Z"), ZoneOffset.UTC);
        }
    }

    @Autowired
    MockMvc mvc;

    @Autowired
    JobApplicationRepository repository;

    @BeforeEach
    void cleanDatabase() {
        repository.deleteAll();
    }

    @Test
    void createsAnApplicationAndReturnsItsLocation() throws Exception {
        mvc.perform(post("/api/applications")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body("Nordlys Software", "Junior Developer", "FULL_TIME", null)))
                .andExpect(status().isCreated())
                .andExpect(header().string("Location", endsWith("/api/applications/" + onlyId())))
                .andExpect(jsonPath("$.company").value("Nordlys Software"))
                .andExpect(jsonPath("$.status").value("WISHLIST"))
                .andExpect(jsonPath("$.appliedOn").doesNotExist());
    }

    @Test
    void rejectsAnApplicationWithoutCompany() throws Exception {
        mvc.perform(post("/api/applications")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body("", "Junior Developer", "FULL_TIME", null)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.title").value("Validation failed"))
                .andExpect(jsonPath("$.errors.company").exists());
    }

    @Test
    void movingPastWishlistRecordsTheAppliedDate() throws Exception {
        long id = create("Havn Robotics", "Graduate Engineer", "FULL_TIME", null);

        mvc.perform(patch("/api/applications/{id}/status", id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":\"APPLIED\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("APPLIED"))
                .andExpect(jsonPath("$.appliedOn").value("2026-11-06"));
    }

    @Test
    void filtersByStatusTypeAndSearchText() throws Exception {
        create("Nordlys Software", "Junior Developer", "FULL_TIME", "APPLIED");
        create("Havn Robotics", "Embedded Engineer", "FULL_TIME", "WISHLIST");
        create("Lys Health", "Student Developer", "PART_TIME", "APPLIED");

        mvc.perform(get("/api/applications").param("status", "APPLIED"))
                .andExpect(jsonPath("$", hasSize(2)));

        mvc.perform(get("/api/applications").param("status", "APPLIED").param("type", "PART_TIME"))
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].company").value("Lys Health"));

        mvc.perform(get("/api/applications").param("q", "robot"))
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].company").value("Havn Robotics"));
    }

    @Test
    void updatesAndDeletesAnApplication() throws Exception {
        long id = create("Bølge Energy", "Software Engineer", "FULL_TIME", null);

        mvc.perform(put("/api/applications/{id}", id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body("Bølge Energy", "Platform Engineer", "FULL_TIME", "INTERVIEW")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.role").value("Platform Engineer"))
                .andExpect(jsonPath("$.status").value("INTERVIEW"));

        mvc.perform(delete("/api/applications/{id}", id))
                .andExpect(status().isNoContent());

        mvc.perform(get("/api/applications/{id}", id))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.title").value("Not found"));
    }

    @Test
    void importSkipsJobLinksThatAreAlreadyTracked() throws Exception {
        mvc.perform(post("/api/applications")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"company":"Nordlys Software","role":"Junior Developer","type":"FULL_TIME",
                                 "jobUrl":"https://jobs.example.com/1"}
                                """))
                .andExpect(status().isCreated());

        mvc.perform(post("/api/applications/import")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"applications":[
                                  {"company":"Nordlys Software","role":"Junior Developer","type":"FULL_TIME",
                                   "jobUrl":"https://jobs.example.com/1"},
                                  {"company":"Havn Robotics","role":"Graduate Engineer","type":"FULL_TIME",
                                   "jobUrl":"https://jobs.example.com/2"},
                                  {"company":"Havn Robotics","role":"Graduate Engineer","type":"FULL_TIME",
                                   "jobUrl":"https://jobs.example.com/2"},
                                  {"company":"Lys Health","role":"Student Developer","type":"PART_TIME"}
                                ]}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.imported").value(2))
                .andExpect(jsonPath("$.skipped").value(2));

        mvc.perform(get("/api/applications"))
                .andExpect(jsonPath("$", hasSize(3)));
    }

    @Test
    void importRejectsInvalidEntries() throws Exception {
        mvc.perform(post("/api/applications/import")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"applications\":[{\"company\":\"\",\"role\":\"Dev\",\"type\":\"FULL_TIME\"}]}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors['applications[0].company']").exists());
    }

    @Test
    void statsSummariseTheApplications() throws Exception {
        create("A", "Dev", "FULL_TIME", "WISHLIST");
        create("B", "Dev", "FULL_TIME", "APPLIED");
        create("C", "Dev", "FULL_TIME", "INTERVIEW");
        create("D", "Dev", "PART_TIME", "REJECTED");

        mvc.perform(get("/api/stats"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.total").value(4))
                .andExpect(jsonPath("$.submitted").value(3))
                .andExpect(jsonPath("$.byStatus.INTERVIEW").value(1))
                .andExpect(jsonPath("$.responseRate").value(2.0 / 3.0));
    }

    private long create(String company, String role, String type, String status) throws Exception {
        MvcResult result = mvc.perform(post("/api/applications")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body(company, role, type, status)))
                .andExpect(status().isCreated())
                .andReturn();
        String location = result.getResponse().getHeader("Location");
        return Long.parseLong(location.substring(location.lastIndexOf('/') + 1));
    }

    private long onlyId() {
        return repository.findAll().get(0).getId();
    }

    private static String body(String company, String role, String type, String status) {
        String statusJson = status == null ? "null" : "\"" + status + "\"";
        return """
                {"company":"%s","role":"%s","location":"Copenhagen","type":"%s","status":%s}
                """.formatted(company, role, type, statusJson);
    }
}
