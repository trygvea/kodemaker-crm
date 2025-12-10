import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DatePicker } from "@/components/ui/date-picker";

export default {
  default: (
    <Tabs defaultValue="tab1">
      <TabsList>
        <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        <TabsTrigger value="tab3">Tab 3</TabsTrigger>
      </TabsList>
      <TabsContent value="tab1">
        <div className="p-4">Content for Tab 1</div>
      </TabsContent>
      <TabsContent value="tab2">
        <div className="p-4">Content for Tab 2</div>
      </TabsContent>
      <TabsContent value="tab3">
        <div className="p-4">Content for Tab 3</div>
      </TabsContent>
    </Tabs>
  ),
  withLongContent: (
    <Tabs defaultValue="tab1">
      <TabsList>
        <TabsTrigger value="tab1">Oppfølging</TabsTrigger>
        <TabsTrigger value="tab2">Kommentar</TabsTrigger>
      </TabsList>
      <TabsContent value="tab1">
        <div className="p-4 space-y-3">
          <textarea
            rows={3}
            className="w-full border rounded p-2 text-sm"
            placeholder="Notat…"
          />
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <label className="block text-xs text-muted-foreground mb-1">
                Frist
              </label>
              <DatePicker placeholder="Velg dato" />
            </div>
          </div>
        </div>
      </TabsContent>
      <TabsContent value="tab2">
        <div className="p-4 space-y-3">
          <textarea
            rows={3}
            className="w-full border rounded p-2 text-sm"
            placeholder="Skriv en kommentar…"
          />
        </div>
      </TabsContent>
    </Tabs>
  ),
};
