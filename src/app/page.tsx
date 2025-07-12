"use client";

import { useState, useRef } from "react";
import type { Advocate } from "@/lib/app/advocate";
import {
  AdvocatesTable,
  type AdvocatesTableRef,
} from "@/components/advocates/table";
import { AdvocateDetails } from "@/components/advocate-details";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

export default function Home() {
  const tableRef = useRef<AdvocatesTableRef>(null);
  const [selectedAdvocate, setSelectedAdvocate] = useState<Advocate | null>(
    null
  );

  const handleSelect = (advocate: Advocate) => {
    setSelectedAdvocate(advocate);
  };

  const handleSheetOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setSelectedAdvocate(null);
    }
  };

  return (
    <div className="bg-background min-h-screen">
      <main className="container mx-auto py-4 md:py-10 px-4 md:px-6">
        <div className="space-y-2 mb-2 md:mb-4">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-foreground">
            Find Your Patient Advocate
          </h1>
          <p className="hidden md:block max-w-[700px] text-muted-foreground md:text-xl/relaxed">
            Search for a patient advocate by name, specialty, or city.
          </p>
        </div>

        <AdvocatesTable ref={tableRef} onRowClick={handleSelect} />

        <Sheet open={!!selectedAdvocate} onOpenChange={handleSheetOpenChange}>
          <SheetContent className="w-full sm:max-w-2xl overflow-y-auto bg-background">
            <SheetHeader>
              <SheetTitle className="text-primary">Advocate Details</SheetTitle>
              <SheetDescription>
                Detailed information about the selected patient advocate.
              </SheetDescription>
            </SheetHeader>
            {selectedAdvocate && (
              <AdvocateDetails advocate={selectedAdvocate} />
            )}
          </SheetContent>
        </Sheet>
      </main>
    </div>
  );
}
