import DropdownField from "@/components/form/Dropdown";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { get, Service } from "@lib/api-client";
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

const CitySchema = Yup.object().shape({
  city: Yup.string().required("Please select an option"),
});

export const cityOptions = [
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

type ForecastDay = {
  date: string;
  humidity: number;
  temp_max: number;
  temp_min: number;
  weather: string;
  wind_speed: number;
};

export default function ForecastScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const [forecast, setForecast] = useState<ForecastDay[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleCityChange = async (
    value: string,
    setFieldValue: (field: string, value: string) => void,
  ) => {
    setFieldValue("city", value);
    setIsLoading(true);

    try {
      const data = await get<ForecastDay[]>(
        Service.WEATHER,
        `weather/7-day?city=${encodeURIComponent(value)}`,
      );
      setForecast(data);
    } catch (error) {
      console.error("Failed to fetch 7-day forecast:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.content}
    >
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
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <View style={styles.loadingRow}>
            <ActivityIndicator size="small" color={theme.tint} />
            <Text style={[styles.loadingText, { color: theme.icon }]}>
              Loading forecast...
            </Text>
          </View>
        </View>
      ) : (
        <View style={styles.cardsSection}>
          {forecast.map((day) => {
            const weatherLower = day.weather.toLowerCase();
            let accent = "#E88AA4";
            let accentSoft = "rgba(232, 138, 164, 0.16)";
            let icon = "⛅";

            if (weatherLower.includes("thunder")) {
              accent = "#7F5AF0";
              accentSoft = "rgba(127, 90, 240, 0.16)";
              icon = "⚡";
            } else if (
              weatherLower.includes("rain") ||
              weatherLower.includes("drizzle")
            ) {
              accent = "#4C8EDA";
              accentSoft = "rgba(76, 142, 218, 0.16)";
              icon = "🌧️";
            } else if (weatherLower.includes("cloud")) {
              accent = "#6A7F9B";
              accentSoft = "rgba(106, 127, 155, 0.16)";
              icon = "☁️";
            } else if (
              weatherLower.includes("clear") ||
              weatherLower.includes("sun")
            ) {
              accent = "#F5A524";
              accentSoft = "rgba(245, 165, 36, 0.16)";
              icon = "☀️";
            } else if (weatherLower.includes("snow")) {
              accent = "#58B7D3";
              accentSoft = "rgba(88, 183, 211, 0.16)";
              icon = "❄️";
            }

            return (
              <View
                key={day.date}
                style={[
                  styles.card,
                  {
                    backgroundColor: theme.white,
                    borderColor: theme.white,
                  },
                ]}
              >
                <View style={[styles.cardHeaderRow]}>
                  <View
                    style={[styles.cardIcon, { backgroundColor: accentSoft }]}
                  >
                    <Text style={styles.cardIconText}>{icon}</Text>
                  </View>
                  <View style={styles.cardHeaderText}>
                    <Text style={[styles.cardDate, { color: theme.text }]}>
                      {day.date}
                    </Text>
                    <Text style={[styles.cardWeather, { color: theme.icon }]}>
                      {day.weather}
                    </Text>
                  </View>
                  <View
                    style={[styles.tempPill, { backgroundColor: accentSoft }]}
                  >
                    <Text style={[styles.tempPillText, { color: accent }]}>
                      {Math.round(day.temp_max)}°
                    </Text>
                  </View>
                </View>
                <View style={styles.cardRow}>
                  <Text style={[styles.cardLabel, { color: theme.icon }]}>
                    Max
                  </Text>
                  <Text style={[styles.cardValue, { color: theme.text }]}>
                    {day.temp_max.toFixed(1)}°C
                  </Text>
                </View>
                <View style={styles.cardRow}>
                  <Text style={[styles.cardLabel, { color: theme.icon }]}>
                    Min
                  </Text>
                  <Text style={[styles.cardValue, { color: theme.text }]}>
                    {day.temp_min.toFixed(1)}°C
                  </Text>
                </View>
                <View style={styles.cardRow}>
                  <Text style={[styles.cardLabel, { color: theme.icon }]}>
                    Humidity
                  </Text>
                  <Text style={[styles.cardValue, { color: theme.text }]}>
                    {day.humidity}%
                  </Text>
                </View>
                <View style={styles.cardRow}>
                  <Text style={[styles.cardLabel, { color: theme.icon }]}>
                    Wind
                  </Text>
                  <Text style={[styles.cardValue, { color: theme.text }]}>
                    {day.wind_speed.toFixed(1)} m/s
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
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
    marginBottom: 18,
  },
  body: {
    fontSize: 14,
    lineHeight: 20,
  },
  formSection: {
    marginTop: 24,
    gap: 12,
  },
  cardsSection: {
    marginTop: 20,
    gap: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 320,
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginTop: 16,
  },
  loadingText: {
    fontSize: 13,
    fontWeight: "600",
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
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
    marginBottom: 12,
  },
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  cardIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  cardIconText: {
    fontSize: 18,
  },
  cardHeaderText: {
    flex: 1,
    marginLeft: 10,
  },
  cardDate: {
    fontSize: 16,
    fontWeight: "700",
  },
  cardWeather: {
    fontSize: 13,
    fontWeight: "600",
    textTransform: "capitalize",
    marginTop: 4,
  },
  tempPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  tempPillText: {
    fontSize: 13,
    fontWeight: "700",
  },
  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
  },
  cardLabel: {
    fontSize: 12,
    fontWeight: "600",
  },
  cardValue: {
    fontSize: 13,
    fontWeight: "700",
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
