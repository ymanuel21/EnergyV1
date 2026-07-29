'use client';
import { useState } from 'react';
export function ProductForm2({ defaultValues }: any) {
  const [c] = useState(0);
  return <p>ProductForm2: {defaultValues?.name} (c={c})</p>;
}
