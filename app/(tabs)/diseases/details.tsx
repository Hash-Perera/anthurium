import { useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

type StageResp = { infected_area_percent: number; stage: string };
type RecoveryResp = { disease: string; confidence?: number; stage: string; recovery_days: { min: number; max: number } };
type RiskResp = { disease: string; confidence?: number; infected_area_percent: number; stage: string; spread_risk: { level: string; score: number } };
type TreatmentResp = { disease: string; guidance: string[] };

const API_BASE = process.env.EXPO_PUBLIC_API_BASE_URL_DISEASE;

async function fileFromUri(uri: string) {
  const ext = uri.split(".").pop()?.toLowerCase() || "jpg";
  const mime = ext === "png" ? "image/png" : "image/jpeg";
  return { uri, name: `leaf.${ext}`, type: mime } as any;
}

async function postImage<T>(endpoint: string, uri: string, extra?: Record<string, string>): Promise<T> {
  const form = new FormData();
  form.append("image", await fileFromUri(uri));
  if (extra) Object.entries(extra).forEach(([k, v]) => form.append(k, v));

  const res = await fetch(`${API_BASE}${endpoint}`, { method: "POST", body: form });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(txt || `Request failed: ${res.status}`);
  }
  return res.json();
}

async function getJson<T>(endpoint: string): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`);
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(txt || `Request failed: ${res.status}`);
  }
  return res.json();
}

export default function DiseaseDetails() {
  const params = useLocalSearchParams<{ imageUri?: string; disease?: string }>();
  const imageUri = params.imageUri;
  const disease = params.disease;

  const [loading, setLoading] = useState<string | null>(null);
  const [stage, setStage] = useState<StageResp | null>(null);
  const [recovery, setRecovery] = useState<RecoveryResp | null>(null);
  const [risk, setRisk] = useState<RiskResp | null>(null);
  const [treatment, setTreatment] = useState<TreatmentResp | null>(null);

  if (!API_BASE) {
    return (
      <View style={styles.container}>
        <Text style={styles.err}>API base missing. Check EXPO_PUBLIC_API_BASE_URL_DISEASE in .env</Text>
      </View>
    );
  }

  if (!imageUri) {
    return (
      <View style={styles.container}>
        <Text style={styles.err}>No image received. Go back and select an image first.</Text>
      </View>
    );
  }

  const runStage = async () => {
    try {
      setLoading("stage");
      const resp = await postImage<StageResp>("/stage", imageUri);
      setStage(resp);
    } catch (e: any) {
      Alert.alert("Error", e?.message || "Stage failed");
    } finally {
      setLoading(null);
    }
  };

  const runRecovery = async () => {
    try {
      setLoading("recovery");
      const resp = await postImage<RecoveryResp>("/recovery", imageUri, {
        treatment_quality: "normal",
        humidity: "medium",
      });
      setRecovery(resp);
    } catch (e: any) {
      Alert.alert("Error", e?.message || "Recovery failed");
    } finally {
      setLoading(null);
    }
  };

  const runRisk = async () => {
    try {
      setLoading("risk");
      const resp = await postImage<RiskResp>("/risk", imageUri, {
        humidity: "medium",
      });
      setRisk(resp);
    } catch (e: any) {
      Alert.alert("Error", e?.message || "Risk failed");
    } finally {
      setLoading(null);
    }
  };

  const runTreatment = async () => {
    if (!disease) {
      Alert.alert("No disease", "Detect disease first.");
      return;
    }
    try {
      setLoading("treatment");
      const resp = await getJson<TreatmentResp>(`/treatment/${encodeURIComponent(disease)}`);
      setTreatment(resp);
    } catch (e: any) {
      Alert.alert("Error", e?.message || "Treatment failed");
    } finally {
      setLoading(null);
    }
  };

  const nice = (s: string) => s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>More Details</Text>

      {disease ? (
        <View style={styles.bigBox}>
          <Text style={styles.big}>{nice(disease)}</Text>
        </View>
      ) : (
        <Text style={styles.muted}>Disease not provided. Go back and detect first.</Text>
      )}

      <View style={styles.rowWrap}>
        <TouchableOpacity style={styles.smallBtn} disabled={loading !== null} onPress={runStage}>
          <Text style={styles.btnText}>{loading === "stage" ? "..." : "Stage"}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.smallBtn} disabled={loading !== null} onPress={runRecovery}>
          <Text style={styles.btnText}>{loading === "recovery" ? "..." : "Recovery"}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.smallBtn} disabled={loading !== null} onPress={runRisk}>
          <Text style={styles.btnText}>{loading === "risk" ? "..." : "Risk"}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.smallBtn, !disease && styles.disabled]} disabled={!disease || loading !== null} onPress={runTreatment}>
          <Text style={styles.btnText}>{loading === "treatment" ? "..." : "Treatment"}</Text>
        </TouchableOpacity>
      </View>

      {stage && (
        <View style={styles.resultBox}>
          <Text style={styles.result}>Infected Area: {stage.infected_area_percent}%</Text>
          <Text style={styles.result}>Stage: {stage.stage}</Text>
        </View>
      )}

      {recovery && (
        <View style={styles.resultBox}>
          <Text style={styles.result}>
            Recovery: {recovery.recovery_days.min}–{recovery.recovery_days.max} days
          </Text>
        </View>
      )}

      {risk && (
        <View style={styles.resultBox}>
          <Text style={styles.result}>
            Risk: {risk.spread_risk.level} (score {risk.spread_risk.score})
          </Text>
        </View>
      )}

      {treatment && (
        <View style={styles.resultBox}>
          <Text style={styles.resultTitle}>Treatment Guidance</Text>
          {treatment.guidance.map((g, i) => (
            <Text key={i} style={styles.bullet}>• {g}</Text>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 12 },
  title: { fontSize: 20, fontWeight: "700" },
  bigBox: { backgroundColor: "#f7f7f7", borderRadius: 14, padding: 14, alignItems: "center" },
  big: { fontSize: 20, fontWeight: "800" },
  rowWrap: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  smallBtn: { backgroundColor: "#111", paddingVertical: 10, paddingHorizontal: 14, borderRadius: 10 },
  btnText: { color: "#fff", fontWeight: "700" },
  disabled: { opacity: 0.4 },
  resultBox: { padding: 12, backgroundColor: "#fff", borderRadius: 14, borderWidth: 1, borderColor: "#eee" },
  result: { fontSize: 14 },
  resultTitle: { fontSize: 14, fontWeight: "800", marginBottom: 6 },
  bullet: { marginTop: 4, color: "#333" },
  muted: { color: "#666" },
  err: { color: "red" },
});