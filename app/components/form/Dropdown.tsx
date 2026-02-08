import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { Colors, Fonts } from "../../constants/theme";

interface DropdownOption {
  label: string;
  value: string;
}

interface DropdownFieldProps {
  label?: string;
  value?: string;
  placeholder?: string;
  options: DropdownOption[];
  error?: string;
  onChangeSelect: (value: string) => void;
}

export default function DropdownField({
  label,
  value,
  options,
  error,
  placeholder,
  onChangeSelect,
}: DropdownFieldProps) {
  const [isFocus, setIsFocus] = useState(false);

  return (
    <View style={styles.container}>
      {/* Label */}
      {label && <Text style={styles.label}>{label}</Text>}

      <Dropdown
        style={[
          styles.dropdown,
          isFocus && { borderColor: Colors.light.tint },
          error && { borderColor: Colors.light.tint },
        ]}
        placeholderStyle={styles.placeholderStyle}
        selectedTextStyle={styles.selectedTextStyle}
        data={options}
        maxHeight={300}
        labelField="label"
        valueField="value"
        placeholder={!isFocus ? placeholder : "..."}
        value={value}
        onFocus={() => setIsFocus(true)}
        onBlur={() => setIsFocus(false)}
        onChange={(item) => {
          setIsFocus(false);
          onChangeSelect(item.value);
        }}
      />

      {/* Error */}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 15,
    backgroundColor: Colors.light.background,
    width: "100%",
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6,
    color: Colors.light.text,
    fontFamily: Fonts.rounded,
    marginLeft: 4,
  },
  dropdown: {
    height: 50,
    borderColor: Colors.light.icon,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 8,
    backgroundColor: Colors.light.white,
  },
  placeholderStyle: {
    fontSize: 16,
    color: Colors.light.icon,
    fontFamily: Fonts.rounded,
  },
  selectedTextStyle: {
    fontSize: 16,
    color: Colors.light.text,
    fontFamily: Fonts.rounded,
  },
  errorText: {
    marginTop: 4,
    fontSize: 12,
    color: Colors.light.tint,
    fontFamily: Fonts.rounded,
  },
});
