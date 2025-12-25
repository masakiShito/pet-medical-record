import { ChangeEvent } from 'react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  label?: string;
  name: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLSelectElement>) => void;
  options?: SelectOption[];
  required?: boolean;
  error?: string | null;
}

export default function Select({
  label,
  name,
  value,
  onChange,
  options = [],
  required = false,
  error = null
}: SelectProps) {
  return (
    <div className="mb-5">
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-neutral-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className={`w-full px-4 py-2.5 border rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-primary-500/20 ${
          error ? 'border-red-500 focus:border-red-500' : 'border-neutral-300 focus:border-primary-500'
        }`}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
