import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { useEffect, useState } from "react";
import { Button, Platform, StyleSheet, Text, View } from "react-native";

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
  watering_level: string;
  watering_frequency_per_day: number;
  watering_time: string;
  water_amount: string;
};

const HARDCODED_SCHEDULES: WateringSchedule[] = [
  {
    city: "Badulla",
    watering_level: "High",
    watering_frequency_per_day: 2,
    watering_time: "00:00 & 00:01",
    water_amount: "400ml + 300ml",
  },
  {
    city: "Colombo",
    watering_level: "Medium",
    watering_frequency_per_day: 1,
    watering_time: "00:05",
    water_amount: "350ml",
  },
  {
    city: "Kandy",
    watering_level: "High",
    watering_frequency_per_day: 2,
    watering_time: "00:06 & 00:07",
    water_amount: "400ml + 350ml",
  },
];

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

async function scheduleWateringReminders(schedule: WateringSchedule) {
  await Notifications.cancelAllScheduledNotificationsAsync();
  const times = parseWateringTimes(schedule.watering_time);

  await Promise.all(
    times.map(({ hour, minute }) =>
      Notifications.scheduleNotificationAsync({
        content: {
          title: "Watering Reminder",
          body: `Time to water in ${schedule.city}. Amount: ${schedule.water_amount}.`,
          data: {
            type: "watering_reminder",
            city: schedule.city,
            watering_level: schedule.watering_level,
          },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour,
          minute,
        },
      }),
    ),
  );
}

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
  const [expoPushToken, setExpoPushToken] = useState("");
  const [wateringSchedule, setWateringSchedule] =
    useState<WateringSchedule | null>(null);
  const [notification, setNotification] = useState<
    Notifications.Notification | undefined
  >(undefined);

  useEffect(() => {
    registerForPushNotificationsAsync()
      .then((token) => setExpoPushToken(token ?? ""))
      .catch((error: any) => setExpoPushToken(`${error}`));

    const loadSchedule = async () => {
      try {
        await Promise.all(
          HARDCODED_SCHEDULES.map((schedule) =>
            scheduleWateringReminders(schedule),
          ),
        );
        setWateringSchedule(HARDCODED_SCHEDULES[0]);
      } catch (error) {
        console.warn("Failed to load watering schedule:", error);
      }
    };

    loadSchedule();

    const notificationListener = Notifications.addNotificationReceivedListener(
      (notification) => {
        setNotification(notification);
      },
    );

    const responseListener =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log(response);
      });

    return () => {
      notificationListener.remove();
      responseListener.remove();
    };
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Alerts</Text>
      <Text style={styles.body}>
        No alerts for your plants. Check back later!
      </Text>

      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "space-around",
        }}
      >
        <Button
          title="Reschedule Watering Reminder"
          onPress={async () => {
            if (wateringSchedule) {
              await scheduleWateringReminders(wateringSchedule);
            }
          }}
        />
      </View>
    </View>
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
});
