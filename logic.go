package main

import (
	"sort"
	"strings"
)

type Racers = map[string]string

func parseRacers(racers string) *Racers {
	// Replace tabs with spaces and trim the string
	racers = strings.ReplaceAll(racers, "\t", " ")
	racers = strings.TrimSpace(racers)

	// Split the string by newline and iterate over each line
	lines := strings.Split(racers, "\n")
	racerMap := make(map[string]string)

	for _, line := range lines {
		// Trim each line and split it by spaces
		parts := strings.Fields(strings.TrimSpace(line))
		if len(parts) > 1 {
			// The first part is the ID and the rest is the name
			id := parts[0]
			name := strings.Join(parts[1:], " ")
			racerMap[id] = name
		}
	}

	return &racerMap
}

type RiderOrder struct {
	Rider        string
	NumberOfLaps int
	LastSeen     int
}

func findOrdering(racelog string) []RiderOrder {
	racelog = strings.ReplaceAll(racelog, "\t", " ")
	racelog = strings.TrimSpace(racelog)

	allPasses := strings.Fields(racelog)

	countedPasses := countOccurrences(allPasses)

	var riderOrders []RiderOrder
	for rider, laps := range countedPasses {
		riderOrders = append(riderOrders, RiderOrder{
			Rider:        rider,
			NumberOfLaps: laps,
			LastSeen:     lastIndexOf(allPasses, rider),
		})
	}

	sort.Slice(riderOrders, func(i, j int) bool {
		if riderOrders[i].NumberOfLaps != riderOrders[j].NumberOfLaps {
			return riderOrders[j].NumberOfLaps < riderOrders[i].NumberOfLaps
		}
		return riderOrders[i].LastSeen < riderOrders[j].LastSeen
	})

	return riderOrders
}

func countOccurrences(elements []string) map[string]int {
	counts := make(map[string]int)
	for _, element := range elements {
		counts[element]++
	}
	return counts
}

func lastIndexOf(slice []string, item string) int {
	for i := len(slice) - 1; i >= 0; i-- {
		if slice[i] == item {
			return i
		}
	}
	return -1
}
