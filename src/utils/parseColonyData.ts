import { promises as fs } from 'fs';
import path from 'path';
import Papa from 'papaparse';

export interface ColonyRecord {
    'Colony ID': string;
    'Stress Condition': string;
    'Day': number;
    'Growth Start Day': number;
    'Diameter um': number;
    'Area um2': number;
    'Compactness': number;
    'Perimeter um': number;
    'Shape Factor': number;
    'Inner Radius um': number;
    'Equiv Radius um': number;
    'Rod Like Width um': number;
    'Mean Intensity': number;
    'Median Intensity': number;
    'StdDev Intensity': number;
    'CV Intensity': number;
    'Correlation': number;
    'Energy': number;
    'Entropy': number;
    'Homogeneity': number;
    'Inertia': number;
    'Colony Instability Index': number;
    'Size Classification': string;
    'Drift Risk': string;
    'OCT3 4 Staining Rate': string | number;
    'rBC2LCN Staining Rate': string | number;
    [key: string]: any;
}

export interface GroupedColony {
    id: string;
    metrics: Omit<ColonyRecord, 'Colony ID'>[];
}

export async function getColonyData(): Promise<GroupedColony[]> {
    // Construct the absolute path to the CSV file
    const csvFilePath = path.join(process.cwd(), 'genesis_one_ipsc_dataset.xlsx - Colony Tracking Data.csv');

    // Read the CSV file content
    const fileContent = await fs.readFile(csvFilePath, 'utf-8');

    // The first line contains the title, we skip it
    const lines = fileContent.split('\n');
    if (lines.length > 0 && lines[0].includes('GENESIS ONE')) {
        lines.shift();
    }
    const cleanCsv = lines.join('\n');

    // Parse using PapaParse
    const parsed = Papa.parse(cleanCsv, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true, // Automatically parse numbers and booleans
    });

    const rawRecords = parsed.data as ColonyRecord[];

    // Group by Colony ID
    const groupedMap = new Map<string, GroupedColony>();

    rawRecords.forEach((record) => {
        const colonyId = record['Colony ID'];
        if (!colonyId) return; // Skip if no ID

        // Remove ID from the metrics object for cleaner output
        const { 'Colony ID': _, ...metrics } = record;

        if (!groupedMap.has(colonyId)) {
            groupedMap.set(colonyId, {
                id: colonyId,
                metrics: []
            });
        }

        groupedMap.get(colonyId)?.metrics.push(metrics);
    });

    // Sort metrics by Day to ensure logical sequence
    const groupedArray = Array.from(groupedMap.values()).map(colony => ({
        ...colony,
        metrics: colony.metrics.sort((a, b) => (a.Day || 0) - (b.Day || 0))
    }));

    return groupedArray;
}
