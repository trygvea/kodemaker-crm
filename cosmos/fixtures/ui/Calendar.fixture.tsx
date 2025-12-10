import { Calendar } from "@/components/ui/calendar";

export default {
  default: <Calendar mode="single" />,
  withSelected: <Calendar mode="single" selected={new Date()} />,
  withRange: (
    <Calendar
      mode="range"
      selected={{
        from: new Date(),
        to: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      }}
    />
  ),
};
