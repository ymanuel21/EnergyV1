'use client';
import { useState } from 'react';

export function ProductForm({ defaultValues }: any) {
  const [c] = useState(0);
  return <p>PROD-FORM: {defaultValues?.name || 'no-name'} (c={c})</p>;
}
