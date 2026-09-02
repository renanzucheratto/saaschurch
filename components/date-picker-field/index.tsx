"use client";

import { useMemo } from "react";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { parseDateInput, toDateInput } from "@/config/helpers/format-date";

interface Props {
  label: string;
  /** Valor no formato "yyyy-MM-dd" usado pelos formulários. */
  value: string;
  onChange: (value: string) => void;
  /** Data mínima selecionável; por padrão, hoje. */
  minDate?: Date | null;
  error?: boolean;
  helperText?: string;
  disabled?: boolean;
}

/** DatePicker do MUI operando sobre o valor "yyyy-MM-dd" dos formulários. */
export const DatePickerField = ({
  label,
  value,
  onChange,
  minDate,
  error,
  helperText,
  disabled,
}: Props) => {
  const hoje = useMemo(() => {
    const inicioDeHoje = new Date();
    inicioDeHoje.setHours(0, 0, 0, 0);
    return inicioDeHoje;
  }, []);

  return (
    <DatePicker
      label={label}
      value={parseDateInput(value)}
      onChange={(data) => onChange(toDateInput(data))}
      minDate={minDate || hoje}
      format="dd/MM/yyyy"
      disabled={disabled}
      slotProps={{
        textField: { fullWidth: true, error, helperText },
        actionBar: { actions: ["clear", "today"] },
      }}
    />
  );
};
