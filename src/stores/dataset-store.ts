import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { Upload, ParsedSpreadsheet, ColumnStats } from "@/types";

interface DatasetState {
  // Datasets list
  datasets: Upload[];
  setDatasets: (datasets: Upload[]) => void;
  addDataset: (dataset: Upload) => void;
  updateDataset: (id: string, updates: Partial<Upload>) => void;
  removeDataset: (id: string) => void;

  // Current dataset data
  currentData: ParsedSpreadsheet | null;
  setCurrentData: (data: ParsedSpreadsheet | null) => void;

  // Column statistics
  columnStats: ColumnStats[];
  setColumnStats: (stats: ColumnStats[]) => void;

  // Selected columns for analysis
  selectedColumns: string[];
  setSelectedColumns: (columns: string[]) => void;
  toggleColumn: (column: string) => void;
  selectAllColumns: () => void;
  clearSelectedColumns: () => void;

  // Upload state
  uploadProgress: number;
  setUploadProgress: (progress: number) => void;
  isUploading: boolean;
  setIsUploading: (uploading: boolean) => void;

  // Analysis state
  isAnalyzing: boolean;
  setIsAnalyzing: (analyzing: boolean) => void;

  // Filters
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  sortOrder: "asc" | "desc";
  setSortOrder: (order: "asc" | "desc") => void;

  // Computed getters
  getDatasetById: (id: string) => Upload | undefined;
  getFilteredDatasets: () => Upload[];
}

export const useDatasetStore = create<DatasetState>()(
  devtools(
    (set, get) => ({
      // Datasets
      datasets: [],
      setDatasets: (datasets) => set({ datasets }),
      addDataset: (dataset) => set({ datasets: [...get().datasets, dataset] }),
      updateDataset: (id, updates) =>
        set({
          datasets: get().datasets.map((d) =>
            d.id === id ? { ...d, ...updates } : d
          ),
        }),
      removeDataset: (id) =>
        set({ datasets: get().datasets.filter((d) => d.id !== id) }),

      // Current data
      currentData: null,
      setCurrentData: (data) => set({ currentData: data }),

      // Column stats
      columnStats: [],
      setColumnStats: (stats) => set({ columnStats: stats }),

      // Selected columns
      selectedColumns: [],
      setSelectedColumns: (columns) => set({ selectedColumns: columns }),
      toggleColumn: (column) => {
        const current = get().selectedColumns;
        if (current.includes(column)) {
          set({ selectedColumns: current.filter((c) => c !== column) });
        } else {
          set({ selectedColumns: [...current, column] });
        }
      },
      selectAllColumns: () => {
        const data = get().currentData;
        if (data) {
          set({ selectedColumns: data.headers });
        }
      },
      clearSelectedColumns: () => set({ selectedColumns: [] }),

      // Upload
      uploadProgress: 0,
      setUploadProgress: (progress) => set({ uploadProgress: progress }),
      isUploading: false,
      setIsUploading: (uploading) => set({ isUploading: uploading }),

      // Analysis
      isAnalyzing: false,
      setIsAnalyzing: (analyzing) => set({ isAnalyzing: analyzing }),

      // Filters
      searchQuery: "",
      setSearchQuery: (query) => set({ searchQuery: query }),
      sortBy: "created_at",
      setSortBy: (sort) => set({ sortBy: sort }),
      sortOrder: "desc",
      setSortOrder: (order) => set({ sortOrder: order }),

      // Getters
      getDatasetById: (id) => get().datasets.find((d) => d.id === id),
      getFilteredDatasets: () => {
        const { datasets, searchQuery, sortBy, sortOrder } = get();
        let filtered = [...datasets];

        // Apply search
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          filtered = filtered.filter(
            (d) =>
              d.filename.toLowerCase().includes(query) ||
              d.original_filename?.toLowerCase().includes(query)
          );
        }

        // Apply sort
        filtered.sort((a, b) => {
          const aVal = a[sortBy as keyof Upload];
          const bVal = b[sortBy as keyof Upload];

          if (typeof aVal === "string" && typeof bVal === "string") {
            return sortOrder === "asc"
              ? aVal.localeCompare(bVal)
              : bVal.localeCompare(aVal);
          }

          if (typeof aVal === "number" && typeof bVal === "number") {
            return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
          }

          return 0;
        });

        return filtered;
      },
    }),
    { name: "DatasetStore" }
  )
);
