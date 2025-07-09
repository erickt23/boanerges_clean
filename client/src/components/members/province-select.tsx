import { useState, useEffect } from "react";
import { FormControl, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const PROVINCES_CANADA = [
  { value: "AB", label: "Alberta" },
  { value: "BC", label: "Colombie-Britannique" },
  { value: "MB", label: "Manitoba" },
  { value: "NB", label: "Nouveau-Brunswick" },
  { value: "NL", label: "Terre-Neuve-et-Labrador" },
  { value: "NT", label: "Territoires du Nord-Ouest" },
  { value: "NS", label: "Nouvelle-Écosse" },
  { value: "NU", label: "Nunavut" },
  { value: "ON", label: "Ontario" },
  { value: "PE", label: "Île-du-Prince-Édouard" },
  { value: "QC", label: "Québec" },
  { value: "SK", label: "Saskatchewan" },
  { value: "YT", label: "Yukon" }
];

const STATES_USA = [
  { value: "AL", label: "Alabama" },
  { value: "AK", label: "Alaska" },
  { value: "AZ", label: "Arizona" },
  { value: "AR", label: "Arkansas" },
  { value: "CA", label: "Californie" },
  { value: "CO", label: "Colorado" },
  { value: "CT", label: "Connecticut" },
  { value: "DE", label: "Delaware" },
  { value: "FL", label: "Floride" },
  { value: "GA", label: "Géorgie" },
  { value: "HI", label: "Hawaï" },
  { value: "ID", label: "Idaho" },
  { value: "IL", label: "Illinois" },
  { value: "IN", label: "Indiana" },
  { value: "IA", label: "Iowa" },
  { value: "KS", label: "Kansas" },
  { value: "KY", label: "Kentucky" },
  { value: "LA", label: "Louisiane" },
  { value: "ME", label: "Maine" },
  { value: "MD", label: "Maryland" },
  { value: "MA", label: "Massachusetts" },
  { value: "MI", label: "Michigan" },
  { value: "MN", label: "Minnesota" },
  { value: "MS", label: "Mississippi" },
  { value: "MO", label: "Missouri" },
  { value: "MT", label: "Montana" },
  { value: "NE", label: "Nebraska" },
  { value: "NV", label: "Nevada" },
  { value: "NH", label: "New Hampshire" },
  { value: "NJ", label: "New Jersey" },
  { value: "NM", label: "Nouveau-Mexique" },
  { value: "NY", label: "New York" },
  { value: "NC", label: "Caroline du Nord" },
  { value: "ND", label: "Dakota du Nord" },
  { value: "OH", label: "Ohio" },
  { value: "OK", label: "Oklahoma" },
  { value: "OR", label: "Oregon" },
  { value: "PA", label: "Pennsylvanie" },
  { value: "RI", label: "Rhode Island" },
  { value: "SC", label: "Caroline du Sud" },
  { value: "SD", label: "Dakota du Sud" },
  { value: "TN", label: "Tennessee" },
  { value: "TX", label: "Texas" },
  { value: "UT", label: "Utah" },
  { value: "VT", label: "Vermont" },
  { value: "VA", label: "Virginie" },
  { value: "WA", label: "Washington" },
  { value: "WV", label: "Virginie-Occidentale" },
  { value: "WI", label: "Wisconsin" },
  { value: "WY", label: "Wyoming" }
];

interface ProvinceSelectProps {
  country: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export default function ProvinceSelect({ country, value, onChange, disabled }: ProvinceSelectProps) {
  const [options, setOptions] = useState<Array<{ value: string; label: string }>>([]);
  const [label, setLabel] = useState("Province/État");

  useEffect(() => {
    if (country === "Canada") {
      setOptions(PROVINCES_CANADA);
      setLabel("Province");
    } else if (country === "États-Unis" || country === "USA") {
      setOptions(STATES_USA);
      setLabel("État");
    } else {
      setOptions([]);
      setLabel("Province/État");
    }
  }, [country]);

  if (options.length === 0) {
    return (
      <FormItem>
        <FormLabel>{label}</FormLabel>
        <FormControl>
          <Select value={value} onValueChange={onChange} disabled={disabled}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionnez le pays d'abord" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Sélectionnez le pays d'abord</SelectItem>
            </SelectContent>
          </Select>
        </FormControl>
        <FormMessage />
      </FormItem>
    );
  }

  return (
    <FormItem>
      <FormLabel>{label}</FormLabel>
      <FormControl>
        <Select value={value} onValueChange={onChange} disabled={disabled}>
          <SelectTrigger>
            <SelectValue placeholder={`Sélectionnez une ${label.toLowerCase()}`} />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormControl>
      <FormMessage />
    </FormItem>
  );
}