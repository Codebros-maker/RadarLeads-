import type { Company } from './api';

export function normalizeWhatsAppPhone(phone: string | null): string | null {
  if (!phone) return null;
  const value = phone.trim();
  let digits = value.replace(/\D/g, '');
  const international = value.startsWith('+') || value.startsWith('00');
  if (value.startsWith('00')) digits = digits.slice(2);
  if (!international && /^\d{10,11}$/.test(digits)) digits = `55${digits}`;
  if (digits.startsWith('55')) {
    return /^55[1-9]\d(?:[2-5]\d{7}|9\d{8})$/.test(digits) ? digits : null;
  }
  return international && /^[1-9]\d{7,14}$/.test(digits) ? digits : null;
}

export function createProspectingMessage(company: Company): string {
  const introduction = `Oi, tudo bem? Encontrei a ${company.name} no Google Maps e resolvi chamar por aqui.`;

  if (company.website) {
    return `${introduction}\n\nEu trabalho criando sites e vi que vocês já têm um cadastrado. Vocês pensam em atualizar o site em algum momento?\n\nSe fizer sentido, podemos trocar uma ideia por aqui 🙂`;
  }

  return `${introduction}\n\nEu trabalho criando sites e não achei um no perfil de vocês. Vocês já têm algum ou hoje usam mais as redes sociais e o WhatsApp?\n\nSe estiverem pensando em ter um site, posso explicar como funciona, sem compromisso 🙂`;
}

export function createWhatsAppUrl(phone: string, message: string): string {
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
