import React, { useState } from "react";
import { View, TextInput, TouchableOpacity, Text } from "react-native";

type Props = {
  navigation?: any;
};

export default function AddListingScreen({ navigation }: Props) {
  const [title, setTitle] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [price, setPrice] = useState<string>("");

  const addListing = () => {
    const newListing = {
      title,
      location,
      price: Number(price),
    };

    console.log("Created Listing:", newListing);

    setTitle("");
    setLocation("");
    setPrice("");
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <TextInput
        placeholder="Title"
        value={title}
        onChangeText={setTitle}
        style={{ borderWidth: 1, marginBottom: 10, padding: 10 }}
      />

      <TextInput
        placeholder="Location"
        value={location}
        onChangeText={setLocation}
        style={{ borderWidth: 1, marginBottom: 10, padding: 10 }}
      />

      <TextInput
        placeholder="Price"
        value={price}
        onChangeText={setPrice}
        keyboardType="numeric"
        style={{ borderWidth: 1, marginBottom: 10, padding: 10 }}
      />

      <TouchableOpacity
        onPress={addListing}
        style={{
          backgroundColor: "green",
          padding: 15,
          borderRadius: 10,
        }}
      >
        <Text style={{ color: "white", textAlign: "center" }}>
          Add Listing
        </Text>
      </TouchableOpacity>
    </View>
  );
}
