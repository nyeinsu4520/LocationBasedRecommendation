package com.example.locationapp.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.internet.MimeMessage;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.base.url}")
    private String baseUrl;

    @Value("${spring.mail.username}")
    private String fromEmail;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendVerificationEmail(String toEmail, String name, String token) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("Verify your Evanto account");

            String verifyUrl = "http://localhost:8080/api/auth/verify?token=" + token;

String html = """
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #0f172a 0%%, #1e293b 100%%); padding: 40px 32px; border-radius: 16px 16px 0 0; text-align: center;">
            <div style="display: inline-flex; align-items: center; gap: 10px;">
                
                <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">Evanto</h1>
            </div>
            <p style="color: #94a3b8; margin: 12px 0 0 0; font-size: 14px;">Location-based event discovery</p>
        </div>

        <!-- Body -->
        <div style="background: #f8fafc; padding: 40px 32px; border-left: 1px solid #e2e8f0; border-right: 1px solid #e2e8f0;">

            <h2 style="color: #0f172a; margin: 0 0 8px 0; font-size: 22px; font-weight: 700; text-align: center;">
                Welcome, %s! 
            </h2>
            <p style="color: #64748b; text-align: center; margin: 0 0 32px 0; font-size: 15px; line-height: 1.6;">
                You're almost ready to start discovering events near you.<br/>
                Just verify your email to activate your account.
            </p>

            <!-- Button -->
            <div style="text-align: center; margin: 32px 0;">
                <a href="%s"
                   style="display: inline-block; background: #0f172a; color: white;
                          padding: 14px 36px; border-radius: 10px; text-decoration: none;
                          font-weight: 700; font-size: 15px; letter-spacing: 0.3px;
                          box-shadow: 0 4px 12px rgba(15,23,42,0.3);">
                    ✅ Verify My Email
                </a>
            </div>

            <!-- Divider -->
            <div style="border-top: 1px solid #e2e8f0; margin: 32px 0;"></div>

            <!-- What's next -->
            <p style="color: #475569; font-size: 14px; font-weight: 600; margin: 0 0 12px 0;">
                What you can do after verifying:
            </p>
            <div style="display: flex; flex-direction: column; gap: 10px;">
                <div style="display: flex; align-items: center; gap: 10px;">
                    <span style="font-size: 13px;">📍</span>
                    <span style="color: #64748b; font-size: 14px;">Discover events near your location</span>
                </div>
                <div style="display: flex; align-items: center; gap: 10px;">
                    <span style="font-size: 13px;">💬</span>
                    <span style="color: #64748b; font-size: 14px;">Join event chats and connect with people</span>
                </div>
                <div style="display: flex; align-items: center; gap: 10px;">
                    <span style="font-size: 13px;">🎯</span>
                    <span style="color: #64748b; font-size: 14px;">Request to become a host and create events</span>
                </div>
            </div>
        </div>

        <!-- Footer -->
        <div style="background: #1e293b; padding: 24px 32px; border-radius: 0 0 16px 16px; text-align: center;">
            <p style="color: #94a3b8; font-size: 12px; margin: 0 0 8px 0;">
                This link expires in <strong style="color: #cbd5e1;">24 hours</strong>.
            </p>
            <p style="color: #64748b; font-size: 11px; margin: 0;">
                If you didn't create an Evanto account, you can safely ignore this email.
            </p>
            <p style="color: #475569; font-size: 11px; margin: 12px 0 0 0;">
                © 2026 Evanto · All rights reserved
            </p>
        </div>

    </div>
    """.formatted(name, verifyUrl);

            helper.setText(html, true);
            mailSender.send(message);
            System.out.println("==> Verification email sent to: " + toEmail);

        } catch (Exception e) {
            System.out.println("==> Email failed: " + e.getMessage());
        }
    }

    public void sendWelcomeEmail(String toEmail, String name) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("Welcome to Evanto!");

            String html = """
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: #0f172a; padding: 30px; border-radius: 12px 12px 0 0;">
                        <h1 style="color: white; margin: 0; font-size: 21px;">Evanto</h1>
                    </div>
                    <div style="background: #f8fafc; padding: 32px; border-radius: 0 0 12px 12px; border: 1px solid #e2e8f0;">
                        <h2 style="color: #0f172a; margin-top: 0;">You're verified, %s! </h2>
                        <p style="color: #475569;">Your account is now active. Start exploring events near you!</p>
                        <a href="%s/locations"
                           style="display: inline-block; background: #0f172a; color: white;
                                  padding: 12px 24px; border-radius: 8px; text-decoration: none;
                                  font-weight: bold; margin: 16px 0;">
                            Explore Events
                        </a>
                    </div>
                </div>
                """.formatted(name, baseUrl);

            helper.setText(html, true);
            mailSender.send(message);
        } catch (Exception e) {
            System.out.println("==> Welcome email failed: " + e.getMessage());
        }
    }
}