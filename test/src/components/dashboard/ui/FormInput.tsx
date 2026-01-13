'use client';

import { forwardRef, InputHTMLAttributes, TextareaHTMLAttributes } from 'react';
import { motion } from 'framer-motion';

interface FormInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  hint?: string;
  size?: 'sm' | 'md' | 'lg';
  prefix?: string;
  suffix?: string;
}

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ label, error, hint, size = 'md', prefix, suffix, className = '', ...props }, ref) => {
    const sizeClasses = {
      sm: 'px-2 py-1 text-[10px]',
      md: 'px-2.5 py-1.5 text-xs',
      lg: 'px-3 py-2 text-sm',
    };

    const hasAddon = prefix || suffix;

    return (
      <div className="w-full">
        {label && (
          <label className="text-[10px] text-slate-500 uppercase mb-1 block tracking-wide">
            {label}
            {props.required && <span className="text-red-400 ml-0.5">*</span>}
          </label>
        )}

        <div className={`relative ${hasAddon ? 'flex' : ''}`}>
          {prefix && (
            <span className={`
              inline-flex items-center
              ${sizeClasses[size]}
              bg-slate-800/50 border border-r-0 border-slate-700 rounded-l
              text-slate-500 font-mono
            `}>
              {prefix}
            </span>
          )}

          <input
            ref={ref}
            className={`
              w-full
              ${sizeClasses[size]}
              bg-slate-800 border border-slate-700
              ${prefix ? 'rounded-l-none' : 'rounded'}
              ${suffix ? 'rounded-r-none' : 'rounded'}
              text-white placeholder-slate-500
              focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20
              ${error ? 'border-red-500/50 focus:border-red-500/50 focus:ring-red-500/20' : ''}
              transition-all duration-200
              ${props.disabled ? 'opacity-50 cursor-not-allowed bg-slate-800/50' : ''}
              ${className}
            `}
            {...props}
          />

          {suffix && (
            <span className={`
              inline-flex items-center
              ${sizeClasses[size]}
              bg-slate-800/50 border border-l-0 border-slate-700 rounded-r
              text-slate-500 font-mono
            `}>
              {suffix}
            </span>
          )}
        </div>

        {(error || hint) && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className={`text-[10px] mt-1 ${error ? 'text-red-400' : 'text-slate-500'}`}
          >
            {error || hint}
          </motion.p>
        )}
      </div>
    );
  }
);

FormInput.displayName = 'FormInput';

// Textarea variant
interface FormTextareaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'> {
  label?: string;
  error?: string;
  hint?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const FormTextarea = forwardRef<HTMLTextAreaElement, FormTextareaProps>(
  ({ label, error, hint, size = 'md', className = '', ...props }, ref) => {
    const sizeClasses = {
      sm: 'px-2 py-1 text-[10px]',
      md: 'px-2.5 py-1.5 text-xs',
      lg: 'px-3 py-2 text-sm',
    };

    return (
      <div className="w-full">
        {label && (
          <label className="text-[10px] text-slate-500 uppercase mb-1 block tracking-wide">
            {label}
            {props.required && <span className="text-red-400 ml-0.5">*</span>}
          </label>
        )}

        <textarea
          ref={ref}
          className={`
            w-full
            ${sizeClasses[size]}
            bg-slate-800 border border-slate-700 rounded
            text-white placeholder-slate-500
            focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20
            ${error ? 'border-red-500/50 focus:border-red-500/50 focus:ring-red-500/20' : ''}
            transition-all duration-200
            resize-none
            ${props.disabled ? 'opacity-50 cursor-not-allowed bg-slate-800/50' : ''}
            ${className}
          `}
          {...props}
        />

        {(error || hint) && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className={`text-[10px] mt-1 ${error ? 'text-red-400' : 'text-slate-500'}`}
          >
            {error || hint}
          </motion.p>
        )}
      </div>
    );
  }
);

FormTextarea.displayName = 'FormTextarea';
