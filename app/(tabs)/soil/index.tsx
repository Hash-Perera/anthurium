import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons } from "@expo/vector-icons";
import { get, Service } from "@lib/api-client";
import * as Location from "expo-location";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import MapView, { Marker } from "react-native-maps";

type SoilData = {
  location: {
    type: "Point";
    coordinates: [number, number]; // [longitude, latitude]
  };
  soilMoisture: number;
  humidity: number;
  temperature: number;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  isHealthy: boolean;
  timestamp: string;
};

export default function Soil() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const mapRef = useRef<MapView | null>(null);
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [soilData, setSoilData] = useState<SoilData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      // 1. Request Permission
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
        return;
      }

      // 2. Get Current Location
      let userLocation = await Location.getCurrentPositionAsync({});
      setLocation(userLocation.coords);
    })();
  }, []);

  // Get latest data every 30 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const data = await get<SoilData>(Service.SOIL, `api/readings/latest`);
        setSoilData(data);
        setLocation({
          latitude: data.location.coordinates[1],
          longitude: data.location.coordinates[0],
        });
      } catch (error) {
        console.error("Failed to fetch soil data:", error);
      } finally {
        setIsLoading(false);
      }
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!location) {
      return;
    }

    mapRef.current?.animateToRegion(
      {
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      },
      500,
    );
  }, [location]);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {location ? (
        <MapView
          ref={mapRef}
          style={styles.map}
          // Use PROVIDER_GOOGLE for Android (requires API key)
          // or leave empty for Apple Maps on iOS
          initialRegion={{
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          showsUserLocation={true}
        >
          <Marker
            coordinate={{
              latitude: location.latitude,
              longitude: location.longitude,
            }}
            title="You are here"
          />
        </MapView>
      ) : (
        <View style={styles.loading}>
          <Text style={{ color: theme.text }}>
            {errorMsg ? errorMsg : "Fetching your location..."}
          </Text>
        </View>
      )}
      <View
        style={[
          styles.detailsCard,
          { backgroundColor: theme.white, borderColor: theme.transparent },
        ]}
      >
        <Text style={[styles.detailsTitle, { color: theme.text }]}>
          Soil Details
        </Text>
        {soilData ? (
          <View style={styles.detailsGrid}>
            <View style={styles.detailRow}>
              <View style={styles.detailLeft}>
                <Ionicons name="water-outline" size={18} color={theme.tint} />
                <Text style={[styles.detailLabel, { color: theme.icon }]}>
                  Soil Moisture
                </Text>
              </View>
              <Text style={[styles.detailValue, { color: theme.text }]}>
                {soilData.soilMoisture}%
              </Text>
            </View>
            <View style={styles.detailRow}>
              <View style={styles.detailLeft}>
                <Ionicons name="rainy-outline" size={18} color={theme.tint} />
                <Text style={[styles.detailLabel, { color: theme.icon }]}>
                  Humidity
                </Text>
              </View>
              <Text style={[styles.detailValue, { color: theme.text }]}>
                {soilData.humidity}%
              </Text>
            </View>
            <View style={styles.detailRow}>
              <View style={styles.detailLeft}>
                <Ionicons
                  name="thermometer-outline"
                  size={18}
                  color={theme.tint}
                />
                <Text style={[styles.detailLabel, { color: theme.icon }]}>
                  Temperature
                </Text>
              </View>
              <Text style={[styles.detailValue, { color: theme.text }]}>
                {soilData.temperature}°C
              </Text>
            </View>
            <View style={styles.detailRow}>
              <View style={styles.detailLeft}>
                <Ionicons name="leaf-outline" size={18} color={theme.tint} />
                <Text style={[styles.detailLabel, { color: theme.icon }]}>
                  Nitrogen
                </Text>
              </View>
              <Text style={[styles.detailValue, { color: theme.text }]}>
                {soilData.nitrogen}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <View style={styles.detailLeft}>
                <Ionicons name="flask-outline" size={18} color={theme.tint} />
                <Text style={[styles.detailLabel, { color: theme.icon }]}>
                  Phosphorus
                </Text>
              </View>
              <Text style={[styles.detailValue, { color: theme.text }]}>
                {soilData.phosphorus}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <View style={styles.detailLeft}>
                <Ionicons
                  name="analytics-outline"
                  size={18}
                  color={theme.tint}
                />
                <Text style={[styles.detailLabel, { color: theme.icon }]}>
                  Potassium
                </Text>
              </View>
              <Text style={[styles.detailValue, { color: theme.text }]}>
                {soilData.potassium}
              </Text>
            </View>
          </View>
        ) : (
          <Text style={[styles.detailsPlaceholder, { color: theme.icon }]}>
            {isLoading ? "Loading soil details..." : "No soil data yet."}
          </Text>
        )}
      </View>

      {/* Add a button to navigate to recommendations screen with current soil data as query params */}
      {soilData && (
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              router.push({
                pathname: "/soil/recommendation",
                params: { soilData: JSON.stringify(soilData) },
              });
            }}
          >
            <Text style={styles.buttonText}>View Recommendations</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { width: "100%", height: "50%" },
  loading: { flex: 1, justifyContent: "center", alignItems: "center" },
  detailsCard: {
    margin: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: "#000000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
  },
  detailsGrid: {
    gap: 8,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  detailLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: "500",
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "600",
  },
  detailsPlaceholder: {
    fontSize: 14,
  },
  buttonContainer: {
    position: "absolute",
    bottom: 32,
    left: 16,
    right: 16,
    alignItems: "center",
  },
  button: {
    backgroundColor: Colors.light.tint,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    shadowColor: "#000000",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  buttonText: {
    color: Colors.light.white,
    fontSize: 16,
    fontWeight: "600",
  },
});
