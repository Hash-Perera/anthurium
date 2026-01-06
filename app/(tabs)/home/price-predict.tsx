// import DateTimePicker from "@react-native-community/datetimepicker";
// import { useState } from "react";
// import {
//   Modal,
//   Platform,
//   ScrollView,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   View,
// } from "react-native";

// export default function PricePredict() {
//   const [date, setDate] = useState<Date | null>(null);
//   const [showDatePicker, setShowDatePicker] = useState(false);

//   const [variety, setVariety] = useState("");
//   const [size, setSize] = useState("");

//   const [showVarietyModal, setShowVarietyModal] = useState(false);
//   const [showSizeModal, setShowSizeModal] = useState(false);

//   const [showResult, setShowResult] = useState(false);

//   return (
//     <ScrollView
//       contentContainerStyle={styles.container}
//       keyboardShouldPersistTaps="handled"
//     >
//       <Text style={styles.title}>Price Prediction</Text>

//       {/* Date */}
//       <Text style={styles.label}>Date</Text>
//       <TouchableOpacity
//         style={styles.input}
//         onPress={() => setShowDatePicker(true)}
//       >
//         <Text style={styles.inputText}>
//           {date ? date.toDateString() : "Select date"}
//         </Text>
//       </TouchableOpacity>

//       {showDatePicker && (
//         <DateTimePicker
//           value={date ?? new Date()}
//           mode="date"
//           display={Platform.OS === "ios" ? "spinner" : "default"}
//           onChange={(e, selectedDate) => {
//             setShowDatePicker(false);
//             if (selectedDate) setDate(selectedDate);
//           }}
//         />
//       )}

//       {/* Variety */}
//       <Text style={styles.label}>Flower Variety</Text>
//       <TouchableOpacity
//         style={styles.input}
//         onPress={() => setShowVarietyModal(true)}
//       >
//         <Text style={styles.inputText}>{variety || "Select variety"}</Text>
//       </TouchableOpacity>

//       {/* Size */}
//       <Text style={styles.label}>Flower Size</Text>
//       <TouchableOpacity
//         style={styles.input}
//         onPress={() => setShowSizeModal(true)}
//       >
//         <Text style={styles.inputText}>{size || "Select size"}</Text>
//       </TouchableOpacity>

//       {/* Submit */}
//       <TouchableOpacity
//         style={styles.submitButton}
//         onPress={() => setShowResult(true)}
//       >
//         <Text style={styles.submitText}>Predict Price</Text>
//       </TouchableOpacity>

//       {/* Variety Modal */}
//       <SelectionModal
//         visible={showVarietyModal}
//         title="Select Variety"
//         options={["Anthurium Red", "Anthurium White", "Anthurium Pink"]}
//         onSelect={(value) => {
//           setVariety(value);
//           setShowVarietyModal(false);
//         }}
//         onClose={() => setShowVarietyModal(false)}
//       />

//       {/* Size Modal */}
//       <SelectionModal
//         visible={showSizeModal}
//         title="Select Size"
//         options={["Small", "Medium", "Large"]}
//         onSelect={(value) => {
//           setSize(value);
//           setShowSizeModal(false);
//         }}
//         onClose={() => setShowSizeModal(false)}
//       />

//       {/* Result Modal */}
//       <Modal transparent visible={showResult} animationType="fade">
//         <View style={styles.overlay}>
//           <View style={styles.resultCard}>
//             <Text style={styles.resultTitle}>Predicted Price</Text>
//             <Text style={styles.price}>Rs. 40</Text>

//             <TouchableOpacity
//               style={styles.closeButton}
//               onPress={() => setShowResult(false)}
//             >
//               <Text style={styles.submitText}>Close</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </Modal>
//     </ScrollView>
//   );
// }

// /* ---------------- COMPONENT ---------------- */

// function SelectionModal({
//   visible,
//   title,
//   options,
//   onSelect,
//   onClose,
// }: {
//   visible: boolean;
//   title: string;
//   options: string[];
//   onSelect: (v: string) => void;
//   onClose: () => void;
// }) {
//   return (
//     <Modal visible={visible} transparent animationType="slide">
//       <View style={styles.overlay}>
//         <View style={styles.modalCard}>
//           <Text style={styles.modalTitle}>{title}</Text>

//           {options.map((item) => (
//             <TouchableOpacity
//               key={item}
//               style={styles.option}
//               onPress={() => onSelect(item)}
//             >
//               <Text>{item}</Text>
//             </TouchableOpacity>
//           ))}

//           <TouchableOpacity onPress={onClose}>
//             <Text style={styles.cancel}>Cancel</Text>
//           </TouchableOpacity>
//         </View>
//       </View>
//     </Modal>
//   );
// }

