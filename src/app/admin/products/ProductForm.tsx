'use client';

import { useState } from 'react';

interface ProductFormProps {
  defaultValues?: any;
  brands: any[];
  categories: any[];
  onSubmit: (data: any) => Promise<void>;
  reviewStatus?: string | null;
  reviewNotes?: string | null;
}

export function ProductForm({ defaultValues }: ProductFormProps) {
  const [count] = useState(0);
  return <p>✅ ProductForm v2: {defaultValues?.name} (count={count})</p>;
}
