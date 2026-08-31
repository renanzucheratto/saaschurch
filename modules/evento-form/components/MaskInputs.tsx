import React from 'react';
import { IMaskInput } from 'react-imask';

interface MaskProps {
  onChange: (event: { target: { name: string; value: string } }) => void;
  name: string;
}

export const TelefoneMaskCustom = React.forwardRef<HTMLInputElement, MaskProps>(
  function TelefoneMaskCustom(props, ref) {
    const { onChange, ...other } = props;
    return (
      <IMaskInput
        {...other}
        mask="(00) 00000-0000"
        inputRef={ref}
        onAccept={(value: unknown) =>
          onChange({ target: { name: props.name, value: value as string } })
        }
        overwrite
      />
    );
  },
);

export const CPFMaskCustom = React.forwardRef<HTMLInputElement, MaskProps>(
  function CPFMaskCustom(props, ref) {
    const { onChange, ...other } = props;
    return (
      <IMaskInput
        {...other}
        mask="000.000.000-00"
        inputRef={ref}
        onAccept={(value: unknown) =>
          onChange({ target: { name: props.name, value: value as string } })
        }
        overwrite
      />
    );
  },
);

export const DataMaskCustom = React.forwardRef<HTMLInputElement, MaskProps>(
  function DataMaskCustom(props, ref) {
    const { onChange, ...other } = props;
    return (
      <IMaskInput
        {...other}
        mask="00/00/0000"
        inputRef={ref}
        onAccept={(value: unknown) =>
          onChange({ target: { name: props.name, value: value as string } })
        }
        overwrite
      />
    );
  },
);

export const RGMaskCustom = React.forwardRef<HTMLInputElement, MaskProps>(
  function RGMaskCustom(props, ref) {
    const { onChange, ...other } = props;
    return (
      <IMaskInput
        {...other}
        mask="00.000.000-0"
        inputRef={ref}
        onAccept={(value: unknown) =>
          onChange({ target: { name: props.name, value: value as string } })
        }
        overwrite
      />
    );
  },
);
