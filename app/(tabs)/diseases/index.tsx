import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

type DiseaseResp = { disease: string; confidence: number };

const API_BASE = process.env.EXPO_PUBLIC_API_BASE_URL_DISEASE;

async function fileFromUri(uri: string) {
  const ext = uri.split(".").pop()?.toLowerCase() || "jpg";
  const mime = ext === "png" ? "image/png" : "image/jpeg";
  return { uri, name: `leaf.${ext}`, type: mime } as any;
}

async function postImage<T>(endpoint: string, uri: string): Promise<T> {
  const form = new FormData();
  form.append("image", await fileFromUri(uri));

  const res = await fetch(`${API_BASE}${endpoint}`, {
    method: "POST",
    body: form,
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(txt || `Request failed: ${res.status}`);
  }
  return res.json();
}

const niceName = (s: string) => s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

export default function DiseasesIndex() {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [disease, setDisease] = useState<DiseaseResp | null>(null);
  const [loading, setLoading] = useState(false);

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
      setDisease(null);
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
    }
  };

  const runPredictDisease = async () => {
    if (!imageUri) return;

    if (!API_BASE) {
      Alert.alert("API missing", "EXPO_PUBLIC_API_BASE_URL_DISEASE is not set in .env");
      return;
    }

    try {
      setLoading(true);
      const resp = await postImage<DiseaseResp>("/predict-disease", imageUri);
      setDisease(resp);
    } catch (e: any) {
      Alert.alert("Error", e?.message || "Prediction failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Anthurium Leaf Disease Detection</Text>
      <Text style={styles.sub}>API: {API_BASE || "-"}</Text>

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

        <TouchableOpacity
          style={[styles.primary, !canRun && styles.disabled]}
          disabled={!canRun || loading}
          onPress={runPredictDisease}
        >
          <Text style={styles.primaryText}>{loading ? "Detecting..." : "Detect Disease"}</Text>
        </TouchableOpacity>

        {disease && (
          <View style={styles.resultBox}>
            <Text style={styles.predicted}>{niceName(disease.disease)}</Text>

            <TouchableOpacity
              style={styles.moreBtn}
              onPress={() =>
                router.push({
                  pathname: "/diseases/details",
                  params: {
                    imageUri: imageUri ?? "",
                    disease: disease.disease,
                  },
                })
              }
            >
              <Text style={styles.moreBtnText}>To get more details</Text>
            </TouchableOpacity>
          </View>
        )}
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
  btn: { flex: 1, backgroundColor: "#111", paddingVertical: 12, borderRadius: 10, alignItems: "center" },
  btnText: { color: "#fff", fontWeight: "700" },

  primary: { backgroundColor: "#1f6feb", paddingVertical: 12, borderRadius: 10, alignItems: "center" },
  primaryText: { color: "#fff", fontWeight: "800" },
  disabled: { opacity: 0.4 },

  preview: { width: "100%", height: 240, borderRadius: 12, marginTop: 12, backgroundColor: "#f2f2f2" },
  muted: { color: "#666" },

  resultBox: { marginTop: 12, padding: 12, backgroundColor: "#f7f7f7", borderRadius: 12 },
  predicted: { fontSize: 20, fontWeight: "800", textAlign: "center" },

  moreBtn: { marginTop: 10, backgroundColor: "#111", paddingVertical: 12, borderRadius: 10, alignItems: "center" },
  moreBtnText: { color: "#fff", fontWeight: "700" },
});