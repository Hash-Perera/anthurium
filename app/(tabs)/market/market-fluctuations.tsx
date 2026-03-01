// market-fluctuations.tsx


import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const API_BASE = "http://192.168.1.14:8000";

type FluctuationResponse = {
  filters?: {
    start_date?: string;
    end_date?: string;
    variety?: string;
    shop?: string | null;
    size?: string | null;
  };
  points?: number;
  image_base64_png?: string;
  detail?: string;
};

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function formatDDMMYYYY(d: Date) {
  const dd = pad2(d.getDate());
  const mm = pad2(d.getMonth() + 1);
  const yyyy = d.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
}

function parseDDMMYYYY(s: string) {
  const parts = s.trim().split("-");
  if (parts.length !== 3) return null;
  const dd = Number(parts[0]);
  const mm = Number(parts[1]);
  const yyyy = Number(parts[2]);
  if (!dd || !mm || !yyyy) return null;
  const d = new Date(yyyy, mm - 1, dd);
  if (Number.isNaN(d.getTime())) return null;
  // validate roundtrip (avoid invalid dates like 31-02-2024)
  if (d.getFullYear() !== yyyy || d.getMonth() !== mm - 1 || d.getDate() !== dd) return null;
  return d;
}

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function addDays(d: Date, days: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + days);
  return x;
}

function clampEndDate(start: Date, end: Date) {
  // ensure end >= start
  if (startOfDay(end).getTime() < startOfDay(start).getTime()) return start;
  return end;
}

