import nodemailer from 'nodemailer';
import handlebars from 'handlebars';
import path from 'path';
import fs from 'fs/promises';
import env from '../../config/env';
import { BaseExternalService } from './base.service';

class EmailService extends BaseExternalService {
    protected readonly serviceName = 'Email';
    private transporter: nodemailer.Transporter;
    private templateCache: Map<string, HandlebarsTemplateDelegate> = new Map();

    constructor() {
        super();
        this.transporter = nodemailer.createTransport({
            host: env.SMTP_HOST,
            port: env.SMTP_PORT,
            secure: false,
            auth: {
                user: env.SMTP_USER,
                pass: env.SMTP_PASS,
            },
        });
    }

    /**
     * Load and compile a Handlebars template
     */
    private async loadTemplate(templateName: string): Promise<HandlebarsTemplateDelegate> {
        if (this.templateCache.has(templateName)) {
            return this.templateCache.get(templateName)!;
        }

        const templatePath = path.join(__dirname, '../../templates/emails', `${templateName}.hbs`);
        const templateSource = await fs.readFile(templatePath, 'utf-8');
        const template = handlebars.compile(templateSource);

        this.templateCache.set(templateName, template);
        return template;
    }

    /**
     * Send email using a template
     */
    async sendEmail(
        to: string,
        subject: string,
        templateName: string,
        data: Record<string, any>
    ): Promise<void> {
        try {
            this.log('Sending email', { to, subject, template: templateName });
            const template = await this.loadTemplate(templateName);
            const html = template({
                ...data,
                year: new Date().getFullYear(),
                supportEmail: env.SMTP_USER,
            });

            await this.transporter.sendMail({
                from: `"Premium Purchases" <${env.SMTP_USER}>`,
                to,
                subject,
                html,
            });
        } catch (error) {
            this.handleError(error, 'sendEmail');
        }
    }

    /**
     * Domain specific helpers
     */
    async sendVerificationEmail(email: string, token: string, name: string) {
        const verificationUrl = `${env.FRONTEND_URL}/verify-email/${token}`;
        return this.sendEmail(email, 'Verify Your Email Address', 'verification', { name, verificationUrl });
    }

    async sendPasswordResetEmail(email: string, token: string, name: string) {
        const resetUrl = `${env.FRONTEND_URL}/reset-password/${token}`;
        return this.sendEmail(email, 'Reset Your Password', 'password-reset', { name, resetUrl });
    }

    async sendPasswordResetConfirmation(email: string, name: string) {
        return this.sendEmail(email, 'Password Reset Successful', 'password-reset-confirmation', { name });
    }

    async sendOrderConfirmationEmail(email: string, name: string, order: any) {
        const orderUrl = `${env.FRONTEND_URL}/orders/${order.id}`;
        return this.sendEmail(email, `Order Confirmation - #${order.id}`, 'order-confirmation', {
            name,
            orderId: order.id,
            totalAmount: order.totalAmount.toFixed(2),
            orderDate: order.createdAt.toLocaleDateString(),
            status: order.status,
            items: order.items.map((item: any) => ({
                name: item.name,
                quantity: item.quantity,
                price: item.price.toFixed(2),
            })),
            shippingAddress: order.shippingAddress,
            orderUrl,
        });
    }
}

export const emailService = new EmailService();
