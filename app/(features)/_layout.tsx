import { Stack } from "expo-router";

export default function FeatureLayout() {
  return (
    <Stack
      screenOptions={{
        headerBackTitle: "Back",
      }}
    >
      <Stack.Screen
        name="price-predict"
        options={{
          title: "Price Prediction",
        }}
      />
    </Stack>
  );
}
