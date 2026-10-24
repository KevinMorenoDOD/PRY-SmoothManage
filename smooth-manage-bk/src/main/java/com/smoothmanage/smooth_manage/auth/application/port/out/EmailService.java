package com.smoothmanage.smooth_manage.auth.application.port.out;

public interface EmailService {

    void sendEmailVerification(String to, String token);

    void sendPasswordReset(String to, String token);
}