import type { PluginDescriptor, ResolvedPlugin } from "emdash";
import { definePlugin } from "emdash";
import nodemailer from "nodemailer";

import { version } from "../package.json";

export interface SmtpPluginOptions {
	defaultFrom?: string;
	defaultFromName?: string;
}

export function emailSmtpPlugin(
	options: SmtpPluginOptions = {},
): PluginDescriptor<SmtpPluginOptions> {
	return {
		id: "emdash-email-smtp",
		version,
		entrypoint: "@emdash-cms/plugin-email-smtp",
		options,
		capabilities: ["email:provide"],
		admin: {
			settingsSchema: {
				host: { type: "string", label: "SMTP Host", required: true },
				port: { type: "number", label: "SMTP Port", defaultValue: 587 },
				user: { type: "string", label: "SMTP User" },
				pass: { type: "secret", label: "SMTP Password" },
				fromEmail: { type: "email", label: "From email", required: true },
				fromName: { type: "string", label: "From name" },
			},
		},
	};
}

export function createPlugin(options: SmtpPluginOptions = {}): ResolvedPlugin {
	const { defaultFrom = "noreply@example.com", defaultFromName = "EmDash" } = options;

	return definePlugin({
		id: "emdash-email-smtp",
		version,
		capabilities: ["email:provide"],
		admin: {
			settingsSchema: {
				host: { type: "string", label: "SMTP Host", required: true },
				port: { type: "number", label: "SMTP Port", defaultValue: 587 },
				user: { type: "string", label: "SMTP User" },
				pass: { type: "secret", label: "SMTP Password" },
				fromEmail: { type: "email", label: "From email", required: true },
				fromName: { type: "string", label: "From name" },
			},
		},
		hooks: {
			"email:deliver": {
				exclusive: true,
				handler: async (event, ctx) => {
					const { message } = event;
					const kv = ctx.kv;

					const host = await kv.get<string>("host");
					const port = (await kv.get<number>("port")) ?? 587;
					const user = await kv.get<string>("user");
					const pass = await kv.get<string>("pass");
					const fromEmail = (await kv.get<string>("fromEmail")) ?? defaultFrom;
					const fromName = (await kv.get<string>("fromName")) ?? defaultFromName;

					if (!host) {
						throw new Error(
							"SMTP not configured. Go to Settings > Email and configure the SMTP provider.",
						);
					}

					const transporter = nodemailer.createTransport({
						host,
						port,
						secure: port === 465,
						auth: user && pass ? { user, pass } : undefined,
					});

					await transporter.sendMail({
						from: fromName ? `"${fromName}" <${fromEmail}>` : fromEmail,
						to: message.to,
						subject: message.subject,
						text: message.text,
						html: message.html,
					});
				},
			},
		},
		routes: {
			test: {
				handler: async (ctx) => {
					const body = (await ctx.request.json()) as { to?: string };
					const to = body?.to;
					if (!to || typeof to !== "string") {
						return { success: false, error: "Missing 'to' field" };
					}
					const kv = ctx.kv;

					const host = await kv.get<string>("host");
					const port = (await kv.get<number>("port")) ?? 587;
					const user = await kv.get<string>("user");
					const pass = await kv.get<string>("pass");
					const fromEmail = (await kv.get<string>("fromEmail")) ?? defaultFrom;

					if (!host) {
						return { success: false, error: "SMTP not configured" };
					}

					const transporter = nodemailer.createTransport({
						host,
						port,
						secure: port === 465,
						auth: user && pass ? { user, pass } : undefined,
					});

					try {
						await transporter.sendMail({
							from: fromEmail,
							to: to,
							subject: "Test email from EmDash",
							text: "This is a test email to verify SMTP configuration.",
						});
						return { success: true };
					} catch (error) {
						return {
							success: false,
							error: error instanceof Error ? error.message : "Unknown error",
						};
					}
				},
			},
		},
	});
}

export default createPlugin;
