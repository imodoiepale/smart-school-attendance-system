"use client"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, X } from "lucide-react"
import { format } from "date-fns"
import { DateRange } from "../types"

interface DateFilterProps {
  dateRange: DateRange
  onDateRangeChange: (range: DateRange) => void
  className?: string
}

export function DateFilter({ dateRange, onDateRangeChange, className }: DateFilterProps) {
  const clearDateRange = () => {
    onDateRangeChange({ from: null, to: null })
  }

  return (
    <div className={`flex items-center gap-2 ${className || ''}`}>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="h-7 text-[10px] gap-1.5">
            <CalendarIcon className="w-3 h-3" />
            {dateRange.from ? (
              dateRange.to ? (
                <>
                  {format(dateRange.from, "MMM d")} - {format(dateRange.to, "MMM d")}
                </>
              ) : (
                format(dateRange.from, "MMM d, yyyy")
              )
            ) : (
              "Select dates"
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={dateRange.from || new Date()}
            selected={{ from: dateRange.from || undefined, to: dateRange.to || undefined }}
            onSelect={(range) => onDateRangeChange({ from: range?.from || null, to: range?.to || null })}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
      {(dateRange.from || dateRange.to) && (
        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={clearDateRange}>
          <X className="w-3 h-3" />
        </Button>
      )}
    </div>
  )
}
