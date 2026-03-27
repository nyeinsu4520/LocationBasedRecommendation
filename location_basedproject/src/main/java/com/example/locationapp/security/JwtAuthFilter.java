package com.example.locationapp.security;

import com.example.locationapp.model.Role;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;
import java.util.List;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;

    public JwtAuthFilter(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String auth = request.getHeader("Authorization");

        if ((auth == null || !auth.startsWith("Bearer ")) && request.getParameter("token") != null) {
            auth = "Bearer " + request.getParameter("token");
        }

        if (auth != null && auth.startsWith("Bearer ")) {
            String token = auth.substring(7);

            try {
                Jws<Claims> parsed = jwtUtil.parse(token);
                String email = parsed.getBody().getSubject();
                Long userId = parsed.getBody().get("userId", Long.class);
                String roleStr = parsed.getBody().get("role", String.class);
                Role role = Role.valueOf(roleStr);

                var principal = new UserPrincipal(userId, email,role);
                var authentication = new UsernamePasswordAuthenticationToken(
                        principal,
                        null,
                        principal.getAuthorities()
                );
                SecurityContextHolder.getContext().setAuthentication(authentication);

            }catch(IllegalArgumentException e){
                response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                return;
            }catch (Exception e) {
                response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                return;
            }
        }

        filterChain.doFilter(request, response);
    }
}