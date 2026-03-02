import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Samis = {
  samis_score: number;
  sustainability: string;
  trend: {
    label: string;
    change_percent: number;
  };
  risk: {
    level: string;
    volatility: number;
  };
};

type RouteParams = {
  PricePredict: {
    price: number;
    samis: Samis;
  };
};

export default function SamisDetails() {
  const route = useRoute<RouteProp<RouteParams, "PricePredict">>();
  const navigation = useNavigation();
  const { price, samis } = route.params;

  const [recommendation, setRecommendation] = useState<string>("");

  const getSellingRecommendation = () => {
    if (samis.trend.change_percent > 5 && samis.risk.volatility < 10) {
      setRecommendation("✅ Good time to sell!");
    } else {
      setRecommendation("⚠️ Better to wait before selling.");
    }
  };

  const scoreTone = useMemo(() => {
    const score = Number(samis?.samis_score ?? 0);
    if (score >= 80) return "good";
    if (score >= 50) return "mid";
    return "bad";
  }, [samis?.samis_score]);

  const toneColor =
    scoreTone === "good" ? PINK.primary : scoreTone === "mid" ? PINK.dark : "#B00020";

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Sustainable Report</Text>
          <Text style={styles.subtitle}>
            SAMIS based market insights for your prediction
          </Text>
        </View>

        <View style={styles.card}>
          {/* Price */}
          <View style={styles.priceBox}>
            <Text style={styles.mutedLabel}>Predicted Price</Text>
            <Text style={styles.price}>Rs. {Number(price).toFixed(2)}</Text>
          </View>

          {/* Score */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>SAMIS Score</Text>

            <View style={[styles.pill, { borderColor: PINK.border }]}>
              <View style={[styles.dot, { backgroundColor: toneColor }]} />
              <Text style={styles.pillText}>
                {samis.samis_score} • {samis.sustainability}
              </Text>
            </View>

            <View style={styles.metricGrid}>
              <View style={styles.metricCard}>
                <Text style={styles.metricLabel}>Trend</Text>
                <Text style={styles.metricValue}>{samis.trend.label}</Text>
              </View>

              <View style={styles.metricCard}>
                <Text style={styles.metricLabel}>Risk Level</Text>
                <Text style={styles.metricValue}>{samis.risk.level}</Text>
              </View>
            </View>
          </View>

          {/* Recommendation */}
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={getSellingRecommendation}
            activeOpacity={0.9}
          >
            <Text style={styles.primaryBtnText}>
              Smart Selling Recommendation
            </Text>
          </TouchableOpacity>

          {recommendation ? (
            <View style={styles.recoBox}>
              <Text style={styles.recoText}>{recommendation}</Text>
            </View>
          ) : (
            <Text style={styles.helperText}>
              Tap the button to get a quick suggestion based on trend and risk.
            </Text>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const PINK = {
  primary: "#E91E63",
  dark: "#C2185B",
  light: "#FCE4EC",
  border: "#F3E5F5",
  text: "#2D2D2D",
  muted: "#777",
  white: "#FFFFFF",
};

const styles = StyleSheet.create({
  // ✅ Take the whole screen height and remove center alignment
  container: {
    flexGrow: 1,
    backgroundColor: PINK.white,
  },

  // ✅ Outer wrapper that fills the full page
  page: {
    flex: 1,
    padding: 16,
    minHeight: "100%",
  },

  header: {
    paddingTop: 10,
    paddingBottom: 14,
    gap: 6,
    alignItems: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: PINK.text,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 13,
    color: PINK.muted,
    textAlign: "center",
    lineHeight: 18,
  },

  // ✅ Card takes full width and looks bigger
  card: {
    flex: 1,
    width: "100%",
    backgroundColor: PINK.white,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: PINK.border,
    shadowColor: "#000000",
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
  },

  priceBox: {
    backgroundColor: "#FFF7FB",
    borderWidth: 1,
    borderColor: PINK.border,
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 14,
    alignItems: "center",
  },
  mutedLabel: {
    color: PINK.muted,
    fontWeight: "700",
    fontSize: 12,
  },
  price: {
    marginTop: 8,
    fontSize: 36,
    fontWeight: "800",
    color: PINK.primary,
  },

  section: {
    marginTop: 18,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: PINK.text,
    marginBottom: 12,
  },

  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    backgroundColor: PINK.white,
    borderRadius: 999,
    paddingVertical: 12,
    paddingHorizontal: 12,
    alignSelf: "flex-start",
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 999,
  },
  pillText: {
    color: PINK.text,
    fontWeight: "600",
    fontSize: 13,
  },

  metricGrid: {
    marginTop: 14,
    flexDirection: "row",
    gap: 10,
  },
  metricCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: PINK.border,
    backgroundColor: PINK.white,
    borderRadius: 16,
    padding: 14,
    minHeight: 86,
    justifyContent: "center",
  },
  metricLabel: {
    color: PINK.muted,
    fontWeight: "700",
    fontSize: 12,
  },
  metricValue: {
    marginTop: 8,
    color: PINK.text,
    fontWeight: "700",
    fontSize: 16,
  },

  primaryBtn: {
    marginTop: 18,
    backgroundColor: PINK.primary,
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: "center",
    shadowColor: "#000000",
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  primaryBtnText: {
    color: PINK.white,
    fontWeight: "700",
    fontSize: 14,
  },

  helperText: {
    marginTop: 12,
    color: PINK.muted,
    textAlign: "center",
    lineHeight: 18,
    fontSize: 12,
  },

  recoBox: {
    marginTop: 14,
    backgroundColor: PINK.light,
    borderWidth: 1,
    borderColor: PINK.border,
    borderRadius: 14,
    padding: 14,
    alignItems: "center",
  },
  recoText: {
    color: PINK.text,
    textAlign: "center",
    fontWeight: "600",
    fontSize: 14,
    lineHeight: 20,
  },
});