"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.enviarEmail = void 0;
const https_1 = require("firebase-functions/v2/https");
const nodemailer = __importStar(require("nodemailer"));
exports.enviarEmail = (0, https_1.onCall)({
    region: 'southamerica-east1',
    cors: true,
}, async (request) => {
    const { destinatario, assunto, corpo, provider } = request.data;
    if (!destinatario || !assunto || !corpo) {
        throw new https_1.HttpsError('invalid-argument', 'Campos obrigatórios: destinatario, assunto, corpo');
    }
    // Validação básica de e-mail
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(destinatario)) {
        throw new https_1.HttpsError('invalid-argument', 'E-mail do destinatário inválido');
    }
    let transporter;
    let fromEmail;
    if (provider === 'outlook') {
        const user = process.env.OUTLOOK_USER;
        const pass = process.env.OUTLOOK_PASSWORD;
        if (!user || !pass) {
            throw new https_1.HttpsError('failed-precondition', 'Credenciais do Outlook não configuradas no .env');
        }
        transporter = nodemailer.createTransport({
            host: 'smtp.office365.com',
            port: 587,
            secure: false,
            auth: { user, pass },
            tls: { ciphers: 'SSLv3' },
        });
        fromEmail = user;
    }
    else {
        // Gmail (padrão)
        const user = process.env.GMAIL_USER;
        const pass = process.env.GMAIL_APP_PASSWORD;
        if (!user || !pass) {
            throw new https_1.HttpsError('failed-precondition', 'Credenciais do Gmail não configuradas no .env');
        }
        transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: { user, pass },
        });
        fromEmail = user;
    }
    try {
        await transporter.sendMail({
            from: `"CompraFácil" <${fromEmail}>`,
            to: destinatario,
            subject: assunto,
            html: corpo,
        });
        return { success: true, message: 'E-mail enviado com sucesso!' };
    }
    catch (error) {
        const msg = error instanceof Error ? error.message : 'Erro desconhecido ao enviar e-mail';
        throw new https_1.HttpsError('internal', `Falha ao enviar e-mail: ${msg}`);
    }
});
//# sourceMappingURL=index.js.map