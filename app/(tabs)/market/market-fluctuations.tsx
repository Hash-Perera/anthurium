// market-fluctuations.tsx
// Works with your current backend (dayfirst=True)
// Sends dates as DD-MM-YYYY to avoid parsing issues
//
// Install:
//   npm i react-native-chart-kit react-native-svg
//   npm i @react-native-community/datetimepicker

import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { BarChart } from "react-native-chart-kit";

const API_BASE = "http://172.20.10.2:8000";
const SCREEN_W = Dimensions.get("window").width;

type Option = { label: string; value: string };

type FluctuationRow = {
  date: string; // "YYYY-MM-DD"
  price: number | null;
  price_diff: number;
  price_pct_change: number;
  fluctuation_score: number;
  is_fluctuation: number;
};

type FluctuationResponse = {
  summary: {
    start_date: string;
    end_date: string;
    shop: string;
    variety: string;
    size: string;
    rows: number;
    fluctuations: number;
    message?: string;
  };
  rows: FluctuationRow[];
};

// IMPORTANT for your backend (dayfirst=True): send DD-MM-YYYY
function fmtDayFirst(d: Date) {
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
}

// for labels only
function fmtLabel(d: string) {
  // input row.date usually "YYYY-MM-DD"
  if (!d) return "";
  const parts = d.split("-");
  if (parts.length === 3) return `${parts[1]}/${parts[2]}`; // MM/DD
  return d;
}

const SHOP_OPTIONS: Option[] = [
  { label: "Anthurium Flower Garden", value: "anthurium flower garden" },
  { label: "Horana Anthurium", value: "horana anthurium" },
  { label: "Oscar Anthurium", value: "oscar anthurium" },
];

const VARIETY_OPTIONS: Option[] = [
  { label: "Baby Pink", value: "baby pink" },
  { label: "Black Cardinal", value: "black cardinal" },
  { label: "Lady Jane", value: "lady jane" },
  { label: "Red", value: "red" },
  { label: "Flash", value: "flash" },
];

const SIZE_OPTIONS: Option[] = [
  { label: "Small", value: "small" },
  { label: "Medium", value: "medium" },
  { label: "Large", value: "large" },
];

