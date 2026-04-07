import { onCall, HttpsError } from 'firebase-functions/v2/https'
import * as nodemailer from 'nodemailer'

export const enviarEmail = onCall(
  {
    region: 'southamerica-east1',
    cors: true,
  },
  async (request) => {
    const { destinatario, assunto, corpo, provider } = request.data

    if (!destinatario || !assunto || !corpo) {
      throw new HttpsError('invalid-argument', 'Campos obrigatórios: destinatario, assunto, corpo')
    }

    // Validação básica de e-mail
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(destinatario)) {
      throw new HttpsError('invalid-argument', 'E-mail do destinatário inválido')
    }

    let transporter: nodemailer.Transporter
    let fromEmail: string

    if (provider === 'outlook') {
      const user = process.env.OUTLOOK_USER
      const pass = process.env.OUTLOOK_PASSWORD
      if (!user || !pass) {
        throw new HttpsError('failed-precondition', 'Credenciais do Outlook não configuradas no .env')
      }
      transporter = nodemailer.createTransport({
        host: 'smtp.office365.com',
        port: 587,
        secure: false,
        auth: { user, pass },
        tls: { ciphers: 'SSLv3' },
      })
      fromEmail = user
    } else {
      // Gmail (padrão)
      const user = process.env.GMAIL_USER
      const pass = process.env.GMAIL_APP_PASSWORD
      if (!user || !pass) {
        throw new HttpsError('failed-precondition', 'Credenciais do Gmail não configuradas no .env')
      }
      transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user, pass },
      })
      fromEmail = user
    }

    try {
      await transporter.sendMail({
        from: `"CompraFácil" <${fromEmail}>`,
        to: destinatario,
        subject: assunto,
        html: corpo,
      })

      return { success: true, message: 'E-mail enviado com sucesso!' }
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Erro desconhecido ao enviar e-mail'
      throw new HttpsError('internal', `Falha ao enviar e-mail: ${msg}`)
    }
  }
)
