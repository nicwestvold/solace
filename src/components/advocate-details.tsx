import { Phone, MapPin, GraduationCap, Sparkles } from "lucide-react";
import type { Advocate } from "@/lib/types";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function formatPhoneNumber(phone: number) {
  const phoneStr = phone.toString();
  return `(${phoneStr.slice(0, 3)}) ${phoneStr.slice(3, 6)}-${phoneStr.slice(6)}`;
}

export function AdvocateDetails({ advocate }: { advocate: Advocate }) {
  const initials = `${advocate.firstName[0]}${advocate.lastName[0]}`;
  const formattedDate = new Date(advocate.createdAt).toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    },
  );

  return (
    <div className="p-1 pt-4 md:p-2 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col items-center text-center space-y-4">
        <Avatar className="h-24 w-24 text-3xl">
          <AvatarFallback className="bg-primary/10 text-primary">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-primary">
            {advocate.firstName} {advocate.lastName}
          </h2>
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <GraduationCap className="h-4 w-4" />
            <span>{advocate.degree}</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{advocate.city}</span>
          </div>
        </div>
      </div>

      {/* Contact Button */}
      <Button asChild size="lg" className="w-full">
        <a href={`tel:${advocate.phoneNumber}`}>
          <Phone className="mr-2 h-4 w-4" /> Contact {advocate.firstName}
        </a>
      </Button>

      {/* Key Info Cards */}
      <div className="grid grid-cols-2 gap-4 text-center">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Experience
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {advocate.yearsOfExperience} yrs
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Member Since
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">{formattedDate}</p>
          </CardContent>
        </Card>
      </div>

      {/* Specialties Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <span>Specialties</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {advocate.specialties.map((specialty) => (
            <Badge key={specialty} variant="secondary" className="text-sm">
              {specialty}
            </Badge>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
