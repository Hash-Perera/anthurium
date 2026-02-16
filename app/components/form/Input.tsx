import React, { useState } from "react";
import { Text, TextInput, TextInputProps, View } from "react-native";

interface InputFieldProps extends TextInputProps {
  label: string;
  error?: string;
  touched?: boolean;
}

export default function InputField({
  label,
  placeholder,
  value,
  onChangeText,
  onBlur,
  error,
  touched,
  ...props
}: InputFieldProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View className="mb-4">
      {/* Label */}
      <Text className="text-black font-medium mb-1">{label}</Text>

      {/* Input Field */}
      <TextInput
        className={`p-4 rounded ${
          isFocused ? "border-2 border-custom-blue1" : "border-2 border-gray200"
        } bg-white`}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        onBlur={(e) => {
          setIsFocused(false);
          onBlur?.(e);
        }}
        onFocus={() => setIsFocused(true)}
        {...props}
      />

      {/* Error Message */}
      {error && touched && (
        <Text className="text-red-500 text-sm mt-1">{error}</Text>
      )}
    </View>
  );
}
