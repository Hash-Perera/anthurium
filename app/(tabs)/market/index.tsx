import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { router } from "expo-router";
import React from "react";
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

type CardProps = {
  title: string;
  subtitle: string;
  icon: string;
  image: any;
  onPress: () => void;
  theme: any;
};

function FeatureCard({
  title,
  subtitle,
  icon,
  image,
  onPress,
  theme,
}: CardProps) {
  const overlay = hexToRgba("#000000", 0.38);

  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onPress}>
      <View style={[styles.featureCard, { backgroundColor: theme.card }]}>
        <ImageBackground
          source={image}
          style={styles.featureImage}
          imageStyle={styles.featureImageStyle}
        >
          <View style={[styles.featureOverlay, { backgroundColor: overlay }]} />
        </ImageBackground>

        <View style={styles.featureContent}>
          <View style={styles.featureLeft}>
            <View
              style={[
                styles.iconBubble,
                { backgroundColor: hexToRgba(theme.tint, 0.14) },
              ]}
            >
              <IconSymbol size={20} name={icon as any} color={theme.tint} />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={[styles.featureTitle, { color: theme.text }]}>
                {title}
              </Text>
              <Text
                style={[styles.featureSubtitle, { color: theme.mutedText }]}
                numberOfLines={2}
              >
                {subtitle}
              </Text>
            </View>
          </View>

          <View style={styles.featureRight}>
            <IconSymbol size={18} name="chevron.right" color={theme.mutedText} />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function MarketScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];

  const heroOverlay = hexToRgba(theme.background, 0.82);
  const chipBg = hexToRgba(theme.tint, 0.12);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* HERO */}
      <ImageBackground
        source={anthuriumImage}
        style={styles.hero}
        imageStyle={styles.heroImage}
      >
        <View style={[styles.heroOverlay, { backgroundColor: heroOverlay }]}>
          <Text style={[styles.heroTitle, { color: theme.text }]}>
            Market Prediction
          </Text>

          <Text style={[styles.heroDesc, { color: theme.text }]}>
            Welcome to the market module of the Anthurium Care app. Track trends
            and get smart predictions to plan your selling and buying better.
          </Text>

        
       
        </View>
      </ImageBackground>

      {/* CARDS */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Tools
        </Text>

        <FeatureCard
          title="Price Prediction"
          subtitle="Predict future anthurium prices using past market patterns."
          icon="star.fill"
          image={priceImage}
          theme={theme}
          onPress={() => router.push("/(tabs)/market/price-predict")}
        />


      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 18,
  },

  hero: {
    height: 190,
    borderRadius: 22,
    overflow: "hidden",
  },
  heroImage: {
    borderRadius: 22,
    resizeMode: "cover",
  },
  heroOverlay: {
    flex: 1,
    padding: 18,
    justifyContent: "center",
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  heroDesc: {
    fontSize: 13.5,
    lineHeight: 19,
    marginBottom: 14,
    fontWeight: "500",
  },

  chipsRow: {
    flexDirection: "row",
    gap: 10,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
  },
  chipText: {
    fontSize: 12.5,
    fontWeight: "700",
  },

  section: {
    marginTop: 18,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "800",
    marginBottom: 10,
    letterSpacing: 0.2,
  },

  featureCard: {
    borderRadius: 18,
    overflow: "hidden",
    marginBottom: 14,
    elevation: 5,
  },

  featureImage: {
    height: 92,
    width: "100%",
  },
  featureImageStyle: {
    resizeMode: "cover",
  },
  featureOverlay: {
    ...StyleSheet.absoluteFillObject,
  },

  featureContent: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  featureLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
    paddingRight: 10,
  },

  iconBubble: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  featureTitle: {
    fontSize: 15,
    fontWeight: "800",
    marginBottom: 2,
  },
  featureSubtitle: {
    fontSize: 12.5,
    lineHeight: 17,
    fontWeight: "500",
  },

  featureRight: {
    width: 24,
    alignItems: "flex-end",
  },
});