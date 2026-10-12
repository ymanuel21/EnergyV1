export interface Article {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  image?: string;
  author: string;
  date: string;
  readTime: number;
}

export const articles: Article[] = [
  {
    slug: 'panduan-memilih-panel-surya',
    title: 'Guide to Choosing Solar Panels for Your Home',
    excerpt: 'Learn how to choose the right solar panel: monocrystalline vs polycrystalline, power rating, warranty and inverter compatibility.',
    content: `Choosing the right solar panel is the first step towards energy independence. Here is the complete guide.

## 1. Types of Solar Panel

### Monocrystalline
- High efficiency (18-22%)
- Uniform black colour
- Good performance in hot weather
- More expensive
- Suitable for limited roof space

### Polycrystalline
- Medium efficiency (15-17%)
- Bluish colour
- More affordable
- Suitable for large areas

## 2. Power Rating (Watt Peak)

For households, calculate your requirement:
- Small home (900 VA): 1.000-2.000 Wp
- Medium home (1.300-2.200 VA): 2.000-4.000 Wp
- Large home (>3.500 VA): 4.000-10.000 Wp

## 3. Warranty

A quality solar panel offers:
- Product warranty: 10-12 years
- Performance warranty: 25 years (at least 80% output)

## 4. Inverter Compatibility

Make sure the total panel power does not exceed the inverter capacity. Ideally 80-120% of the inverter rating.`,
    category: 'Guides',
    author: 'Tim EBTPlaza',
    date: '2025-12-15',
    readTime: 5,
  },
  {
    slug: 'jenis-jenis-inverter',
    title: 'Types of Inverter: On-Grid, Off-Grid and Hybrid',
    excerpt: 'Memahami perbedaan inverter on-grid, off-grid, dan hybrid untuk sistem PLTS Anda.',
    content: `The inverter is the brain of a solar power system. Here are the differences between the three main types.

## On-Grid (Grid-Tie)
- Connected to the PLN grid
- Excess power is sold to PLN (net metering)
- Cannot operate during a power outage
- Most economical
- Suitable for: urban homes with a stable supply

## Off-Grid
- Not connected to the PLN grid
- Requires batteries
- Operates independently 24/7
- Higher cost (batteries)
- Suitable for: remote areas, villas, islands

## Hybrid
- A combination of on-grid and batteries
- Can export to PLN and store in batteries
- Keeps operating during a power outage
- Highest investment, maximum flexibility
- Suitable for: homes that want backup power`,
    category: 'Guides',
    author: 'Tim EBTPlaza',
    date: '2025-11-20',
    readTime: 4,
  },
  {
    slug: 'cara-menghitung-tagihan-listrik-setelah-pasang-plts',
    title: 'How to Calculate Your Electricity Bill Savings After Installing Solar',
    excerpt: 'A simple simulation of how much of your electricity bill you can save with solar panels.',
    content: `Many people ask: "How much do I actually save after installing solar?" Let us do the maths.

## Assumptions
- Electricity supply: 1.300 VA
- Monthly usage: 400 kWh
- Electricity tariff: Rp 1.444/kWh
- Solar system: 2.000 Wp (on-grid)
- Average daily production: 8 kWh
- Monthly production: 240 kWh

## Calculation

**Before solar:**
400 kWh × Rp 1.444 = Rp 577.600 per month

**After solar:**
- Grid consumption: 400 - 240 = 160 kWh
- PLN bill: 160 × Rp 1.444 = Rp 231.040
- **Savings: Rp 346.560 per month**
- **Savings: Rp 4.158.720 per year**

## ROI (Return on Investment)

With a system cost of about Rp 20 million:
- ROI = Rp 20.000.000 ÷ Rp 4.158.720 = ~4,8 years
- After 5 years, electricity is FREE for the next 20+ years`,
    category: 'Education',
    author: 'Tim EBTPlaza',
    date: '2025-10-05',
    readTime: 6,
  },
  {
    slug: 'perawatan-panel-surya',
    title: '5 Tips for Solar Panel Maintenance So They Last 25+ Years',
    excerpt: 'Practical tips for caring for solar panels: cleaning, visual inspection, performance monitoring and protection.',
    content: `Solar panels are designed to last 25+ years. With the right maintenance you can maximise your investment.

## 1. Regular Cleaning
- Clean off dust and dirt every 3-6 months
- Use clean water and a soft cloth
- Do NOT use soap or chemicals
- Best time: morning, while the panels are still cool

## 2. Visual Inspection
- Check for cracks or physical damage every 6 months
- Check cables and connectors for corrosion
- Make sure the mounting is still secure

## 3. Performance Monitoring
- Use the inverter's monitoring app
- Record daily production
- A drop of more than 10% from normal is a sign of a problem

## 4. Protection from Pests
- Fit bird mesh to prevent birds nesting
- Check cables for rodent damage

## 5. Professional Servicing
- Call a technician every 5 years for a thorough inspection
- Includes checking the grounding and protection system`,
    category: 'Tips',
    author: 'Tim EBTPlaza',
    date: '2025-09-18',
    readTime: 4,
  },
];
