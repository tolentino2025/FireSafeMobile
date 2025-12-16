import React, { useState, useEffect, useCallback, useRef } from "react";
import { TextInput, TextInputProps, Platform } from "react-native";

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
  const isFocusedRef = useRef(false);
  const hasChangedRef = useRef(false);

  useEffect(() => {
    if (!isFocusedRef.current) {
      setLocalValue(value);
    }
  }, [value]);

  const handleChangeText = useCallback((text: string) => {
    const transformed = transform ? transform(text) : text;
    setLocalValue(transformed);
    hasChangedRef.current = true;
  }, [transform]);

  const handleFocus = useCallback(() => {
    isFocusedRef.current = true;
  }, []);

  const syncValue = useCallback(() => {
    isFocusedRef.current = false;
    if (hasChangedRef.current && localValue !== value) {
      onValueChange(localValue);
      hasChangedRef.current = false;
    }
  }, [localValue, value, onValueChange]);

  const handleEndEditing = useCallback(() => {
    syncValue();
  }, [syncValue]);

  const handleBlur = useCallback(() => {
    syncValue();
  }, [syncValue]);

  return (
    <TextInput
      {...props}
      value={localValue}
      onChangeText={handleChangeText}
      onFocus={handleFocus}
      onEndEditing={handleEndEditing}
      onBlur={handleBlur}
    />
  );
}
