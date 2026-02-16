import DropdownField from "@/components/form/Dropdown";
import { Ionicons } from "@expo/vector-icons";
import { get } from "@lib/api-client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Formik } from "formik";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import * as Yup from "yup";
import { Colors } from "../../../app-example/constants/theme";
import { cityOptions } from "./forecast";

const CitySchema = Yup.object().shape({
  city: Yup.string().required("Please select an option"),
});

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

function handleRegistrationError(errorMessage: string) {
  alert(errorMessage);
  throw new Error(errorMessage);
}

type WateringSchedule = {
  city: string;
  weather: {
    temperature_c: number;
    humidity_pct: number;
    rainfall_mm: number;
    wind_kmph: number;
  };
  watering_level: string;
  watering_frequency_per_day: number;
  watering_time: string;
  water_amount: string;
};

type ReminderEntry = {
  id: string;
  city: string;
  time: string;
  amount: string;
  watering_level: string;
  notification_id: string;
};

const REMINDER_STORAGE_KEY = "watering_reminders";

const parseWateringTimes = (wateringTime: string) => {
  const times = wateringTime.split(/&|,/).map((time) => time.trim());
  return times
    .map((time) => {
      const match = time.match(/^(\d{1,2}):(\d{2})$/);
      if (!match) {
        return null;
      }
      const hour = Number(match[1]);
      const minute = Number(match[2]);
      if (Number.isNaN(hour) || Number.isNaN(minute)) {
        return null;
      }
      return { hour, minute };
    })
    .filter((time): time is { hour: number; minute: number } => !!time);
};

const parseWateringAmounts = (wateringAmount: string) =>
  wateringAmount
    .split(/&|,|\+/)
    .map((amount) => amount.trim())
    .filter((amount) => amount.length > 0);

async function registerForPushNotificationsAsync() {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") {
      handleRegistrationError(
        "Permission not granted to get push token for push notification!",
      );
      return;
    }
    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ??
      Constants?.easConfig?.projectId;
    if (!projectId) {
      handleRegistrationError("Project ID not found");
    }
    try {
      const pushTokenString = (await Notifications.getExpoPushTokenAsync())
        .data;

      console.log(pushTokenString);
      return pushTokenString;
    } catch (e: unknown) {
      handleRegistrationError(`${e}`);
    }
  } else {
    handleRegistrationError("Must use physical device for push notifications");
  }
}

