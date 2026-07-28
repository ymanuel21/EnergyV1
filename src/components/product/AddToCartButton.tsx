'use client';

import { useState } from 'react';
import { Button } from '@ui/Button';
import { QuantitySelector } from './QuantitySelector';
import { useCart } from '@providers/CartProvider';
import { useToast } from '@providers/ToastProvider';
import { CartIcon } from '@ui/Icons';

interface AddToCartProps {
  productId: string;
  slug: string;
  name: string;
  brandName: string;
  image: string;
  price: number;
  maxQuantity: number;
  weight: number;
}

export function AddToCartButton({
  productId,
  slug,
  name,
  brandName,
  image,
  price,
  maxQuantity,
  weight,
}: AddToCartProps) {
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();
  const { showToast } = useToast();

  function handleAdd() {
    addItem({ productId, slug, name, brandName, image, price, maxQuantity, weight }, quantity);
    showToast(`${name} ×${quantity} ditambahkan ke keranjang`);
    setQuantity(1);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4">
        <label className="text-sm text-muted">Jumlah</label>
        <QuantitySelector value={quantity} max={999} onChange={setQuantity} />
      </div>
      <Button
        variant="primary"
        size="lg"
        className="w-full"
        onClick={handleAdd}
        leftIcon={<CartIcon className="h-5 w-5" />}
      >
        Tambah ke Keranjang
      </Button>
    </div>
  );
}
