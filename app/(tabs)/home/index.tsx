import { IconSymbol } from "@/components/ui/icon-symbol";
import { router } from "expo-router";
import {
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const anthuriumImage = require("../../../assets/images/anthurium.jpg");
const demandImage = require("../../../assets/images/demand.png");
const marketImage = require("../../../assets/images/market.png");
const priceImage = require("../../../assets/images/price.png");

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        <TouchableOpacity
          onPress={() => router.push("/(tabs)/home/price-predict")}
        >
          <ImageBackground
            source={anthuriumImage}
            style={styles.card}
            imageStyle={styles.cardImage}
          >
            <View style={styles.overlay}>
              <IconSymbol size={40} name="chart.bar.fill" color="#B22222" />
              <Text style={styles.cardText}>Today's Market</Text>
            </View>
          </ImageBackground>
        </TouchableOpacity>

        <ImageBackground
          source={priceImage}
          style={styles.card}
          r
          imageStyle={styles.cardImage}
        >
          <View style={styles.overlay}>
            <IconSymbol size={40} name="star.fill" color="#B22222" />
            <Text style={styles.cardText}>Price Prediction</Text>
          </View>
        </ImageBackground>

        <ImageBackground
          source={marketImage}
          style={styles.card}
          imageStyle={styles.cardImage}
        >
          <View style={styles.overlay}>
            <IconSymbol size={40} name="waveform.path" color="#B22222" />
            <Text style={styles.cardText}>Market Fluctuations</Text>
          </View>
        </ImageBackground>

        <ImageBackground
          source={demandImage}
          style={styles.card}
          imageStyle={styles.cardImage}
        >
          <View style={styles.overlay}>
            <IconSymbol size={40} name="clock.fill" color="#B22222" />
            <Text style={styles.cardText}>Most Demanding Time Durations</Text>
          </View>
        </ImageBackground>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingHorizontal: 40,
    backgroundColor: "#fff",
    justifyContent: "center",
  },

  grid: {
    flexDirection: "column",
  },

  card: {
    width: "100%",
    height: 130,
    borderRadius: 16,
    marginBottom: 16,
    overflow: "hidden",
    elevation: 6,
  },

  cardImage: {
    borderRadius: 16,
    resizeMode: "cover",
  },

  overlay: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.7)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },

  cardText: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 12,
    fontWeight: "600",
    color: "#333",
  },
});
