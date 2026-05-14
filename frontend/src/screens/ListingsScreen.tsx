import React, { useState } from "react";
import { View, Text, FlatList, TouchableOpacity } from "react-native";

type Listing = {
  id: string;
  title: string;
  price: number;
  location: string;
};

export default function ListingsScreen() {
  const [listings, setListings] = useState<Listing[]>([
    { id: "1", title: "Farm Lot", price: 500000, location: "Aklan" },
    { id: "2", title: "Beach Land", price: 2000000, location: "Boracay" },
  ]);

  const deleteListing = (id: string) => {
    setListings(listings.filter((item) => item.id !== id));
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 22, fontWeight: "bold" }}>
        Listings
      </Text>

      <FlatList
        data={listings}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View
            style={{
              padding: 15,
              marginTop: 10,
              backgroundColor: "#e8f5e9",
              borderRadius: 10,
            }}
          >
            <Text style={{ fontWeight: "bold" }}>{item.title}</Text>
            <Text>{item.location}</Text>
            <Text>₱{item.price}</Text>

            <TouchableOpacity
              onPress={() => deleteListing(item.id)}
              style={{
                marginTop: 10,
                backgroundColor: "red",
                padding: 8,
                borderRadius: 6,
              }}
            >
              <Text style={{ color: "white" }}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}