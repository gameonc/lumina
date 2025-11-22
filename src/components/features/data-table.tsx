"use client";

import { useState, useMemo } from "react";
import { cn } from "@/utils/cn";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import type { ParsedSpreadsheet } from "@/types";

interface DataTableProps {
  data: ParsedSpreadsheet;
  className?: string;
  pageSize?: number;
}

export function DataTable({ data, className, pageSize = 10 }: DataTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Filter rows based on search
  const filteredRows = useMemo(() => {
    if (!searchTerm) return data.rows;
    return data.rows.filter((row) =>
      Object.values(row).some((value) =>
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [data.rows, searchTerm]);

  // Sort rows
  const sortedRows = useMemo(() => {
    if (!sortColumn) return filteredRows;
    return [...filteredRows].sort((a, b) => {
      const aVal = a[sortColumn];
      const bVal = b[sortColumn];
      if (aVal === bVal) return 0;
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;
      const comparison = String(aVal).localeCompare(String(bVal), undefined, {
        numeric: true,
      });
      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [filteredRows, sortColumn, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(sortedRows.length / pageSize);
  const paginatedRows = sortedRows.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const formatCellValue = (value: unknown): string => {
    if (value === null || value === undefined) return "—";
    if (typeof value === "number") return value.toLocaleString();
    return String(value);
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
        <input
          type="text"
          placeholder="Search data..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full rounded-lg border border-neutral-200 bg-white py-2 pl-10 pr-4 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-neutral-200 dark:border-neutral-700">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 dark:bg-neutral-800">
            <tr>
              {data.headers.map((header) => (
                <th
                  key={header}
                  onClick={() => handleSort(header)}
                  className="cursor-pointer whitespace-nowrap px-4 py-3 text-left font-medium text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-700"
                >
                  <div className="flex items-center gap-2">
                    {header}
                    {sortColumn === header && (
                      <span className="text-primary-600">
                        {sortDirection === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {paginatedRows.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
              >
                {data.headers.map((header) => (
                  <td
                    key={header}
                    className="whitespace-nowrap px-4 py-3 text-neutral-900 dark:text-white"
                  >
                    {formatCellValue(row[header])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Showing {(currentPage - 1) * pageSize + 1} to{" "}
          {Math.min(currentPage * pageSize, sortedRows.length)} of{" "}
          {sortedRows.length} rows
          {searchTerm && ` (filtered from ${data.rowCount} total)`}
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-200 text-neutral-600 hover:bg-neutral-50 disabled:opacity-50 dark:border-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-sm text-neutral-600 dark:text-neutral-400">
            Page {currentPage} of {totalPages || 1}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage >= totalPages}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-200 text-neutral-600 hover:bg-neutral-50 disabled:opacity-50 dark:border-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
