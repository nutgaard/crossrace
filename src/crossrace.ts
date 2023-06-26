export interface RiderOrder {
    rider: string;
    numberOfLaps: number;
    lastSeen: number;
}

export function findOrdering(racelog: string): RiderOrder[] {
    const allPasses: string[] = racelog
        .trim()
        .split('\n')
        .flatMap(line => line.split(' '));

    const countedPasses: Record<string, number> = allPasses
        .reduce(countOccurrences, {});

    return Object.keys(countedPasses)
        .map((rider) => ({
            rider,
            numberOfLaps: countedPasses[rider],
            lastSeen: allPasses.lastIndexOf(rider)
        }))
        .sort((riderA, riderB) => {
            const lapsDiff = riderB.numberOfLaps - riderA.numberOfLaps;
            if (lapsDiff > 0) { return lapsDiff; }

            return riderA.lastSeen - riderB.lastSeen;
        });
}

function countOccurrences(acc: Record<string, number>, element: string): Record<string, number> {
    const count = acc[element] ?? 0;
    acc[element] = count + 1;
    return acc;
}
