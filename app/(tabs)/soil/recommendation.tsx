import DropdownField from "@/components/form/Dropdown";
import { SuitabilityCard } from "@/components/soil/SuitabilityCard";
import Colors from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { post, Service } from "@lib/api-client";
import { useLocalSearchParams } from "expo-router";
import { Formik } from "formik";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from "react-native";
import * as Yup from "yup";

const VarientSchema = Yup.object().shape({
  varient: Yup.string().required("Please select an option"),
});

export const varientOptions = [
  { label: "Flamingo Flower", value: "Flamingo Flower" },
  { label: "Pigtail Flower", value: "Pigtail Flower" },
  { label: "Black Velvet", value: "Black Velvet" },
  { label: "Crystal Anthurium", value: "Crystal Anthurium" },
];

const parseDeviations = (deviations: string[]) => {
  return deviations.map((deviation) => {
    // Parse deviation strings like "Soil Moisture deviation: +56.5% High"
    const match = deviation.match(
      /(.+?):\s*([-+]?\d+\.?\d*%?)\s*(?:\(?(High|Low|Moderate)\)?)?/i,
    );

    if (match) {
      return {
        label: match[1].trim(),
        value: match[2].trim(),
        status: (match[3] || "Moderate") as "High" | "Low" | "Moderate",
      };
    }

    return {
      label: deviation,
      value: "N/A",
      status: "Moderate" as const,
    };
  });
};

type SoilData = {
  soilMoisture: number;
  humidity: number;
  temperature: number;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  isHealthy: boolean;
  timestamp: string;
};
type Soil = {
  issues: string[];
  recommendations: string[];
  deviations: string[];
  suitability_score: number;
};

export default function Recommendation() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const { soilData } = useLocalSearchParams<{ soilData?: string }>();
  const [isLoading, setIsLoading] = useState(false);
  const [soil, setSoil] = useState<Soil>({
    issues: [],
    recommendations: [],
    deviations: [],
    suitability_score: 0,
  });

  // Parse soil data from query params
  const parsed = useMemo<SoilData | null>(() => {
    if (!soilData) {
      return null;
    }

    try {
      return JSON.parse(soilData) as SoilData;
    } catch {
      return null;
    }
  }, [soilData]);

  // Recommendations
  const handleVarientChange = async (
    value: string,
    setFieldValue: (field: string, value: string) => void,
  ) => {
    setFieldValue("varient", value);
    setIsLoading(true);

    try {
      if (!parsed) {
        console.error("No soil data available");
        return;
      }

      const requestBody = {
        soilMoisture: parsed.soilMoisture,
        humidity: parsed.humidity,
        temperature: parsed.temperature,
        nitrogen: parsed.nitrogen,
        phosphorus: parsed.phosphorus,
        potassium: parsed.potassium,
      };

      const data = await post<Soil>(
        Service.SOIL,
        `api/readings/recommendations?flower=${encodeURIComponent(value)}`,
        requestBody,
      );

      setSoil(data);
    } catch (error) {
      console.error("Failed to fetch recommendations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.content}
    >
      <Text style={[styles.title, { color: theme.text }]}>
        Soil Recommendations
      </Text>
      <Text style={[styles.subtitle, { color: theme.icon }]}>
        Select anthurium variant
      </Text>
      <Formik
        initialValues={{ varient: "" }}
        validationSchema={VarientSchema}
        onSubmit={(values) => {
          console.log("Selected varient:", values.varient);
        }}
      >
        {({ values, errors, touched, setFieldValue, handleSubmit }) => (
          <DropdownField
            value={values.varient}
            placeholder="Select a varient"
            options={varientOptions}
            error={touched.varient ? errors.varient : undefined}
            onChangeSelect={(value: string) =>
              handleVarientChange(value, setFieldValue)
            }
          />
        )}
      </Formik>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.tint} />
          <Text style={[styles.loadingText, { color: theme.icon }]}>
            Loading recommendations...
          </Text>
        </View>
      ) : (
        <>
          {soil.suitability_score > 0 && (
            <SuitabilityCard
              score={soil.suitability_score}
              deviations={parseDeviations(soil.deviations)}
            />
          )}

          {soil.issues.length > 0 && (
            <View style={styles.issuesContainer}>
              <View style={styles.sectionHeader}>
                <Ionicons name="alert-circle" size={20} color="#D97706" />
                <Text style={styles.sectionTitle}>Issues</Text>
              </View>
              {soil.issues.map((issue, index) => (
                <View key={index} style={styles.issueItem}>
                  <Text style={styles.bulletPoint}>•</Text>
                  <Text style={styles.issueText}>{issue}</Text>
                </View>
              ))}
            </View>
          )}

          {soil.recommendations.length > 0 && (
            <View style={styles.recommendationsContainer}>
              <View style={styles.sectionHeader}>
                <Ionicons name="checkmark-circle" size={20} color="#059669" />
                <Text style={styles.sectionTitle}>Recommendations</Text>
              </View>
              {soil.recommendations.map((recommendation, index) => (
                <View key={index} style={styles.recommendationItem}>
                  <Text style={styles.bulletPoint}>•</Text>
                  <Text style={styles.recommendationText}>
                    {recommendation}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </>
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
  loadingContainer: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: "500",
  },
  issuesContainer: {
    backgroundColor: "#FEF3C7",
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
    borderWidth: 1,
    borderColor: "#FDE68A",
  },
  recommendationsContainer: {
    backgroundColor: "#D1FAE5",
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: "#A7F3D0",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
  },
  issueItem: {
    flexDirection: "row",
    marginBottom: 8,
    paddingLeft: 4,
  },
  recommendationItem: {
    flexDirection: "row",
    marginBottom: 8,
    paddingLeft: 4,
  },
  bulletPoint: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
    marginRight: 8,
    marginTop: 1,
  },
  issueText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: "#78350F",
  },
  recommendationText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: "#065F46",
  },
});
