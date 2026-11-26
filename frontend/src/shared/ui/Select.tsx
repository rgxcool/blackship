import type { SelectHTMLAttributes } from "react";

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "children" | "onChange" | "value"> {
  value: string;
  options: readonly (string | SelectOption)[];
  placeholder?: string;
  onChange: (value: string) => void;
}

export function Select({ options, placeholder, value, onChange, ...selectProps }: SelectProps) {
  return (
    <select {...selectProps} value={value} onChange={(event) => onChange(event.target.value)}>
      {placeholder !== undefined && <option value="">{placeholder}</option>}
      {options.map((option) => {
        const optionValue = typeof option === "string" ? option : option.value;
        const optionLabel = typeof option === "string" ? option : option.label;

        return (
          <option key={optionValue} value={optionValue}>
            {optionLabel}
          </option>
        );
      })}
    </select>
  );
}
