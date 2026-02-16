import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { TouchableOpacity, View } from "react-native";

export default function useStackHeaderOptions() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const HeaderIcons = () => (
    <View style={{ flexDirection: "row", gap: 16, marginRight: 16 }}>
      <TouchableOpacity>
        <IconSymbol size={24} name="bell.fill" color={colors.white} />
      </TouchableOpacity>
      <TouchableOpacity>
        <IconSymbol size={24} name="person.circle.fill" color={colors.white} />
      </TouchableOpacity>
    </View>
  );

  return {
    headerShown: true,
    headerTitle: "",
    headerStyle: { backgroundColor: colors.tint },
    headerTintColor: colors.transparent,
    headerRight: () => <HeaderIcons />,
  };
}
