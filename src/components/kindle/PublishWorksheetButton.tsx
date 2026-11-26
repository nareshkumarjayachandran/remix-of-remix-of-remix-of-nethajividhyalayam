import { useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { publishWorksheetToLibrary, type PublishableWorksheet } from "@/lib/worksheetPublishing";
import type { WorksheetLayout } from "@/lib/worksheetLayout";

export default function PublishWorksheetButton({ worksheet, layout, includeAnswers }: { worksheet: PublishableWorksheet; layout: WorksheetLayout; includeAnswers: boolean }) {
  const [publishing, setPublishing] = useState(false);
  const [status, setStatus] = useState("");
  const [publishedId, setPublishedId] = useState<string | null>(null);
  const { toast } = useToast();
  const publish = async () => {
    if (publishing) return;
    setPublishing(true);
    setPublishedId(null);
    try {
      const item = await publishWorksheetToLibrary(worksheet, layout, includeAnswers, setStatus);
      setPublishedId(item.id);
      toast({ title: "Worksheet published!", description: "Students and parents can now open it in the Kindle Library." });
    } catch (error) {
      toast({ title: "Could not publish worksheet", variant: "destructive", description: <div>{error instanceof Error ? error.message : "Please try again."}<br /><Link to="/kindle-admin" target="_blank" rel="noopener noreferrer" className="underline">Open Kindle Admin</Link></div> });
    } finally {
      setPublishing(false);
      setStatus("");
    }
  };
  return <div className="flex flex-wrap items-center gap-2">
    <Button onClick={publish} disabled={publishing} className="gap-2" title={status || "Publish the current worksheet to the school library"}>
      {publishing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
      {publishing ? "Publishing…" : "Publish to Kindle Library"}
    </Button>
    {publishing && <span role="status" className="text-xs text-muted-foreground">{status}</span>}
    {publishedId && <Button asChild variant="outline"><Link to={`/kindle-reader?item=${publishedId}`}>View published worksheet</Link></Button>}
  </div>;
}