import { Service } from "@lib/api-client";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type DiseaseResp = { disease: string; confidence: number };

const COLORS = {
  primary: "#E91E63",
  primaryDark: "#C2185B",
  primaryLight: "#FCE4EC",
  secondary: "#F8BBD0",
  border: "#F3E5F5",
  textPrimary: "#2D2D2D",
  textMuted: "#777",
  white: "#FFFFFF",
  black: "#000000",
};

// Same env + join logic as api client, but only inside this file
const getBaseUrl = (service: Service): string => {
  const baseUrls: Record<Service, string> = {
    [Service.WEATHER]: process.env.EXPO_PUBLIC_API_BASE_URL_WEATHER ?? "",
    [Service.SOIL]: process.env.EXPO_PUBLIC_API_BASE_URL_SOIL ?? "",
    [Service.DISEASE]: process.env.EXPO_PUBLIC_API_BASE_URL_DISEASE ?? "",
    [Service.MARKET]: process.env.EXPO_PUBLIC_API_BASE_URL_MARKET ?? "",
    [Service.ROOT]: process.env.EXPO_PUBLIC_API_BASE_URL_ROOT ?? "",
  };

  const baseUrl = baseUrls[service];
  if (!baseUrl) {
    throw new Error(`Missing EXPO_PUBLIC_API_BASE_URL_${service} in .env`);
  }
  return baseUrl;
};

const joinUrl = (service: Service, path: string) => {
  const baseUrl = getBaseUrl(service);
  const trimmedBase = baseUrl.replace(/\/+$/, "");
  const trimmedPath = path.replace(/^\/+/, "");
  return `${trimmedBase}/${trimmedPath}`;
};

async function fileFromUri(uri: string) {
  const ext = uri.split(".").pop()?.toLowerCase() || "jpg";
  const mime = ext === "png" ? "image/png" : "image/jpeg";
  return { uri, name: `leaf.${ext}`, type: mime } as any;
}

// Use fetch for multipart upload (api client is JSON-only)
async function postImage<T>(endpoint: string, uri: string): Promise<T> {
  const form = new FormData();
  form.append("image", await fileFromUri(uri));

  const url = joinUrl(Service.DISEASE, endpoint);

  const res = await fetch(url, {
    method: "POST",
    body: form,
  });

  let data: any = null;
  try {
    data = await res.json();
  } catch {
    const txt = await res.text().catch(() => "");
    throw new Error(txt || "Something went wrong while detecting disease.");
  }

  if (!res.ok || data?.success === false) {
    throw new Error(data?.message || data?.detail || "Disease detection failed.");
  }

  return data as T;
}

const niceName = (s: string) =>
  s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

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

    try {
      setLoading(true);

      const resp = await postImage<{ disease: string; confidence: number }>(
        "/predict-disease",
        imageUri,
      );

      setDisease({ disease: resp.disease, confidence: resp.confidence });

      router.push({
        pathname: "/diseases/details",
        params: {
          imageUri: imageUri ?? "",
          disease: resp.disease,
        },
      });

      setImageUri(null);
      setDisease(null);
    } catch (e: any) {
      Alert.alert(
        "Detection Failed",
        e?.message ||
          "Unable to detect the leaf disease. Please try again with a clearer image.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Anthurium Leaf Disease Detection</Text>
      <Text style={styles.sub}>
        Upload or capture a clear leaf image to detect the disease.
      </Text>

      <View style={styles.card}>
        <Text style={styles.h}>1) Select Leaf Image</Text>

        <View style={styles.row}>
          <TouchableOpacity style={styles.btn} onPress={pickFromGallery} disabled={loading}>
            <Text style={styles.btnText}>Upload from Gallery</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.btn} onPress={captureImage} disabled={loading}>
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
          style={[styles.primary, (!canRun || loading) && styles.primaryDisabled]}
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
  container: { padding: 16, gap: 12, backgroundColor: "#fff" },

  title: { fontSize: 20, fontWeight: "700", color: COLORS.black },
  sub: { marginTop: 4, color: COLORS.textMuted },

  card: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  h: { fontSize: 16, fontWeight: "700", marginBottom: 10, color: COLORS.textPrimary },

  row: { flexDirection: "row", gap: 10 },

  btn: {
    flex: 1,
    backgroundColor: COLORS.primaryLight,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  btnText: { color: COLORS.primaryDark, fontWeight: "700" },

  primary: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    elevation: 2,
  },
  primaryDisabled: {
    backgroundColor: COLORS.secondary,
    opacity: 0.8,
  },
  primaryText: { color: COLORS.white, fontWeight: "800", fontSize: 15 },

  preview: {
    width: "100%",
    height: 240,
    borderRadius: 12,
    marginTop: 12,
    backgroundColor: "#f2f2f2",
  },
  muted: { color: COLORS.textMuted },

  resultBox: {
    marginTop: 14,
    padding: 14,
    backgroundColor: COLORS.primaryLight,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  predicted: {
    fontSize: 20,
    fontWeight: "800",
    textAlign: "center",
    color: COLORS.primaryDark,
  },

  moreBtn: {
    marginTop: 12,
    backgroundColor: COLORS.primaryDark,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  moreBtnText: { color: COLORS.white, fontWeight: "700" },
});