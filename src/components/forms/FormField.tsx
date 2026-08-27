"use client";

import React from "react";

interface FormFieldProps {
  label: string;
  name: string;
  type: 'text' | 'email' | 'tel' | 'select' | 'checkbox' | 'number';
  value: string | number | boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  error?: string;
  required?: boolean;
  placeholder?: string;
  options?: { value: string | number; label: string }[];
  helpText?: string;
  disabled?: boolean;
}

export default function FormField({
  label,
  name,
  type,
  value,
  onChange,
  error,
  required,
  placeholder,
  options,
  helpText,
  disabled
}: FormFieldProps) {
  const baseClasses = `block w-full rounded-lg border ${
    error ? "border-red-500 focus:ring-red-500 focus:border-red-500" : "border-slate-300 focus:ring-indigo-500 focus:border-indigo-500"
  } shadow-sm sm:text-sm py-2 px-3 transition-colors disabled:bg-slate-100 disabled:text-slate-500`;

  const renderInput = () => {
    if (type === 'select') {
      return (
        <select
          id={name}
          name={name}
          value={value as string | number}
          onChange={onChange}
          required={required}
          disabled={disabled}
          className={baseClasses}
        >
          <option value="" disabled>Seleccione una opción</option>
          {options?.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      );
    }

    if (type === 'checkbox') {
      return (
        <div className="flex items-center">
          <input
            id={name}
            name={name}
            type="checkbox"
            checked={value as boolean}
            onChange={onChange}
            required={required}
            disabled={disabled}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded"
          />
          <label htmlFor={name} className="ml-2 block text-sm text-slate-700">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
        </div>
      );
    }

    return (
      <input
        id={name}
        name={name}
        type={type}
        value={value as string | number}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        disabled={disabled}
        className={baseClasses}
      />
    );
  };

  return (
    <div className={type === 'checkbox' ? 'mb-4 flex items-center' : 'mb-4'}>
      {type !== 'checkbox' && (
        <label htmlFor={name} className="block text-sm font-medium text-slate-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      
      {renderInput()}
      
      {helpText && !error && (
        <p className="mt-1 text-sm text-slate-500">{helpText}</p>
      )}
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
