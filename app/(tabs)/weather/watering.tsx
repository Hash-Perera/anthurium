import DropdownField from "@/components/form/Dropdown";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons } from "@expo/vector-icons";
import { get } from "@lib/api-client";
import { Formik } from "formik";
import React, { useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import * as Yup from "yup";
import { cityOptions } from "./forecast";

const CitySchema = Yup.object().shape({
  city: Yup.string().required("Please select an option"),
});

type WateringData = {
  city: string;
  weather: {
    temperature_c: number;
    humidity_pct: number;
    rainfall_mm: number;
    wind_kmph: number;
  };
  watering_level: string;
  watering_frequency_per_day: number;
  watering_time: string;
  water_amount: string;
};

export default function WateringScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const [wateringData, setWateringData] = useState<WateringData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleCityChange = async (
    value: string,
    setFieldValue: (field: string, value: string) => void,
  ) => {
    console.log("City selected in DropdownField:", value);
    setFieldValue("city", value);
    setIsLoading(true);

    try {
      const data = await get<WateringData>(
        `watering/recommendation?city=${encodeURIComponent(value)}`,
      );
      setWateringData(data);
    } catch (error) {
      console.warn("Failed to fetch watering recommendation:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.content}
    >
      <Text style={[styles.title, { color: theme.text }]}>Watering</Text>
      <Text style={[styles.subtitle, { color: theme.icon }]}>
        Soil moisture
      </Text>
      <Text style={[styles.body, { color: theme.text }]}>
        Moisture trends and suggested watering windows will appear here.
      </Text>

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
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={theme.tint} />
          <Text style={[styles.loadingText, { color: theme.icon }]}>
            Loading watering data...
          </Text>
        </View>
      ) : (
        wateringData && (
          <View
            style={[
              styles.card,
              {
                backgroundColor: theme.white,
                borderColor: theme.tint,
              },
            ]}
          >
            {/* <View style={styles.cardAccent} /> */}
            <View style={styles.sectionRow}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                Weather
              </Text>
            </View>
            <View style={styles.weatherGrid}>
              <View style={styles.weatherItem}>
                <View
                  style={[
                    styles.weatherIconBox,
                    { backgroundColor: "rgba(245, 165, 36, 0.16)" },
                  ]}
                >
                  <Ionicons
                    name="thermometer-outline"
                    size={20}
                    color="#F5A524"
                  />
                </View>
                <Text style={[styles.weatherLabel, { color: theme.icon }]}>
                  Temperature
                </Text>
                <Text style={[styles.weatherValue, { color: theme.text }]}>
                  {wateringData.weather.temperature_c}°C
                </Text>
              </View>
              <View style={styles.weatherItem}>
                <View
                  style={[
                    styles.weatherIconBox,
                    { backgroundColor: "rgba(76, 142, 218, 0.16)" },
                  ]}
                >
                  <Ionicons name="water-outline" size={20} color="#4C8EDA" />
                </View>
                <Text style={[styles.weatherLabel, { color: theme.icon }]}>
                  Humidity
                </Text>
                <Text style={[styles.weatherValue, { color: theme.text }]}>
                  {wateringData.weather.humidity_pct}%
                </Text>
              </View>
              <View style={styles.weatherItem}>
                <View
                  style={[
                    styles.weatherIconBox,
                    { backgroundColor: "rgba(88, 183, 211, 0.16)" },
                  ]}
                >
                  <Ionicons
                    name="cloud-download-outline"
                    size={20}
                    color="#58B7D3"
                  />
                </View>
                <Text style={[styles.weatherLabel, { color: theme.icon }]}>
                  Rainfall
                </Text>
                <Text style={[styles.weatherValue, { color: theme.text }]}>
                  {wateringData.weather.rainfall_mm}mm
                </Text>
              </View>
              <View style={styles.weatherItem}>
                <View
                  style={[
                    styles.weatherIconBox,
                    { backgroundColor: "rgba(106, 127, 155, 0.16)" },
                  ]}
                >
                  <Ionicons
                    name="speedometer-outline"
                    size={20}
                    color="#6A7F9B"
                  />
                </View>
                <Text style={[styles.weatherLabel, { color: theme.icon }]}>
                  Wind
                </Text>
                <Text style={[styles.weatherValue, { color: theme.text }]}>
                  {wateringData.weather.wind_kmph} km/h
                </Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.sectionRow}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                Watering Recomndation
              </Text>
            </View>
            <View style={styles.wateringRow}>
              <View style={styles.wateringItem}>
                <Text style={[styles.wateringLabel, { color: theme.icon }]}>
                  Level
                </Text>
                <View
                  style={[
                    styles.levelBadge,
                    {
                      backgroundColor:
                        wateringData.watering_level === "High"
                          ? "rgba(232, 138, 164, 0.16)"
                          : "rgba(76, 142, 218, 0.16)",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.levelText,
                      {
                        color:
                          wateringData.watering_level === "High"
                            ? "#E88AA4"
                            : "#4C8EDA",
                      },
                    ]}
                  >
                    {wateringData.watering_level}
                  </Text>
                </View>
              </View>
              <View style={styles.wateringItem}>
                <Text style={[styles.wateringLabel, { color: theme.icon }]}>
                  Frequency
                </Text>
                <Text style={[styles.wateringValue, { color: theme.text }]}>
                  {wateringData.watering_frequency_per_day}x per day
                </Text>
              </View>
            </View>
            <View style={styles.wateringRow}>
              <View style={styles.wateringItem}>
                <Text style={[styles.wateringLabel, { color: theme.icon }]}>
                  Time
                </Text>
                <Text style={[styles.wateringValue, { color: theme.text }]}>
                  {wateringData.watering_time}
                </Text>
              </View>
              <View style={styles.wateringItem}>
                <Text style={[styles.wateringLabel, { color: theme.icon }]}>
                  Amount
                </Text>
                <Text style={[styles.wateringValue, { color: theme.text }]}>
                  {wateringData.water_amount}
                </Text>
              </View>
            </View>
          </View>
        )
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  content: {
    paddingBottom: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 16,
  },
  body: {
    fontSize: 14,
    lineHeight: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 320,
    flexDirection: "row",
    gap: 10,
  },
  loadingText: {
    fontSize: 13,
    fontWeight: "600",
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E8E8E8",
    padding: 16,
    marginTop: 20,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 3,
    overflow: "hidden",
  },
  cardAccent: {
    height: 6,
    borderRadius: 999,
    backgroundColor: "#E88AA4",
    marginBottom: 16,
  },
  sectionRow: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
  },
  weatherGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  weatherItem: {
    flex: 1,
    minWidth: "45%",
    alignItems: "center",
  },
  weatherIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  weatherLabel: {
    fontSize: 11,
    fontWeight: "600",
    marginBottom: 4,
  },
  weatherValue: {
    fontSize: 12,
    fontWeight: "700",
  },
  divider: {
    height: 1,
    backgroundColor: "#E8E8E8",
    marginVertical: 16,
  },
  wateringRow: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 12,
  },
  wateringItem: {
    flex: 1,
  },
  wateringLabel: {
    fontSize: 11,
    fontWeight: "600",
    marginBottom: 6,
  },
  levelBadge: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignItems: "center",
  },
  levelText: {
    fontSize: 12,
    fontWeight: "700",
  },
  wateringValue: {
    fontSize: 13,
    fontWeight: "600",
  },
});
