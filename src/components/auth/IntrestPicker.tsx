import { Check, ChevronsUpDown, X } from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { FieldLabel } from "@/components/ui/field";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useSignUpStore } from "@/store/useSignUpStore";

const INTRESTS = [
  "Maize",
  "Beans",
  "Rice",
  "Cassava",
  "Sweet Potatoes",
  "Irish Potatoes",
  "Tomatoes",
  "Onions",
  "Cabbage",
  "Carrots",
  "Bananas",
  "Pineapples",
  "Mangoes",
  "Avocados",
  "Coffee",
  "Tea",
  "Sunflower",
  "Groundnuts",
  "Soybeans",
  "Sorghum",
  "Millet",
  "Sugarcane",
  "Cotton",
  "Vanilla",
];

export function IntrestPicker() {
  const { interests, setIntrests } = useSignUpStore();
  const [open, setOpen] = useState(false);

  const MAX = 3;

  function toggle(value: string) {
    if (interests.includes(value)) {
      setIntrests(interests.filter((s) => s !== value));
    } else {
      if (interests.length >= MAX) return;
      setIntrests([...interests, value]);
    }
  }

  function remove(value: string) {
    setIntrests(interests.filter((s) => s !== value));
  }

  return (
    <div className="flex flex-col gap-2">
      <FieldLabel>
        Intrests<span className="text-destructive">*</span>
        <span className="text-muted-foreground font-normal text-xs ml-1">(pick up to {MAX})</span>
      </FieldLabel>

      {/* Selected badges */}
      {interests.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {interests.map((s) => (
            <Badge key={s} variant="secondary" className="gap-1 pr-1 h-6 text-xs">
              {s}
              <button
                type="button"
                onClick={() => remove(s)}
                className="hover:text-destructive transition-colors ml-0.5"
              >
                <X className="size-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            className={cn(
              "w-full h-11 justify-between font-normal",
              interests.length === 0 && "text-muted-foreground"
            )}
          >
            {interests.length === 0
              ? "Select crops / produce..."
              : `${interests.length} of ${MAX} selected`}
            <ChevronsUpDown className="size-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput placeholder="Search produce..." />
            <CommandList>
              <CommandEmpty>No produce found.</CommandEmpty>
              <CommandGroup>
                {INTRESTS.map((item) => {
                  const isSelected = interests.includes(item);
                  const isDisabled = !isSelected && interests.length >= MAX;
                  return (
                    <CommandItem
                      key={item}
                      value={item}
                      disabled={isDisabled}
                      onSelect={() => toggle(item)}
                      className={cn(isDisabled && "opacity-40 cursor-not-allowed")}
                    >
                      <Check
                        className={cn("mr-2 size-4", isSelected ? "opacity-100" : "opacity-0")}
                      />
                      {item}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {interests.length === MAX && (
        <p className="text-xs text-muted-foreground">Maximum of {MAX} specialties reached.</p>
      )}
    </div>
  );
}
