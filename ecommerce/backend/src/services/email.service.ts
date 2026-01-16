import nodemailer from 'nodemailer';
import handlebars from 'handlebars';
import path from 'path';
import fs from 'fs/promises';
import env from '../config/env';

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: false,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
});

const templateCache: Map<string, HandlebarsTemplateDelegate> = new Map();

/**
 * Load and compile a Handlebars template
 */
const loadTemplate = async (templateName: string): Promise<HandlebarsTemplateDelegate> => {
  if (templateCache.has(templateName)) {
    return templateCache.get(templateName)!;
  }

  const templatePath = path.join(__dirname, '../templates/emails', `${templateName}.hbs`);
  const templateSource = await fs.readFile(templatePath, 'utf-8');
  const template = handlebars.compile(templateSource);

  templateCache.set(templateName, template);

  return template;
};

/**
 * Send email using a Handlebars template
 */
const sendTemplateEmail = async (
  to: string,
  subject: string,
  templateName: string,
  data: Record<string, any>
) => {
  try {
    const template = await loadTemplate(templateName);

    const html = template({
      ...data,
      year: new Date().getFullYear(),
      supportEmail: env.SMTP_USER,
    });

    await transporter.sendMail({
      from: `"Premium Purchases" <${env.SMTP_USER}>`,
      to,
      subject,
      html,
    });

    console.log(`Email sent to ${to} using template: ${templateName}`);
  } catch (error) {
    console.error(`Error sending email to ${to}:`, error);
    throw new Error('Failed to send email');
  }
};

/**
 * Send verification email
 */
export const sendVerificationEmail = async (email: string, token: string, name: string) => {
  const verificationUrl = `${env.FRONTEND_URL}/verify-email/${token}`;

  await sendTemplateEmail(
    email,
    'Verify Your Email Address',
    'verification',
    {
      name,
      verificationUrl,
    }
  );
};

/**
 * Send password reset email
 */
export const sendPasswordResetEmail = async (email: string, token: string, name: string) => {
  const resetUrl = `${env.FRONTEND_URL}/reset-password/${token}`;

  await sendTemplateEmail(
    email,
    'Reset Your Password',
    'password-reset',
    {
      name,
      resetUrl,
    }
  );
};

/**
 * Send password reset confirmation email
 */
export const sendPasswordResetConfirmation = async (email: string, name: string) => {
  try {
    await sendTemplateEmail(
      email,
      'Password Reset Successful',
      'password-reset-confirmation',
      {
        name,
      }
    );
  } catch (error) {
    console.error('Error sending confirmation email:', error);
  }
};

/**
 * Send order confirmation email
 */
export const sendOrderConfirmationEmail = async (
  email: string,
  name: string,
  order: {
    id: string;
    totalAmount: number;
    items: Array<{ name: string; quantity: number; price: number }>;
    shippingAddress: {
      line1: string;
      line2?: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
    };
    status: string;
    createdAt: Date;
  }
) => {
  const orderUrl = `${env.FRONTEND_URL}/orders/${order.id}`;

  await sendTemplateEmail(
    email,
    `Order Confirmation - #${order.id}`,
    'order-confirmation',
    {
      name,
      orderId: order.id,
      totalAmount: order.totalAmount.toFixed(2),
      orderDate: order.createdAt.toLocaleDateString(),
      status: order.status,
      items: order.items.map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price.toFixed(2),
      })),
      shippingAddress: order.shippingAddress,
      orderUrl,
    }
  );
};
