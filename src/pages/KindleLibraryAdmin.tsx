import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import type { User } from "@supabase/supabase-js";
import {
  ArrowLeft,
  BookOpen,
  ExternalLink,
  FileText,
  Loader2,
  Lock,
  LogOut,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  deleteKindleLibraryItem,
  fetchKindleLibraryItems,
  formatFileSize,
  KINDLE_LIBRARY_STANDARDS,
  uploadKindleLibraryItem,
  validateKindleUploadInput,
  type KindleLibraryCategory,
  type KindleLibraryItem,
} from "@/lib/kindleLibrary";

const ACCEPTED_FILES =
  ".pdf,.doc,.docx,.xls,.xlsx,.csv,.epub,.txt,.md,.html,.htm,.rtf,.jpg,.jpeg,.png,.webp,.gif,.bmp";

const KindleLibraryAdmin = () => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Sign-in form
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [signingIn, setSigningIn] = useState(false);

  // Upload form
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<KindleLibraryCategory>("book");
  const [standard, setStandard] = useState<string>("All");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const [formError, setFormError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Library list
  const [items, setItems] = useState<KindleLibraryItem[]>([]);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadRole = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .maybeSingle();
    setRole(data?.role ?? null);
  }, []);

  const loadItems = useCallback(async () => {
    setItemsLoading(true);
    try {
      setItems(await fetchKindleLibraryItems(true));
    } catch (err) {
      toast({
        title: "Could not load library",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setItemsLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    const init = async () => {
      setAuthLoading(true);
      const { data } = await supabase.auth.getUser();
      if (!active) return;
      if (data.user) {
        setUser(data.user);
        await loadRole(data.user.id);
      } else {
        setUser(null);
        setRole(null);
      }
      if (active) setAuthLoading(false);
    };
    void init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const nextUser = session?.user ?? null;
      setUser(nextUser);
      if (nextUser) {
        void loadRole(nextUser.id);
      } else {
        setRole(null);
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [loadRole]);

  const isStaff = role === "admin" || role === "staff";

  useEffect(() => {
    if (isStaff) void loadItems();
  }, [isStaff, loadItems]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setSigningIn(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (error) {
      toast({ title: "Sign-in failed", description: error.message, variant: "destructive" });
    }
    setSigningIn(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setRole(null);
  };

  const handleFilePick = (file: File | null) => {
    setSelectedFile(file);
    setFormError("");
    if (file && !title.trim()) {
      setTitle(file.name.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ").trim());
    }
  };

  const clearSelectedFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setFormError("");
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !isStaff || !selectedFile) return;
    const validationError = validateKindleUploadInput(title, selectedFile);
    if (validationError) {
      setFormError(validationError);
      return;
    }
    setFormError("");
    setUploading(true);
    setUploadStatus("Preparing upload…");
    try {
      const created = await uploadKindleLibraryItem({
        file: selectedFile,
        title,
        category,
        standard,
        userId: user.id,
        userEmail: user.email ?? null,
        onStatus: setUploadStatus,
      });
      setItems((prev) => [created, ...prev]);
      setTitle("");
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      toast({
        title: "Published to Kindle Reader",
        description: `"${created.title}" is now visible to everyone in the Kindle Reader library.`,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Upload failed.";
      setFormError(msg);
      toast({ title: "Upload failed", description: msg, variant: "destructive" });
    } finally {
      setUploading(false);
      setUploadStatus("");
    }
  };

  const handleDelete = async (item: KindleLibraryItem) => {
    if (!window.confirm(`Remove "${item.title}" from the public Kindle Reader library?`)) return;
    setDeletingId(item.id);
    try {
      await deleteKindleLibraryItem(item);
      setItems((prev) => prev.filter((x) => x.id !== item.id));
      toast({ title: "Removed from library", description: `"${item.title}" was deleted.` });
    } catch (err) {
      toast({
        title: "Delete failed",
        description: err instanceof Error ? err.message : "Could not delete item.",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-7 w-7 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="bg-muted/40 min-h-[75vh] py-12 px-4">
        <div className="max-w-md mx-auto bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="space-y-2 text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <Lock className="h-5 w-5" />
            </div>
            <h1 className="font-serif text-2xl font-bold text-foreground">Kindle Library Admin</h1>
            <p className="text-sm text-muted-foreground">
              Sign in with your school staff account to upload books and worksheets for all students.
            </p>
          </div>

          <form onSubmit={handleSignIn} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="staff-email">Staff Email</Label>
              <Input id="staff-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="staff@nethajividhyalayam.org" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="staff-password">Password</Label>
              <Input id="staff-password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter password" />
            </div>
            <Button type="submit" className="w-full" disabled={signingIn}>
              {signingIn ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Sign In
            </Button>
          </form>

          <div className="pt-2 border-t border-border flex justify-center">
            <Button asChild variant="ghost" size="sm" className="gap-1.5 text-xs">
              <Link to="/kindle-reader"><ArrowLeft className="h-3.5 w-3.5" /> Back to Kindle Reader</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!isStaff) {
    return (
      <div className="bg-muted/40 min-h-[75vh] py-12 px-4">
        <div className="max-w-md mx-auto bg-card border border-border rounded-2xl p-6 sm:p-8 text-center space-y-4">
          <Lock className="h-10 w-10 text-destructive mx-auto" />
          <h1 className="font-serif text-2xl font-bold text-foreground">Staff Access Required</h1>
          <p className="text-sm text-muted-foreground">
            Signed in as <span className="font-medium text-foreground">{user.email}</span>, which does not have a school staff or admin role.
          </p>
          <div className="flex flex-wrap justify-center gap-2 pt-2">
            <Button asChild variant="outline" size="sm">
              <Link to="/kindle-reader">Back to Kindle Reader</Link>
            </Button>
            <Button variant="destructive" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-1.5" /> Sign Out
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-muted/40 min-h-screen">
      <section className="bg-primary text-primary-foreground py-10">
        <div className="container-custom flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-serif text-2xl sm:text-4xl font-bold">Kindle Library Admin</h1>
            <p className="text-sm sm:text-base text-primary-foreground/85 mt-1">
              Upload books and worksheets so every student and parent can open them in Kindle Reader.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button asChild variant="secondary" size="sm" className="gap-1.5">
              <Link to="/kindle-reader"><BookOpen className="h-4 w-4" /> Open Kindle Reader</Link>
            </Button>
            <Button variant="outline" size="sm" onClick={handleSignOut} className="bg-transparent border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 gap-1.5">
              <LogOut className="h-4 w-4" /> Sign Out
            </Button>
          </div>
        </div>
      </section>

      <div className="container-custom py-8 space-y-8">
        <form onSubmit={handleUpload} className="bg-card border border-border rounded-2xl p-5 sm:p-6 shadow-sm space-y-5">
          <div>
            <h2 className="font-serif text-xl font-bold text-foreground">Upload to School Library</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Signed in as {user.email} ({role}) · Supports PDF, Word, Excel/CSV, EPUB, Text &amp; Images up to 50 MB
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2 space-y-1.5">
              <Label htmlFor="lib-title">Title</Label>
              <Input id="lib-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Class 3 Term 1 Science Worksheet" maxLength={150} required />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="lib-category">Type</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as KindleLibraryCategory)}>
                <SelectTrigger id="lib-category"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="book">Book</SelectItem>
                  <SelectItem value="worksheet">Worksheet</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="lib-standard">Class / Grade</Label>
              <Select value={standard} onValueChange={setStandard}>
                <SelectTrigger id="lib-standard"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {KINDLE_LIBRARY_STANDARDS.map((std) => (
                    <SelectItem key={std} value={std}>{std === "All" ? "All Classes" : `Class ${std}`}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-dashed border-border bg-muted/30 p-4">
            <div className="min-w-0">
              <input
                ref={fileInputRef}
                type="file"
                id="lib-file"
                accept={ACCEPTED_FILES}
                onChange={(e) => handleFilePick(e.target.files?.[0] ?? null)}
                className="block w-full text-xs text-muted-foreground file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-primary-foreground hover:file:bg-primary/90"
              />
              {selectedFile && (
                <div className="flex items-center gap-2 mt-1.5">
                  <p className="text-xs text-muted-foreground truncate">
                    Selected: <span className="font-medium text-foreground">{selectedFile.name}</span> ({formatFileSize(selectedFile.size)})
                  </p>
                  <button
                    type="button"
                    onClick={clearSelectedFile}
                    aria-label={`Remove ${selectedFile.name}`}
                    title="Remove selected file"
                    className="shrink-0 inline-flex h-5 w-5 items-center justify-center rounded-full border border-border bg-background text-muted-foreground hover:bg-destructive hover:text-destructive-foreground hover:border-destructive transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>

            <Button type="submit" disabled={uploading} className="shrink-0 gap-2">
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              {uploading ? "Publishing…" : "Publish to Library"}
            </Button>
          </div>

          {uploadStatus && <p className="text-xs font-medium text-primary">{uploadStatus}</p>}
          {formError && <p role="alert" className="text-xs font-semibold text-destructive">{formError}</p>}
        </form>

        <div className="bg-card border border-border rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-serif text-xl font-bold text-foreground">
              Published Library ({items.length})
            </h2>
            {itemsLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
          </div>

          {items.length === 0 && !itemsLoading ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              No books or worksheets uploaded yet. Upload your first file above to make it available in Kindle Reader.
            </p>
          ) : (
            <div className="divide-y divide-border">
              {items.map((item) => (
                <div key={item.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="mt-0.5 rounded-lg bg-primary/10 p-2 text-primary shrink-0">
                      {item.category === "worksheet" ? <FileText className="h-4 w-4" /> : <BookOpen className="h-4 w-4" />}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-foreground break-words">{item.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {item.category === "worksheet" ? "Worksheet" : "Book"} · {item.standard === "All" ? "All Classes" : `Class ${item.standard}`} · {item.file_format.toUpperCase()} · {item.page_count} {item.page_count === 1 ? "page" : "pages"} · {formatFileSize(item.file_size)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button asChild variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
                      <Link to={`/kindle-reader?item=${item.id}`}>
                        <ExternalLink className="h-3.5 w-3.5" /> Open
                      </Link>
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                      disabled={deletingId === item.id}
                      onClick={() => void handleDelete(item)}
                      aria-label={`Delete ${item.title}`}
                    >
                      {deletingId === item.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default KindleLibraryAdmin;