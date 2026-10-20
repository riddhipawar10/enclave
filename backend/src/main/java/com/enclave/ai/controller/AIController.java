
package com.enclave.ai.controller;

import com.enclave.ai.service.OpenAIService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
public class AIController {

    private final OpenAIService openAIService;

    public AIController(OpenAIService openAIService) {
        this.openAIService = openAIService;
    }

    @PostMapping("/chat")
    public ResponseEntity<ChatResponse> chat(
            @Valid @RequestBody ChatRequest request) {

        String answer = openAIService.ask(request.message());

        return ResponseEntity.ok(new ChatResponse(answer));
    }

    public record ChatRequest(
            @NotBlank(message = "Message cannot be empty")
            @Size(max = 4000, message = "Message must not exceed 4000 characters")
            String message) {
    }

    public record ChatResponse(String answer) {
    }
}
