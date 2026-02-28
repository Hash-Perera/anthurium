import React from "react";
import { Image, SafeAreaView, StyleSheet, Text, View } from "react-native";

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Anthurium Care</Text>
          <Text style={styles.subtitle}>Smart Plant Monitoring Application</Text>
        </View>

        <View style={styles.heroCard}>
          <Image
            source={require("../home/assets/images/img.jpg")}
            style={styles.image}
            resizeMode="cover"
          />
          <View style={styles.heroTextWrap}>
            <Text style={styles.heroTitle}>Keep your plants healthy</Text>
            <Text style={styles.heroText}>
              Simple guidance to support growth, disease prevention, and better care routines.
            </Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoCard}>
            <Text style={styles.infoIcon}>📷</Text>
            <Text style={styles.infoTitle}>Detect</Text>
            <Text style={styles.infoText}>Identify leaf issues early</Text>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoIcon}>🪴</Text>
            <Text style={styles.infoTitle}>Care</Text>
            <Text style={styles.infoText}>Get simple daily tips</Text>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoIcon}>📈</Text>
            <Text style={styles.infoTitle}>Track</Text>
            <Text style={styles.infoText}>Monitor progress easily</Text>
          </View>
        </View>

        <View style={styles.bottomCard}>
          <Text style={styles.bottomTitle}>Welcome</Text>
          <Text style={styles.bottomText}>
            This app is designed to help Anthurium growers maintain healthy plants with clear and
            friendly guidance.
          </Text>
        </View>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F4F6F9" },
  container: { flex: 1, padding: 18 },

  header: { marginTop: 6, marginBottom: 14 },
  title: { fontSize: 30, fontWeight: "800", color: "#111827" },
  subtitle: { marginTop: 6, fontSize: 14, color: "#6B7280" },

  heroCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 14,
  },
  image: { width: "100%", height: 190 },
  heroTextWrap: { padding: 14 },
  heroTitle: { fontSize: 16, fontWeight: "800", color: "#111827" },
  heroText: { marginTop: 6, fontSize: 13, color: "#4B5563", lineHeight: 18 },

  infoRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 14 },
  infoCard: {
    width: "32%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
  },
  infoIcon: { fontSize: 18, marginBottom: 8 },
  infoTitle: { fontSize: 13, fontWeight: "800", color: "#111827" },
  infoText: { marginTop: 6, fontSize: 11.5, color: "#6B7280", textAlign: "center", lineHeight: 16 },

  bottomCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  bottomTitle: { fontSize: 14, fontWeight: "800", color: "#111827" },
  bottomText: { marginTop: 8, fontSize: 13, color: "#4B5563", lineHeight: 19 },

  footer: { marginTop: 14, textAlign: "center", fontSize: 12, color: "#9CA3AF" },
});