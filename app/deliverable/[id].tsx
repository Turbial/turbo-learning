// ─── Deliverable submission screen (Phase 2) ───

import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function DeliverableScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Deliverable submission — coming in Phase 2</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FAF8F5",
  },
  text: {
    fontSize: 16,
    color: "#A09484",
  },
});
