package com.example.locationapp.controller;
import com.example.locationapp.model.Role;
import com.example.locationapp.model.User;
import com.example.locationapp.repository.UserRepository;
import com.example.locationapp.security.UserPrincipal;
import com.google.gson.JsonObject;
import com.stripe.Stripe;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.model.Event;
import com.stripe.net.Webhook;
import com.stripe.param.checkout.SessionCreateParams;
import com.stripe.model.checkout.Session;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "http://localhost:5173")
public class PaymentController {

    private final UserRepository userRepository;

    @Value("${stripe.secret.key}")
    private String stripeSecretKey;

    @Value("${stripe.webhook.secret}")
    private String webhookSecret;

    @Value("${stripe.premium.price.id}")
    private String premiumPriceId;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    public PaymentController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // ✅ Create Stripe checkout session
    @PostMapping("/create-checkout-session")
    public ResponseEntity<?> createCheckoutSession(
            @AuthenticationPrincipal UserPrincipal principal) {
        try {
            Stripe.apiKey = stripeSecretKey;

            SessionCreateParams params = SessionCreateParams.builder()
                    .setMode(SessionCreateParams.Mode.SUBSCRIPTION)
                    .setSuccessUrl(frontendUrl + "/payment/success?session_id={CHECKOUT_SESSION_ID}")
                    .setCancelUrl(frontendUrl + "/payment/cancel")
                    .putMetadata("userId", principal.getUserId().toString())
                    .addLineItem(
                            SessionCreateParams.LineItem.builder()
                                    .setPrice(premiumPriceId)
                                    .setQuantity(1L)
                                    .build()
                    )
                    .build();

            Session session = Session.create(params);
            System.out.println("==> Checkout session created for userId: " + principal.getUserId());
            return ResponseEntity.ok(Map.of("url", session.getUrl()));

        } catch (Exception e) {
            System.out.println("==> Checkout session error: " + e.getMessage());
            return ResponseEntity.badRequest().body("Failed to create checkout session: " + e.getMessage());
        }
    }

    // ✅ Stripe webhook — handles all events using raw JSON parsing
    @PostMapping("/webhook")
    public ResponseEntity<String> handleWebhook(
            @RequestBody String payload,
            @RequestHeader("Stripe-Signature") String sigHeader) {
        try {
            // ✅ Verify webhook signature
            Event event = Webhook.constructEvent(payload, sigHeader, webhookSecret);
            System.out.println("==> Stripe webhook received: " + event.getType());

            // ✅ Parse raw JSON — works with all Stripe API versions including 2026-03-25.dahlia
            JsonObject dataObject = com.stripe.model.StripeObject.PRETTY_PRINT_GSON
                    .fromJson(payload, JsonObject.class)
                    .getAsJsonObject("data")
                    .getAsJsonObject("object");

            switch (event.getType()) {

                case "checkout.session.completed" -> {
                    System.out.println("==> Processing checkout.session.completed");
                    System.out.println("==> Session data: " + dataObject);

                    JsonObject metadata = dataObject.getAsJsonObject("metadata");
                    if (metadata != null && metadata.has("userId")) {
                        String userId = metadata.get("userId").getAsString();
                        System.out.println("==> Payment completed for userId: " + userId);

                        userRepository.findById(Long.parseLong(userId)).ifPresentOrElse(
                                user -> {
                                    user.setRole(Role.HOST_PREMIUM);
                                    userRepository.save(user);
                                    System.out.println("==> ✅ Upgraded user " + userId + " to HOST_PREMIUM");
                                },
                                () -> System.out.println("==> ❌ User not found: " + userId)
                        );
                    } else {
                        System.out.println("==> ❌ No userId found in metadata — metadata: " + metadata);
                    }
                }

                case "customer.subscription.deleted" -> {
                    System.out.println("==> Processing customer.subscription.deleted");

                    JsonObject metadata = dataObject.getAsJsonObject("metadata");
                    if (metadata != null && metadata.has("userId")) {
                        String userId = metadata.get("userId").getAsString();
                        System.out.println("==> Subscription cancelled for userId: " + userId);

                        userRepository.findById(Long.parseLong(userId)).ifPresentOrElse(
                                user -> {
                                    user.setRole(Role.HOST);
                                    userRepository.save(user);
                                    System.out.println("==> Downgraded user " + userId + " to HOST");
                                },
                                () -> System.out.println("==> User not found: " + userId)
                        );
                    } else {
                        System.out.println("==> No userId in subscription metadata");
                    }
                }

                case "invoice.payment_succeeded" -> {
                    // ✅ Also handle recurring payments — keep user as premium
                    System.out.println("==> Invoice payment succeeded — subscription renewed");
                }

                case "invoice.payment_failed" -> {
                    // ✅ Payment failed — optionally downgrade user
                    System.out.println("==> Invoice payment failed — consider downgrading user");
                }

                default -> System.out.println("==> Unhandled event type: " + event.getType());
            }

            return ResponseEntity.ok("success");

        } catch (SignatureVerificationException e) {
            System.out.println("==> ❌ Invalid webhook signature: " + e.getMessage());
            return ResponseEntity.badRequest().body("Invalid signature");
        } catch (Exception e) {
            System.out.println("==> ❌ Webhook error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Webhook error: " + e.getMessage());
        }
    }

    // ✅ Get current user's payment status — reads from database (not JWT)
    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getStatus(
            @AuthenticationPrincipal UserPrincipal principal) {
        try {
            User user = userRepository.findById(principal.getUserId())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            return ResponseEntity.ok(Map.of(
                    "isPremium", user.getRole() == Role.HOST_PREMIUM,
                    "role", user.getRole().name()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "isPremium", false,
                    "role", "HOST"
            ));
        }
    }
}