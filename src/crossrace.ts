export interface RiderOrder {
    rider: string;
    numberOfLaps: number;
    lastSeen: number;
}

export function parseRacers(racers: string): Record<string, string> {
    return racers
        .replace(/\t/g, ' ')
        .trim()
        .split('\n')
        .map(line => line.trim().split(' '))
        .reduce((acc, [id, ...name]) => {
            acc[id] = name.join(' ');
            return acc;
        }, {} as Record<string, string>)
}

export function findOrdering(racelog: string): RiderOrder[] {
    const allPasses: string[] = racelog
        .replace(/\t/g, ' ')
        .trim()
        .split('\n')
        .flatMap(line => line.trim().split(' '));

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
            if (lapsDiff !== 0) { return lapsDiff; }

            return riderA.lastSeen - riderB.lastSeen;
        });
}

function countOccurrences(acc: Record<string, number>, element: string): Record<string, number> {
    const count = acc[element] ?? 0;
    acc[element] = count + 1;
    return acc;
}