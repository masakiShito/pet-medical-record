import { ChangeEvent } from 'react';

interface InputProps {
  label?: string;
  name: string;
  type?: string;
  value: string | number;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  placeholder?: string;
  error?: string | null;
}

export default function Input({
  label,
  name,
  type = 'text',
  value,
  onChange,
  required = false,
  placeholder = '',
  error = null
}: InputProps) {
  return (
    <div className="mb-5">
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-neutral-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        className={`w-full px-4 py-2.5 border rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-primary-500/20 ${
          error ? 'border-red-500 focus:border-red-500' : 'border-neutral-300 focus:border-primary-500'
        }`}
      />
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
