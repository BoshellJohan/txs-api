import { SpanStatusCode } from "@opentelemetry/api";
import { tracer } from "../../common/tracer.js";
import { transporter } from "./mail.config.js";
import { resetPasswordTemplate } from "./templates/resetPassword.js";

export async function sendPasswordResetEmail(email: string, token: string): Promise<void>{
    const link = `${process.env.FRONT_URL}/reset-password?token=${token}`;

    return tracer.startActiveSpan('mail.sendResetPasswordMail', async (span) => {
        try {
            await transporter.sendMail({
                to: email,
                subject: 'Reset your password - PRESTEMONOS.COM',
                html: resetPasswordTemplate(link)
            });
        } catch (error) {
            if(error instanceof Error){
                span.recordException(error);
                span.setStatus({ code: SpanStatusCode.ERROR, message: error.message});
            } else {
                span.setStatus({ code: SpanStatusCode.ERROR, message: 'Error while sending reset password email'});
            }

            throw error;
        } finally {
            span.end();
        }
    });
}