// /* ---------------- STYLES ---------------- */

// const styles = StyleSheet.create({
//   container: {
//     padding: 20,
//     backgroundColor: "#fff",
//     flexGrow: 1,
//   },
//   title: {
//     fontSize: 22,
//     fontWeight: "600",
//     textAlign: "center",
//     marginBottom: 30,
//   },
//   label: {
//     marginTop: 15,
//     marginBottom: 6,
//     fontWeight: "500",
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: "#ddd",
//     borderRadius: 10,
//     padding: 14,
//     backgroundColor: "#fafafa",
//   },
//   inputText: {
//     color: "#333",
//   },
//   submitButton: {
//     marginTop: 40,
//     backgroundColor: "#B22222",
//     padding: 16,
//     borderRadius: 12,
//     alignItems: "center",
//   },
//   submitText: {
//     color: "#fff",
//     fontWeight: "600",
//   },
//   overlay: {
//     flex: 1,
//     backgroundColor: "rgba(0,0,0,0.4)",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   modalCard: {
//     backgroundColor: "#fff",
//     width: "85%",
//     borderRadius: 14,
//     padding: 20,
//   },
//   modalTitle: {
//     fontSize: 18,
//     fontWeight: "600",
//     marginBottom: 15,
//   },
//   option: {
//     paddingVertical: 12,
//   },
//   cancel: {
//     marginTop: 15,
//     textAlign: "center",
//     color: "#B22222",
//     fontWeight: "500",
//   },
//   resultCard: {
//     backgroundColor: "#fff",
//     padding: 30,
//     borderRadius: 14,
//     width: "80%",
//     alignItems: "center",
//   },
//   resultTitle: {
//     fontSize: 18,
//     marginBottom: 10,
//   },
//   price: {
//     fontSize: 32,
//     fontWeight: "bold",
//     color: "#B22222",
//     marginBottom: 20,
//   },
//   closeButton: {
//     backgroundColor: "#B22222",
//     paddingVertical: 12,
//     paddingHorizontal: 40,
//     borderRadius: 10,
//   },
// });

import DateTimePicker from "@react-native-community/datetimepicker";
import { useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function PricePredict() {
  const [date, setDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [variety, setVariety] = useState("");
  const [size, setSize] = useState("");

  const [openVariety, setOpenVariety] = useState(false);
  const [openSize, setOpenSize] = useState(false);

  const [showResult, setShowResult] = useState(false);

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
          {date ? date.toDateString() : "Select date"}
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

      {/* Variety Dropdown */}
      <Text style={styles.label}>Flower Variety</Text>
      <TouchableOpacity
        style={styles.input}
        onPress={() => {
          setOpenVariety(!openVariety);
          setOpenSize(false);
        }}
      >
        <Text style={styles.inputText}>{variety || "Select variety"}</Text>
      </TouchableOpacity>

      {openVariety && (
        <View style={styles.dropdown}>
          {["Anthurium Red", "Anthurium White", "Anthurium Pink"].map(
            (item) => (
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
            )
          )}
        </View>
      )}

      {/* Size Dropdown */}
      <Text style={styles.label}>Flower Size</Text>
      <TouchableOpacity
        style={styles.input}
        onPress={() => {
          setOpenSize(!openSize);
          setOpenVariety(false);
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

      {/* Submit */}
      <TouchableOpacity
        style={styles.submitButton}
        onPress={() => setShowResult(true)}
      >
        <Text style={styles.submitText}>Predict Price</Text>
      </TouchableOpacity>

      {/* Result Popup */}
      <Modal transparent visible={showResult} animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.resultCard}>
            <Text style={styles.resultTitle}>Predicted Price</Text>
            <Text style={styles.price}>Rs. 40</Text>

            <TouchableOpacity
              style={styles.closeButton}
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
  container: {
    padding: 20,
    backgroundColor: "#fff",
    flexGrow: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 30,
  },
  label: {
    marginTop: 15,
    marginBottom: 6,
    fontWeight: "500",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 14,
    backgroundColor: "#fafafa",
  },
  inputText: {
    color: "#333",
  },
  dropdown: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    marginTop: 5,
    backgroundColor: "#fff",
  },
  option: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  submitButton: {
    marginTop: 40,
    backgroundColor: "#B22222",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  submitText: {
    color: "#fff",
    fontWeight: "600",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  resultCard: {
    backgroundColor: "#fff",
    padding: 30,
    borderRadius: 14,
    width: "80%",
    alignItems: "center",
  },
  resultTitle: {
    fontSize: 18,
    marginBottom: 10,
  },
  price: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#B22222",
    marginBottom: 20,
  },
  closeButton: {
    backgroundColor: "#B22222",
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 10,
  },
});
