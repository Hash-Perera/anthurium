import { post, Service } from "@lib/api-client";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useNavigation } from "@react-navigation/native";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function PricePredict() {
  const navigation = useNavigation<any>();

  const [date, setDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [variety, setVariety] = useState("");
  const [size, setSize] = useState("");
  const [shop, setShop] = useState("");

  const [openVariety, setOpenVariety] = useState(false);
  const [openSize, setOpenSize] = useState(false);
  const [openShop, setOpenShop] = useState(false);

  const [showResult, setShowResult] = useState(false);
  const [predictedPrice, setPredictedPrice] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [samis, setSamis] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const formatDate = (d: Date) => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const SHOPS = useMemo(
    () => ["Anthurium Flower Garden", "Horana Anthurium", "Oscar Anthurium"],
    [],
  );
  const VARIETIES = useMemo(
    () => ["Baby Pink", "Black Cardinal", "Flash", "Lady Jane", "Red"],
    [],
  );
  const SIZES = useMemo(() => ["Large", "Medium", "Small"], []);

  type PriceApiResp = {
    message: string;
    data: {
      price_lkr: number;
      samis: any;
    };
  };

  const closeAllDropdowns = () => {
    setOpenVariety(false);
    setOpenSize(false);
    setOpenShop(false);
  };

  const clearForm = () => {
    setDate(null);
    setVariety("");
    setSize("");
    setShop("");
    closeAllDropdowns();
  };

  const predictPrice = async () => {
    if (!date || !variety || !size || !shop) {
      Alert.alert("Missing data", "Please fill all fields");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        date: formatDate(date),
        shop,
        variety,
        size,
      };

      const data = await post<PriceApiResp>(
        Service.MARKET,
        "/get_price_per_flower",
        payload,
      );

      setPredictedPrice(data.data.price_lkr);
      setMessage(data.message);
      setSamis(data.data.samis);
      setShowResult(true);

      // ✅ Clear form AFTER successful prediction
      clearForm();
    } catch (error: any) {
      Alert.alert("Error", error?.message || "Failed to get prediction");
    } finally {
      setLoading(false);
    }
  };

  const canPredict = !!date && !!variety && !!size && !!shop && !loading;

  const Field = ({
    label,
    value,
    placeholder,
    open,
    onToggle,
    options,
    onPick,
  }: {
    label: string;
    value: string;
    placeholder: string;
    open: boolean;
    onToggle: () => void;
    options: string[];
    onPick: (v: string) => void;
  }) => (
    <View style={{ marginTop: 12 }}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity style={styles.picker} onPress={onToggle} activeOpacity={0.85}>
        <Text style={[styles.pickerText, !value && styles.placeholder]}>
          {value || placeholder}
        </Text>
        <Text style={styles.chev}>▾</Text>
      </TouchableOpacity>

      {open && (
        <View style={styles.dropdown}>
          <ScrollView style={{ maxHeight: 210 }} nestedScrollEnabled>
            {options.map((item, idx) => (
              <TouchableOpacity
                key={item}
                style={[
                  styles.option,
                  idx === options.length - 1 && { borderBottomWidth: 0 },
                ]}
                onPress={() => onPick(item)}
                activeOpacity={0.85}
              >
                <Text style={styles.optionText}>{item}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );

  return (
    <Pressable style={{ flex: 1 }} onPress={closeAllDropdowns}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.title}>Price Prediction</Text>
          <Text style={styles.subtitle}>
            Select date, shop, variety and size to get the predicted price.
          </Text>
        </View>

        <View style={styles.card}>
          {/* Date */}
          <Text style={styles.label}>Date</Text>
          <TouchableOpacity
            style={styles.picker}
            onPress={() => {
              closeAllDropdowns();
              setShowDatePicker(true);
            }}
            activeOpacity={0.85}
          >
            <Text style={[styles.pickerText, !date && styles.placeholder]}>
              {date ? formatDate(date) : "Select date"}
            </Text>
            <Text style={styles.chev}>📅</Text>
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={date ?? new Date()}
              mode="date"
              onChange={(e, selected) => {
                setShowDatePicker(false);
                if (selected) setDate(selected);
              }}
            />
          )}

          <Field
            label="Flower Shop"
            value={shop}
            placeholder="Select shop"
            open={openShop}
            onToggle={() => {
              setOpenShop(!openShop);
              setOpenVariety(false);
              setOpenSize(false);
            }}
            options={SHOPS}
            onPick={(v) => {
              setShop(v);
              setOpenShop(false);
            }}
          />

          <Field
            label="Flower Variety"
            value={variety}
            placeholder="Select variety"
            open={openVariety}
            onToggle={() => {
              setOpenVariety(!openVariety);
              setOpenShop(false);
              setOpenSize(false);
            }}
            options={VARIETIES}
            onPick={(v) => {
              setVariety(v);
              setOpenVariety(false);
            }}
          />

          <Field
            label="Flower Size"
            value={size}
            placeholder="Select size"
            open={openSize}
            onToggle={() => {
              setOpenSize(!openSize);
              setOpenShop(false);
              setOpenVariety(false);
            }}
            options={SIZES}
            onPick={(v) => {
              setSize(v);
              setOpenSize(false);
            }}
          />

          <TouchableOpacity
            style={[styles.primaryBtn, !canPredict && styles.primaryBtnDisabled]}
            disabled={!canPredict}
            onPress={predictPrice}
            activeOpacity={0.9}
          >
            {loading ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator color="#fff" />
                <Text style={styles.primaryBtnText}>Predicting...</Text>
              </View>
            ) : (
              <Text style={styles.primaryBtnText}>Predict Price</Text>
            )}
          </TouchableOpacity>

       
        </View>

        {/* Result Modal */}
        <Modal transparent visible={showResult} animationType="fade">
          <Pressable style={styles.modalOverlay} onPress={() => setShowResult(false)}>
            <Pressable style={styles.modalCard} onPress={() => {}}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Prediction Result</Text>
                <TouchableOpacity
                  onPress={() => setShowResult(false)}
                  style={styles.xBtn}
                  activeOpacity={0.85}
                >
                  <Text style={styles.xText}>×</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.priceBox}>
                <Text style={styles.modalLabel}>Predicted Price</Text>
                <Text style={styles.modalPrice}>
                  {predictedPrice !== null ? `Rs. ${predictedPrice}` : "--"}
                </Text>
              </View>


              <TouchableOpacity
                style={styles.secondaryBtn}
                onPress={() => {
                  setShowResult(false);
                  navigation.navigate("SamisDetails", {
                    price: predictedPrice,
                    samis: samis,
                  });
                }}
                activeOpacity={0.9}
              >
                <Text style={styles.secondaryBtnText}>View Sustainable Report</Text>
              </TouchableOpacity>

            </Pressable>
          </Pressable>
        </Modal>
      </ScrollView>
    </Pressable>
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
  container: { padding: 16, backgroundColor: PINK.white, flexGrow: 1 },

  header: { paddingTop: 6, paddingBottom: 10, gap: 8 },
  title: { fontSize: 22, fontWeight: "700", textAlign: "center", color: PINK.text },
  subtitle: { fontSize: 13, color: PINK.muted, textAlign: "center", lineHeight: 18 },

  card: {
    backgroundColor: PINK.white,
    borderWidth: 1,
    borderColor: PINK.border,
    borderRadius: 18,
    padding: 16,
    shadowColor: "#000000",
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
  },

  label: { marginTop: 12, marginBottom: 6, fontWeight: "800", color: PINK.text, fontSize: 13 },

  picker: {
    borderWidth: 1,
    borderColor: PINK.border,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 14,
    backgroundColor: "#FFF7FB",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  pickerText: { color: PINK.text, fontWeight: "400", fontSize: 14 },
  placeholder: { color: PINK.muted },
  chev: { color: PINK.dark, fontSize: 16, fontWeight: "600" },

  dropdown: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: PINK.border,
    borderRadius: 14,
    backgroundColor: PINK.white,
    overflow: "hidden",
  },
  option: {
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: PINK.border,
  },
  optionText: { color: PINK.text, fontWeight: "400" },

  primaryBtn: {
    marginTop: 18,
    backgroundColor: PINK.primary,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    shadowColor: "#000000",
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  primaryBtnDisabled: { opacity: 0.5 },
  primaryBtnText: { color: PINK.white, fontWeight: "700", fontSize: 14 },

  loadingRow: { flexDirection: "row", gap: 10, alignItems: "center" },

  hint: { marginTop: 12, fontSize: 12, color: PINK.muted, textAlign: "center", lineHeight: 18 },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    padding: 18,
  },
  modalCard: {
    backgroundColor: PINK.white,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: PINK.border,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  modalTitle: { fontSize: 16, fontWeight: "800", color: PINK.text },
  xBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: PINK.light,
    alignItems: "center",
    justifyContent: "center",
  },
  xText: { fontSize: 22, fontWeight: "800", color: PINK.dark, lineHeight: 22 },

  priceBox: {
    backgroundColor: "#FFF7FB",
    borderWidth: 1,
    borderColor: PINK.border,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 14,
    alignItems: "center",
  },
  modalLabel: { color: PINK.muted, fontWeight: "700", fontSize: 12 },
  modalPrice: { marginTop: 6, fontSize: 34, fontWeight: "800", color: PINK.primary },

  modalMsg: { marginTop: 12, color: PINK.text, textAlign: "center", lineHeight: 20, fontWeight: "400" },

  secondaryBtn: {
    marginTop: 14,
    backgroundColor: PINK.dark,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  secondaryBtnText: { color: PINK.white, fontWeight: "700", fontSize: 14 },

  modalCloseBtn: {
    marginTop: 10,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: PINK.border,
    backgroundColor: PINK.white,
  },
  modalCloseText: { color: PINK.dark, fontWeight: "700", fontSize: 14 },
});