import React from "react";
import { CurrencyInput } from "react-currency-mask";

interface CustomProps {
  onChange: (event: { target: { name: string; value: string } }) => void;
  name: string;
}

export const formatCurrencyToNumber = (value: string | number): number => {
  if (typeof value === "number") return value;
  if (!value) return 0;
  
  // Remove currency symbols and spaces
  const cleanValue = String(value).replace(/[^\d.,-]/g, "");
  
  if (cleanValue.includes(",")) {
    // PT-BR: remove thousands dots, then replace decimal comma with dot
    const sanitized = cleanValue.replace(/\./g, "").replace(",", ".");
    return parseFloat(sanitized) || 0;
  }
  
  return parseFloat(cleanValue) || 0;
};

export const formatNumberToCurrency = (value: number): string => {
  if (isNaN(value)) value = 0;
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

export const CurrencyMaskCustom = React.forwardRef<HTMLInputElement, CustomProps>(
  function CurrencyMaskCustom(props, ref) {
    const { onChange, ownerState, inputProps, value, ...other } = props as any;
    
    return (
      // @ts-ignore: Legacy module typing issue with React 19
      <CurrencyInput
        {...other}
        ref={ref}
        value={value}
        locale="pt-BR"
        currency="BRL"
        inputMode="numeric"
        onChangeValue={(event: any, originalValue: number | string) => {
          // Always send as localized string with 2 decimals to preserve "cents" context
          const normalized = originalValue !== undefined && originalValue !== null ? Number(originalValue) : 0;
          const valueToSend = normalized.toFixed(2).replace(".", ",");
          onChange({ target: { name: props.name, value: valueToSend } });
        }}
      />
    );
  }
);
