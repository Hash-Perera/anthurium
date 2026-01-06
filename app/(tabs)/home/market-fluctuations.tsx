import { Dimensions, StyleSheet, Text, View } from "react-native";
import { LineChart } from "react-native-chart-kit";

const screenWidth = Dimensions.get("window").width;

export default function MarketFluctuations() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dynamic Anthurium Price Index (DAPI)</Text>

      <LineChart
        data={{
          labels: [
            "2023-01",
            "2023-02",
            "2023-03",
            "2023-04",
            "2023-05",
            "2023-06",
            "2023-07",
            "2023-08",
            "2023-09",
            "2023-10",
            "2023-11",
          ],
          datasets: [
            {
              data: [100, 52, 68, 74, 92, 76, 88, 70, 78, 69, 88],
            },
          ],
        }}
        width={screenWidth - 32}
        height={240}
        bezier
        chartConfig={{
          backgroundColor: "#ffffff",
          backgroundGradientFrom: "#ffffff",
          backgroundGradientTo: "#ffffff",
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(34, 139, 34, ${opacity})`,
          labelColor: () => "#333",
          propsForDots: {
            r: "4",
            strokeWidth: "2",
            stroke: "#228B22",
          },
        }}
        style={styles.chart}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 30,
    paddingHorizontal: 16,
  },
  title: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
  },
  chart: {
    borderRadius: 12,
  },
});
