import DateTimePicker from "@react-native-community/datetimepicker";
import { useNavigation } from "@react-navigation/native";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
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

  const formatDate = (d: Date) =>
    `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;

  const predictPrice = async () => {
    if (!date || !variety || !size || !shop) {
      Alert.alert("Missing data", "Please fill all fields");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(
        "http://172.20.10.2:8000/get_price_per_flower",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            date: formatDate(date),
            shop,
            variety,
            size,
          }),
        }
      );

      const data = await response.json();
      if (!response.ok) throw new Error(`API error ${response.status}`);

      setPredictedPrice(data.data.price_lkr);
      setMessage(data.message);
      setSamis(data.data.samis); // store SAMIS for next page
      setShowResult(true);

      // Clear inputs
      setDate(null);
      setVariety("");
      setSize("");
      setShop("");
      setOpenVariety(false);
      setOpenSize(false);
      setOpenShop(false);
    } catch (error: any) {
      console.error(error);
      Alert.alert("Error", error.message || "Failed to get prediction");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Price Prediction</Text>

      {/* Date */}
      <Text style={styles.label}>Date</Text>
      <TouchableOpacity
        style={styles.input}
        onPress={() => setShowDatePicker(true)}
      >
        <Text style={styles.inputText}>
          {date ? formatDate(date) : "Select date"}
        </Text>
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

      {/* Variety */}
      <Text style={styles.label}>Flower Variety</Text>
      <TouchableOpacity
        style={styles.input}
        onPress={() => {
          setOpenVariety(!openVariety);
          setOpenSize(false);
          setOpenShop(false);
        }}
      >
        <Text style={styles.inputText}>{variety || "Select variety"}</Text>
      </TouchableOpacity>
      {openVariety && (
        <View style={styles.dropdown}>
          {["Red", "White", "Pink"].map((item) => (
            <TouchableOpacity
              key={item}
              style={styles.option}
              onPress={() => {
                setVariety(item);
                setOpenVariety(false);
              }}
            >
              <Text>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Size */}
      <Text style={styles.label}>Flower Size</Text>
      <TouchableOpacity
        style={styles.input}
        onPress={() => {
          setOpenSize(!openSize);
          setOpenVariety(false);
          setOpenShop(false);
        }}
      >
        <Text style={styles.inputText}>{size || "Select size"}</Text>
      </TouchableOpacity>
      {openSize && (
        <View style={styles.dropdown}>
          {["Small", "Medium", "Large"].map((item) => (
            <TouchableOpacity
              key={item}
              style={styles.option}
              onPress={() => {
                setSize(item);
                setOpenSize(false);
              }}
            >
              <Text>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Shop */}
      <Text style={styles.label}>Flower Shop</Text>
      <TouchableOpacity
        style={styles.input}
        onPress={() => {
          setOpenShop(!openShop);
          setOpenVariety(false);
          setOpenSize(false);
        }}
      >
        <Text style={styles.inputText}>{shop || "Select shop"}</Text>
      </TouchableOpacity>
      {openShop && (
        <View style={styles.dropdown}>
          {["Anthurium Flower Garden", "Horana Anthurium", "Oscar Anthurium"].map(
            (item) => (
              <TouchableOpacity
                key={item}
                style={styles.option}
                onPress={() => {
                  setShop(item);
                  setOpenShop(false);
                }}
              >
                <Text>{item}</Text>
              </TouchableOpacity>
            )
          )}
        </View>
      )}

      {/* Submit */}
      <TouchableOpacity
        style={[styles.submitButton, loading && { opacity: 0.6 }]}
        disabled={loading}
        onPress={predictPrice}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitText}>Predict Price</Text>
        )}
      </TouchableOpacity>

      {/* Result Modal */}
      <Modal transparent visible={showResult} animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.resultCard}>
            <Text style={styles.resultTitle}>Predicted Price</Text>
            <Text style={styles.price}>
              {predictedPrice !== null ? `Rs. ${predictedPrice}` : "--"}
            </Text>
           

            {/* Navigate to SAMIS Report */}
            <TouchableOpacity
              style={[styles.submitButton, { marginTop: 15 }]}
              onPress={() => {
                setShowResult(false);
                navigation.navigate("SamisDetails", {
                  price: predictedPrice,
                  samis: samis,
                });
              }}
            >
              <Text style={styles.submitText}>View Sustainable Report</Text>
            </TouchableOpacity>

            {/* Close */}
            <TouchableOpacity
              style={[styles.closeButton, { marginTop: 10 }]}
              onPress={() => setShowResult(false)}
            >
              <Text style={styles.submitText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: "#fff", flexGrow: 1 },
  title: { fontSize: 22, fontWeight: "600", textAlign: "center", marginBottom: 30 },
  label: { marginTop: 15, marginBottom: 6, fontWeight: "500" },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 14,
    backgroundColor: "#fafafa",
  },
  inputText: { color: "#333" },
  dropdown: { borderWidth: 1, borderColor: "#ddd", borderRadius: 10, marginTop: 5, backgroundColor: "#fff" },
  option: { padding: 14, borderBottomWidth: 1, borderBottomColor: "#eee" },
  submitButton: { marginTop: 40, backgroundColor: "#B22222", padding: 16, borderRadius: 12, alignItems: "center" },
  submitText: { color: "#fff", fontWeight: "600" },
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "center", alignItems: "center" },
  resultCard: { backgroundColor: "#fff", padding: 30, borderRadius: 14, width: "80%", alignItems: "center" },
  resultTitle: { fontSize: 18, marginBottom: 10 },
  price: { fontSize: 32, fontWeight: "bold", color: "#B22222", marginBottom: 20 },
  closeButton: { backgroundColor: "#B22222", paddingVertical: 12, paddingHorizontal: 40, borderRadius: 10 },
});
