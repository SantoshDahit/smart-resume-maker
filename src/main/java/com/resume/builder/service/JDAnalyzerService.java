package com.resume.builder.service;

import com.resume.builder.model.JobDescription;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
@Slf4j
public class JDAnalyzerService {

    private static final Set<String> STOP_WORDS = Set.of(
        "a", "an", "and", "are", "as", "at", "be", "by", "for", "from",
        "has", "he", "in", "is", "it", "its", "of", "on", "that", "the",
        "to", "was", "will", "with", "this", "but", "they", "have"
    );

    public JobDescription analyzeJobDescription(String jdText) {
        JobDescription jd = new JobDescription();
        jd.setDescription(jdText);
        
        // Extract job title
        String jobTitle = extractJobTitle(jdText);
        jd.setJobTitle(jobTitle);
        
        // Extract company name (if mentioned)
        String companyName = extractCompanyName(jdText);
        jd.setCompanyName(companyName);
        
        // Extract required skills
        Set<String> requiredSkills = extractSkills(jdText, true);
        jd.setRequiredSkills(String.join(", ", requiredSkills));
        
        // Extract preferred skills
        Set<String> preferredSkills = extractSkills(jdText, false);
        jd.setPreferredSkills(String.join(", ", preferredSkills));
        
        // Extract responsibilities
        String responsibilities = extractResponsibilities(jdText);
        jd.setResponsibilities(responsibilities);
        
        return jd;
    }

    private String extractJobTitle(String text) {
        // Look for common job title patterns in first few lines
        String[] lines = text.split("\n");
        
        // Common job title keywords - expanded list
        String[] titleKeywords = {
            "engineer", "developer", "manager", "analyst", "designer", "consultant", 
            "architect", "specialist", "coordinator", "lead", "director", "officer",
            "administrator", "technician", "scientist", "researcher", "associate",
            "executive", "supervisor", "assistant", "representative", "agent",
            "programmer", "tester", "qa", "devops", "sre", "scrum master", "product owner"
        };
        
        // First try: Look in first 5 lines for job title patterns
        for (int i = 0; i < Math.min(5, lines.length); i++) {
            String line = lines[i].trim();
            
            // Skip empty lines
            if (line.isEmpty()) continue;
            
            // Check if line contains any title keyword and is reasonably short
            if (line.length() < 100 && line.length() > 3) {
                for (String keyword : titleKeywords) {
                    if (line.toLowerCase().contains(keyword)) {
                        // Clean up the line (remove extra whitespace, common prefixes)
                        String cleaned = line
                            .replaceAll("(?i)^(position:|job title:|role:|title:)\\s*", "")
                            .trim();
                        if (!cleaned.isEmpty()) {
                            return cleaned;
                        }
                    }
                }
            }
        }
        
        // Second try: Look for "Job Title:" or "Position:" patterns anywhere in text
        Pattern titlePattern = Pattern.compile("(?i)(job title|position|role):\\s*([^\\n]+)", Pattern.CASE_INSENSITIVE);
        Matcher matcher = titlePattern.matcher(text);
        if (matcher.find()) {
            String title = matcher.group(2).trim();
            if (title.length() < 100 && !title.isEmpty()) {
                return title;
            }
        }
        
        // Third try: First non-empty line that's short enough (likely the title)
        for (String line : lines) {
            line = line.trim();
            if (!line.isEmpty() && line.length() < 80 && line.length() > 3) {
                // Avoid lines that look like sections or headers
                if (!line.toLowerCase().matches(".*(description|about|overview|summary|company).*")) {
                    return line;
                }
            }
        }
        
        // Fallback
        return "Untitled Position";
    }

    private String extractCompanyName(String text) {
        Pattern pattern = Pattern.compile("(?i)(company|organization|at)\\s+([A-Z][a-zA-Z\\s&]+)");
        Matcher matcher = pattern.matcher(text);
        if (matcher.find()) {
            return matcher.group(2).trim();
        }
        return "";
    }

    private Set<String> extractSkills(String text, boolean required) {
        Set<String> skills = new HashSet<>();
        
        // Common technical skills and keywords
        String[] commonSkills = {
            "java", "python", "javascript", "react", "angular", "vue", "node.js", "spring boot",
            "sql", "mysql", "postgresql", "mongodb", "aws", "azure", "docker", "kubernetes",
            "git", "jenkins", "ci/cd", "rest api", "microservices", "agile", "scrum",
            "machine learning", "ai", "data analysis", "html", "css", "typescript",
            "c++", "c#", ".net", "php", "ruby", "go", "kotlin", "swift",
            "redux", "graphql", "webpack", "linux", "unix", "bash"
        };
        
        String lowerText = text.toLowerCase();
        
        // Check for each skill
        for (String skill : commonSkills) {
            if (lowerText.contains(skill.toLowerCase())) {
                skills.add(skill);
            }
        }
        
        // Extract skills from "Required Skills" or "Qualifications" section
        if (required) {
            String requiredSection = extractSectionByKeyword(text, "required", "qualifications", "must have");
            skills.addAll(extractKeywordsFromText(requiredSection));
        } else {
            String preferredSection = extractSectionByKeyword(text, "preferred", "nice to have", "plus");
            skills.addAll(extractKeywordsFromText(preferredSection));
        }
        
        return skills;
    }

    private String extractResponsibilities(String text) {
        return extractSectionByKeyword(text,
            "responsibilities", "duties", "you will", "role");
    }

    private String extractSectionByKeyword(String text, String... keywords) {
        String lowerText = text.toLowerCase();
        
        for (String keyword : keywords) {
            int startIndex = lowerText.indexOf(keyword);
            if (startIndex != -1) {
                int endIndex = findNextSectionStart(lowerText, startIndex + keyword.length());
                if (endIndex == -1) {
                    endIndex = Math.min(startIndex + 1000, text.length());
                }
                return text.substring(startIndex, endIndex).trim();
            }
        }
        
        return "";
    }

    private int findNextSectionStart(String text, int fromIndex) {
        String[] sections = {
            "requirements", "qualifications", "responsibilities", "benefits",
            "about us", "about the company", "equal opportunity"
        };
        
        int minIndex = -1;
        for (String section : sections) {
            int index = text.indexOf(section, fromIndex);
            if (index != -1 && (minIndex == -1 || index < minIndex)) {
                minIndex = index;
            }
        }
        
        return minIndex;
    }

    private Set<String> extractKeywordsFromText(String text) {
        Set<String> keywords = new HashSet<>();
        
        // Split by common delimiters
        String[] words = text.toLowerCase().split("[\\s,;.()\\[\\]{}]+");
        
        for (String word : words) {
            word = word.trim();
            // Filter: not empty, not stop word, length > 2
            if (!word.isEmpty() && !STOP_WORDS.contains(word) && word.length() > 2) {
                keywords.add(word);
            }
        }
        
        return keywords;
    }

    public Set<String> extractAllKeywords(String text) {
        return extractKeywordsFromText(text);
    }
}
