import useStackHeaderOptions from "@/components/navigation/stackHeaderOptions";
import { Stack } from "expo-router";

export default function HomeLayout() {
  const headerOptions = useStackHeaderOptions();
  return <Stack screenOptions={headerOptions} />;
}
