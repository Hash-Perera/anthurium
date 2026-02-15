import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
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

const hexToRgba = (hex: string, alpha: number) => {
  const sanitized = hex.replace("#", "");
  const r = parseInt(sanitized.slice(0, 2), 16);
  const g = parseInt(sanitized.slice(2, 4), 16);
  const b = parseInt(sanitized.slice(4, 6), 16);

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const overlayBackground = hexToRgba(theme.background, 0.78);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.grid}>
        <TouchableOpacity
          onPress={() => router.push("/(tabs)/home/price-predict")}
        >
          <ImageBackground
            source={anthuriumImage}
            style={styles.card}
            imageStyle={styles.cardImage}
          >
            <View
              style={[styles.overlay, { backgroundColor: overlayBackground }]}
            >
              <IconSymbol size={40} name="chart.bar.fill" color={theme.tint} />
              <Text style={[styles.cardText, { color: theme.text }]}>
                Today's Market
              </Text>
            </View>
          </ImageBackground>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push("/(tabs)/home/price-predict")}
        >
          <ImageBackground
            source={priceImage}
            style={styles.card}
            imageStyle={styles.cardImage}
          >
            <View
              style={[styles.overlay, { backgroundColor: overlayBackground }]}
            >
              <IconSymbol size={40} name="star.fill" color={theme.tint} />
              <Text style={[styles.cardText, { color: theme.text }]}>
                Price Prediction
              </Text>
            </View>
          </ImageBackground>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push("/(tabs)/home/market-fluctuations")}
        >
          <ImageBackground
            source={marketImage}
            style={styles.card}
            imageStyle={styles.cardImage}
          >
            <View
              style={[styles.overlay, { backgroundColor: overlayBackground }]}
            >
              <IconSymbol size={40} name="waveform.path" color={theme.tint} />
              <Text style={[styles.cardText, { color: theme.text }]}>
                Market Fluctuations
              </Text>
            </View>
          </ImageBackground>
        </TouchableOpacity>

        <ImageBackground
          source={demandImage}
          style={styles.card}
          imageStyle={styles.cardImage}
        >
          <View
            style={[styles.overlay, { backgroundColor: overlayBackground }]}
          >
            <IconSymbol size={40} name="clock.fill" color={theme.tint} />
            <Text style={[styles.cardText, { color: theme.text }]}>
              Most Demanding Time Durations
            </Text>
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
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },

  cardText: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 12,
    fontWeight: "600",
  },
});