export default function AlertsScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const [expoPushToken, setExpoPushToken] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [wateringData, setWateringData] = useState<WateringSchedule | null>(
    null,
  );
  const [reminderList, setReminderList] = useState<ReminderEntry[]>([]);

  useEffect(() => {
    registerForPushNotificationsAsync()
      .then((token) => setExpoPushToken(token ?? ""))
      .catch((error: any) => setExpoPushToken(`${error}`));
  }, []);

  useEffect(() => {
    const loadReminders = async () => {
      try {
        const stored = await AsyncStorage.getItem(REMINDER_STORAGE_KEY);
        if (stored) {
          setReminderList(JSON.parse(stored) as ReminderEntry[]);
        }
      } catch (error) {
        console.warn("Failed to load reminders:", error);
      }
    };

    loadReminders();
  }, []);

  const handleCityChange = async (
    value: string,
    setFieldValue: (field: string, value: string) => void,
  ) => {
    setFieldValue("city", value);
    setIsLoading(true);

    try {
      const data = await get<WateringSchedule>(
        `watering/recommendation?city=${encodeURIComponent(value)}`,
      );
      setWateringData(data);
    } catch (error) {
      console.warn("Failed to fetch watering recommendation:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const addToReminderList = async () => {
    if (!wateringData) {
      return;
    }

    const times = parseWateringTimes(wateringData.watering_time);
    const amounts = parseWateringAmounts(wateringData.water_amount);

    if (times.length === 0) {
      console.warn("No valid watering times to schedule.");
      return;
    }

    try {
      const newEntries: ReminderEntry[] = [];

      for (let index = 0; index < times.length; index += 1) {
        const { hour, minute } = times[index];

        const amount = amounts[index] ?? wateringData.water_amount;
        const notificationId = await Notifications.scheduleNotificationAsync({
          content: {
            title: "Watering Reminder",
            body: `Time to water in ${wateringData.city}. Amount: ${amount}.`,
            data: {
              type: "watering_reminder",
              city: wateringData.city,
              watering_level: wateringData.watering_level,
            },
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DAILY,
            hour,
            minute,
          },
        });

        newEntries.push({
          id: `${wateringData.city}-${hour}-${minute}-${Date.now()}-${index}`,
          city: wateringData.city,
          time: `${String(hour).padStart(2, "0")}:${String(minute).padStart(
            2,
            "0",
          )}`,
          amount,
          watering_level: wateringData.watering_level,
          notification_id: notificationId,
        });
      }

      const updated = [...reminderList, ...newEntries];
      setReminderList(updated);
      await AsyncStorage.setItem(REMINDER_STORAGE_KEY, JSON.stringify(updated));
      setWateringData(null);
    } catch (error) {
      console.warn("Failed to add watering reminders:", error);
    }
  };

  const clearAllReminders = async () => {
    try {
      await Promise.all(
        reminderList.map((item) =>
          Notifications.cancelScheduledNotificationAsync(item.notification_id),
        ),
      );
      setReminderList([]);
      await AsyncStorage.removeItem(REMINDER_STORAGE_KEY);
    } catch (error) {
      console.warn("Failed to clear reminders:", error);
    }
  };

  const deleteReminder = async (id: string) => {
    try {
      const reminder = reminderList.find((item) => item.id === id);
      if (reminder) {
        await Notifications.cancelScheduledNotificationAsync(
          reminder.notification_id,
        );
      }
      const updated = reminderList.filter((item) => item.id !== id);
      setReminderList(updated);
      await AsyncStorage.setItem(REMINDER_STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
      console.warn("Failed to delete reminder:", error);
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.content}
    >
      <Text style={[styles.title, { color: theme.text }]}>Watering</Text>
      <Text style={[styles.subtitle, { color: theme.icon }]}>
        Soil moisture
      </Text>
      <Text style={[styles.body, { color: theme.text }]}>
        Moisture trends and suggested watering windows will appear here.
      </Text>

      <Formik
        initialValues={{ city: "" }}
        validationSchema={CitySchema}
        onSubmit={(values) => {
          console.log("Selected city:", values.city);
        }}
      >
        {({ values, errors, touched, setFieldValue, handleSubmit }) => (
          <DropdownField
            value={values.city}
            placeholder="Select a city"
            options={cityOptions}
            error={touched.city ? errors.city : undefined}
            onChangeSelect={(value: string) =>
              handleCityChange(value, setFieldValue)
            }
          />
        )}
      </Formik>
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={theme.tint} />
          <Text style={[styles.loadingText, { color: theme.icon }]}>
            Loading watering data...
          </Text>
        </View>
      ) : (
        wateringData && (
          <View
            style={[
              styles.card,
              {
                backgroundColor: theme.background,
                borderColor: theme.tint,
              },
            ]}
          >
            <View style={styles.sectionRow}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                Weather
              </Text>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Add to notification list"
                style={[
                  styles.notificationButton,
                  { backgroundColor: `${theme.tint}1A` },
                ]}
                onPress={addToReminderList}
              >
                <Ionicons
                  name="notifications-outline"
                  size={24}
                  color={theme.tint}
                />
              </TouchableOpacity>
            </View>
            <View style={styles.weatherGrid}>
              <View style={styles.weatherItem}>
                <View
                  style={[
                    styles.weatherIconBox,
                    { backgroundColor: "rgba(245, 165, 36, 0.16)" },
                  ]}
                >
                  <Ionicons
                    name="thermometer-outline"
                    size={20}
                    color="#F5A524"
                  />
                </View>
                <Text style={[styles.weatherLabel, { color: theme.icon }]}>
                  Temperature
                </Text>
                <Text style={[styles.weatherValue, { color: theme.text }]}>
                  {wateringData.weather.temperature_c}°C
                </Text>
              </View>
              <View style={styles.weatherItem}>
                <View
                  style={[
                    styles.weatherIconBox,
                    { backgroundColor: "rgba(76, 142, 218, 0.16)" },
                  ]}
                >
                  <Ionicons name="water-outline" size={20} color="#4C8EDA" />
                </View>
                <Text style={[styles.weatherLabel, { color: theme.icon }]}>
                  Humidity
                </Text>
                <Text style={[styles.weatherValue, { color: theme.text }]}>
                  {wateringData.weather.humidity_pct}%
                </Text>
              </View>
              <View style={styles.weatherItem}>
                <View
                  style={[
                    styles.weatherIconBox,
                    { backgroundColor: "rgba(88, 183, 211, 0.16)" },
                  ]}
                >
                  <Ionicons
                    name="cloud-download-outline"
                    size={20}
                    color="#58B7D3"
                  />
                </View>
                <Text style={[styles.weatherLabel, { color: theme.icon }]}>
                  Rainfall
                </Text>
                <Text style={[styles.weatherValue, { color: theme.text }]}>
                  {wateringData.weather.rainfall_mm}mm
                </Text>
              </View>
              <View style={styles.weatherItem}>
                <View
                  style={[
                    styles.weatherIconBox,
                    { backgroundColor: "rgba(106, 127, 155, 0.16)" },
                  ]}
                >
                  <Ionicons
                    name="speedometer-outline"
                    size={20}
                    color="#6A7F9B"
                  />
                </View>
                <Text style={[styles.weatherLabel, { color: theme.icon }]}>
                  Wind
                </Text>
                <Text style={[styles.weatherValue, { color: theme.text }]}>
                  {wateringData.weather.wind_kmph} km/h
                </Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.sectionRow}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                Watering Recomndation
              </Text>
            </View>
            <View style={styles.wateringRow}>
              <View style={styles.wateringItem}>
                <Text style={[styles.wateringLabel, { color: theme.icon }]}>
                  Level
                </Text>
                <View
                  style={[
                    styles.levelBadge,
                    {
                      backgroundColor:
                        wateringData.watering_level === "High"
                          ? "rgba(232, 138, 164, 0.16)"
                          : "rgba(76, 142, 218, 0.16)",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.levelText,
                      {
                        color:
                          wateringData.watering_level === "High"
                            ? "#E88AA4"
                            : "#4C8EDA",
                      },
                    ]}
                  >
                    {wateringData.watering_level}
                  </Text>
                </View>
              </View>
              <View style={styles.wateringItem}>
                <Text style={[styles.wateringLabel, { color: theme.icon }]}>
                  Frequency
                </Text>
                <Text style={[styles.wateringValue, { color: theme.text }]}>
                  {wateringData.watering_frequency_per_day}x per day
                </Text>
              </View>
            </View>
            <View style={styles.wateringRow}>
              <View style={styles.wateringItem}>
                <Text style={[styles.wateringLabel, { color: theme.icon }]}>
                  Time
                </Text>
                <Text style={[styles.wateringValue, { color: theme.text }]}>
                  {wateringData.watering_time}
                </Text>
              </View>
              <View style={styles.wateringItem}>
                <Text style={[styles.wateringLabel, { color: theme.icon }]}>
                  Amount
                </Text>
                <Text style={[styles.wateringValue, { color: theme.text }]}>
                  {wateringData.water_amount}
                </Text>
              </View>
            </View>
          </View>
        )
      )}
      {reminderList.length > 0 && (
        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.background,
              borderColor: theme.tint,
            },
          ]}
        >
          <View style={styles.sectionRow}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Notification List
            </Text>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Clear all reminders"
              style={[
                styles.clearButton,
                { backgroundColor: "rgba(232, 138, 164, 0.16)" },
              ]}
              onPress={clearAllReminders}
            >
              <Ionicons name="trash-outline" size={18} color="#E88AA4" />
            </TouchableOpacity>
          </View>
          {reminderList.map((item) => (
            <View key={item.id} style={styles.reminderRow}>
              <View style={styles.reminderInfo}>
                <Text style={[styles.reminderTitle, { color: theme.text }]}>
                  {item.city} - {item.time}
                </Text>
                <Text style={[styles.reminderMeta, { color: theme.icon }]}>
                  {item.watering_level} · {item.amount}
                </Text>
              </View>
              <View style={styles.reminderActions}>
                <Ionicons name="notifications" size={16} color={theme.tint} />
                <TouchableOpacity
                  accessibilityRole="button"
                  accessibilityLabel="Delete reminder"
                  onPress={() => deleteReminder(item.id)}
                >
                  <Ionicons name="trash-outline" size={16} color="#E88AA4" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  content: {
    paddingBottom: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 18,
  },
  body: {
    fontSize: 14,
    lineHeight: 20,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 320,
    flexDirection: "row",
    gap: 10,
  },
  loadingText: {
    fontSize: 13,
    fontWeight: "600",
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E8E8E8",
    padding: 16,
    marginTop: 20,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 3,
    overflow: "hidden",
  },
  cardAccent: {
    height: 6,
    borderRadius: 999,
    backgroundColor: "#E88AA4",
    marginBottom: 16,
  },
  sectionRow: {
    marginBottom: 16,
    alignItems: "center",
    justifyContent: "space-between",
    flexDirection: "row",
  },

  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
  },
  weatherGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  weatherItem: {
    flex: 1,
    alignItems: "center",
  },
  weatherIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  weatherLabel: {
    fontSize: 11,
    fontWeight: "600",
    marginBottom: 4,
  },
  weatherValue: {
    fontSize: 12,
    fontWeight: "700",
  },
  divider: {
    height: 1,
    backgroundColor: "#E8E8E8",
    marginVertical: 16,
  },
  wateringRow: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 12,
  },
  wateringItem: {
    flex: 1,
  },
  wateringLabel: {
    fontSize: 11,
    fontWeight: "600",
    marginBottom: 6,
  },
  levelBadge: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignItems: "center",
  },
  levelText: {
    fontSize: 12,
    fontWeight: "700",
  },
  wateringValue: {
    fontSize: 13,
    fontWeight: "600",
  },
  notificationButton: {
    padding: 6,
    borderRadius: 999,
  },
  clearButton: {
    padding: 6,
    borderRadius: 999,
  },
  reminderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E8E8E8",
  },
  reminderInfo: {
    flex: 1,
  },
  reminderActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  reminderTitle: {
    fontSize: 13,
    fontWeight: "700",
  },
  reminderMeta: {
    marginTop: 4,
    fontSize: 11,
    fontWeight: "600",
  },
});
