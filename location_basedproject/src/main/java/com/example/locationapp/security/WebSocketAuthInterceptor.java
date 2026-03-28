package com.example.locationapp.security;

import com.example.locationapp.model.Role;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;

public class WebSocketAuthInterceptor implements ChannelInterceptor {

    private final JwtUtil jwtUtil;

    public WebSocketAuthInterceptor(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(message);

        if (accessor.getCommand() != null && accessor.getCommand().name().equals("CONNECT")) {
            String token = (String) accessor.getSessionAttributes().get("jwt");
            if (token != null) {
                try {
                    var claims = jwtUtil.parse(token);
                    String email = claims.getBody().getSubject();

                    // ✅ Same fix as JwtAuthFilter — JJWT deserialises as Integer not Long
                    Long userId = ((Number) claims.getBody().get("userId")).longValue();
                    String roleStr = claims.getBody().get("role", String.class);
                    Role role = Role.valueOf(roleStr);

                    var principal = new UserPrincipal(userId, email, role);
                    accessor.setUser(new UsernamePasswordAuthenticationToken(
                            principal, null, principal.getAuthorities()
                    ));
                } catch (IllegalArgumentException e) {
                    System.out.println("Invalid role in JWT: " + e.getMessage());
                    return null;
                } catch (Exception e) {
                    System.out.println("Invalid JWT for WebSocket: " + e.getMessage());
                    return null;
                }
            } else {
                return null;
            }
        }

        return message;
    }
}