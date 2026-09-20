import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import { requiredEnv } from '../../utils/env.js';

export const transporter: Transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: requiredEnv('EMAIL_USER'),
        pass: requiredEnv('EMAIL_PASSWORD')
    }
})