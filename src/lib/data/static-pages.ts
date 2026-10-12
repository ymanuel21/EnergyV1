export interface StaticPage {
  slug: string;
  title: string;
  content: string;
  description?: string;
}

export const staticPages: StaticPage[] = [
  {
    slug: 'tentang-kami',
    title: 'About Us',
    content: `# About Us

EBTPlaza is a renewable energy platform focused on providing solar power solutions for homes, businesses and large-scale projects in Indonesia.

## Our Vision

To be a trusted partner in Indonesia's energy transition towards a sustainable future.

## Our Mission

- To provide quality solar energy products at affordable prices
- To educate the public about the benefits of renewable energy
- To support green energy projects throughout Indonesia

## Location

Jl. Terusan Jakarta, Puri Dago Raya No.342 Kav 31
Sukamiskin, Arcamanik District
Bandung City, West Java 40293

## Contact

- Email: info@ebtplaza.com
- Phone: (022) 20522279
- Website: https://ebtplaza.vercel.app`,
  },
  {
    slug: 'kebijakan-pengiriman',
    title: 'Shipping Policy',
    content: `# Shipping Policy

## Delivery Coverage

We ship across Indonesia through trusted logistics partners.

## Estimated Delivery Times

- **Java & Bali**: 2–5 business days
- **Sumatra, Kalimantan, Sulawesi**: 5–10 business days
- **Eastern Indonesia**: 7–14 business days

For large products (solar panels, batteries), shipping uses a cargo service and may take longer.

## Shipping Cost

Shipping cost is calculated from:
- Product weight and dimensions
- Distance and destination
- The shipping method chosen

The cost is displayed at checkout before payment.

## Tracking

A tracking number is sent by email once your order is processed.`,
  },
  {
    slug: 'kebijakan-retur',
    title: 'Return Policy',
    content: `# Return Policy

## Return Conditions

A return may be requested within **7 days** of receiving the product, subject to the following conditions:

- The product is in its original condition and unused
- Packaging is complete and undamaged
- Proof of purchase is included

## Procedure

1. Contact us by email or WhatsApp
2. Include photos of the product and packaging
3. Our team will provide return instructions
4. Send the product to the address provided

## Refunds

- Funds are refunded within 7–14 business days after the product is received
- Return shipping costs are borne by the buyer (unless the error was ours)
- Clearance products cannot be returned`,
  },
  {
    slug: 'syarat-ketentuan',
    title: 'Terms & Conditions',
    content: `# Terms & Conditions

By using EBTPlaza's services, you agree to the following terms and conditions.

## 1. General

- Prices may change at any time without notice
- Product stock availability cannot be guaranteed
- We reserve the right to refuse an order for any reason

## 2. Ordering

- Orders are processed once payment is confirmed
- Pricing errors will be re-confirmed before shipping

## 3. Payment

- Payment by bank transfer, Virtual Account, or QRIS
- Orders are cancelled if payment is not received within 24 hours

## 4. Warranty

- Product warranty follows each brand's own terms
- Damage caused by misuse is not covered by warranty

## 5. Privacy

- Customer personal data is protected in line with the Privacy Policy
- Information is not shared with third parties without permission`,
  },
  {
    slug: 'kebijakan-privasi',
    title: 'Privacy Policy',
    content: `# Privacy Policy

## Data We Collect

- Name, email and phone number (at checkout or when requesting a quote)
- Shipping address
- Order history

## How We Use Data

Your data is used to:
- Process orders and deliveries
- Communicate about orders
- Send newsletters (if you subscribe)

## Data Protection

- Data is stored encrypted
- Not shared with third parties without permission
- You can request deletion of your data at any time

## Contact

For privacy enquiries: info@ebtplaza.com`,
  },
];
