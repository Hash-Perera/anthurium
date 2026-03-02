import { get, Service } from "@lib/api-client";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

type StageResp = { infected_area_percent: number; stage: string };
type RecoveryResp = { recovery_days: { min: number; max: number } };
type RiskResp = { spread_risk: { level: string; score: number } };
type TreatmentResp = { guidance: string[] };

const COLORS = {
  primary: "#E91E63",
  primaryLight: "#FCE4EC",
  border: "#F3E5F5",
  text: "#2D2D2D",
  muted: "#777",
};

// Only DISEASE service needed here
const API_BASE = process.env.EXPO_PUBLIC_API_BASE_URL_DISEASE ?? "";

const joinUrl = (path: string) => {
  const trimmedBase = API_BASE.replace(/\/+$/, "");
  const trimmedPath = path.replace(/^\/+/, "");
  return `${trimmedBase}/${trimmedPath}`;
};

async function fileFromUri(uri: string) {
  const ext = uri.split(".").pop()?.toLowerCase() || "jpg";
  const mime = ext === "png" ? "image/png" : "image/jpeg";
  return { uri, name: `leaf.${ext}`, type: mime } as any;
}

async function postImage<T>(
  endpoint: string,
  uri: string,
  extra?: Record<string, string>,
): Promise<T> {
  if (!API_BASE) {
    throw new Error("API base missing. Check EXPO_PUBLIC_API_BASE_URL_DISEASE in .env");
  }

  const form = new FormData();
  form.append("image", await fileFromUri(uri));
  if (extra) Object.entries(extra).forEach(([k, v]) => form.append(k, v));

  const res = await fetch(joinUrl(endpoint), { method: "POST", body: form });

  let data: any = null;
  try {
    data = await res.json();
  } catch {
    const txt = await res.text().catch(() => "");
    throw new Error(txt || "Server error");
  }

  if (!res.ok || data?.success === false) {
    throw new Error(data?.message || data?.detail || "Something went wrong");
  }

  return data as T;
}

const nice = (s: string) =>
  s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

export default function DiseaseDetails() {
  const params = useLocalSearchParams<{ imageUri?: string; disease?: string }>();
  const imageUri = params.imageUri;
  const disease = params.disease;

  const [stage, setStage] = useState<StageResp | null>(null);
  const [recovery, setRecovery] = useState<RecoveryResp | null>(null);
  const [risk, setRisk] = useState<RiskResp | null>(null);
  const [treatment, setTreatment] = useState<TreatmentResp | null>(null);
  const [loading, setLoading] = useState(true);

  const isHealthy = (disease || "").toLowerCase() === "healthy";

  useEffect(() => {
    const loadAll = async () => {
      try {
        if (!imageUri) throw new Error("No image received. Go back and select an image first.");

        if (!API_BASE) {
          throw new Error("API base missing. Check EXPO_PUBLIC_API_BASE_URL_DISEASE in .env");
        }

        if (isHealthy) {
          setLoading(false);
          return;
        }

        const s = await postImage<StageResp>("/stage", imageUri);
        setStage(s);

        const r = await postImage<RecoveryResp>("/recovery", imageUri, {
          treatment_quality: "normal",
          humidity: "medium",
        });
        setRecovery(r);

        const rk = await postImage<RiskResp>("/risk", imageUri, { humidity: "medium" });
        setRisk(rk);

        if (disease) {
          // ✅ Use api client for JSON GET
          const t = await get<TreatmentResp>(
            Service.DISEASE,
            `/treatment/${encodeURIComponent(disease)}`,
          );
          setTreatment(t);
        }
      } catch (e: any) {
        Alert.alert("Error", e?.message || "Failed to load results");
      } finally {
        setLoading(false);
      }
    };

    loadAll();
  }, [imageUri, disease, isHealthy]);

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.muted}>Analyzing leaf...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Leaf Analysis Result</Text>

      <View style={styles.diseaseBox}>
        {isHealthy ? (
          <>
            <Text style={styles.healthyTitle}>This is a healthy leaf</Text>
            <Text style={styles.healthySub}>No disease detected.</Text>

            <View style={styles.healthyTipsBox}>
              <Text style={styles.tipsTitle}>Maintain Tips</Text>

              {[
                "Keep good air circulation around the plant",
                "Avoid overwatering and water only when needed",
                "Avoid overhead watering to keep leaves dry",
                "Keep the plant clean and remove dead leaves",
                "Monitor weekly for early spots or discoloration",
              ].map((t, i) => (
                <Text key={i} style={styles.bullet}>
                  • {t}
                </Text>
              ))}
            </View>
          </>
        ) : (
          <>
            <Text style={styles.label}>Detected Disease</Text>
            <Text style={styles.diseaseName}>{disease ? nice(disease) : "Not provided"}</Text>
          </>
        )}
      </View>

      {!isHealthy && stage && (
        <View style={styles.card}>
          <Text style={styles.label}>Stage</Text>
          <Text style={styles.value}>{nice(stage.stage)}</Text>
          <Text style={styles.sub}>Infected Area: {stage.infected_area_percent}%</Text>
        </View>
      )}

      {!isHealthy && risk && (
        <View style={styles.card}>
          <Text style={styles.label}>Spread Risk</Text>
          <Text style={styles.value}>{nice(risk.spread_risk.level)}</Text>
        </View>
      )}

      {!isHealthy && recovery && (
        <View style={styles.card}>
          <Text style={styles.label}>Recovery Time</Text>
          <Text style={styles.value}>
            {recovery.recovery_days.min} - {recovery.recovery_days.max} Days
          </Text>
        </View>
      )}

      {!isHealthy && treatment && (
        <View style={styles.card}>
          <Text style={styles.label}>Treatment Guidance</Text>
          {treatment.guidance.map((g, i) => (
            <Text key={i} style={styles.bullet}>
              • {g}
            </Text>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 12, backgroundColor: "#fff" },
  loader: { flex: 1, justifyContent: "center", alignItems: "center", padding: 16 },

  title: { fontSize: 20, fontWeight: "800", color: COLORS.primary, marginTop: 15, marginBottom: 15 },

  diseaseBox: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  label: { fontSize: 14, fontWeight: "700", color: COLORS.muted },
  diseaseName: { fontSize: 18, fontWeight: "900", color: COLORS.text, marginTop: 4 },

  card: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  value: { fontSize: 18, fontWeight: "800", color: COLORS.text },
  sub: { color: COLORS.muted, marginTop: 4 },

  bullet: { marginTop: 6, color: COLORS.text, lineHeight: 20 },
  muted: { color: COLORS.muted, marginTop: 10, textAlign: "center" },

  healthyTitle: { fontSize: 18, fontWeight: "900", color: COLORS.text },
  healthySub: { marginTop: 4, color: COLORS.muted, fontWeight: "600" },
  healthyTipsBox: {
    marginTop: 12,
    padding: 12,
    borderRadius: 12,
    backgroundColor: COLORS.primaryLight,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tipsTitle: { fontSize: 14, fontWeight: "800", color: COLORS.text, marginBottom: 6 },
});