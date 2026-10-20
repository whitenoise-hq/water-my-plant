interface NumberFieldProps {
  value: string;
  onChange: (digits: string) => void;
  placeholder: string;
  maxDigits: number;
  preview?: string;
}

// 입력 중에는 숫자만 그대로 보여주고(쉼표 없이), 읽기 쉬운 값은 아래에 따로 보여줘요.
export function NumberField({ value, onChange, placeholder, maxDigits, preview }: NumberFieldProps) {
  return (
    <div>
      <input
        className="won-input"
        inputMode="numeric"
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value.replace(/\D/g, "").slice(0, maxDigits))}
      />
      {preview && <p className="field-counter">{preview}</p>}
    </div>
  );
}
