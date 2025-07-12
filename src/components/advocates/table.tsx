import * as React from "react";
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import type { Advocate } from "@/lib/app/advocate";

import { getColumns } from "./columns";
import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

export interface AdvocatesTableRef {
  resetSearch: () => void;
}

async function getAdvocates(
  page: number = 1,
  limit: number = 10,
  search?: string,
): Promise<{
  data: Advocate[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}> {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  if (search && search.trim()) {
    params.append("search", search.trim());
  }

  const res = await fetch(`/api/advocates?${params.toString()}`);
  if (!res.ok) {
    throw new Error("Failed to fetch advocates");
  }
  const response = await res.json();
  return response;
}

const DataTable = ({
  search,
  onRowClick,
}: {
  search?: string;
  onRowClick: (advocate: Advocate) => void;
}) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  console.log("search", search);

  const { data, isLoading, error } = useQuery({
    queryKey: ["advocates", currentPage, pageSize, search],
    queryFn: () => getAdvocates(currentPage, pageSize, search),
  });

  const columns = getColumns(onRowClick);

  const table = useReactTable({
    data: data?.data || [],
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
      columnFilters,
    },
    manualPagination: true,
    pageCount: data?.pagination.totalPages ?? 0,
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);
  if (isLoading && !((data || {}) as { data: unknown[] })?.data?.length) {
    return (
      <div className="space-y-4">
        <div className="rounded-md border">
          <Skeleton className="h-12 w-full" />
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <p className="text-destructive">
        Failed to load advocates. Please try again later.
      </p>
    );
  }

  return (
    <>
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  onClick={() => onRowClick(row.original)}
                  className="cursor-pointer hover:bg-muted/50"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {data && data.pagination.totalPages > 1 && (
        <div className="mt-8">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  className={
                    currentPage === 1
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>
              {Array.from(
                { length: data.pagination.totalPages },
                (_, i) => i + 1,
              ).map((page) => (
                <PaginationItem key={page}>
                  <PaginationLink
                    onClick={() => setCurrentPage(page)}
                    isActive={currentPage === page}
                    className="cursor-pointer"
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  onClick={() =>
                    setCurrentPage((prev) =>
                      Math.min(prev + 1, data.pagination.totalPages),
                    )
                  }
                  className={
                    currentPage === data.pagination.totalPages
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </>
  );
};

export const AdvocatesTable = React.forwardRef<
  AdvocatesTableRef,
  {
    onRowClick: (advocate: Advocate) => void;
  }
>(({ onRowClick }, ref) => {
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput]);

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
  };

  React.useImperativeHandle(ref, () => ({
    resetSearch: () => {
      setSearchInput("");
    },
  }));

  return (
    <div>
      <div className="w-full">
        <div className="flex items-center py-4">
          <div className="relative w-full max-w-sm">
            <Input
              placeholder="Search by name or specialty..."
              value={searchInput}
              onChange={(event) => handleSearchChange(event.target.value)}
              className="pr-8"
            />
            {searchInput && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-2 py-0 hover:bg-transparent"
                onClick={() => handleSearchChange("")}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        <DataTable onRowClick={onRowClick} search={debouncedSearch} />
      </div>
    </div>
  );
});

AdvocatesTable.displayName = "AdvocatesTable";
