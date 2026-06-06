import axios from 'axios';

// Remove barra final da URL para evitar double-slash (ex: https://host.com//api/...)
const RAW_BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';
const BACKEND_URL = RAW_BACKEND_URL.replace(/\/+$/, '');
const ADMIN_WHATSAPP = process.env.REACT_APP_ADMIN_WHATSAPP;

export const whatsappService = {
  async sendMessage(to, message) {
    try {
      if (!BACKEND_URL) {
        console.error('WhatsApp: REACT_APP_BACKEND_URL não está configurada!');
        return { success: false, error: 'Backend URL não configurada' };
      }
      // Usar proxy do backend para evitar Mixed Content (HTTPS -> HTTP)
      const endpoint = `${BACKEND_URL}/api/whatsapp/send`;
      console.log('WhatsApp: Enviando requisição...', { para: to, endpoint });
      const response = await axios.post(endpoint, {
        number: to,
        text: message
      });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('WhatsApp API Error:', error.message);
      console.error('URL chamada:', `${BACKEND_URL}/api/whatsapp/send`);
      console.error('Detalhes:', error.response?.data || error);
      return { success: false, error: error.message };
    }
  },

  // Notifica admin sobre novo cadastro
  async notifyNewRegistration(adminPhone, userName) {
    const message = `👤 *Novo Usuário Cadastrado*\n\nO usuário *${userName}* acabou de se cadastrar na plataforma Pró-Família Conecta.\n\nAcesse o painel admin para revisar os perfis pendentes.`;
    return this.sendMessage(adminPhone || ADMIN_WHATSAPP, message);
  },

  // Notifica admin sobre nova oferta pendente
  async notifyNewOffer(offerTitle, ownerName) {
    const message = `🆕 *Nova Oferta Pendente*\n\nOferta: ${offerTitle}\nVendedor: ${ownerName}\n\nAcesse o painel admin para revisar e aprovar.`;
    return this.sendMessage(ADMIN_WHATSAPP, message);
  },

  // Notifica admin sobre nova mediação/disputa
  async notifyNewDispute(disputeTitle, complainantName, defendantName) {
    const message = `⚠️ *Nova Mediação Solicitada*\n\nTítulo: ${disputeTitle}\nReclamante: ${complainantName}\nVendedor: ${defendantName}\n\nAcesse o painel admin para mediar.`;
    return this.sendMessage(ADMIN_WHATSAPP, message);
  },

  // Notifica admin sobre nova avaliação pendente
  async notifyNewReview(offerTitle, authorName, rating) {
    const stars = '⭐'.repeat(rating);
    const message = `📝 *Nova Avaliação Pendente*\n\nOferta: ${offerTitle}\nAutor: ${authorName}\nNota: ${stars} (${rating}/5)\n\nAcesse o painel admin para moderar.`;
    return this.sendMessage(ADMIN_WHATSAPP, message);
  },

  // Notifica o vendedor quando alguém demonstra interesse na oferta
  async notifySellerOfInterest(sellerWhatsApp, sellerName, offerTitle, buyerName = 'Alguém') {
    const message = `📩 *Interesse na sua oferta!*\n\nOlá ${sellerName}!\n\n${buyerName} demonstrou interesse no seu anúncio: "${offerTitle}"\n\nEle pode entrar em contato pelo WhatsApp a qualquer momento. Fique atento! 🔔`;
    return this.sendMessage(sellerWhatsApp, message);
  },

  // Notifica vendedor quando oferta é aprovada
  async notifyOfferApproved(sellerWhatsApp, sellerName, offerTitle) {
    const message = `✅ *Oferta Aprovada!*\n\nOlá ${sellerName}!\n\nSua oferta "${offerTitle}" foi aprovada e já está visível na plataforma Pró-Família.\n\nBoas vendas! 🎉`;
    return this.sendMessage(sellerWhatsApp, message);
  },

  // Notifica vendedor quando oferta é rejeitada
  async notifyOfferRejected(sellerWhatsApp, sellerName, offerTitle) {
    const message = `❌ *Oferta não aprovada*\n\nOlá ${sellerName}.\n\nInfelizmente sua oferta "${offerTitle}" não foi aprovada.\n\nEntre em contato com o administrador para mais informações.`;
    return this.sendMessage(sellerWhatsApp, message);
  },

  // Gera link do WhatsApp
  getWhatsAppLink(phoneNumber, message = '') {
    const cleanNumber = phoneNumber.replace(/\D/g, '');
    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/${cleanNumber}${message ? `?text=${encodedMessage}` : ''}`;
  }
};
