import { useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, Lock, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { checkStaffPublishingAccess, publishWorksheetToLibrary, type PublishableWorksheet } from "@/lib/worksheetPublishing";
import type { WorksheetLayout } from "@/lib/worksheetLayout";

export default function PublishWorksheetButton({ worksheet, layout, includeAnswers }: { worksheet: PublishableWorksheet; layout: WorksheetLayout; includeAnswers: boolean }) {
  const [checking, setChecking] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [status, setStatus] = useState("");
  const [publishedId, setPublishedId] = useState<string | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [signingIn, setSigningIn] = useState(false);
  const [authError, setAuthError] = useState("");
  const { toast } = useToast();

  const runPublish = async () => {
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

  const handlePublishClick = async () => {
    if (checking || publishing) return;
    setChecking(true);
    setAuthError("");
    try {
      const access = await checkStaffPublishingAccess();
      if (access.status === "authorized") {
        setChecking(false);
        await runPublish();
        return;
      }
      if (access.status === "unauthorized") {
        setAuthError(access.email ? `Signed in as ${access.email}, which does not have staff access. Sign in with a school staff account to publish.` : "Only school staff and administrators can publish worksheets.");
      }
      setAuthOpen(true);
    } finally {
      setChecking(false);
    }
  };

  const handleSignInAndPublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (signingIn) return;
    setSigningIn(true);
    setAuthError("");
    try {
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error) {
        setAuthError(error.message);
        return;
      }
      const access = await checkStaffPublishingAccess();
      if (access.status !== "authorized") {
        setAuthError("Only school staff and administrators can publish worksheets.");
        return;
      }
      setPassword("");
      setAuthOpen(false);
      await runPublish();
    } finally {
      setSigningIn(false);
    }
  };

  const busy = checking || publishing;
  return <div className="flex flex-wrap items-center gap-2">
    <Button onClick={handlePublishClick} disabled={busy} className="gap-2" title={status || "Publish the current worksheet to the school library"}>
      {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
      {publishing ? "Publishing…" : checking ? "Checking…" : "Publish to Kindle Library"}
    </Button>
    {publishing && <span role="status" className="text-xs text-muted-foreground">{status}</span>}
    {publishedId && <Button asChild variant="outline"><Link to={`/kindle-reader?item=${publishedId}`}>View published worksheet</Link></Button>}

    <Dialog open={authOpen} onOpenChange={(open) => { if (!signingIn) setAuthOpen(open); }}>
      <DialogContent className="bg-card sm:max-w-md">
        <DialogHeader className="text-center sm:text-center">
          <div className="mx-auto mb-2 flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Lock className="h-5 w-5" />
          </div>
          <DialogTitle className="font-serif text-xl">Kindle Library Admin Sign In</DialogTitle>
          <DialogDescription>
            Sign in with your school staff account to publish this worksheet to the Kindle Library. Your worksheet stays open.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSignInAndPublish} className="space-y-4">
          {authError && <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">{authError}</p>}
          <div className="space-y-1.5">
            <Label htmlFor="publish-staff-email">Staff Email</Label>
            <Input id="publish-staff-email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="staff@nethajividhyalayam.org" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="publish-staff-password">Password</Label>
            <Input id="publish-staff-password" type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter password" />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="ghost" disabled={signingIn} onClick={() => setAuthOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={signingIn} className="gap-2">
              {signingIn && <Loader2 className="h-4 w-4 animate-spin" />}
              {signingIn ? "Signing in…" : "Sign In & Publish"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  </div>;
}