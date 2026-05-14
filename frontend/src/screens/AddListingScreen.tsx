import React, { useState } from "react";
import { View, TextInput, TouchableOpacity, Text } from "react-native";

type Listing = {
  title: string;
};

export default function EditListingScreen() {
  const [listing, setListing] = useState<Listing>({
    title: "Old Title",
  });

  const updateListing = () => {
    console.log("Updated:", listing);
  };

  return (
    <View style={{ padding: 20 }}>
      <TextInput
        value={listing.title}
        onChangeText={(text) => setListing({ title: text })}
        style={{ borderWidth: 1, padding: 10 }}
      />

      <TouchableOpacity
        onPress={updateListing}
        style={{
          backgroundColor: "orange",
          padding: 15,
          marginTop: 10,
        }}
      >
        <Text style={{ color: "white" }}>Update</Text>
      </TouchableOpacity>
    </View>
  );
}