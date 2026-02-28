import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { useState } from "react";
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


  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Sustainable Report</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Predicted Price</Text>
        <Text style={styles.price}>Rs. {price.toFixed(2)}</Text>

        <View style={styles.section}>
          <Text style={styles.label}>SAMIS Score</Text>
          <Text style={styles.value}>
            {samis.samis_score} ({samis.sustainability})
          </Text>
        </View>

<View style={styles.section}>
  <Text style={styles.label}>Trend</Text>
  <Text style={styles.value}>
    {samis.trend.label}
  </Text>
</View>

    <View style={styles.section}>
  <Text style={styles.label}>Risk Level</Text>
  <Text style={styles.value}>
    {samis.risk.level}
  </Text>
</View>

        {/* Smart Selling Recommendation Button */}
        <TouchableOpacity
          style={[styles.submitButton, { marginTop: 20 }]}
          onPress={getSellingRecommendation}
        >
          <Text style={styles.submitText}>Smart Selling Recommendation</Text>
        </TouchableOpacity>

        {/* Display Recommendation */}
        {recommendation ? (
          <Text style={styles.recommendation}>{recommendation}</Text>
        ) : null}

        {/* Close */}
        <TouchableOpacity
          style={[styles.closeButton, { marginTop: 20 }]}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.closeText}>Close</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#f5f5f5",
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 20,
    textAlign: "center",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 25,
    width: "90%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 10,
  },
  label: { fontWeight: "500", fontSize: 16, marginTop: 10 },
  value: { fontSize: 18, marginTop: 4, color: "#B22222", fontWeight: "600" },
  price: { fontSize: 32, fontWeight: "bold", color: "#B22222", marginVertical: 10 },
  section: { width: "100%", marginTop: 10, alignItems: "center" },
  submitButton: {
    marginTop: 20,
    backgroundColor: "#B22222",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 10,
    alignItems: "center",
  },
  submitText: { color: "#fff", fontWeight: "600" },
  recommendation: {
    marginTop: 15,
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    color: "#333",
  },
  closeButton: { marginTop: 20, backgroundColor: "#B22222", paddingVertical: 12, paddingHorizontal: 40, borderRadius: 10 },
  closeText: { color: "#fff", fontWeight: "600" },
});
