import React, { useState, useEffect, useCallback, useRef } from "react";
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
  const isFocusedRef = useRef(false);
  const hasChangedRef = useRef(false);

  useEffect(() => {
    if (!isFocusedRef.current) {
      setLocalValue(value);
    }
  }, [value]);

  const handleChangeText = useCallback((text: string) => {
    // DO NOT apply transform here - causes IME conflicts on Android
    // Transform is applied only on blur/endEditing
    setLocalValue(text);
    hasChangedRef.current = true;
  }, []);

  const handleFocus = useCallback(() => {
    isFocusedRef.current = true;
  }, []);

  const syncValue = useCallback(() => {
    isFocusedRef.current = false;

    if (!hasChangedRef.current) return;

    // Apply transform only when exiting the field
    const finalValue = transform ? transform(localValue) : localValue;

    if (finalValue !== value) {
      onValueChange(finalValue);
    }

    // Update displayed value with normalized text after leaving field
    setLocalValue(finalValue);

    hasChangedRef.current = false;
  }, [localValue, value, onValueChange, transform]);

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
