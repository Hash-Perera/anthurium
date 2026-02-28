import * as ImagePicker from "expo-image-picker";
import React, { useMemo, useState } from "react";
import { Alert, Image, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

type DiseaseResp = { disease: string; confidence: number };
type StageResp = { infected_area_percent: number; stage: string };
type RecoveryResp = { disease: string; confidence?: number; stage: string; recovery_days: { min: number; max: number } };
type RiskResp = { disease: string; confidence?: number; infected_area_percent: number; stage: string; spread_risk: { level: string; score: number } };
type TreatmentResp = { disease: string; guidance: string[] };

const API_BASE = process.env.EXPO_PUBLIC_API_BASE_URL_DISEASE 

async function fileFromUri(uri: string) {
  const ext = uri.split(".").pop()?.toLowerCase() || "jpg";
  const mime = ext === "png" ? "image/png" : "image/jpeg";
  return { uri, name: `leaf.${ext}`, type: mime } as any;
}

async function postImage<T>(endpoint: string, uri: string, extra?: Record<string, string>): Promise<T> {
  const form = new FormData();
  form.append("image", await fileFromUri(uri));

  if (extra) {
    Object.entries(extra).forEach(([k, v]) => form.append(k, v));
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    method: "POST",
    body: form,
    headers: {
      // Let fetch set boundary automatically
      ...(Platform.OS === "web" ? {} : {}),
    },
  });

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

export default function DiseasesIndex() {
  const [imageUri, setImageUri] = useState<string | null>(null);

  const [disease, setDisease] = useState<DiseaseResp | null>(null);
  const [stage, setStage] = useState<StageResp | null>(null);
  const [recovery, setRecovery] = useState<RecoveryResp | null>(null);
  const [risk, setRisk] = useState<RiskResp | null>(null);
  const [treatment, setTreatment] = useState<TreatmentResp | null>(null);

  const [loading, setLoading] = useState<string | null>(null);

  const canRun = useMemo(() => !!imageUri, [imageUri]);

  const pickFromGallery = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Permission needed", "Please allow photo library access.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setImageUri(uri);
      // clear previous outputs
      setDisease(null);
      setStage(null);
      setRecovery(null);
      setRisk(null);
      setTreatment(null);
    }
  };

  const captureImage = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Permission needed", "Please allow camera access.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      quality: 1,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setImageUri(uri);
      setDisease(null);
      setStage(null);
      setRecovery(null);
      setRisk(null);
      setTreatment(null);
    }
  };

  const runPredictDisease = async () => {
    if (!imageUri) return;
    try {
      setLoading("predict");
      const resp = await postImage<DiseaseResp>("/predict-disease", imageUri);
      setDisease(resp);
    } catch (e: any) {
      Alert.alert("Error", e?.message || "Prediction failed");
    } finally {
      setLoading(null);
    }
  };

  const runStage = async () => {
    if (!imageUri) return;
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
    if (!imageUri) return;
    try {
      setLoading("recovery");
      // You can replace these with UI dropdowns later
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
    if (!imageUri) return;
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
    const d = disease?.disease;
    if (!d) {
      Alert.alert("First detect disease", "Please run disease detection first.");
      return;
    }
    try {
      setLoading("treatment");
      const resp = await getJson<TreatmentResp>(`/treatment/${encodeURIComponent(d)}`);
      setTreatment(resp);
    } catch (e: any) {
      Alert.alert("Error", e?.message || "Treatment failed");
    } finally {
      setLoading(null);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Anthurium Leaf Disease Detection</Text>
      <Text style={styles.sub}>
        API: {API_BASE}
      </Text>

      <View style={styles.card}>
        <Text style={styles.h}>1) Select Leaf Image</Text>

        <View style={styles.row}>
          <TouchableOpacity style={styles.btn} onPress={pickFromGallery}>
            <Text style={styles.btnText}>Upload from Gallery</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.btn} onPress={captureImage}>
            <Text style={styles.btnText}>Capture Image</Text>
          </TouchableOpacity>
        </View>

        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.preview} />
        ) : (
          <Text style={styles.muted}>No image selected yet.</Text>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.h}>2) Detect Disease</Text>
        <TouchableOpacity style={[styles.primary, !canRun && styles.disabled]} disabled={!canRun || loading !== null} onPress={runPredictDisease}>
          <Text style={styles.primaryText}>{loading === "predict" ? "Detecting..." : "Detect Disease"}</Text>
        </TouchableOpacity>

        {disease && (
          <View style={styles.resultBox}>
            <Text style={styles.result}>
              Disease: <Text style={styles.bold}>{disease.disease}</Text>
            </Text>
            <Text style={styles.result}>
              Confidence: <Text style={styles.bold}>{Math.round(disease.confidence * 100)}%</Text>
            </Text>
          </View>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.h}>3) More Actions</Text>

        <View style={styles.rowWrap}>
          <TouchableOpacity style={[styles.smallBtn, !canRun && styles.disabled]} disabled={!canRun || loading !== null} onPress={runStage}>
            <Text style={styles.btnText}>{loading === "stage" ? "..." : "Stage"}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.smallBtn, !canRun && styles.disabled]} disabled={!canRun || loading !== null} onPress={runRecovery}>
            <Text style={styles.btnText}>{loading === "recovery" ? "..." : "Recovery"}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.smallBtn, !canRun && styles.disabled]} disabled={!canRun || loading !== null} onPress={runRisk}>
            <Text style={styles.btnText}>{loading === "risk" ? "..." : "Risk"}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.smallBtn, !disease?.disease && styles.disabled]} disabled={!disease?.disease || loading !== null} onPress={runTreatment}>
            <Text style={styles.btnText}>{loading === "treatment" ? "..." : "Treatment"}</Text>
          </TouchableOpacity>
        </View>

        {stage && (
          <View style={styles.resultBox}>
            <Text style={styles.result}>
              Infected Area: <Text style={styles.bold}>{stage.infected_area_percent}%</Text>
            </Text>
            <Text style={styles.result}>
              Stage: <Text style={styles.bold}>{stage.stage}</Text>
            </Text>
          </View>
        )}

        {recovery && (
          <View style={styles.resultBox}>
            <Text style={styles.result}>
              Recovery: <Text style={styles.bold}>{recovery.recovery_days.min}–{recovery.recovery_days.max} days</Text>
            </Text>
          </View>
        )}

        {risk && (
          <View style={styles.resultBox}>
            <Text style={styles.result}>
              Risk: <Text style={styles.bold}>{risk.spread_risk.level}</Text> (score {risk.spread_risk.score})
            </Text>
          </View>
        )}

        {treatment && (
          <View style={styles.resultBox}>
            <Text style={[styles.result, styles.bold]}>Treatment Guidance</Text>
            {treatment.guidance.map((g, i) => (
              <Text key={i} style={styles.bullet}>• {g}</Text>
            ))}
          </View>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.muted}>
          Tip: If testing on a real phone, API base should be your PC IP like 192.168.1.xx not 127.0.0.1
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 12 },
  title: { fontSize: 20, fontWeight: "700" },
  sub: { marginTop: 4, color: "#666" },
  card: { backgroundColor: "#fff", padding: 14, borderRadius: 14, borderWidth: 1, borderColor: "#eee" },
  h: { fontSize: 16, fontWeight: "700", marginBottom: 10 },
  row: { flexDirection: "row", gap: 10 },
  rowWrap: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  btn: { flex: 1, backgroundColor: "#111", paddingVertical: 12, borderRadius: 10, alignItems: "center" },
  smallBtn: { backgroundColor: "#111", paddingVertical: 10, paddingHorizontal: 14, borderRadius: 10 },
  btnText: { color: "#fff", fontWeight: "700" },
  primary: { backgroundColor: "#1f6feb", paddingVertical: 12, borderRadius: 10, alignItems: "center" },
  primaryText: { color: "#fff", fontWeight: "800" },
  disabled: { opacity: 0.4 },
  preview: { width: "100%", height: 240, borderRadius: 12, marginTop: 12, backgroundColor: "#f2f2f2" },
  muted: { color: "#666" },
  resultBox: { marginTop: 12, padding: 12, backgroundColor: "#f7f7f7", borderRadius: 12 },
  result: { fontSize: 14, marginBottom: 4 },
  bold: { fontWeight: "800" },
  bullet: { marginTop: 4, color: "#333" },
});