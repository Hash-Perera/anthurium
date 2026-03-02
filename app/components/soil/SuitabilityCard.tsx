import React from "react";
import { StyleSheet, Text, View } from "react-native";

type DeviationItem = {
  label: string;
  value: string;
  status: "High" | "Low" | "Moderate";
};

type SuitabilityCardProps = {
  score: number;
  deviations: DeviationItem[];
};

const getScoreStatus = (
  score: number,
): { label: string; color: string; bgColor: string } => {
  if (score >= 80) {
    return { label: "Excellent", color: "#059669", bgColor: "#ECF5EC" };
  } else if (score >= 70) {
    return { label: "Good", color: "#16A34A", bgColor: "#F0FDF4" };
  } else if (score >= 50) {
    return { label: "Fair", color: "#F59E0B", bgColor: "#FFFBEB" };
  }
  return { label: "Poor", color: "#DC2626", bgColor: "#FEF2F2" };
};

const getDeviationColor = (status: string) => {
  switch (status) {
    case "High":
      return {
        bgColor: "#FEE2E2",
        textColor: "#991B1B",
        statusColor: "#DC2626",
      };
    case "Low":
      return {
        bgColor: "#DBEAFE",
        textColor: "#1E3A8A",
        statusColor: "#2563EB",
      };
    case "Moderate":
      return {
        bgColor: "#FEF3C7",
        textColor: "#78350F",
        statusColor: "#F59E0B",
      };
    default:
      return {
        bgColor: "#F3F4F6",
        textColor: "#374151",
        statusColor: "#9CA3AF",
      };
  }
};

export const SuitabilityCard: React.FC<SuitabilityCardProps> = ({
  score,
  deviations,
}) => {
  const scoreStatus = getScoreStatus(score);

  return (
    <View style={styles.container}>
      <View style={styles.scoreHeader}>
        <View style={styles.scoreCircle}>
          <Text style={styles.scorePercentage}>{score}%</Text>
        </View>
        <Text style={styles.scoreTitle}>Suitability Score</Text>
        <View
          style={[styles.statusBadge, { backgroundColor: scoreStatus.color }]}
        >
          <Text style={styles.statusText}>{scoreStatus.label}</Text>
        </View>
      </View>

      {deviations.length > 0 && (
        <View style={styles.deviationsContainer}>
          {deviations.map((deviation, index) => {
            const colors = getDeviationColor(deviation.status);
            return (
              <View key={index} style={styles.deviationItem}>
                <Text style={styles.bulletPoint}>•</Text>
                <View style={styles.deviationContent}>
                  <Text style={styles.deviationText}>
                    {deviation.label}
                    <Text style={styles.deviationValue}>{deviation.value}</Text>
                  </Text>
                </View>
                <View
                  style={[
                    styles.deviationBadge,
                    { backgroundColor: colors.statusColor },
                  ]}
                >
                  <Text style={styles.deviationBadgeText}>
                    {deviation.status}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#F0F9FF",
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#BAE6FD",
  },
  scoreHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  scoreCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#E0F2FE",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#0EA5E9",
  },
  scorePercentage: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0C4A6E",
  },
  scoreTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  deviationsContainer: {
    gap: 8,
  },
  deviationItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 4,
    marginBottom: 4,
  },
  bulletPoint: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
    marginRight: 10,
    marginTop: 1,
  },
  deviationContent: {
    flex: 1,
  },
  deviationText: {
    fontSize: 14,
    lineHeight: 20,
    color: "#1F2937",
  },
  deviationValue: {
    fontWeight: "700",
  },
  deviationBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 12,
  },
  deviationBadgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
