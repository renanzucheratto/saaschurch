import React from "react";
import { CurrencyInput } from "react-currency-mask";

interface CustomProps {
  onChange: (event: { target: { name: string; value: string } }) => void;
  name: string;
}

export const CurrencyMaskCustom = React.forwardRef<HTMLInputElement, CustomProps>(
  function CurrencyMaskCustom(props, ref) {
    // We must omit props injected by MUI that `react-currency-mask` or native `<input>` doesn't recognize
    const { onChange, ownerState, inputProps, ...other } = props as any;
    
    return (
      // @ts-ignore: Legacy module typing issue with React 19
      <CurrencyInput
        {...other}
        // react-currency-mask accepts ref internally through its own mechanism or we just pass it
        ref={ref}
        locale="pt-BR"
        currency="BRL"
        onChangeValue={(event: any, originalValue: number | string, maskedValue: string) => {
          onChange({ target: { name: props.name, value: String(originalValue || "") } });
        }}
      />
    );
  }
);

export const formatCurrencyToNumber = (value: string | number): number => {
  if (typeof value === "number") return value;
  if (!value) return 0;
  
  const num = parseFloat(value);
  return isNaN(num) ? 0 : num;
};

export const formatNumberToCurrency = (value: number): string => {
  if (isNaN(value)) value = 0;
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};
