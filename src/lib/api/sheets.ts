/**
 * Google Sheets order storage.
 *
 * Architecture:
 *   Checkout → sheets.ts → Google Apps Script Web App → Google Sheet
 *
 * The GOOGLE_SHEETS_WEB_APP_URL env var should point to a deployed
 * Google Apps Script that accepts POST with order data.
 *
 * A sample Apps Script is provided in scripts/google-apps-script.gs
 */

const SHEETS_URL = process.env.NEXT_PUBLIC_GOOGLE_SHEETS_WEB_APP_URL ?? '';

export interface OrderPayload {
  orderId: string;
  date: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  notes: string;
  paymentMethod: string;
  items: Array<{
    productName: string;
    sku: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
  }>;
  total: number;
}

function generateOrderId(): string {
  const date = new Date();
  const ymd = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `EV1-${ymd}-${random}`;
}

export function createOrderPayload(
  name: string,
  email: string,
  phone: string,
  address: string,
  city: string,
  postalCode: string,
  notes: string,
  paymentMethod: string,
  items: Array<{ productName: string; sku: string; quantity: number; unitPrice: number }>,
  total: number
): OrderPayload {
  return {
    orderId: generateOrderId(),
    date: new Date().toISOString(),
    name,
    email,
    phone,
    address,
    city,
    postalCode,
    notes,
    paymentMethod,
    items: items.map((item) => ({
      productName: item.productName,
      sku: item.sku,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      subtotal: item.unitPrice * item.quantity,
    })),
    total,
  };
}

export async function saveOrderToSheets(order: OrderPayload): Promise<boolean> {
  if (!SHEETS_URL) {
    console.warn('GOOGLE_SHEETS_WEB_APP_URL not set — order not saved to sheets');
    return false;
  }

  try {
    const response = await fetch(SHEETS_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order),
    });
    // no-cors mode means we can't read the response, but the request was sent
    return true;
  } catch (error) {
    console.error('Failed to save order to sheets:', error);
    return false;
  }
}

export function buildWhatsAppMessage(
  waNumber: string,
  order: OrderPayload
): string {
  const lines = [
    'Hello, I would like to place an order.',
    '',
    `Order ID: ${order.orderId}`,
    '',
    `Name: ${order.name}`,
    `Phone: ${order.phone}`,
    `Email: ${order.email}`,
    `Address: ${order.address}, ${order.city} ${order.postalCode}`,
    '',
    '--- Products ---',
    ...order.items.map(
      (item) => `- ${item.productName} ×${item.quantity} = Rp ${item.subtotal.toLocaleString('id-ID')}`
    ),
    '',
    `Total: Rp ${order.total.toLocaleString('id-ID')}`,
    '',
    `Payment: ${order.paymentMethod === 'transfer' ? 'Bank Transfer' : order.paymentMethod}`,
    order.notes ? `\nCatatan: ${order.notes}` : '',
  ];

  const message = lines.join('\n');
  return `https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`;
}
