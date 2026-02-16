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

type WateringInstructions = {
  weather_type: string;
  avg_temp: number;
  avg_humidity: number;
  avg_rainfall: number;
  recommendations: string[];
};

export default function InsightsScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const [wateringData, setWateringData] = useState<WateringInstructions | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);

  const handleCityChange = async (
    value: string,
    setFieldValue: (field: string, value: string) => void,
  ) => {
    setFieldValue("city", value);
    setIsLoading(true);

    try {
      const data = await get<WateringInstructions>(
        `weather/3-day-recommendation?city=${encodeURIComponent(value)}`,
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
      <Text style={[styles.title, { color: theme.text }]}>Insights</Text>
      <Text style={[styles.subtitle, { color: theme.icon }]}>Care tips</Text>
      <Text style={[styles.body, { color: theme.text }]}>
        Weather-based care insights and quick tips according to the weather in
        coming 3 days.
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
            Loading reccomndations...
          </Text>
        </View>
      ) : (
        wateringData && (
          <View
            style={[
              styles.card,
              {
                backgroundColor: theme.white,
              },
            ]}
          >
            <View style={styles.cardAccent} />
            <View style={styles.weatherTypeRow}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                Weather Type
              </Text>
              <View
                style={[
                  styles.typeBadge,
                  {
                    backgroundColor:
                      wateringData.weather_type === "Normal"
                        ? "rgba(76, 142, 218, 0.16)"
                        : "rgba(232, 138, 164, 0.16)",
                  },
                ]}
              >
                <Text
                  style={[
                    styles.typeText,
                    {
                      color:
                        wateringData.weather_type === "Normal"
                          ? "#4C8EDA"
                          : "#E88AA4",
                    },
                  ]}
                >
                  {wateringData.weather_type}
                </Text>
              </View>
            </View>
            <View style={styles.metricsGrid}>
              <View style={styles.metricItem}>
                <View
                  style={[
                    styles.metricIconBox,
                    { backgroundColor: "rgba(245, 165, 36, 0.16)" },
                  ]}
                >
                  <Ionicons
                    name="thermometer-outline"
                    size={20}
                    color="#F5A524"
                  />
                </View>
                <Text style={[styles.metricLabel, { color: theme.icon }]}>
                  Avg Temp
                </Text>
                <Text style={[styles.metricValue, { color: theme.text }]}>
                  {wateringData.avg_temp}°C
                </Text>
              </View>
              <View style={styles.metricItem}>
                <View
                  style={[
                    styles.metricIconBox,
                    { backgroundColor: "rgba(76, 142, 218, 0.16)" },
                  ]}
                >
                  <Ionicons name="water-outline" size={20} color="#4C8EDA" />
                </View>
                <Text style={[styles.metricLabel, { color: theme.icon }]}>
                  Humidity
                </Text>
                <Text style={[styles.metricValue, { color: theme.text }]}>
                  {wateringData.avg_humidity}%
                </Text>
              </View>
              <View style={styles.metricItem}>
                <View
                  style={[
                    styles.metricIconBox,
                    { backgroundColor: "rgba(88, 183, 211, 0.16)" },
                  ]}
                >
                  <Ionicons
                    name="cloud-download-outline"
                    size={20}
                    color="#58B7D3"
                  />
                </View>
                <Text style={[styles.metricLabel, { color: theme.icon }]}>
                  Rainfall
                </Text>
                <Text style={[styles.metricValue, { color: theme.text }]}>
                  {wateringData.avg_rainfall}mm
                </Text>
              </View>
            </View>
            <View style={styles.divider} />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Recommendations
            </Text>
            <View style={styles.recommendationsList}>
              {wateringData.recommendations.map((rec, index) => (
                <View key={index} style={styles.recommendationItem}>
                  <View
                    style={[
                      styles.recommendationIcon,
                      { backgroundColor: "rgba(232, 138, 164, 0.16)" },
                    ]}
                  >
                    <Ionicons
                      name="checkmark-circle"
                      size={18}
                      color="#E88AA4"
                    />
                  </View>
                  <Text
                    style={[styles.recommendationText, { color: theme.text }]}
                  >
                    {rec}
                  </Text>
                </View>
              ))}
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
  weatherTypeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
  },
  typeBadge: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  typeText: {
    fontSize: 12,
    fontWeight: "700",
  },
  metricsGrid: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  metricItem: {
    flex: 1,
    alignItems: "center",
  },
  metricIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: "600",
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 12,
    fontWeight: "700",
  },
  divider: {
    height: 1,
    backgroundColor: "#E8E8E8",
    marginVertical: 16,
  },
  recommendationsList: {
    gap: 12,
  },
  recommendationItem: {
    flexDirection: "row",
    gap: 10,
  },
  recommendationIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  recommendationText: {
    flex: 1,
    fontSize: 13,
    fontWeight: "500",
    borderRadius: 8,
    lineHeight: 18,
  },
});
