package com.smoothmanage.smooth_manage.auth.infrastructure.email;

import com.smoothmanage.smooth_manage.auth.application.port.out.EmailService;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Component;

@Component
public class SmtpEmailService implements EmailService {

    private final JavaMailSender mailSender;
    private final String from;
    private final String frontendUrl;

    public SmtpEmailService(JavaMailSender mailSender,
                            @Value("${app.email.from}") String from,
                            @Value("${app.frontend.url}") String frontendUrl) {
        this.mailSender = mailSender;
        this.from = from;
        this.frontendUrl = frontendUrl;
    }

    @Override
    public void sendEmailVerification(String to, String token) {
        String verificationUrl = frontendUrl + "/verify-email?token=" + token;
        String html = """
            <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #2563eb;">Verifica tu cuenta</h2>
                    <p>Gracias por registrarte en SmoothManage. Haz clic en el botón de abajo para verificar tu dirección de email:</p>
                    <p style="text-align: center; margin: 30px 0;">
                        <a href="%s" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                            Verificar email
                        </a>
                    </p>
                    <p>O copia y pega este enlace en tu navegador:</p>
                    <p style="word-break: break-all; color: #666;">%s</p>
                    <p>Este enlace expira en 24 horas.</p>
                    <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
                    <p style="color: #999; font-size: 12px;">Si no creaste esta cuenta, ignora este email.</p>
                </div>
            </body>
            </html>
            """.formatted(verificationUrl, verificationUrl);

        sendHtmlEmail(to, "Verifica tu cuenta en SmoothManage", html);
    }

    @Override
    public void sendPasswordReset(String to, String token) {
        String resetUrl = frontendUrl + "/reset-password?token=" + token;
        String html = """
            <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #dc2626;">Restablecer contraseña</h2>
                    <p>Recibiste este email porque se solicitó restablecer la contraseña de tu cuenta.</p>
                    <p style="text-align: center; margin: 30px 0;">
                        <a href="%s" style="background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                            Restablecer contraseña
                        </a>
                    </p>
                    <p>O copia y pega este enlace en tu navegador:</p>
                    <p style="word-break: break-all; color: #666;">%s</p>
                    <p>Este enlace expira en 1 hora.</p>
                    <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
                    <p style="color: #999; font-size: 12px;">Si no solicitaste esto, ignora este email.</p>
                </div>
            </body>
            </html>
            """.formatted(resetUrl, resetUrl);

        sendHtmlEmail(to, "Restablece tu contraseña en SmoothManage", html);
    }

    private void sendHtmlEmail(String to, String subject, String html) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(from);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(html, true);
            mailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException("Failed to send email to " + to, e);
        }
    }
}
