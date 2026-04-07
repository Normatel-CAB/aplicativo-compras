import { httpsCallable } from 'firebase/functions'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { functions, db } from '../firebase'

export type EmailProvider = 'gmail' | 'outlook'

interface EnviarEmailParams {
  destinatario: string
  assunto: string
  corpo: string
  provider: EmailProvider
}

interface EnviarEmailResult {
  success: boolean
  message?: string
}

export async function enviarEmail(params: EnviarEmailParams): Promise<EnviarEmailResult> {
  try {
    const fn = httpsCallable<EnviarEmailParams, EnviarEmailResult>(functions, 'enviarEmail')
    const result = await fn(params)

    // Log no Firestore
    await addDoc(collection(db, 'emails_enviados'), {
      destinatario: params.destinatario,
      assunto: params.assunto,
      provider: params.provider,
      status: 'delivered',
      enviadoEm: serverTimestamp(),
    })

    return result.data
  } catch (error: unknown) {
    // Log o erro no Firestore
    await addDoc(collection(db, 'emails_enviados'), {
      destinatario: params.destinatario,
      assunto: params.assunto,
      provider: params.provider,
      status: 'error',
      erro: error instanceof Error ? error.message : 'Erro desconhecido',
      enviadoEm: serverTimestamp(),
    }).catch(() => {})

    throw error
  }
}

export async function enviarNotaPorEmail(params: {
  notaNumero: string
  fornecedor: string
  valor: string
  destinatario: string
  emailDest: string
  mensagemAdicional?: string
  provider: EmailProvider
}): Promise<EnviarEmailResult> {
  const corpoHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #16a34a; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
        <h2 style="margin: 0;">Envio de Nota Fiscal</h2>
        <p style="margin: 4px 0 0; opacity: 0.9;">CompraFácil - Módulo de Compras</p>
      </div>
      <div style="border: 1px solid #e5e7eb; border-top: none; padding: 24px; border-radius: 0 0 8px 8px;">
        <p>Prezado(a),</p>
        <p>Segue a nota fiscal referente à sua empresa:</p>
        <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
          <tr style="background: #f9fafb;">
            <td style="padding: 10px 14px; font-weight: bold; border: 1px solid #e5e7eb;">Nota</td>
            <td style="padding: 10px 14px; border: 1px solid #e5e7eb;">${params.notaNumero}</td>
          </tr>
          <tr>
            <td style="padding: 10px 14px; font-weight: bold; border: 1px solid #e5e7eb;">Fornecedor</td>
            <td style="padding: 10px 14px; border: 1px solid #e5e7eb;">${params.fornecedor}</td>
          </tr>
          <tr style="background: #f9fafb;">
            <td style="padding: 10px 14px; font-weight: bold; border: 1px solid #e5e7eb;">Valor</td>
            <td style="padding: 10px 14px; border: 1px solid #e5e7eb; color: #16a34a; font-weight: bold;">${params.valor}</td>
          </tr>
        </table>
        ${params.mensagemAdicional ? `<p style="background: #f0fdf4; padding: 12px; border-radius: 6px; border-left: 4px solid #16a34a;"><strong>Mensagem:</strong> ${params.mensagemAdicional}</p>` : ''}
        <p style="color: #6b7280; font-size: 13px; margin-top: 24px;">Este e-mail foi enviado automaticamente pelo sistema CompraFácil.</p>
      </div>
    </div>
  `

  return enviarEmail({
    destinatario: params.emailDest,
    assunto: `Nota Fiscal ${params.notaNumero} - ${params.fornecedor}`,
    corpo: corpoHtml,
    provider: params.provider,
  })
}
