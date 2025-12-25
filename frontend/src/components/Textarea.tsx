import { ChangeEvent } from 'react';

interface TextareaProps {
  label?: string;
  name: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  required?: boolean;
  placeholder?: string;
  rows?: number;
  error?: string | null;
}

export default function Textarea({
  label,
  name,
  value,
  onChange,
  required = false,
  placeholder = '',
  rows = 4,
  error = null
}: TextareaProps) {
  return (
    <div className="mb-5">
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-neutral-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <textarea
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        rows={rows}
        className={`w-full px-4 py-2.5 border rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-primary-500/20 resize-none ${
          error ? 'border-red-500 focus:border-red-500' : 'border-neutral-300 focus:border-primary-500'
        }`}
      />
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
