import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { Input } from "@verifyme/ui";
import { Button } from "@verifyme/ui";
import { Badge, tierToVariant } from "@verifyme/ui";

// TODO: Wire up to tRPC hirer.searchWorkers

interface WorkerResult {
  id: string;
  fullName: string;
  skills: string[];
  experienceYears: number;
  tier: "unverified" | "basic" | "enhanced";
}

/**
 * Worker search screen with filters.
 * Hirers can search by name, skills, languages, and experience.
 *
 * TODO: Fetch real search results from API.
 * TODO: Add filter dropdowns for skills, languages, tier.
 * TODO: Add pagination / infinite scroll.
 */
export default function SearchScreen() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<WorkerResult[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    try {
      // TODO: Call hirer.searchWorkers via tRPC
      // const { workers } = await trpc.hirer.searchWorkers.query({
      //   query,
      //   filters: { ... },
      // });
      // setResults(workers);
      setResults([]); // Placeholder
    } finally {
      setLoading(false);
    }
  };

  const renderWorker = ({ item }: { item: WorkerResult }) => (
    <TouchableOpacity
      style={styles.workerCard}
      onPress={() => {
        // TODO: Navigate to worker trust card view with consent check
      }}
    >
      <View style={styles.workerHeader}>
        <Text style={styles.workerName}>{item.fullName}</Text>
        <Badge
          label={item.tier}
          variant={tierToVariant(item.tier)}
        />
      </View>
      <Text style={styles.workerDetails}>
        {item.experienceYears} years experience
      </Text>
      <Text style={styles.workerSkills}>
        {item.skills.join(", ") || "No skills listed"}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Search Workers</Text>

      <View style={styles.searchBar}>
        <Input
          placeholder="Search by name or skill..."
          value={query}
          onChangeText={setQuery}
          containerStyle={styles.searchInput}
        />
        <Button
          title="Search"
          onPress={handleSearch}
          loading={loading}
        />
      </View>

      {/* TODO: Add filter chips for skills, languages, verification tier */}
      <View style={styles.filters}>
        <Text style={styles.filterLabel}>
          Filters — TODO: Implement filter chips
        </Text>
      </View>

      {results.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>
            {query
              ? "No workers found matching your search"
              : "Enter a search query to find workers"}
          </Text>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          renderItem={renderWorker}
          style={styles.list}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    marginBottom: 0,
  },
  filters: {
    marginBottom: 16,
  },
  filterLabel: {
    color: "#9CA3AF",
    fontSize: 13,
  },
  list: {
    flex: 1,
  },
  workerCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  workerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  workerName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
  },
  workerDetails: {
    fontSize: 14,
    color: "#6B7280",
  },
  workerSkills: {
    fontSize: 13,
    color: "#9CA3AF",
    marginTop: 4,
  },
  empty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 64,
  },
  emptyText: {
    fontSize: 16,
    color: "#9CA3AF",
    textAlign: "center",
  },
});
