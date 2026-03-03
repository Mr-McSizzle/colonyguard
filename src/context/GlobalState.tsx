"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface GlobalStateContextType {
    colonies: any[];
    summaryStats: any;
    selectedColony: any | null;
    setSelectedColony: (colony: any | null) => void;
    isLoading: boolean;
    loadDemoData: () => Promise<boolean>;
    pendingUploadFiles: File[];
    setPendingUploadFiles: (files: File[]) => void;
    setColoniesFromPayload: (data: any) => void;
}

const GlobalStateContext = createContext<GlobalStateContextType | undefined>(undefined);

export function GlobalStateProvider({ children }: { children: React.ReactNode }) {
    const [colonies, setColonies] = useState<any[]>([]);
    const [selectedColony, setSelectedColony] = useState<any | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [pendingUploadFiles, setPendingUploadFiles] = useState<File[]>([]);

    // Derived stats could go here later if needed
    const summaryStats = {
        total: colonies.length,
        critical: colonies.filter(c => {
            const metrics = c.metrics || [];
            const latest = metrics[metrics.length - 1] || {};
            return (latest['Colony Instability Index'] || 0) > 60;
        }).length
    };

    const loadDemoData = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/data');
            const data = await response.json();

            if (!response.ok || data.error || !data.colonies) {
                console.error("API Error or Invalid Payload:", data.error || "Missing colonies data");
                return false;
            }

            // Format colonies map to array
            const colsArray = Object.values(data.colonies).map((colony: any) => ({
                ...colony,
                metrics: colony.metrics.sort((a: any, b: any) => (a.Day || 0) - (b.Day || 0))
            }));

            setColonies(colsArray);
            return true;
        } catch (error) {
            console.error("Failed to fetch demo data payload:", error);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const setColoniesFromPayload = (data: any) => {
        if (!data || !data.colonies) {
            setIsLoading(false);
            return;
        }
        const colsArray = Object.values(data.colonies).map((colony: any) => ({
            ...colony,
            metrics: colony.metrics.sort((a: any, b: any) => (a.Day || 0) - (b.Day || 0))
        }));
        setColonies(colsArray);
        setIsLoading(false);
    };

    return (
        <GlobalStateContext.Provider value={{ colonies, summaryStats, selectedColony, setSelectedColony, isLoading, loadDemoData, pendingUploadFiles, setPendingUploadFiles, setColoniesFromPayload }}>
            {children}
        </GlobalStateContext.Provider>
    );
}

export function useGlobalState() {
    const context = useContext(GlobalStateContext);
    if (context === undefined) {
        throw new Error("useGlobalState must be used within a GlobalStateProvider");
    }
    return context;
}