export default function MarketFluctuationsScreen() {
  const [startDate, setStartDate] = useState("01-09-2024");
  const [endDate, setEndDate] = useState("31-10-2024");
  const [variety, setVariety] = useState("black cardinal");
  const [shop, setShop] = useState("");
  const [size, setSize] = useState("");

  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const [loading, setLoading] = useState(false);
  const [imgBase64, setImgBase64] = useState<string | null>(null);
  const [points, setPoints] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const endpoint = useMemo(() => `${API_BASE.replace(/\/$/, "")}/fluctuations`, []);

  const startDateObj = useMemo(() => parseDDMMYYYY(startDate) ?? startOfDay(new Date()), [startDate]);
  const endDateObj = useMemo(() => parseDDMMYYYY(endDate) ?? startOfDay(new Date()), [endDate]);

  const todayObj = useMemo(() => startOfDay(new Date()), []);
  const maxStartDate = todayObj;
  const maxEndDate = todayObj;
  const minEndDate = startDateObj;

  const applyPreset = (daysBack: number) => {
    const end = startOfDay(new Date());
    const start = addDays(end, -daysBack);
    setStartDate(formatDDMMYYYY(start));

    // keep end valid
    const newEnd = clampEndDate(start, end);
    setEndDate(formatDDMMYYYY(newEnd));
  };

  const onFetch = async () => {
    setError(null);
    setImgBase64(null);
    setPoints(null);

    const sdObj = parseDDMMYYYY(startDate);
    const edObj = parseDDMMYYYY(endDate);
    const v = variety.trim();

    if (!sdObj || !edObj || !v) {
      Alert.alert("Missing or invalid fields", "Please pick valid Start Date, End Date, and enter Variety.");
      return;
    }

    // enforce end >= start
    if (startOfDay(edObj).getTime() < startOfDay(sdObj).getTime()) {
      Alert.alert("Invalid range", "End date cannot be before Start date.");
      return;
    }

    const payload: any = {
      start_date: formatDDMMYYYY(sdObj),
      end_date: formatDDMMYYYY(edObj),
      variety: v,
    };
    if (shop.trim()) payload.shop = shop.trim();
    if (size.trim()) payload.size = size.trim();

    try {
      setLoading(true);

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data: FluctuationResponse = await res.json().catch(() => ({} as any));

      if (!res.ok) {
        const msg = data?.detail || `Request failed (${res.status})`;
        setError(msg);
        return;
      }

      if (!data.image_base64_png) {
        setError("No image returned from backend.");
        return;
      }

      setImgBase64(data.image_base64_png);
      setPoints(typeof data.points === "number" ? data.points : null);
    } catch (e: any) {
      setError(e?.message || "Network error");
    } finally {
      setLoading(false);
    }
  };

  const imgUri = imgBase64 ? `data:image/png;base64,${imgBase64}` : null;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#fff" }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.subtitle}>
          Enter a date range and Anthurium variety to generate a price fluctuation graph.
        </Text>


        <View style={styles.card}>
          <Text style={styles.label}>Start Date</Text>
          <TouchableOpacity
            style={styles.dateBtn}
            onPress={() => setShowStartPicker(true)}
            disabled={loading}
          >
            <Text style={styles.dateText}>{startDate}</Text>
          </TouchableOpacity>

          {showStartPicker ? (
            <DateTimePicker
              value={startDateObj}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              maximumDate={maxStartDate}
              onChange={(event, selectedDate) => {
                if (Platform.OS !== "ios") setShowStartPicker(false);
                if ((event as any).type === "dismissed") return;

                const picked = selectedDate ? startOfDay(selectedDate) : startDateObj;
                setStartDate(formatDDMMYYYY(picked));

                // auto-fix end date if it becomes invalid
                const fixedEnd = clampEndDate(picked, endDateObj);
                setEndDate(formatDDMMYYYY(fixedEnd));
              }}
            />
          ) : null}

          {Platform.OS === "ios" && showStartPicker ? (
            <TouchableOpacity style={styles.pickerDoneBtn} onPress={() => setShowStartPicker(false)}>
              <Text style={styles.pickerDoneText}>Done</Text>
            </TouchableOpacity>
          ) : null}

          <Text style={styles.label}>End Date</Text>
          <TouchableOpacity
            style={styles.dateBtn}
            onPress={() => setShowEndPicker(true)}
            disabled={loading}
          >
            <Text style={styles.dateText}>{endDate}</Text>
          </TouchableOpacity>

          {showEndPicker ? (
            <DateTimePicker
              value={endDateObj}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              minimumDate={minEndDate}
              maximumDate={maxEndDate}
              onChange={(event, selectedDate) => {
                if (Platform.OS !== "ios") setShowEndPicker(false);
                if ((event as any).type === "dismissed") return;

                const picked = selectedDate ? startOfDay(selectedDate) : endDateObj;
                const fixed = clampEndDate(startDateObj, picked);
                setEndDate(formatDDMMYYYY(fixed));
              }}
            />
          ) : null}

          {Platform.OS === "ios" && showEndPicker ? (
            <TouchableOpacity style={styles.pickerDoneBtn} onPress={() => setShowEndPicker(false)}>
              <Text style={styles.pickerDoneText}>Done</Text>
            </TouchableOpacity>
          ) : null}

          <Text style={styles.label}>Variety</Text>
          <TextInput
            value={variety}
            onChangeText={setVariety}
            placeholder="black cardinal"
            style={styles.input}
            autoCapitalize="none"
          />

          <Text style={styles.optional}>Optional filters</Text>

          <Text style={styles.label}>Shop (optional)</Text>
          <TextInput
            value={shop}
            onChangeText={setShop}
            placeholder="horana anthurium"
            style={styles.input}
            autoCapitalize="none"
          />

          <Text style={styles.label}>Size (optional)</Text>
          <TextInput
            value={size}
            onChangeText={setSize}
            placeholder="small"
            style={styles.input}
            autoCapitalize="none"
          />

          <TouchableOpacity style={styles.primaryBtn} onPress={onFetch} disabled={loading}>
            {loading ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator />
                <Text style={styles.primaryBtnText}>Generating...</Text>
              </View>
            ) : (
              <Text style={styles.primaryBtnText}>Generate Graph</Text>
            )}
          </TouchableOpacity>


          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorTitle}>Error</Text>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}
        </View>

        {imgUri ? (
          <View style={styles.resultCard}>
            <View style={styles.resultHeader}>
              <Text style={styles.resultTitle}>Fluctuation Graph</Text>
              
            </View>

            <Image source={{ uri: imgUri }} style={styles.image} resizeMode="contain" />

       
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No graph yet. Generate one using the form above.</Text>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 28,
    gap: 14,
  },
  subtitle: {
    fontSize: 13,
    color: "#333",
    lineHeight: 18,
  },

  presetRow: {
    flexDirection: "row",
    gap: 10,
    flexWrap: "wrap",
  },
  presetBtn: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#111",
    backgroundColor: "#fff",
  },
  presetBtnGhost: {
    borderColor: "#999",
  },
  presetText: {
    fontSize: 12,
    fontWeight: "700",
  },

  card: {
    borderWidth: 1,
    borderColor: "#E6E6E6",
    borderRadius: 12,
    padding: 14,
    gap: 10,
    backgroundColor: "#fff",
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
  },
  optional: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: "700",
  },

  dateBtn: {
    borderWidth: 1,
    borderColor: "#DADADA",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: "#fff",
  },
  dateText: {
    fontSize: 14,
  },
  pickerDoneBtn: {
    alignSelf: "flex-end",
    marginTop: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#111",
  },
  pickerDoneText: {
    fontSize: 13,
    fontWeight: "700",
  },

  input: {
    borderWidth: 1,
    borderColor: "#DADADA",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: "#fff",
  },
  primaryBtn: {
    marginTop: 8,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#111",
  },
  primaryBtnText: {
    fontSize: 14,
    fontWeight: "700",
  },
  loadingRow: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  apiHint: {
    marginTop: 6,
    fontSize: 11,
    color: "#666",
  },

  errorBox: {
    marginTop: 8,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#f2c0c0",
    backgroundColor: "#fff7f7",
    gap: 6,
  },
  errorTitle: {
    fontSize: 12,
    fontWeight: "800",
  },
  errorText: {
    fontSize: 12,
    color: "#333",
  },

  resultCard: {
    borderWidth: 1,
    borderColor: "#E6E6E6",
    borderRadius: 12,
    padding: 14,
    backgroundColor: "#fff",
    gap: 10,
  },
  resultHeader: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
  },
  resultTitle: {
    fontSize: 15,
    fontWeight: "800",
  },
  pointsText: {
    fontSize: 12,
    color: "#555",
  },
  image: {
    width: "100%",
    height: 260,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#F0F0F0",
    backgroundColor: "#fff",
  },
  note: {
    fontSize: 12,
    color: "#666",
    lineHeight: 16,
  },
  emptyState: {
    padding: 18,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E6E6E6",
    backgroundColor: "#fff",
  },
  emptyText: {
    fontSize: 12,
    color: "#666",
  },
});