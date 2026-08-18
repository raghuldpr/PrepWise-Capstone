import React from 'react';

export default function FormInput({
  id,
  label,
  type = 'text',
  value,
  onChange,
  error = null,
  helperText = null,
  placeholder = '',
  disabled = false,
  required = false,
  options = [],
  rows = 3,
  className = '',
  icon: Icon = null,
  ...rest
}) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  const baseInputStyles =
    'w-full px-4 py-2.5 rounded-lg bg-[#EAE6DF] dark:bg-[#242424] text-[#111111] dark:text-white border border-[rgba(0,0,0,0.12)] dark:border-[rgba(255,255,255,0.15)] placeholder:text-[#5E5B56]/60 dark:placeholder:text-[#A0A0A0]/60 focus:outline-none focus:ring-2 focus:ring-[#C85232] focus:border-[#C85232] disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm';

  const errorStyles = error
    ? 'border-rose-500 focus:ring-rose-500 focus:border-rose-500'
    : '';

  return (
    <div className={`w-full flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="text-xs font-semibold uppercase tracking-wider text-[#111111] dark:text-white flex items-center gap-1"
        >
          {label}
          {required && <span className="text-[#C85232]">*</span>}
        </label>
      )}

      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-3.5 text-[#5E5B56] dark:text-[#A0A0A0] pointer-events-none">
            <Icon size={18} />
          </div>
        )}

        {type === 'select' ? (
          <select
            id={inputId}
            value={value}
            onChange={onChange}
            disabled={disabled}
            required={required}
            className={`${baseInputStyles} ${Icon ? 'pl-10' : ''} ${errorStyles}`}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : undefined}
            {...rest}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((opt) => {
              const val = typeof opt === 'object' ? opt.value : opt;
              const lbl = typeof opt === 'object' ? opt.label : opt;
              return (
                <option key={val} value={val}>
                  {lbl}
                </option>
              );
            })}
          </select>
        ) : type === 'textarea' ? (
          <textarea
            id={inputId}
            value={value}
            onChange={onChange}
            rows={rows}
            disabled={disabled}
            required={required}
            placeholder={placeholder}
            className={`${baseInputStyles} ${errorStyles}`}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : undefined}
            {...rest}
          />
        ) : (
          <input
            id={inputId}
            type={type}
            value={value}
            onChange={onChange}
            disabled={disabled}
            required={required}
            placeholder={placeholder}
            className={`${baseInputStyles} ${Icon ? 'pl-10' : ''} ${errorStyles}`}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : undefined}
            {...rest}
          />
        )}
      </div>

      {error ? (
        <p id={`${inputId}-error`} className="text-xs font-medium text-rose-600 dark:text-rose-400 mt-0.5">
          {error}
        </p>
      ) : helperText ? (
        <p className="text-xs text-[#5E5B56] dark:text-[#A0A0A0] mt-0.5">{helperText}</p>
      ) : null}
    </div>
  );
}
