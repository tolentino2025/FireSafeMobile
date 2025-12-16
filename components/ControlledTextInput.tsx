import React, { useState, useEffect, useCallback } from "react";
import { TextInput, TextInputProps } from "react-native";

interface ControlledTextInputProps extends Omit<TextInputProps, "value" | "onChangeText"> {
  value: string;
  onValueChange: (value: string) => void;
  transform?: (value: string) => string;
}

export function ControlledTextInput({
  value,
  onValueChange,
  transform,
  ...props
}: ControlledTextInputProps) {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChangeText = useCallback((text: string) => {
    const transformed = transform ? transform(text) : text;
    setLocalValue(transformed);
  }, [transform]);

  const handleEndEditing = useCallback(() => {
    if (localValue !== value) {
      onValueChange(localValue);
    }
  }, [localValue, value, onValueChange]);

  const handleBlur = useCallback(() => {
    if (localValue !== value) {
      onValueChange(localValue);
    }
  }, [localValue, value, onValueChange]);

  return (
    <TextInput
      {...props}
      value={localValue}
      onChangeText={handleChangeText}
      onEndEditing={handleEndEditing}
      onBlur={handleBlur}
    />
  );
}