export default function MarketFluctuations() {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const [shop, setShop] = useState<Option | null>(null);
  const [variety, setVariety] = useState<Option | null>(null);
  const [size, setSize] = useState<Option | null>(null);

  const [openDropdown, setOpenDropdown] = useState<"shop" | "variety" | "size" | null>(null);

  const [loading, setLoading] = useState(false);
  const [resp, setResp] = useState<FluctuationResponse | null>(null);

  const validate = () => {
    if (!startDate || !endDate || !shop || !variety || !size) {
      Alert.alert("Missing data", "Please fill all fields");
      return false;
    }
    if (endDate.getTime() < startDate.getTime()) {
      Alert.alert("Invalid date range", "End date must be after start date");
      return false;
    }
    return true;
  };

  const fetchFluctuations = async () => {
    if (!validate()) return;

    setLoading(true);
    setResp(null);

    // Build payload exactly how backend expects
    const payload = {
      start_date: fmtDayFirst(startDate as Date),
      end_date: fmtDayFirst(endDate as Date),
      shop: shop!.value,
      variety: variety!.value,
      size: size!.value,
    };

    try {
      const res = await fetch(`${API_BASE}/fluctuations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        const msg = data?.detail ? String(data.detail) : "Request failed";
        throw new Error(msg);
      }

      setResp(data as FluctuationResponse);
      setOpenDropdown(null);
    } catch (e: any) {
      Alert.alert("Error", e?.message ? String(e.message) : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const chartData = useMemo(() => {
    const rows = resp?.rows ?? [];
    if (!rows.length) return null;

    // limit to last 60 points to keep chart fast
    const sliced = rows.slice(-60);

    const labels = sliced.map((r) => fmtLabel(r.date));
    const values = sliced.map((r) => {
      const n = Number(r?.price_diff);
      return Number.isFinite(n) ? Math.abs(n) : 0;
    });

    return { labels, datasets: [{ data: values }] };
  }, [resp]);

  const summaryText = useMemo(() => {
    if (!resp?.summary) return "";
    if (resp.summary.message) return resp.summary.message;
    return `Rows: ${resp.summary.rows} | Fluctuations: ${resp.summary.fluctuations}`;
  }, [resp]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Market Fluctuations</Text>

      {/* Start date */}
      <Text style={styles.label}>Start Date</Text>
      <TouchableOpacity
        style={styles.input}
        onPress={() => {
          setShowStartPicker(true);
          setOpenDropdown(null);
        }}
      >
        <Text style={styles.inputText}>
          {startDate ? fmtDayFirst(startDate) : "Select start date"}
        </Text>
      </TouchableOpacity>

      {showStartPicker && (
        <DateTimePicker
          value={startDate ?? new Date()}
          mode="date"
          onChange={(_, d) => {
            setShowStartPicker(false);
            if (d) setStartDate(d);
          }}
        />
      )}

      {/* End date */}
      <Text style={styles.label}>End Date</Text>
      <TouchableOpacity
        style={styles.input}
        onPress={() => {
          setShowEndPicker(true);
          setOpenDropdown(null);
        }}
      >
        <Text style={styles.inputText}>
          {endDate ? fmtDayFirst(endDate) : "Select end date"}
        </Text>
      </TouchableOpacity>

      {showEndPicker && (
        <DateTimePicker
          value={endDate ?? new Date()}
          mode="date"
          onChange={(_, d) => {
            setShowEndPicker(false);
            if (d) setEndDate(d);
          }}
        />
      )}

      {/* Variety */}
      <Text style={styles.label}>Flower Variety</Text>
      <TouchableOpacity
        style={styles.input}
        onPress={() => {
          setOpenDropdown(openDropdown === "variety" ? null : "variety");
        }}
      >
        <Text style={styles.inputText}>{variety?.label || "Select variety"}</Text>
      </TouchableOpacity>
      {openDropdown === "variety" && (
        <View style={styles.dropdown}>
          {VARIETY_OPTIONS.map((o) => (
            <TouchableOpacity
              key={o.value}
              style={styles.option}
              onPress={() => {
                setVariety(o);
                setOpenDropdown(null);
              }}
            >
              <Text>{o.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Size */}
      <Text style={styles.label}>Flower Size</Text>
      <TouchableOpacity
        style={styles.input}
        onPress={() => setOpenDropdown(openDropdown === "size" ? null : "size")}
      >
        <Text style={styles.inputText}>{size?.label || "Select size"}</Text>
      </TouchableOpacity>
      {openDropdown === "size" && (
        <View style={styles.dropdown}>
          {SIZE_OPTIONS.map((o) => (
            <TouchableOpacity
              key={o.value}
              style={styles.option}
              onPress={() => {
                setSize(o);
                setOpenDropdown(null);
              }}
            >
              <Text>{o.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Shop */}
      <Text style={styles.label}>Flower Shop</Text>
      <TouchableOpacity
        style={styles.input}
        onPress={() => setOpenDropdown(openDropdown === "shop" ? null : "shop")}
      >
        <Text style={styles.inputText}>{shop?.label || "Select shop"}</Text>
      </TouchableOpacity>
      {openDropdown === "shop" && (
        <View style={styles.dropdown}>
          {SHOP_OPTIONS.map((o) => (
            <TouchableOpacity
              key={o.value}
              style={styles.option}
              onPress={() => {
                setShop(o);
                setOpenDropdown(null);
              }}
            >
              <Text>{o.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Submit */}
      <TouchableOpacity
        style={[styles.submitButton, loading && { opacity: 0.6 }]}
        disabled={loading}
        onPress={fetchFluctuations}
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>Show Chart</Text>}
      </TouchableOpacity>

      {!!summaryText && <Text style={styles.summary}>{summaryText}</Text>}

      {/* Chart */}
      {!loading && chartData && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Price change magnitude (|price_diff|)</Text>
          <BarChart
            data={chartData}
            width={SCREEN_W - 32}
            height={260}
            fromZero
            showValuesOnTopOfBars={false}
            yAxisLabel=""
            yAxisSuffix=""
            chartConfig={{
              backgroundGradientFrom: "#ffffff",
              backgroundGradientTo: "#ffffff",
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(0,0,0,${opacity})`,
              labelColor: (opacity = 1) => `rgba(0,0,0,${opacity})`,
              barPercentage: 0.7,
              propsForBackgroundLines: { strokeWidth: 0 },
            }}
            style={{ borderRadius: 12 }}
          />
        </View>
      )}

      {!loading && resp?.summary?.message && resp.summary.rows === 0 && (
        <Text style={{ marginTop: 12 }}>{resp.summary.message}</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: "#fff", flexGrow: 1 },
  title: { fontSize: 22, fontWeight: "600", textAlign: "center", marginBottom: 16 },

  label: { marginTop: 14, marginBottom: 6, fontWeight: "500" },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 14,
    backgroundColor: "#fafafa",
  },
  inputText: { color: "#333" },

  dropdown: { borderWidth: 1, borderColor: "#ddd", borderRadius: 10, marginTop: 6, backgroundColor: "#fff" },
  option: { padding: 14, borderBottomWidth: 1, borderBottomColor: "#eee" },

  submitButton: { marginTop: 26, backgroundColor: "#B22222", padding: 16, borderRadius: 12, alignItems: "center" },
  submitText: { color: "#fff", fontWeight: "600" },

  summary: { marginTop: 10, fontSize: 13, opacity: 0.85 },

  card: { marginTop: 16, backgroundColor: "#fff", borderRadius: 12, padding: 12, borderWidth: 1, borderColor: "#eee" },
  cardTitle: { fontSize: 16, fontWeight: "700", marginBottom: 8 },
});
