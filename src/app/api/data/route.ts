import { promises as fs } from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';
import Papa from 'papaparse';

export async function GET() {
    try {
        const trackingPath = path.join(process.cwd(), 'genesis_one_ipsc_dataset.xlsx - Colony Tracking Data.csv');

        // Read file
        const trackingRaw = await fs.readFile(trackingPath, 'utf-8');

        // Parse Tracking Data
        // Skip title row containing "GENESIS ONE"
        let trackingLines = trackingRaw.split('\n');
        if (trackingLines.length > 0 && trackingLines[0].includes('GENESIS ONE')) {
            trackingLines.shift();
        }
        const cleanTrackingCsv = trackingLines.join('\n');

        const parsedTracking = Papa.parse(cleanTrackingCsv, {
            header: true,
            skipEmptyLines: true,
            dynamicTyping: true, // Automatically parse numbers
        });

        // Group Tracking Data
        const coloniesMap = new Map<string, any>();
        const rawRecords = parsedTracking.data as any[];

        rawRecords.forEach((record) => {
            const colonyId = record['Colony ID'];
            if (!colonyId) return;

            // Enforce float parsing for specific UI columns just in case dynamicTyping caught strings
            const parsedRecord = {
                ...record,
                'Compactness': parseFloat(record['Compactness']) || 0,
                'Entropy': parseFloat(record['Entropy']) || 0,
                'Colony Instability Index': parseFloat(record['Colony Instability Index']) || 0,
                'Day': parseFloat(record['Day']) || 0
            };

            const { 'Colony ID': _, ...metrics } = parsedRecord;

            if (!coloniesMap.has(colonyId)) {
                coloniesMap.set(colonyId, {
                    id: colonyId,
                    metrics: []
                });
            }
            coloniesMap.get(colonyId)?.metrics.push(metrics);
        });

        // We can omit parsing the summary CSV since GlobalState derives it locally
        const summaryData = {};

        // Serialize output
        const output = {
            colonies: Object.fromEntries(coloniesMap),
            summary: summaryData
        };

        return NextResponse.json(output);

    } catch (error) {
        console.error('Failed to parse data pipeline:', error);
        return NextResponse.json(
            { error: 'Failed to ingest underlying CSV datasets' },
            { status: 500 }
        );
    }
}
