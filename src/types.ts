export interface CartItem {
  cartItemId: string;
  productId: string;
  productName: string;
  categoryName?: string;
  img: string;
  unitPrice: number;
  quantity: number;
  leadTimeDays: number; // Dynamic production time in business days from admin/catalog
  selections: {
    tamanho?: string;
    cor?: string;
    corPrincipal?: string;
    corDetalhe?: string;
    quantidade?: string;
    [key: string]: any;
  };
  hasSize?: boolean;
  hasQuantity?: boolean;
}

export interface ShippingZone {
  id: 'PT' | 'ES' | 'EU' | 'INT';
  name: { pt: string; en: string };
  regionDetail: { pt: string; en: string };
  price: number;
  deliveryTime: { pt: string; en: string };
}

export const SHIPPING_ZONES: ShippingZone[] = [
  {
    id: 'PT',
    name: { pt: 'Portugal (Continental e Ilhas)', en: 'Portugal (Mainland & Islands)' },
    regionDetail: { pt: 'Envio CTT Expresso Registado', en: 'CTT Express Registered Shipping' },
    price: 4.50,
    deliveryTime: { pt: '1-5 dias úteis', en: '1-5 business days' }
  },
  {
    id: 'ES',
    name: { pt: 'Espanha (Peninsular e Baleares)', en: 'Spain (Peninsula & Balearics)' },
    regionDetail: { pt: 'Envio Expresso Ibérico', en: 'Iberian Express Shipping' },
    price: 6.50,
    deliveryTime: { pt: '2-5 dias úteis', en: '2-5 business days' }
  },
  {
    id: 'EU',
    name: { pt: 'Europa (União Europeia)', en: 'Europe (European Union)' },
    regionDetail: { pt: 'Envio Internacional Prioritário UE', en: 'EU Priority International Shipping' },
    price: 11.90,
    deliveryTime: { pt: '2-8 dias úteis', en: '2-8 business days' }
  },
  {
    id: 'INT',
    name: { pt: 'Internacional (Resto do Mundo)', en: 'International (Rest of World)' },
    regionDetail: { pt: 'Envio Internacional Registado com Tracking', en: 'Tracked Registered Global Shipping' },
    price: 24.90,
    deliveryTime: { pt: '5-12 dias úteis', en: '5-12 business days' }
  }
];
