import { Calendar } from '@/components/ui/calendar'

export default {
  default: <Calendar />,
  withSelected: <Calendar mode="single" selected={new Date()} />,
}


