import { IconSymbol, IconSymbolName } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { router } from "expo-router";
import React, { useEffect, useRef } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";

type Card = {
  title: string;
  subtitle: string;
  icon: IconSymbolName;
  route: string;
};

const cards: Card[] = [
  {
    title: "Forecast",
    subtitle: "Next 7d",
    icon: "cloud.sun.fill",
    route: "/(tabs)/weather/forecast",
  },
  {
    title: "Watering",
    subtitle: "Soil moisture",
    icon: "drop.fill",
    route: "/(tabs)/weather/watering",
  },
  {
    title: "Insights",
    subtitle: "Care tips",
    icon: "sparkles",
    route: "/(tabs)/weather/insights",
  },
];

const hexToRgba = (hex: string, alpha: number) => {
  const sanitized = hex.replace("#", "");
  const r = parseInt(sanitized.slice(0, 2), 16);
  const g = parseInt(sanitized.slice(2, 4), 16);
  const b = parseInt(sanitized.slice(4, 6), 16);

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export default function WeatherScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const cardBackground =
    colorScheme === "dark" ? "rgba(255, 255, 255, 0.08)" : theme.white;
  const tintSoft = hexToRgba(theme.tint, 0.25);
  const cloudDrift = useRef(new Animated.Value(0)).current;
  const cloudDriftSlow = useRef(new Animated.Value(0)).current;
  const rainDrop = useRef(new Animated.Value(0)).current;
  const lightningFlash = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const cloudLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(cloudDrift, {
          toValue: 1,
          duration: 4200,
          useNativeDriver: true,
        }),
        Animated.timing(cloudDrift, {
          toValue: 0,
          duration: 4200,
          useNativeDriver: true,
        }),
      ]),
    );
    const cloudSlowLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(cloudDriftSlow, {
          toValue: 1,
          duration: 6200,
          useNativeDriver: true,
        }),
        Animated.timing(cloudDriftSlow, {
          toValue: 0,
          duration: 6200,
          useNativeDriver: true,
        }),
      ]),
    );
    const rainLoop = Animated.loop(
      Animated.timing(rainDrop, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
    );
    const lightningLoop = Animated.loop(
      Animated.sequence([
        Animated.delay(2600),
        Animated.timing(lightningFlash, {
          toValue: 1,
          duration: 140,
          useNativeDriver: true,
        }),
        Animated.timing(lightningFlash, {
          toValue: 0,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.delay(1800),
      ]),
    );

    cloudLoop.start();
    cloudSlowLoop.start();
    rainLoop.start();
    lightningLoop.start();

    return () => {
      cloudLoop.stop();
      cloudSlowLoop.stop();
      rainLoop.stop();
      lightningLoop.stop();
    };
  }, [cloudDrift, cloudDriftSlow, rainDrop, lightningFlash]);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.hero}>
        <View style={styles.heroText}>
          <Text style={[styles.title, { color: theme.text }]}>Weather</Text>
          <Text style={[styles.subtitle, { color: theme.icon }]}>
            Soft breeze, steady light
          </Text>
        </View>
      </View>

      <View style={styles.cardGrid}>
        {cards.map((card) => (
          <Pressable
            key={card.title}
            onPress={() => router.push(card.route as any)}
            style={({ pressed }) => [
              styles.card,
              {
                backgroundColor: cardBackground,
                borderColor: tintSoft,
                shadowColor: theme.tint,
                opacity: pressed ? 0.85 : 1,
                transform: [{ scale: pressed ? 0.97 : 1 }],
              },
            ]}
          >
            <View
              style={[
                styles.cardIcon,
                { backgroundColor: tintSoft, borderColor: theme.tint },
              ]}
            >
              <IconSymbol size={20} name={card.icon} color={theme.tint} />
            </View>

            <Text style={[styles.cardTitle, { color: theme.text }]}>
              {card.title}
            </Text>

            <Text style={[styles.cardSubtitle, { color: theme.icon }]}>
              {card.subtitle}
            </Text>
          </Pressable>
        ))}
      </View>

      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <View
          style={{
            alignItems: "center",
            justifyContent: "center",
            height: 300,
            width: "70%",
            padding: 20,
            borderRadius: 16,
          }}
        >
          <View style={styles.comingSoon}>
            <View style={styles.scene}>
              <View style={[styles.sun, { borderColor: theme.tint }]} />
              <Animated.View
                style={[
                  styles.cloud,
                  styles.cloudLarge,
                  {
                    transform: [
                      {
                        translateX: cloudDrift.interpolate({
                          inputRange: [0, 1],
                          outputRange: [-18, 18],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <View style={[styles.cloudPuff, styles.cloudPuffLeft]} />
                <View style={[styles.cloudPuff, styles.cloudPuffRight]} />
              </Animated.View>
              <Animated.View
                style={[
                  styles.rainGroup,
                  {
                    transform: [
                      {
                        translateY: rainDrop.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, 16],
                        }),
                      },
                    ],
                    opacity: rainDrop.interpolate({
                      inputRange: [0, 0.8, 1],
                      outputRange: [0, 0.9, 0],
                    }),
                  },
                ]}
              >
                <View style={styles.rainDrop} />
                <View style={[styles.rainDrop, styles.rainDropMiddle]} />
                <View style={[styles.rainDrop, styles.rainDropRight]} />
              </Animated.View>
              <Animated.View
                style={[
                  styles.cloud,
                  styles.cloudSmall,
                  {
                    transform: [
                      {
                        translateX: cloudDriftSlow.interpolate({
                          inputRange: [0, 1],
                          outputRange: [20, -20],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <View style={[styles.cloudPuff, styles.cloudPuffLeft]} />
                <View style={[styles.cloudPuff, styles.cloudPuffRight]} />
              </Animated.View>
              <Animated.View
                style={[
                  styles.rainGroupSmall,
                  {
                    transform: [
                      {
                        translateY: rainDrop.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, 12],
                        }),
                      },
                    ],
                    opacity: rainDrop.interpolate({
                      inputRange: [0, 0.8, 1],
                      outputRange: [0, 0.85, 0],
                    }),
                  },
                ]}
              >
                <View style={[styles.rainDrop, styles.rainDropSmall]} />
                <View style={[styles.rainDrop, styles.rainDropSmallMiddle]} />
              </Animated.View>

              <Animated.View
                style={[
                  styles.lightning,
                  {
                    opacity: lightningFlash,
                    transform: [
                      {
                        translateY: lightningFlash.interpolate({
                          inputRange: [0, 1],
                          outputRange: [-6, 0],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <View style={styles.lightningBolt} />
              </Animated.View>

              <View style={styles.groundLine} />

              <View style={styles.treeWrap}>
                <View style={styles.tree}>
                  <View style={styles.treeTrunk} />
                  <View style={styles.treeBranchLeft} />
                  <View style={styles.treeBranchRight} />
                  <View style={styles.treeCrown} />
                </View>
              </View>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  hero: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  heroText: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: "500",
  },
  cardGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  card: {
    width: "31%",
    aspectRatio: 1,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 4,
  },
  cardIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
    borderWidth: 1,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 6,
    textAlign: "center",
  },
  cardSubtitle: {
    fontSize: 12,
    fontWeight: "500",
    textAlign: "center",
  },
  comingSoon: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "space-between",
  },
  comingSoonText: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 8,
  },
  scene: {
    flex: 1,
    width: "100%",
    borderRadius: 14,
    position: "relative",
    overflow: "hidden",
    paddingTop: 18,
  },
  sun: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#FDBE55",
    borderWidth: 2,
    position: "absolute",
    top: 14,
    right: 18,
  },
  cloud: {
    position: "absolute",
    backgroundColor: "#E88AA4",
    borderRadius: 30,
    opacity: 0.95,
  },
  cloudLarge: {
    width: 120,
    height: 44,
    left: 18,
    top: 28,
  },
  cloudSmall: {
    width: 90,
    height: 36,
    right: 12,
    top: 70,
    opacity: 0.85,
  },
  cloudPuff: {
    position: "absolute",
    width: 40,
    height: 28,
    backgroundColor: "#E88AA4",
    borderRadius: 20,
    top: -10,
  },
  cloudPuffLeft: {
    left: 12,
  },
  cloudPuffRight: {
    right: 14,
  },
  rainGroup: {
    position: "absolute",
    left: 40,
    top: 72,
    width: 60,
    height: 30,
  },
  rainGroupSmall: {
    position: "absolute",
    right: 30,
    top: 104,
    width: 40,
    height: 24,
  },
  rainDrop: {
    position: "absolute",
    width: 4,
    height: 10,
    borderRadius: 3,
    backgroundColor: "#7FB5D8",
    opacity: 1,
  },
  rainDropMiddle: {
    left: 20,
    height: 12,
  },
  rainDropRight: {
    left: 40,
    height: 9,
  },
  rainDropSmall: {
    width: 3,
    height: 8,
  },
  rainDropSmallMiddle: {
    left: 16,
    height: 7,
  },
  lightning: {
    position: "absolute",
    right: 44,
    top: 112,
  },
  lightningBolt: {
    width: 10,
    height: 24,
    backgroundColor: "#F9D65C",
    borderRadius: 2,
    transform: [{ skewX: "-16deg" }],
  },
  groundLine: {
    position: "absolute",
    bottom: 14,
    width: "88%",
    height: 8,
    backgroundColor: "rgba(88, 132, 92, 0.7)",
    borderRadius: 12,
    alignSelf: "center",
    shadowColor: "rgba(46, 86, 59, 0.45)",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.7,
    shadowRadius: 6,
    elevation: 4,
  },
  treeWrap: {
    position: "absolute",
    bottom: 18,
    width: "100%",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  tree: {
    width: 54,
    height: 90,
    alignItems: "center",
    justifyContent: "flex-end",
  },
  treeTrunk: {
    width: 10,
    height: 36,
    backgroundColor: "#6B4A2B",
    borderRadius: 4,
  },
  treeBranchLeft: {
    position: "absolute",
    bottom: 22,
    left: 10,
    width: 18,
    height: 6,
    backgroundColor: "#6B4A2B",
    borderRadius: 3,
    transform: [{ rotate: "-25deg" }],
  },
  treeBranchRight: {
    position: "absolute",
    bottom: 24,
    right: 10,
    width: 18,
    height: 6,
    backgroundColor: "#6B4A2B",
    borderRadius: 3,
    transform: [{ rotate: "25deg" }],
  },
  treeCrown: {
    position: "absolute",
    bottom: 26,
    width: 44,
    height: 36,
    backgroundColor: "#4B8A5A",
    borderRadius: 22,
  },
});
