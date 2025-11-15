package com.resume.builder.controller;

import com.resume.builder.model.JobDescription;
import com.resume.builder.repository.JobDescriptionRepository;
import com.resume.builder.service.JDAnalyzerService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/job-descriptions")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(originPatterns = "*")
public class JobDescriptionController {

    private final JobDescriptionRepository jobDescriptionRepository;
    private final JDAnalyzerService jdAnalyzerService;

    @PostMapping
    public ResponseEntity<JobDescription> createJobDescription(@RequestBody Map<String, String> request) {
        String jdText = request.get("description");
        
        log.info("Analyzing job description");
        JobDescription jd = jdAnalyzerService.analyzeJobDescription(jdText);
        JobDescription saved = jobDescriptionRepository.save(jd);
        
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @GetMapping
    public ResponseEntity<List<JobDescription>> getAllJobDescriptions() {
        List<JobDescription> jds = jobDescriptionRepository.findAll();
        return ResponseEntity.ok(jds);
    }

    @GetMapping("/{id}")
    public ResponseEntity<JobDescription> getJobDescription(@PathVariable Long id) {
        return jobDescriptionRepository.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<JobDescription> updateJobDescription(
            @PathVariable Long id, 
            @RequestBody Map<String, String> request) {
        
        return jobDescriptionRepository.findById(id)
            .map(jd -> {
                String jdText = request.get("description");
                JobDescription analyzed = jdAnalyzerService.analyzeJobDescription(jdText);
                
                jd.setJobTitle(analyzed.getJobTitle());
                jd.setCompanyName(analyzed.getCompanyName());
                jd.setDescription(analyzed.getDescription());
                jd.setRequiredSkills(analyzed.getRequiredSkills());
                jd.setPreferredSkills(analyzed.getPreferredSkills());
                jd.setResponsibilities(analyzed.getResponsibilities());
                
                JobDescription updated = jobDescriptionRepository.save(jd);
                return ResponseEntity.ok(updated);
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteJobDescription(@PathVariable Long id) {
        if (jobDescriptionRepository.existsById(id)) {
            jobDescriptionRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    @PutMapping("/{id}/title")
    public ResponseEntity<JobDescription> updateJobTitle(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {
        
        log.info("Received request to update job title for JD {}", id);
        
        return jobDescriptionRepository.findById(id)
            .map(jd -> {
                String newTitle = request.get("title");
                log.info("Updating job title for JD {} from '{}' to '{}'", id, jd.getJobTitle(), newTitle);
                jd.setJobTitle(newTitle);
                JobDescription updated = jobDescriptionRepository.save(jd);
                log.info("Successfully updated job title for JD {}", id);
                return ResponseEntity.ok(updated);
            })
            .orElseGet(() -> {
                log.error("Job Description with id {} not found", id);
                return ResponseEntity.notFound().build();
            });
    }
}
