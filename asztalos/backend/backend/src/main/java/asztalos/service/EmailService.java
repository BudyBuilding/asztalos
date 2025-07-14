package asztalos.service;

import org.springframework.stereotype.Service;

import asztalos.model.User;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.beans.factory.annotation.Value;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;
    @Value("${mail.from}") private String from;

    public void sendResetMail(User user, String token) {
        String resetUrl = "https://asztalosoft.hu/reset-password?token=" + token;
        SimpleMailMessage msg = new SimpleMailMessage();
        msg.setTo(user.getEmail());
        msg.setSubject("Password reset");
        msg.setFrom(from);
        msg.setText("""
                Hello %s!
                
                Someone (hopefully you) asked for a password reset.
                Click the link below (valid for 30 minutes), then choose a new password:
                
                %s
                
                If you didn’t request this, just ignore the e-mail.
                """.formatted(user.getUsername(), resetUrl));
        mailSender.send(msg);
    }
}
