import { NextResponse } from 'next/server';
import { getColonyData } from '@/utils/parseColonyData';

export async function GET() {
    try {
        const colonies = await getColonyData();
        return NextResponse.json(colonies);
    } catch (error) {
        console.error('Failed to parse colony data:', error);
        return NextResponse.json(
            { error: 'Failed to process colony dataset' },
            { status: 500 }
        );
    }
}
