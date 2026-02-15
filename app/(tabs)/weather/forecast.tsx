import DropdownField from "@/components/form/Dropdown";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { get } from "@lib/api-client";
import { Formik } from "formik";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import * as Yup from "yup";

const CitySchema = Yup.object().shape({
  city: Yup.string().required("Please select an option"),
});

const cityOptions = [
  { label: "Ampara", value: "Ampara" },
  { label: "Anuradhapura", value: "Anuradhapura" },
  { label: "Badulla", value: "Badulla" },
  { label: "Batticaloa", value: "Batticaloa" },
  { label: "Colombo", value: "Colombo" },
  { label: "Galle", value: "Galle" },
  { label: "Gampaha", value: "Gampaha" },
  { label: "Hambantota", value: "Hambantota" },
  { label: "Jaffna", value: "Jaffna" },
  { label: "Kalutara", value: "Kalutara" },
  { label: "Kandy", value: "Kandy" },
  { label: "Kegalle", value: "Kegalle" },
  { label: "Kilinochchi", value: "Kilinochchi" },
  { label: "Kurunegala", value: "Kurunegala" },
  { label: "Mannar", value: "Mannar" },
  { label: "Matale", value: "Matale" },
  { label: "Matara", value: "Matara" },
  { label: "Monaragala", value: "Monaragala" },
  { label: "Nuwara Eliya", value: "Nuwara Eliya" },
  { label: "Polonnaruwa", value: "Polonnaruwa" },
  { label: "Puttalam", value: "Puttalam" },
  { label: "Ratnapura", value: "Ratnapura" },
  { label: "Trincomalee", value: "Trincomalee" },
  { label: "Vavuniya", value: "Vavuniya" },
];

export default function ForecastScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];

  const handleCityChange = async (
    value: string,
    setFieldValue: (field: string, value: string) => void,
  ) => {
    console.log("City selected in DropdownField:", value);
    setFieldValue("city", value);

    try {
      const data = await get<unknown>(
        `/7-day?city=${encodeURIComponent(value)}`,
      );
      console.log("7-day forecast:", data);
    } catch (error) {
      console.warn("Failed to fetch 7-day forecast:", error);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>Forecast</Text>
      <Text style={[styles.subtitle, { color: theme.icon }]}>Next 7 days</Text>
      <Formik
        initialValues={{ city: "" }}
        validationSchema={CitySchema}
        onSubmit={(values) => {
          console.log("Selected city:", values.city);
        }}
      >
        {({ values, errors, touched, setFieldValue, handleSubmit }) => (
          <DropdownField
            value={values.city}
            placeholder="Select a city"
            options={cityOptions}
            error={touched.city ? errors.city : undefined}
            onChangeSelect={(value: string) =>
              handleCityChange(value, setFieldValue)
            }
          />
        )}
      </Formik>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: "600",
  },
  body: {
    fontSize: 14,
    lineHeight: 20,
  },
  formSection: {
    marginTop: 24,
    gap: 12,
  },
  button: {
    alignItems: "center",
    borderRadius: 12,
    paddingVertical: 12,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  selectionHint: {
    fontSize: 12,
  },
});
