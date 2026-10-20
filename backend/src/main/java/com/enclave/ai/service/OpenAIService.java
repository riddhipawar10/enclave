
package com.enclave.ai.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.Map;

@Service
public class OpenAIService {

    private static final Logger logger =
            LoggerFactory.getLogger(OpenAIService.class);

    @Value("${openai.api-key}")
    private String apiKey;

    @Value("${openai.model}")
    private String model;

    @Value("${openai.base-url}")
    private String baseUrl;

    private final ObjectMapper objectMapper;
    private final HttpClient httpClient;

    public OpenAIService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;

        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(15))
                .build();
    }

    public String ask(String question) {

        if (question == null || question.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Please enter a question."
            );
        }

        if (question.length() > 4000) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Your question must be 4000 characters or fewer."
            );
        }

        if (apiKey == null || apiKey.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.SERVICE_UNAVAILABLE,
                    "AI Assistant is not configured."
            );
        }

        try {
            Map<String, Object> requestBody = Map.of(
                    "model", model,
                    "instructions",
                    "You are Enclave AI Assistant. Answer general questions " +
                    "and help users understand how to use Enclave, a project " +
                    "and task management application. Be friendly, clear, " +
                    "and beginner-friendly. Do not claim to have accessed " +
                    "live Enclave data. Never ask users to share passwords " +
                    "or API keys.",
                    "input", question
            );

            String json = objectMapper.writeValueAsString(requestBody);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(
                            baseUrl.replaceAll("/+$", "") + "/responses"
                    ))
                    .timeout(Duration.ofSeconds(60))
                    .header("Authorization", "Bearer " + apiKey)
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(json))
                    .build();

            HttpResponse<String> response = httpClient.send(
                    request,
                    HttpResponse.BodyHandlers.ofString()
            );

            if (response.statusCode() < 200
                    || response.statusCode() >= 300) {

                // Log the provider's error so the real cause can be diagnosed.
                // Never log the API key or Authorization header.
                logger.error(
                        "OpenAI API returned HTTP status {}. Response body: {}",
                        response.statusCode(),
                        response.body()
                );

                throw new ResponseStatusException(
                        HttpStatus.BAD_GATEWAY,
                        "The AI provider could not complete your request. " +
                        "Please try again."
                );
            }

            JsonNode root = objectMapper.readTree(response.body());
            JsonNode output = root.path("output");

            StringBuilder answer = new StringBuilder();

            for (JsonNode item : output) {

                if ("message".equals(item.path("type").asText())) {

                    for (JsonNode content : item.path("content")) {

                        if ("output_text".equals(
                                content.path("type").asText())) {

                            if (!answer.isEmpty()) {
                                answer.append("\n");
                            }

                            answer.append(
                                    content.path("text").asText("")
                            );
                        }
                    }
                }
            }

            if (answer.isEmpty()) {
                logger.error(
                        "OpenAI returned a successful response without " +
                        "output text. Response ID: {}",
                        root.path("id").asText("unknown")
                );

                throw new ResponseStatusException(
                        HttpStatus.BAD_GATEWAY,
                        "The AI returned an empty answer. Please try again."
                );
            }

            return answer.toString();

        } catch (ResponseStatusException ex) {

            throw ex;

        } catch (InterruptedException ex) {

            Thread.currentThread().interrupt();

            throw new ResponseStatusException(
                    HttpStatus.SERVICE_UNAVAILABLE,
                    "The AI request was interrupted. Please try again."
            );

        } catch (IOException | IllegalArgumentException ex) {

            logger.error("Unable to communicate with the OpenAI API", ex);

            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "Unable to communicate with the AI provider."
            );
        }
    }
}
