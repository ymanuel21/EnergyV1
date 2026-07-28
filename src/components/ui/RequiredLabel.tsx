export function RequiredLabel({ htmlFor, children }: { htmlFor?: string; children: React.ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="mb-1 block text-sm font-medium text-primary">
      {children}
      <span className="text-red-500 ml-0.5" aria-hidden="true">*</span>
    </label>
  );
}
