package main

import (
	"fmt"
	"strings"
)

type Output struct {
	debug  string
	output string
}

func updateOutput(
	racers Racers,
	ordering []RiderOrder,
) Output {
	return Output{
		debug:  toJSON(ordering),
		output: formatRiders(ordering, racers),
	}
}

// Converts a slice of RiderOrder to a JSON-like string format for debugging.
func toJSON(riders []RiderOrder) string {
	var sb strings.Builder
	sb.WriteString("[\n")
	for i, rider := range riders {
		if i > 0 {
			sb.WriteString(",\n")
		}
		sb.WriteString(fmt.Sprintf("  {\"Rider\": \"%s\", \"NumberOfLaps\": %d, \"LastSeen\": %d}", rider.Rider, rider.NumberOfLaps, rider.LastSeen))
	}
	sb.WriteString("\n]")
	return sb.String()
}

// Formats the rider output with their names
func formatRiders(riders []RiderOrder, racerMap map[string]string) string {
	var sb strings.Builder
	for _, rider := range riders {
		name, exists := racerMap[rider.Rider]
		if !exists {
			name = "???"
		}
		sb.WriteString(fmt.Sprintf("%s %s\n", rider.Rider, name))
	}
	return sb.String()
}
