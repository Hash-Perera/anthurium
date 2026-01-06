// import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
// import { View, TouchableOpacity, StyleSheet } from "react-native";
// import { IconSymbol } from "./ui/icon-symbol";
// import { Colors } from "@/constants/theme";
// import { useColorScheme } from "@/hooks/use-color-scheme";

// export function CustomTabBar({
//   state,
//   descriptors,
//   navigation,
// }: BottomTabBarProps) {
//   const colorScheme = useColorScheme();
//   const colors = Colors[colorScheme ?? "light"];

//   const isHomeFocused = state.index === 0; // Assuming index is the first route

//   return (
//     <View style={styles.container}>
//       <View style={styles.tabBar}>
//         {state.routes.map((route, index) => {
//           if (route.name === "index") return null; // Skip home, render separately

//           const { options } = descriptors[route.key];
//           const label = options.title || route.name;
//           const isFocused = state.index === index;

//           const onPress = () => {
//             const event = navigation.emit({
//               type: "tabPress",
//               target: route.key,
//               canPreventDefault: true,
//             });

//             if (!isFocused && !event.defaultPrevented) {
//               navigation.navigate(route.name);
//             }
//           };

//           return (
//             <TouchableOpacity
//               key={route.key}
//               onPress={onPress}
//               style={styles.tab}
//             >
//               {options.tabBarIcon &&
//                 options.tabBarIcon({
//                   focused: isFocused,
//                   color: isFocused ? colors.tint : colors.tabIconDefault,
//                   size: 28,
//                 })}
//               {/* Optionally add label */}
//             </TouchableOpacity>
//           );
//         })}
//       </View>
//       {/* Floating Home Button */}
//       <TouchableOpacity
//         style={[
//           styles.floatingButton,
//           { backgroundColor: isHomeFocused ? colors.tint : "#ccc" },
//         ]}
//         onPress={() => navigation.navigate("index")}
//       >
//         <IconSymbol size={28} name="house.fill" color="white" />
//       </TouchableOpacity>
//     </View>
//   );
// }

import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { IconSymbol } from "./ui/icon-symbol";

export function CustomTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const homeRouteIndex = state.routes.findIndex(
    (route) => route.name === "home"
  );
  const isHomeFocused = state.index === homeRouteIndex;

  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        {state.routes.map((route, index) => {
          // ✅ Skip Home, render as floating button
          if (route.name === "home") return null;

          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              style={styles.tab}
            >
              {options.tabBarIcon?.({
                focused: isFocused,
                color: isFocused ? colors.tint : colors.tabIconDefault,
                size: 28,
              })}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Floating Home Button */}
      <TouchableOpacity
        style={[
          styles.floatingButton,
          { backgroundColor: isHomeFocused ? colors.tint : "#ccc" },
        ]}
        onPress={() => navigation.navigate("home")}
      >
        <IconSymbol size={28} name="house.fill" color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: "white",
    height: 80,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    justifyContent: "space-around",
    alignItems: "center",
    paddingBottom: 30,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  floatingButton: {
    position: "absolute",
    bottom: 50,
    left: "50%",
    transform: [{ translateX: -30 }],
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
});

export default CustomTabBar;
