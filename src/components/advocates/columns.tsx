import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Advocate } from "@/lib/app/advocate";

type RowClickHandler = (advocate: Advocate) => void;

export const getColumns = (
  onRowClick: RowClickHandler,
): ColumnDef<Advocate>[] => [
  {
    accessorFn: (row) => `${row.firstName} ${row.lastName}`,
    id: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="font-medium">
        {row.original.firstName} {row.original.lastName}
      </div>
    ),
    filterFn: (row, _id, value) => {
      const fullName = `${row.original.firstName} ${row.original.lastName}`;
      return fullName.toLowerCase().includes(value.toLowerCase());
    },
  },
  {
    accessorKey: "city",
    header: "City",
  },
  {
    accessorKey: "specialties",
    header: "Specialties",
    cell: ({ row }) => {
      const specialties = row.getValue("specialties") as string[];
      return (
        <div className="flex flex-wrap gap-1">
          {specialties.slice(0, 2).map((s) => (
            <Badge key={s} variant="secondary">
              {s}
            </Badge>
          ))}
          {specialties.length > 2 && (
            <Badge variant="outline">+{specialties.length - 2}</Badge>
          )}
        </div>
      );
    },
    filterFn: (row, id, value) => {
      const specialties = row.getValue(id) as string[];
      return specialties.some((s) =>
        s.toLowerCase().includes(value.toLowerCase()),
      );
    },
  },
  {
    accessorKey: "yearsOfExperience",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Experience (yrs)
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="text-center">{row.getValue("yearsOfExperience")}</div>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return (
        <Button
          variant="ghost"
          className="h-8 w-8 p-0"
          onClick={() => onRowClick(row.original)}
        >
          <span className="sr-only">Open details</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      );
    },
  },
];
