import { Sidebar } from "@/components/sidebar";

export default {
  default: (
    <div className="flex">
      <Sidebar forceVisible />
      <div className="flex-1 p-4">Innholdsområde</div>
    </div>
  ),
};
