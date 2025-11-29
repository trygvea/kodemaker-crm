import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export default {
    default: (
        <Select>
            <SelectTrigger className="w-64">
                <SelectValue placeholder="Velg status" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="new">Ny</SelectItem>
                <SelectItem value="in_progress">Under behandling</SelectItem>
                <SelectItem value="won">Vunnet</SelectItem>
                <SelectItem value="lost">Tapt</SelectItem>
            </SelectContent>
        </Select>
    ),
    withLabel: (
        <div className="space-y-2 w-64">
            <Label htmlFor="status">Status</Label>
            <Select>
                <SelectTrigger id="status">
                    <SelectValue placeholder="Velg status" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="new">Ny</SelectItem>
                    <SelectItem value="in_progress">
                        Under behandling
                    </SelectItem>
                    <SelectItem value="won">Vunnet</SelectItem>
                    <SelectItem value="lost">Tapt</SelectItem>
                </SelectContent>
            </Select>
        </div>
    ),
};
