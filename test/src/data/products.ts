export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  inStock: boolean;
}

export const products: Product[] = [
  {
    id: 'prod-1',
    name: 'Premium Wireless Headphones',
    description: 'High-fidelity audio with active noise cancellation and 30-hour battery life.',
    price: 299.99,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop',
    category: 'Electronics',
    inStock: true,
  },
  {
    id: 'prod-2',
    name: 'Minimalist Watch',
    description: 'Swiss movement with sapphire crystal and Italian leather strap.',
    price: 449.00,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop',
    category: 'Accessories',
    inStock: true,
  },
  {
    id: 'prod-3',
    name: 'Organic Coffee Beans',
    description: 'Single-origin Arabica beans, medium roast, ethically sourced.',
    price: 24.99,
    image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&h=400&fit=crop',
    category: 'Food & Drink',
    inStock: true,
  },
  {
    id: 'prod-4',
    name: 'Smart Home Hub',
    description: 'Control all your smart devices from one central hub with voice commands.',
    price: 179.99,
    image: 'https://images.unsplash.com/photo-1558089687-f282ffcbc126?w=400&h=400&fit=crop',
    category: 'Electronics',
    inStock: true,
  },
  {
    id: 'prod-5',
    name: 'Leather Messenger Bag',
    description: 'Handcrafted full-grain leather with brass hardware.',
    price: 329.00,
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop',
    category: 'Accessories',
    inStock: true,
  },
  {
    id: 'prod-6',
    name: 'Portable Bluetooth Speaker',
    description: 'Waterproof speaker with 360-degree sound and 12-hour playtime.',
    price: 89.99,
    image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&h=400&fit=crop',
    category: 'Electronics',
    inStock: false,
  },
];

export const MERCHANT_ADDRESS = 'merchant@arcstore.com';
