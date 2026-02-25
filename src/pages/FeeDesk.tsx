import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import OfflineBanner from "@/components/ui/OfflineBanner";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { openPrintableTemplate, buildEmailMessage } from "@/lib/printTemplate";
import {
  LogOut, Users, CreditCard, FileText, PlusCircle, Search,
  Printer, DollarSign, BarChart3, BookOpen, Loader2, X, Upload, Trash2, Download, Calendar, Pencil, Check,
  Wifi, WifiOff, RefreshCw, Clock, CheckCircle, XCircle
} from "lucide-react";
import ExcelJS from "exceljs";
import { offlineDb } from "@/lib/offlineDb";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";

const ALLOWED_EMAILS = ["nethajividhyalayam@gmail.com", "nareshkumar.jayachandran@gmail.com", "info@nethajividhyalayam.org", "staff@nethajividhyalayam.org"];
const standards = ["Pre-KG", "LKG", "UKG", "I", "II", "III", "IV", "V"];
const sections = ["A", "B", "C", "D"];

// Column mapping: try to match uploaded columns to student fields
const STUDENT_FIELD_MAP: Record<string, string[]> = {
  admission_number: ["admission number", "admission_number", "adm no", "adm no", "admission no", "admno", "admission", "roll no", "roll number", "rollno", "s no", "sno", "sl no", "slno", "serial no", "serial number", "reg no", "registration no", "registration number", "student id", "emis no", "emisno"],
  student_name: ["student_name", "student name", "name", "student", "pupil name", "pupil"],
  standard: ["standard", "class", "std", "grade"],
  section: ["section", "sec", "div", "division"],
  parent_name: ["parent_name", "parent name", "father name", "mother name", "guardian", "guardian name", "parent"],
  parent_phone: ["parent_phone", "parent phone", "phone", "mobile", "contact", "father phone", "mother phone", "ph no", "phone number", "mobile number"],
  parent_email: ["parent_email", "parent email", "email", "mail"],
  date_of_birth: ["date_of_birth", "dob", "date of birth", "birth date", "birthdate"],
  gender: ["gender", "sex"],
  blood_group: ["blood_group", "blood group", "blood"],
  aadhaar_number: ["aadhaar_number", "aadhaar", "aadhaar number", "aadhaar no", "aadhar", "aadhar number"],
  address: ["address", "addr", "residence"],
};

const matchColumn = (header: string): string | null => {
  const h = header.trim().toLowerCase().replace(/[^a-z0-9 ]/g, "").replace(/\s+/g, " ").trim();
  // Exact match only — no substring matching to avoid wrong column picks
  for (const [field, aliases] of Object.entries(STUDENT_FIELD_MAP)) {
    if (aliases.some((a) => h === a)) return field;
  }
  return null;
};

const FeeDesk = () => {
  const isOnline = useOnlineStatus();
  const [syncing, setSyncing] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [pendingSyncIds, setPendingSyncIds] = useState<Set<string>>(new Set());
  const [lastSyncTime, setLastSyncTime] = useState<number | null>(null);
  const syncInProgress = useRef(false);
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [roleLoading, setRoleLoading] = useState(false);

  // Login state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  // Students
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStandard, setSelectedStandard] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [feeTermFilter, setFeeTermFilter] = useState("Total");

  // Fee payment
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [paymentForm, setPaymentForm] = useState({ amount: "", term: "", payment_method: "Cash", reference_id: "", notes: "" });
  const [paymentLoading, setPaymentLoading] = useState(false);

  // Add student
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [newStudent, setNewStudent] = useState({ admission_number: "", student_name: "", standard: "", section: "A", parent_name: "", parent_phone: "", date_of_birth: "", gender: "" });

  // Payments history
  const [payments, setPayments] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("students");

  // Upload
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadLoading, setUploadLoading] = useState(false);

  // Delete payment
  const [deletePaymentId, setDeletePaymentId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Edit payment (admin)
  const [editingPaymentId, setEditingPaymentId] = useState<string | null>(null);
  const [editPaymentForm, setEditPaymentForm] = useState({ amount: "", term: "", payment_method: "Cash", reference_id: "" });
  const [editPaymentLoading, setEditPaymentLoading] = useState(false);

  // Reports date range
  const [reportDateFrom, setReportDateFrom] = useState("");
  const [reportDateTo, setReportDateTo] = useState("");

  // Payment history date filter
  const [paymentDateFrom, setPaymentDateFrom] = useState("");
  const [paymentDateTo, setPaymentDateTo] = useState("");
  const [selectedPaymentIds, setSelectedPaymentIds] = useState<Set<string>>(new Set());

  // Bulk delete students
  const [selectedStudentIds, setSelectedStudentIds] = useState<Set<string>>(new Set());
  const [bulkDeleteLoading, setBulkDeleteLoading] = useState(false);

  // Edit student
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ admission_number: "", student_name: "", standard: "", section: "", parent_phone: "" });
  const [editLoading, setEditLoading] = useState(false);

  // Pending approvals
  const [pendingApprovals, setPendingApprovals] = useState<any[]>([]);
  const [pendingApprovalsLoading, setPendingApprovalsLoading] = useState(false);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);

  // ===== OFFLINE SYNC LOGIC =====
  const refreshPendingCount = useCallback(async () => {
    const mutations = await offlineDb.getPendingMutations();
    setPendingCount(mutations.length);
    // Build a set of record IDs that have pending mutations
    const ids = new Set<string>();
    for (const m of mutations) {
      if (m.data?.id) ids.add(m.data.id);
      if (m.data?.student_id) ids.add(m.data.student_id);
    }
    setPendingSyncIds(ids);
  }, []);

  const syncPendingMutations = useCallback(async () => {
    if (syncInProgress.current || !navigator.onLine) return;
    syncInProgress.current = true;
    setSyncing(true);
    const mutations = await offlineDb.getPendingMutations();
    if (mutations.length === 0) {
      setSyncing(false);
      syncInProgress.current = false;
      return;
    }

    let synced = 0;
    let failed = 0;
    const sorted = mutations.sort((a, b) => a.timestamp - b.timestamp);

    for (const mut of sorted) {
      try {
        let error: any = null;
        if (mut.type === "insert") {
          const res = await supabase.from(mut.table as any).insert([mut.data] as any);
          error = res.error;
        } else if (mut.type === "update") {
          const { id, ...rest } = mut.data;
          const res = await supabase.from(mut.table as any).update(rest as any).eq("id", id);
          error = res.error;
        } else if (mut.type === "delete") {
          if (mut.table === "students") {
            const res = await supabase.from("students").update({ status: "inactive" } as any).eq("id", mut.data.id);
            error = res.error;
          } else {
            const res = await supabase.from(mut.table as any).delete().eq("id", mut.data.id);
            error = res.error;
          }
        }
        if (!error) {
          await offlineDb.removePendingMutation(mut.id);
          synced++;
        } else {
          console.error("Sync error for mutation:", mut.id, error);
          failed++;
        }
      } catch (err) {
        console.error("Sync exception:", err);
        failed++;
      }
    }

    await offlineDb.setLastSync(Date.now());
    setLastSyncTime(Date.now());
    await refreshPendingCount();
    setSyncing(false);
    syncInProgress.current = false;

    toast({
      title: "🔄 Sync Complete",
      description: `${synced} change(s) synced to cloud.${failed > 0 ? ` ${failed} failed — will retry.` : ""}`,
    });

    // Refresh data from server after sync
    if (synced > 0) {
      fetchStudents();
      fetchPayments();
    }
  }, []);

  // Auto-sync when coming back online
  useEffect(() => {
    if (isOnline) {
      syncPendingMutations();
    }
  }, [isOnline, syncPendingMutations]);

  // Load last sync time and pending count on mount
  useEffect(() => {
    offlineDb.getLastSync().then(setLastSyncTime);
    refreshPendingCount();
  }, [refreshPendingCount]);

  useEffect(() => {
    const checkAuth = async () => {
      setLoading(true);
      // Always try cached session first for instant offline access
      const cached = await offlineDb.getCachedAuthSession();
      if (cached) {
        setUser(cached.user);
        setRole(cached.role);
      }
      // If online, also try to refresh from server
      if (navigator.onLine) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            setUser(session.user);
            setRoleLoading(true);
            await fetchRole(session.user.id);
            setRoleLoading(false);
          }
        } catch (e) {
          console.log("Online auth check failed, using cached session");
        }
      }
      setLoading(false);
    };
    void checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setUser(session.user);
        setRoleLoading(true);
        await fetchRole(session.user.id);
        setRoleLoading(false);
      } else {
        setUser(null);
        setRole(null);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const fetchRole = async (userId: string) => {
    const { data } = await supabase.from("user_roles").select("role").eq("user_id", userId).maybeSingle();
    const fetchedRole = data?.role || null;
    setRole(fetchedRole);
    // Cache auth session for offline use
    if (fetchedRole) {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await offlineDb.cacheAuthSession({
          user: session.user,
          role: fetchedRole,
          email: session.user.email || "",
        });
      }
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + "/feedesk",
    });
    if (error) {
      toast({ title: "Reset Failed", description: error.message, variant: "destructive" });
    } else {
      setResetSent(true);
      toast({ title: "Reset Link Sent", description: "Check your email for the password reset link." });
      // Notify admins about password reset
      try {
        await supabase.functions.invoke("notify-admin-signup", { body: { email, type: "reset" } });
      } catch (e) {
        console.error("Admin reset notification failed:", e);
      }
    }
    setLoginLoading(false);
  };

  const isAllowedEmail = ALLOWED_EMAILS.includes(email.trim().toLowerCase());

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);

    // Offline login: check cached session
    if (!navigator.onLine) {
      const cached = await offlineDb.getCachedAuthSession();
      if (cached && cached.email.toLowerCase() === email.trim().toLowerCase()) {
        setUser(cached.user);
        setRole(cached.role);
        toast({ title: "📱 Offline Login", description: "Logged in using cached session." });
        setLoginLoading(false);
        return;
      } else {
        toast({ title: "Offline Login Failed", description: "No cached session found for this email. Please connect to the internet for your first login.", variant: "destructive" });
        setLoginLoading(false);
        return;
      }
    }

    if (isSignUp) {
      if (!isAllowedEmail) {
        toast({ title: "Access Restricted", description: "This email is not authorized for FeeDesk. Contact the administrator.", variant: "destructive" });
        setLoginLoading(false);
        return;
      }
      const { error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin + "/feedesk" } });
      if (error) {
        toast({ title: "Sign Up Failed", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Account Created!", description: "Please check your email to verify your account, then sign in." });
        setIsSignUp(false);
        try {
          await supabase.functions.invoke("notify-admin-signup", { body: { email } });
        } catch (e) {
          console.error("Admin notification failed:", e);
        }
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        toast({ title: "Login Failed", description: error.message, variant: "destructive" });
      }
    }
    setLoginLoading(false);
  };

  const handleLogout = async () => {
    // Clear cached session so login page shows and user can switch accounts
    await offlineDb.clearAuthSession();
    setUser(null);
    setRole(null);
    if (navigator.onLine) {
      await supabase.auth.signOut();
    }
  };

  // Fetch students
  useEffect(() => {
    if (user && role) fetchStudents();
  }, [user, role]);

  const fetchStudents = async () => {
    if (navigator.onLine) {
      const { data, error } = await supabase.from("students").select("*").eq("status", "active").order("standard").order("student_name");
      if (!error && data) {
        setStudents(data);
        offlineDb.cacheStudents(data);
      }
    } else {
      const cached = await offlineDb.getCachedStudents();
      if (cached.length > 0) setStudents(cached.filter((s: any) => s.status === "active"));
    }
  };

  const fetchPayments = async () => {
    if (navigator.onLine) {
      const { data, error } = await supabase.from("fee_payments").select("*, students(student_name, standard, section)").order("created_at", { ascending: false }).limit(1000);
      if (!error && data) {
        setPayments(data);
        offlineDb.cachePayments(data);
      }
    } else {
      const cached = await offlineDb.getCachedPayments();
      if (cached.length > 0) setPayments(cached);
    }
  };

  useEffect(() => {
    if (user && role) fetchPayments();
  }, [user, role]);

  // Fetch pending approvals
  const fetchPendingApprovals = async () => {
    if (!navigator.onLine) return;
    setPendingApprovalsLoading(true);
    const { data, error } = await supabase.from("pending_fee_payments" as any).select("*").eq("status", "pending").order("created_at", { ascending: false });
    if (!error && data) setPendingApprovals(data as any[]);
    setPendingApprovalsLoading(false);
  };

  useEffect(() => {
    if (user && role) fetchPendingApprovals();
  }, [user, role]);

  const handleApprovePayment = async (pending: any) => {
    setApprovingId(pending.id);
    try {
      const { data: studentData } = await supabase.from("students").select("id").ilike("student_name", pending.student_name).eq("standard", pending.standard).eq("section", pending.section).eq("status", "active").limit(1);
      if (!studentData || studentData.length === 0) {
        toast({ title: "Student Not Found", description: `No active student "${pending.student_name}" in Class ${pending.standard} ${pending.section}.`, variant: "destructive" });
        setApprovingId(null);
        return;
      }
      const { error: payError } = await supabase.from("fee_payments").insert([{
        student_id: studentData[0].id,
        amount: parseFloat(pending.amount) || 0,
        payment_method: pending.payment_method || "UPI",
        reference_id: pending.reference_id,
        term: null,
        notes: "Approved from online payment submission",
        recorded_by: user?.id,
      }]);
      if (payError) throw payError;
      await supabase.from("pending_fee_payments" as any).update({ status: "approved", reviewed_by: user?.id, reviewed_at: new Date().toISOString() } as any).eq("id", pending.id);
      toast({ title: "✅ Payment Approved", description: `Payment by ${pending.student_name} added to payment history.` });
      fetchPendingApprovals();
      fetchPayments();
    } catch (err: any) {
      console.error(err);
      toast({ title: "Approval Failed", description: err.message || "Please try again.", variant: "destructive" });
    }
    setApprovingId(null);
  };

  const handleRejectPayment = async (pending: any) => {
    setRejectingId(pending.id);
    try {
      await supabase.from("pending_fee_payments" as any).update({ status: "rejected", reviewed_by: user?.id, reviewed_at: new Date().toISOString() } as any).eq("id", pending.id);
      toast({ title: "❌ Payment Rejected", description: `Payment by ${pending.student_name} has been rejected.` });
      fetchPendingApprovals();
    } catch (err: any) {
      toast({ title: "Error", description: "Failed to reject. Try again.", variant: "destructive" });
    }
    setRejectingId(null);
  };

  const filteredStudents = students.filter((s) => {
    const matchStd = selectedStandard === "All" || s.standard === selectedStandard;
    const matchSearch = s.student_name.toLowerCase().includes(searchQuery.toLowerCase()) || s.admission_number.toLowerCase().includes(searchQuery.toLowerCase());
    return matchStd && matchSearch;
  });

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudent.admission_number || !newStudent.student_name || !newStudent.standard) {
      toast({ title: "Missing Fields", description: "Fill required fields.", variant: "destructive" });
      return;
    }
    const studentData = { ...newStudent, date_of_birth: newStudent.date_of_birth || null, gender: newStudent.gender || null, status: "active" };

    if (!navigator.onLine) {
      const offlineId = `offline_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      await offlineDb.addPendingMutation({ table: "students", type: "insert", data: studentData });
      setStudents((prev) => [...prev, { ...studentData, id: offlineId, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }]);
      await refreshPendingCount();
      toast({ title: "💾 Saved Offline", description: "Student saved locally. Will sync when online." });
    } else {
      const { error } = await supabase.from("students").insert([studentData]);
      if (error) {
        await offlineDb.addPendingMutation({ table: "students", type: "insert", data: studentData });
        await refreshPendingCount();
        toast({ title: "⚠️ Saved Offline", description: "Server error. Student saved locally for sync." });
      } else {
        toast({ title: "Student Added!" });
        fetchStudents();
      }
    }
    setShowAddStudent(false);
    setNewStudent({ admission_number: "", student_name: "", standard: "", section: "A", parent_name: "", parent_phone: "", date_of_birth: "", gender: "" });
  };

  // ===== FEATURE 1: Upload students from Excel/CSV =====
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadLoading(true);

    try {
      const data = await file.arrayBuffer();
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(data);
      const sheet = workbook.worksheets[0];
      if (!sheet || sheet.rowCount < 2) {
        toast({ title: "Empty File", description: "No data found in the uploaded file.", variant: "destructive" });
        setUploadLoading(false);
        return;
      }
      // Convert exceljs sheet to array of objects
      const headerRow = sheet.getRow(1);
      const headers: string[] = [];
      headerRow.eachCell((cell, colNumber) => {
        headers[colNumber] = String(cell.value || "").trim();
      });
      const rows: any[] = [];
      for (let i = 2; i <= sheet.rowCount; i++) {
        const row = sheet.getRow(i);
        const obj: any = {};
        let hasData = false;
        headers.forEach((h, colNumber) => {
          if (h) {
            const val = row.getCell(colNumber).value;
            obj[h] = val !== null && val !== undefined ? String(val) : "";
            if (obj[h]) hasData = true;
          }
        });
        if (hasData) rows.push(obj);
      }

      if (rows.length === 0) {
        toast({ title: "Empty File", description: "No data found in the uploaded file.", variant: "destructive" });
        setUploadLoading(false);
        return;
      }

      // Map columns
      const colHeaders = Object.keys(rows[0]);
      const columnMap: Record<string, string> = {};
      for (const h of colHeaders) {
        const mapped = matchColumn(h);
        if (mapped) columnMap[h] = mapped;
      }

      if (!Object.values(columnMap).includes("admission_number") || !Object.values(columnMap).includes("student_name") || !Object.values(columnMap).includes("standard")) {
        toast({
          title: "Missing Required Columns",
          description: "File must have columns for Admission Number, Student Name, and Standard/Class. Unrecognized columns will be skipped.",
          variant: "destructive",
        });
        setUploadLoading(false);
        return;
      }

      // Build student records
      const studentsToInsert: any[] = [];
      const skippedRows: number[] = [];
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const student: any = { section: "A", status: "active" };
        for (const [origCol, field] of Object.entries(columnMap)) {
          let val = String(row[origCol] || "").trim();
          if (field === "date_of_birth" && val) {
            // Try to parse date
            const parsed = new Date(val);
            if (!isNaN(parsed.getTime())) {
              val = parsed.toISOString().slice(0, 10);
            } else {
              val = "";
            }
          }
          if (val) student[field] = val;
        }
        if (student.admission_number && student.student_name && student.standard) {
          studentsToInsert.push(student);
        } else {
          skippedRows.push(i + 2); // +2 for header row + 1-indexed
        }
      }

      // Deduplicate by admission_number (keep last occurrence)
      const deduped = new Map<string, typeof studentsToInsert[0]>();
      for (const s of studentsToInsert) {
        deduped.set(s.admission_number, s);
      }
      const uniqueStudents = Array.from(deduped.values());

      if (uniqueStudents.length === 0) {
        toast({ title: "No Valid Rows", description: "No rows had the required fields (Admission Number, Student Name, Standard).", variant: "destructive" });
        setUploadLoading(false);
        return;
      }

      const { error } = await supabase.from("students").upsert(uniqueStudents, { onConflict: "admission_number" });
      if (error) {
        toast({ title: "Upload Error", description: error.message, variant: "destructive" });
      } else {
        toast({
          title: "Upload Successful!",
          description: `${studentsToInsert.length} students imported.${skippedRows.length > 0 ? ` ${skippedRows.length} rows skipped (missing required fields).` : ""}`,
        });
        fetchStudents();
      }
    } catch (err: any) {
      toast({ title: "File Error", description: err.message || "Could not read the file.", variant: "destructive" });
    }
    setUploadLoading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ===== FEATURE 2: Delete fee payment (admin only) =====
  const handleDeletePayment = async (paymentId: string) => {
    setDeleteLoading(true);
    if (!navigator.onLine) {
      await offlineDb.addPendingMutation({ table: "fee_payments", type: "delete", data: { id: paymentId } });
      setPayments((prev) => prev.filter((p) => p.id !== paymentId));
      await refreshPendingCount();
      toast({ title: "💾 Saved Offline", description: "Delete queued. Will sync when online." });
    } else {
      const { error } = await supabase.from("fee_payments").delete().eq("id", paymentId);
      if (error) {
        await offlineDb.addPendingMutation({ table: "fee_payments", type: "delete", data: { id: paymentId } });
        setPayments((prev) => prev.filter((p) => p.id !== paymentId));
        await refreshPendingCount();
        toast({ title: "⚠️ Saved Offline", description: "Server error. Delete queued for sync." });
      } else {
        toast({ title: "Payment Deleted", description: "The fee entry has been removed." });
        fetchPayments();
      }
    }
    setDeletePaymentId(null);
    setDeleteLoading(false);
  };

  // Edit fee payment (admin only)
  const startEditPayment = (p: any) => {
    setEditingPaymentId(p.id);
    setEditPaymentForm({
      amount: String(p.amount),
      term: p.term || "",
      payment_method: p.payment_method || "Cash",
      reference_id: p.reference_id || "",
    });
  };

  const handleSaveEditPayment = async () => {
    if (!editingPaymentId || !editPaymentForm.amount || !editPaymentForm.term) {
      toast({ title: "Missing Fields", description: "Amount and Term are required.", variant: "destructive" });
      return;
    }
    setEditPaymentLoading(true);
    const updateData = {
      id: editingPaymentId,
      amount: parseFloat(editPaymentForm.amount),
      term: editPaymentForm.term,
      payment_method: editPaymentForm.payment_method,
      reference_id: editPaymentForm.reference_id || null,
    };

    if (!navigator.onLine) {
      await offlineDb.addPendingMutation({ table: "fee_payments", type: "update", data: updateData });
      setPayments((prev) => prev.map((p) => p.id === editingPaymentId ? { ...p, ...updateData } : p));
      await refreshPendingCount();
      toast({ title: "💾 Saved Offline", description: "Edit queued. Will sync when online." });
      setEditingPaymentId(null);
    } else {
      const { id, ...rest } = updateData;
      const { error } = await supabase.from("fee_payments").update(rest).eq("id", editingPaymentId);
      if (error) {
        await offlineDb.addPendingMutation({ table: "fee_payments", type: "update", data: updateData });
        setPayments((prev) => prev.map((p) => p.id === editingPaymentId ? { ...p, ...updateData } : p));
        await refreshPendingCount();
        toast({ title: "⚠️ Saved Offline", description: "Server error. Edit queued for sync." });
        setEditingPaymentId(null);
      } else {
        toast({ title: "Payment Updated!" });
        setEditingPaymentId(null);
        fetchPayments();
      }
    }
    setEditPaymentLoading(false);
  };

  // Filtered payments for history tab
  const getFilteredPaymentsForHistory = () => {
    let filtered = [...payments];
    if (paymentDateFrom) {
      filtered = filtered.filter((p) => {
        const d = p.created_at ? new Date(p.created_at) : new Date(p.payment_date);
        return d >= new Date(paymentDateFrom);
      });
    }
    if (paymentDateTo) {
      const toDate = new Date(paymentDateTo);
      toDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter((p) => {
        const d = p.created_at ? new Date(p.created_at) : new Date(p.payment_date);
        return d <= toDate;
      });
    }
    return filtered;
  };

  const togglePaymentSelection = (id: string) => {
    setSelectedPaymentIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleBulkPrintPayments = () => {
    const filtered = getFilteredPaymentsForHistory();
    const selected = filtered.filter((p) => selectedPaymentIds.has(p.id));
    const toPrint = selected.length > 0 ? selected : filtered;
    const fields = toPrint.map((p) => ({
      label: `${p.receipt_number} | ${p.students?.student_name || "—"} | ${p.students?.standard || ""} ${p.students?.section || ""}`,
      value: `₹${p.amount} | ${p.term} | ${p.payment_method} | ${p.created_at ? new Date(p.created_at).toLocaleString("en-IN") : new Date(p.payment_date).toLocaleDateString("en-IN")}`,
    }));
    const grandTotal = toPrint.reduce((s, p) => s + Number(p.amount), 0);
    fields.push({ label: "GRAND TOTAL", value: `₹${grandTotal.toLocaleString("en-IN")} (${toPrint.length} payments)` });
    const dateRange = paymentDateFrom || paymentDateTo ? `${paymentDateFrom || "Start"} to ${paymentDateTo || "Today"}` : "All Time";
    openPrintableTemplate({
      title: "Payment History Report",
      subtitle: `Date Range: ${dateRange}${selected.length > 0 ? ` | ${selected.length} selected` : ""}`,
      fieldGroups: [{ heading: "Payments", fields }],
    });
  };

  const handleBulkDownloadPayments = async () => {
    const filtered = getFilteredPaymentsForHistory();
    const selected = filtered.filter((p) => selectedPaymentIds.has(p.id));
    const toDownload = selected.length > 0 ? selected : filtered;
    const dateRange = paymentDateFrom || paymentDateTo ? `${paymentDateFrom || "Start"} to ${paymentDateTo || "Today"}` : "All Time";
    const wsData = [
      ["Payment History — Nethaji Vidhyalayam"],
      [`Date Range: ${dateRange}`],
      [],
      ["Receipt No", "Student Name", "Class", "Section", "Term", "Amount (₹)", "Method", "Reference ID", "Date & Time"],
      ...toDownload.map((p) => [
        p.receipt_number,
        p.students?.student_name || "—",
        p.students?.standard || "",
        p.students?.section || "",
        p.term,
        p.amount,
        p.payment_method,
        p.reference_id || "",
        p.created_at ? new Date(p.created_at).toLocaleString("en-IN") : new Date(p.payment_date).toLocaleDateString("en-IN"),
      ]),
      [],
      ["GRAND TOTAL", "", "", "", "", toDownload.reduce((s, p) => s + Number(p.amount), 0), "", "", ""],
    ];
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet("Payments");
    wsData.forEach((row) => ws.addRow(row));
    const buffer = await wb.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `PaymentHistory_${new Date().toISOString().slice(0, 10)}.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Term-wise fee calculation for student list
  const getTermFee = (studentId: string, term: string) => {
    return payments.filter((p) => p.student_id === studentId && p.term === term).reduce((sum, p) => sum + Number(p.amount), 0);
  };

  // ===== Bulk delete students (admin only) =====
  const handleBulkDeleteStudents = async () => {
    if (selectedStudentIds.size === 0) return;
    setBulkDeleteLoading(true);
    const ids = Array.from(selectedStudentIds);

    if (!navigator.onLine) {
      for (const id of ids) {
        await offlineDb.addPendingMutation({ table: "students", type: "delete", data: { id } });
      }
      setStudents((prev) => prev.filter((s) => !ids.includes(s.id)));
      await refreshPendingCount();
      toast({ title: "💾 Saved Offline", description: `${ids.length} student delete(s) queued for sync.` });
      setSelectedStudentIds(new Set());
    } else {
      const { error } = await supabase.from("students").update({ status: "inactive" }).in("id", ids);
      if (error) {
        for (const id of ids) {
          await offlineDb.addPendingMutation({ table: "students", type: "delete", data: { id } });
        }
        setStudents((prev) => prev.filter((s) => !ids.includes(s.id)));
        await refreshPendingCount();
        toast({ title: "⚠️ Saved Offline", description: "Server error. Deletes queued for sync." });
        setSelectedStudentIds(new Set());
      } else {
        toast({ title: "Students Removed", description: `${ids.length} student(s) removed from active list.` });
        setSelectedStudentIds(new Set());
        fetchStudents();
      }
    }
    setBulkDeleteLoading(false);
  };

  const toggleStudentSelection = (id: string) => {
    setSelectedStudentIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  // Edit student (admin only)
  const startEditStudent = (s: any) => {
    setEditingStudentId(s.id);
    setEditForm({
      admission_number: s.admission_number || "",
      student_name: s.student_name || "",
      standard: s.standard || "",
      section: s.section || "A",
      parent_phone: s.parent_phone || "",
    });
  };

  const handleSaveEditStudent = async () => {
    if (!editingStudentId) return;
    if (!editForm.admission_number || !editForm.student_name || !editForm.standard) {
      toast({ title: "Missing Fields", description: "Adm. No, Name and Standard are required.", variant: "destructive" });
      return;
    }
    setEditLoading(true);
    const updateData = {
      id: editingStudentId,
      admission_number: editForm.admission_number,
      student_name: editForm.student_name,
      standard: editForm.standard,
      section: editForm.section,
      parent_phone: editForm.parent_phone || null,
    };

    if (!navigator.onLine) {
      await offlineDb.addPendingMutation({ table: "students", type: "update", data: updateData });
      setStudents((prev) => prev.map((s) => s.id === editingStudentId ? { ...s, ...updateData } : s));
      await refreshPendingCount();
      toast({ title: "💾 Saved Offline", description: "Edit saved locally. Will sync when online." });
      setEditingStudentId(null);
    } else {
      const { id, ...rest } = updateData;
      const { error } = await supabase.from("students").update(rest).eq("id", editingStudentId);
      if (error) {
        await offlineDb.addPendingMutation({ table: "students", type: "update", data: updateData });
        await refreshPendingCount();
        toast({ title: "⚠️ Saved Offline", description: "Server error. Edit saved locally for sync." });
        setEditingStudentId(null);
      } else {
        toast({ title: "Student Updated!" });
        setEditingStudentId(null);
        fetchStudents();
      }
    }
    setEditLoading(false);
  };

  const toggleSelectAll = () => {
    if (selectedStudentIds.size === filteredStudents.length) {
      setSelectedStudentIds(new Set());
    } else {
      setSelectedStudentIds(new Set(filteredStudents.map((s) => s.id)));
    }
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !paymentForm.amount || !paymentForm.term) {
      toast({ title: "Missing Fields", description: "Select student, enter amount and term.", variant: "destructive" });
      return;
    }
    setPaymentLoading(true);

    const paymentData = {
      student_id: selectedStudent.id,
      amount: parseFloat(paymentForm.amount),
      term: paymentForm.term,
      payment_method: paymentForm.payment_method,
      reference_id: paymentForm.reference_id || null,
      notes: paymentForm.notes || null,
      recorded_by: user.id,
    };

    if (!navigator.onLine) {
      // Queue for later sync
      const offlineId = `offline_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      const offlinePayment = {
        ...paymentData,
        id: offlineId,
        receipt_number: `OFFLINE-${Date.now()}`,
        created_at: new Date().toISOString(),
        payment_date: new Date().toISOString().slice(0, 10),
        students: { student_name: selectedStudent.student_name, standard: selectedStudent.standard, section: selectedStudent.section },
      };
      await offlineDb.addPendingMutation({ table: "fee_payments", type: "insert", data: paymentData });
      // Add to local state for immediate display
      setPayments((prev) => [offlinePayment, ...prev]);
      await refreshPendingCount();
      toast({ title: "💾 Saved Offline", description: "Payment saved locally. Will sync when internet is available." });
      setPaymentForm({ amount: "", term: "", payment_method: "Cash", reference_id: "", notes: "" });
      setSelectedStudent(null);
    } else {
      const { data, error } = await supabase.from("fee_payments").insert([paymentData]).select().single();
      if (error) {
        // If online but failed, queue offline
        await offlineDb.addPendingMutation({ table: "fee_payments", type: "insert", data: paymentData });
        await refreshPendingCount();
        toast({ title: "⚠️ Saved Offline", description: "Server error. Payment saved locally for sync." });
      } else {
        toast({ title: "Payment Recorded!", description: `Receipt: ${data.receipt_number}` });
        openPrintableTemplate({
          title: "Fee Payment Receipt",
          subtitle: `${selectedStudent.student_name} — Class ${selectedStudent.standard} ${selectedStudent.section}`,
          fieldGroups: [
            { heading: "Student Details", fields: [
              { label: "Name", value: selectedStudent.student_name },
              { label: "Admission No", value: selectedStudent.admission_number },
              { label: "Standard", value: selectedStudent.standard },
              { label: "Section", value: selectedStudent.section },
            ]},
            { heading: "Payment Details", fields: [
              { label: "Receipt No", value: data.receipt_number },
              { label: "Term", value: paymentForm.term },
              { label: "Amount", value: `₹${paymentForm.amount}` },
              { label: "Method", value: paymentForm.payment_method },
              { label: "Reference ID", value: paymentForm.reference_id || "N/A" },
              { label: "Collected At", value: data?.created_at ? new Date(data.created_at).toLocaleString("en-IN") : new Date().toLocaleString("en-IN") },
            ]},
          ],
          receiptMode: true,
          receiptDetails: { referenceId: data.receipt_number, paymentMethod: paymentForm.payment_method, amount: paymentForm.amount },
        });
        fetchPayments();
      }
      setPaymentForm({ amount: "", term: "", payment_method: "Cash", reference_id: "", notes: "" });
      setSelectedStudent(null);
    }
    setPaymentLoading(false);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-accent" /></div>;

  // Login screen
  if (!user) {
    return (
      <div className="min-h-screen bg-secondary flex items-center justify-center p-4">
        <div className="bg-background rounded-2xl shadow-2xl p-8 w-full max-w-md relative">
          <a href="/" className="absolute top-4 right-4 text-muted-foreground hover:text-destructive transition-colors" aria-label="Close">
            <X className="h-5 w-5" />
          </a>
          <div className="text-center mb-8">
            <h1 className="font-serif text-3xl font-bold text-primary">FeeDesk</h1>
            <p className="text-muted-foreground mt-2">Nethaji Vidhyalayam — {isForgotPassword ? "Reset Password" : isSignUp ? "Create Account" : "Staff Login"}</p>
          </div>
          {isForgotPassword ? (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="staff@example.com" required />
              </div>
              {resetSent ? (
                <p className="text-center text-sm text-green-600 bg-green-50 p-3 rounded-lg">
                  ✅ Reset link sent!<br />
                  <strong>From:</strong> noreply@mail.app.supabase.io<br />
                  <strong>To:</strong> {email}<br />
                  Check your email inbox (including Spam/Junk folder) and click the link to reset your password.
                </p>
              ) : (
                <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" disabled={loginLoading}>
                  {loginLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Send Reset Link
                </Button>
              )}
              <p className="text-center text-sm text-muted-foreground mt-4">
                <button onClick={() => { setIsForgotPassword(false); setResetSent(false); }} className="text-accent font-semibold hover:underline">
                  Back to Sign In
                </button>
              </p>
            </form>
          ) : (
            <>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="staff@example.com" required />
                </div>
                <div className="space-y-2">
                  <Label>Password</Label>
                  <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required minLength={6} />
                </div>
                {!isSignUp && (
                  <div className="text-right">
                    <button type="button" onClick={() => setIsForgotPassword(true)} className="text-xs text-accent hover:underline">
                      Forgot Password?
                    </button>
                  </div>
                )}
                <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" disabled={loginLoading}>
                  {loginLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  {isSignUp ? "Sign Up" : "Sign In"}
                </Button>
              </form>
              {isSignUp && (
                <p className="text-center text-xs text-muted-foreground mt-3 bg-secondary/50 p-2 rounded-lg">
                  📧 After signing up, contact admin at <strong>nethajividhyalayam@gmail.com</strong> or <strong>nareshkumar.jayachandran@gmail.com</strong> to get your role assigned.
                </p>
              )}
              {!isSignUp && email && !isAllowedEmail && (
                <p className="text-center text-xs text-destructive mt-3 bg-destructive/10 p-2 rounded-lg">
                  ⚠️ This email is not authorized for FeeDesk access. Only authorized staff emails can sign in.
                </p>
              )}
              {isAllowedEmail && (
                <p className="text-center text-sm text-muted-foreground mt-4">
                  {isSignUp ? "Already have an account?" : "Need an account?"}{" "}
                  <button onClick={() => setIsSignUp(!isSignUp)} className="text-accent font-semibold hover:underline">
                    {isSignUp ? "Sign In" : "Sign Up"}
                  </button>
                </p>
              )}
            </>
          )}
          <a href="/" className="block text-center mt-4 text-sm text-muted-foreground hover:text-primary font-medium transition-colors">
            Cancel
          </a>
        </div>
      </div>
    );
  }

  // No role assigned
  if (!role) {
    if (roleLoading) {
      return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-accent" /></div>;
    }
    return (
      <div className="min-h-screen bg-secondary flex items-center justify-center p-4">
        <div className="bg-background rounded-2xl shadow-2xl p-8 w-full max-w-md text-center">
          <h2 className="font-serif text-2xl font-bold text-primary mb-4">Access Denied</h2>
          <p className="text-muted-foreground mb-4">Your account does not have a role assigned.</p>
          <p className="text-sm text-muted-foreground mb-6 bg-secondary/50 p-3 rounded-lg">
            📧 Contact the administrator at <strong>nethajividhyalayam@gmail.com</strong> or <strong>nareshkumar.jayachandran@gmail.com</strong> to get your credentials and role assigned.
          </p>
          <Button onClick={handleLogout} variant="outline">Log Out</Button>
        </div>
      </div>
    );
  }

  // ===== FEATURE 3: Reports helpers =====
  const getFilteredPaymentsForReport = () => {
    let filtered = [...payments];
    if (reportDateFrom) {
      filtered = filtered.filter((p) => {
        const d = p.created_at ? new Date(p.created_at) : new Date(p.payment_date);
        return d >= new Date(reportDateFrom);
      });
    }
    if (reportDateTo) {
      const toDate = new Date(reportDateTo);
      toDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter((p) => {
        const d = p.created_at ? new Date(p.created_at) : new Date(p.payment_date);
        return d <= toDate;
      });
    }
    return filtered;
  };

  const handlePrintReport = (mode: string, reportData: any[]) => {
    const fields = reportData.map((r) => ({ label: r.label, value: `${r.count} payments — ₹${r.total.toLocaleString("en-IN")}` }));
    const grandTotal = reportData.reduce((s, r) => s + r.total, 0);
    fields.push({ label: "GRAND TOTAL", value: `₹${grandTotal.toLocaleString("en-IN")}` });
    const dateRange = reportDateFrom || reportDateTo
      ? `${reportDateFrom || "Start"} to ${reportDateTo || "Today"}`
      : "All Time";
    openPrintableTemplate({
      title: `${mode.charAt(0).toUpperCase() + mode.slice(1)} Fee Statement`,
      subtitle: `Date Range: ${dateRange}`,
      fieldGroups: [{ heading: `${mode.charAt(0).toUpperCase() + mode.slice(1)} Breakdown`, fields }],
    });
  };

  const handleDownloadReport = async (mode: string, reportData: any[]) => {
    const grandTotal = reportData.reduce((s, r) => s + r.total, 0);
    const dateRange = reportDateFrom || reportDateTo
      ? `${reportDateFrom || "Start"} to ${reportDateTo || "Today"}`
      : "All Time";
    const wsData = [
      [`${mode.charAt(0).toUpperCase() + mode.slice(1)} Fee Statement — Nethaji Vidhyalayam`],
      [`Date Range: ${dateRange}`],
      [],
      ["Period", "No. of Payments", "Total Collected (₹)"],
      ...reportData.map((r) => [r.label, r.count, r.total]),
      [],
      ["GRAND TOTAL", reportData.reduce((s, r) => s + r.count, 0), grandTotal],
    ];
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet("Report");
    wsData.forEach((row) => ws.addRow(row));
    const buffer = await wb.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `FeeStatement_${mode}_${new Date().toISOString().slice(0, 10)}.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-secondary">
      <OfflineBanner
        isOnline={isOnline}
        appName="FeeDesk"
        offlineCapabilities="All data available offline — changes will sync when online"
      />
      {/* Top bar */}
      <div className="bg-primary text-primary-foreground px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BookOpen className="h-6 w-6" />
          <h1 className="font-serif text-xl font-bold">FeeDesk — Nethaji Vidhyalayam</h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm bg-accent/20 px-3 py-1 rounded-full capitalize">{role}</span>
          <Button onClick={handleLogout} variant="ghost" size="sm" className="text-primary-foreground hover:text-accent">
            <LogOut className="h-4 w-4 mr-2" /> Logout
          </Button>
        </div>
      </div>

      {/* Offline Status Bar */}
      <div className={`px-4 py-2 flex items-center justify-between text-sm transition-all ${!isOnline ? "bg-destructive/10 text-destructive" : pendingCount > 0 ? "bg-accent/10 text-accent-foreground" : "bg-accent/5 text-muted-foreground"}`}>
        <div className="flex items-center gap-2">
          {isOnline ? <Wifi className="h-4 w-4 text-accent" /> : <WifiOff className="h-4 w-4" />}
          <span className="font-medium">
            {!isOnline ? "Offline — Changes saved locally" : syncing ? "Syncing..." : "Online"}
          </span>
          {pendingCount > 0 && (
            <span className="bg-destructive/20 text-destructive px-2 py-0.5 rounded-full text-xs font-bold">
              {pendingCount} pending
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {lastSyncTime && (
            <span className="text-xs text-muted-foreground">
              Last sync: {new Date(lastSyncTime).toLocaleString("en-IN")}
            </span>
          )}
          {isOnline && pendingCount > 0 && (
            <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={syncPendingMutations} disabled={syncing}>
              <RefreshCw className={`h-3 w-3 ${syncing ? "animate-spin" : ""}`} /> Sync Now
            </Button>
          )}
        </div>
      </div>

      <div className="container-custom py-6">
        <Tabs defaultValue="students" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-background shadow-sm rounded-xl p-1 flex-wrap h-auto">
            <TabsTrigger value="students" className="gap-2"><Users className="h-4 w-4" /> Students</TabsTrigger>
            <TabsTrigger value="collect-fee" className="gap-2"><CreditCard className="h-4 w-4" /> Collect Fee</TabsTrigger>
            <TabsTrigger value="payments" className="gap-2"><FileText className="h-4 w-4" /> Payments</TabsTrigger>
            <TabsTrigger value="pending-approvals" className="gap-2 relative">
              <Clock className="h-4 w-4" /> Approvals
              {pendingApprovals.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center">{pendingApprovals.length}</span>
              )}
            </TabsTrigger>
            {role === "admin" && <TabsTrigger value="reports" className="gap-2"><BarChart3 className="h-4 w-4" /> Reports</TabsTrigger>}
          </TabsList>

          {/* Students Tab */}
          <TabsContent value="students">
            <div className="bg-background rounded-2xl shadow-lg p-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <h2 className="font-serif text-2xl font-bold text-primary">Students List</h2>
                <div className="flex gap-3 flex-wrap">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search..." className="pl-9 w-48" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                  </div>
                  <Select value={selectedStandard} onValueChange={setSelectedStandard}>
                    <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All Standards</SelectItem>
                      {standards.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  {/* Upload button */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                  <Button
                    variant="outline"
                    className="gap-2"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadLoading}
                  >
                    {uploadLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                    Upload List
                  </Button>
                  <Button onClick={() => setShowAddStudent(true)} className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2">
                    <PlusCircle className="h-4 w-4" /> Add Student
                  </Button>
                </div>
              </div>

              {/* Upload hint */}
              <p className="text-xs text-muted-foreground mb-4">
                📤 Upload Excel (.xlsx/.xls) or CSV with columns: <strong>Admission No, Student Name, Standard</strong> (required). Optional: Section, Parent Name, Phone, Email, DOB, Gender, Blood Group, Aadhaar, Address. Unrecognized columns are skipped.
              </p>

              {/* Add student form */}
              {showAddStudent && (
                <form onSubmit={handleAddStudent} className="bg-secondary p-6 rounded-xl mb-6 space-y-4">
                  <h3 className="font-semibold text-lg">Add New Student</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1"><Label>Admission No *</Label><Input value={newStudent.admission_number} onChange={(e) => setNewStudent({ ...newStudent, admission_number: e.target.value })} /></div>
                    <div className="space-y-1"><Label>Student Name *</Label><Input value={newStudent.student_name} onChange={(e) => setNewStudent({ ...newStudent, student_name: e.target.value })} /></div>
                    <div className="space-y-1"><Label>Standard *</Label>
                      <Select value={newStudent.standard} onValueChange={(v) => setNewStudent({ ...newStudent, standard: v })}>
                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>{standards.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1"><Label>Section</Label>
                      <Select value={newStudent.section} onValueChange={(v) => setNewStudent({ ...newStudent, section: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>{sections.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1"><Label>Parent Name</Label><Input value={newStudent.parent_name} onChange={(e) => setNewStudent({ ...newStudent, parent_name: e.target.value })} /></div>
                    <div className="space-y-1"><Label>Parent Phone</Label><Input value={newStudent.parent_phone} onChange={(e) => setNewStudent({ ...newStudent, parent_phone: e.target.value })} /></div>
                  </div>
                  <div className="flex gap-3">
                    <Button type="submit" className="bg-accent hover:bg-accent/90 text-accent-foreground">Save Student</Button>
                    <Button type="button" variant="outline" onClick={() => setShowAddStudent(false)}>Cancel</Button>
                  </div>
                </form>
              )}

              {/* Bulk delete bar (admin only) */}
              {role === "admin" && selectedStudentIds.size > 0 && (
                <div className="flex items-center gap-3 mb-4 p-3 bg-destructive/10 rounded-xl">
                  <span className="text-sm font-semibold text-destructive">{selectedStudentIds.size} student(s) selected</span>
                  <Button size="sm" variant="destructive" className="gap-1" onClick={handleBulkDeleteStudents} disabled={bulkDeleteLoading}>
                    {bulkDeleteLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    Delete Selected
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setSelectedStudentIds(new Set())}>Clear</Button>
                </div>
              )}

              {/* Students table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      {role === "admin" && (
                        <th className="p-3 w-10">
                          <input type="checkbox" checked={filteredStudents.length > 0 && selectedStudentIds.size === filteredStudents.length} onChange={toggleSelectAll} className="accent-accent h-4 w-4" />
                        </th>
                      )}
                      <th className="p-3 font-semibold">Adm. No</th>
                      <th className="p-3 font-semibold">Name</th>
                      <th className="p-3 font-semibold">Standard</th>
                      <th className="p-3 font-semibold">Section</th>
                      <th className="p-3 font-semibold">Parent</th>
                      <th className="p-3 font-semibold">Phone</th>
                      <th className="p-3 font-semibold text-center">
                        <Select value={feeTermFilter} onValueChange={setFeeTermFilter}>
                          <SelectTrigger className="h-7 text-xs w-24 mx-auto font-semibold"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Total">Total</SelectItem>
                            <SelectItem value="Term 1">Term 1</SelectItem>
                            <SelectItem value="Term 2">Term 2</SelectItem>
                            <SelectItem value="Term 3">Term 3</SelectItem>
                            <SelectItem value="Annual">Annual</SelectItem>
                          </SelectContent>
                        </Select>
                      </th>
                      <th className="p-3 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.length === 0 ? (
                      <tr><td colSpan={role === "admin" ? 9 : 8} className="p-8 text-center text-muted-foreground">No students found. Add students to get started.</td></tr>
                    ) : filteredStudents.map((s) => (
                      <tr key={s.id} className={`border-b hover:bg-secondary/50 transition-colors ${selectedStudentIds.has(s.id) ? "bg-destructive/5" : ""} ${pendingSyncIds.has(s.id) ? "bg-amber-50 dark:bg-amber-950/20" : ""}`}>
                        {role === "admin" && (
                          <td className="p-3">
                            <input type="checkbox" checked={selectedStudentIds.has(s.id)} onChange={() => toggleStudentSelection(s.id)} className="accent-accent h-4 w-4" />
                          </td>
                        )}
                        {editingStudentId === s.id ? (
                          <>
                            <td className="p-2"><Input className="h-8 text-xs w-20" value={editForm.admission_number} onChange={(e) => setEditForm({ ...editForm, admission_number: e.target.value })} /></td>
                            <td className="p-2"><Input className="h-8 text-xs w-28" value={editForm.student_name} onChange={(e) => setEditForm({ ...editForm, student_name: e.target.value })} /></td>
                            <td className="p-2">
                              <Select value={editForm.standard} onValueChange={(v) => setEditForm({ ...editForm, standard: v })}>
                                <SelectTrigger className="h-8 text-xs w-20"><SelectValue /></SelectTrigger>
                                <SelectContent>{standards.map((st) => <SelectItem key={st} value={st}>{st}</SelectItem>)}</SelectContent>
                              </Select>
                            </td>
                            <td className="p-2">
                              <Select value={editForm.section} onValueChange={(v) => setEditForm({ ...editForm, section: v })}>
                                <SelectTrigger className="h-8 text-xs w-16"><SelectValue /></SelectTrigger>
                                <SelectContent>{sections.map((sc) => <SelectItem key={sc} value={sc}>{sc}</SelectItem>)}</SelectContent>
                              </Select>
                            </td>
                            <td className="p-3">{s.parent_name || "—"}</td>
                            <td className="p-2"><Input className="h-8 text-xs w-28" value={editForm.parent_phone} onChange={(e) => setEditForm({ ...editForm, parent_phone: e.target.value })} /></td>
                            <td className="p-3 text-center text-xs font-semibold text-accent">
                              ₹{(feeTermFilter === "Total"
                                ? payments.filter(p => p.student_id === s.id).reduce((sum, p) => sum + Number(p.amount), 0)
                                : getTermFee(s.id, feeTermFilter)
                              ).toLocaleString("en-IN")}
                            </td>
                            <td className="p-3 flex gap-1">
                              <Button size="sm" className="gap-1 text-xs bg-accent hover:bg-accent/90 text-accent-foreground" onClick={handleSaveEditStudent} disabled={editLoading}>
                                {editLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />} Save
                              </Button>
                              <Button size="sm" variant="outline" className="text-xs" onClick={() => setEditingStudentId(null)}>
                                <X className="h-3 w-3" />
                              </Button>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="p-3 font-mono text-xs">{s.admission_number}</td>
                            <td className="p-3 font-semibold">{s.student_name}{pendingSyncIds.has(s.id) && <span className="ml-1.5 inline-flex items-center gap-0.5 text-[10px] font-bold text-amber-600 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400 px-1.5 py-0.5 rounded-full"><RefreshCw className="h-2.5 w-2.5" />Pending</span>}</td>
                            <td className="p-3">{s.standard}</td>
                            <td className="p-3">{s.section}</td>
                            <td className="p-3">{s.parent_name || "—"}</td>
                            <td className="p-3">{s.parent_phone || "—"}</td>
                            <td className="p-3 text-center text-xs font-semibold text-accent">
                              ₹{(feeTermFilter === "Total"
                                ? payments.filter(p => p.student_id === s.id).reduce((sum, p) => sum + Number(p.amount), 0)
                                : getTermFee(s.id, feeTermFilter)
                              ).toLocaleString("en-IN")}
                            </td>
                            <td className="p-3 flex gap-1">
                              {role === "admin" && (
                                <Button size="sm" variant="outline" className="gap-1 text-xs" onClick={() => startEditStudent(s)}>
                                  <Pencil className="h-3 w-3" /> Edit
                                </Button>
                              )}
                              <Button size="sm" className="gap-1 text-xs bg-accent hover:bg-accent/90 text-accent-foreground font-bold shadow-md" onClick={() => { setSelectedStudent(s); setActiveTab("collect-fee"); }}>
                                <DollarSign className="h-3 w-3" /> Pay Fee
                              </Button>
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-muted-foreground mt-4">Total: {filteredStudents.length} students</p>
            </div>
          </TabsContent>

          {/* Collect Fee Tab */}
          <TabsContent value="collect-fee">
            <div className="bg-background rounded-2xl shadow-lg p-6 max-w-2xl mx-auto">
              <h2 className="font-serif text-2xl font-bold text-primary mb-2">Collect Fee Payment</h2>
              <p className="text-sm text-muted-foreground mb-6">Collected At: {new Date().toLocaleString("en-IN")}</p>
              <div className="space-y-2 mb-6">
                <Label className="font-semibold">Select Student</Label>
                <Select value={selectedStudent?.id || ""} onValueChange={(v) => setSelectedStudent(students.find((s) => s.id === v) || null)}>
                  <SelectTrigger><SelectValue placeholder="Choose a student" /></SelectTrigger>
                  <SelectContent>
                    {students.map((s) => (
                      <SelectItem key={s.id} value={s.id}>{s.admission_number} — {s.student_name} ({s.standard} {s.section})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedStudent && (
                <div className="bg-secondary p-4 rounded-xl mb-6">
                  <p className="font-semibold">{selectedStudent.student_name}</p>
                  <p className="text-sm text-muted-foreground">Class {selectedStudent.standard} {selectedStudent.section} | Adm: {selectedStudent.admission_number}</p>
                </div>
              )}

              <form onSubmit={handlePayment} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="font-semibold">Term *</Label>
                    <Select value={paymentForm.term} onValueChange={(v) => setPaymentForm({ ...paymentForm, term: v })}>
                      <SelectTrigger><SelectValue placeholder="Select Term" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Term 1">Term 1</SelectItem>
                        <SelectItem value="Term 2">Term 2</SelectItem>
                        <SelectItem value="Term 3">Term 3</SelectItem>
                        <SelectItem value="Annual">Annual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="font-semibold">Amount (₹) *</Label>
                    <Input type="number" placeholder="5000" value={paymentForm.amount} onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="font-semibold">Payment Method</Label>
                    <Select value={paymentForm.payment_method} onValueChange={(v) => setPaymentForm({ ...paymentForm, payment_method: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Cash">Cash</SelectItem>
                        <SelectItem value="UPI">UPI</SelectItem>
                        <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                        <SelectItem value="Online">Online</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="font-semibold">Reference ID</Label>
                    <Input placeholder="Transaction ref" value={paymentForm.reference_id} onChange={(e) => setPaymentForm({ ...paymentForm, reference_id: e.target.value })} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="font-semibold">Notes</Label>
                  <Input placeholder="Optional notes" value={paymentForm.notes} onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })} />
                </div>
                <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" disabled={paymentLoading}>
                  {paymentLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CreditCard className="h-4 w-4 mr-2" />}
                  Record Payment & Print Receipt
                </Button>
              </form>
            </div>
          </TabsContent>

          {/* Payments History Tab */}
          <TabsContent value="payments">
            <div className="bg-background rounded-2xl shadow-lg p-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <h2 className="font-serif text-2xl font-bold text-primary">Payment History</h2>
                <div className="flex gap-3 flex-wrap items-end">
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold flex items-center gap-1"><Calendar className="h-3 w-3" /> From</Label>
                    <Input type="date" value={paymentDateFrom} onChange={(e) => setPaymentDateFrom(e.target.value)} className="w-40 h-9" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold flex items-center gap-1"><Calendar className="h-3 w-3" /> To</Label>
                    <Input type="date" value={paymentDateTo} onChange={(e) => setPaymentDateTo(e.target.value)} className="w-40 h-9" />
                  </div>
                  {(paymentDateFrom || paymentDateTo) && (
                    <Button variant="ghost" size="sm" onClick={() => { setPaymentDateFrom(""); setPaymentDateTo(""); }}>Clear</Button>
                  )}
                  {role === "admin" && (
                    <>
                      <Button variant="outline" size="sm" className="gap-1" onClick={handleBulkPrintPayments}>
                        <Printer className="h-4 w-4" /> {selectedPaymentIds.size > 0 ? `Print (${selectedPaymentIds.size})` : "Print All"}
                      </Button>
                      <Button variant="outline" size="sm" className="gap-1" onClick={handleBulkDownloadPayments}>
                        <Download className="h-4 w-4" /> {selectedPaymentIds.size > 0 ? `Download (${selectedPaymentIds.size})` : "Download All"}
                      </Button>
                    </>
                  )}
                </div>
              </div>
              {(() => {
                const historyPayments = getFilteredPaymentsForHistory();
                return (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b text-left">
                          {role === "admin" && (
                            <th className="p-3 w-10">
                              <input type="checkbox" checked={historyPayments.length > 0 && selectedPaymentIds.size === historyPayments.length} onChange={() => {
                                if (selectedPaymentIds.size === historyPayments.length) setSelectedPaymentIds(new Set());
                                else setSelectedPaymentIds(new Set(historyPayments.map((p) => p.id)));
                              }} className="accent-accent h-4 w-4" />
                            </th>
                          )}
                          <th className="p-3 font-semibold">Receipt</th>
                          <th className="p-3 font-semibold">Student</th>
                          <th className="p-3 font-semibold">Class</th>
                          <th className="p-3 font-semibold">Term</th>
                          <th className="p-3 font-semibold">Amount</th>
                          <th className="p-3 font-semibold">Method</th>
                          <th className="p-3 font-semibold">Date & Time</th>
                          <th className="p-3 font-semibold">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {historyPayments.length === 0 ? (
                          <tr><td colSpan={role === "admin" ? 10 : 9} className="p-8 text-center text-muted-foreground">No payments found for the selected period.</td></tr>
                        ) : historyPayments.map((p) => (
                          <tr key={p.id} className={`border-b hover:bg-secondary/50 transition-colors ${selectedPaymentIds.has(p.id) ? "bg-accent/5" : ""} ${pendingSyncIds.has(p.id) ? "bg-amber-50 dark:bg-amber-950/20" : ""}`}>
                            {role === "admin" && (
                              <td className="p-3">
                                <input type="checkbox" checked={selectedPaymentIds.has(p.id)} onChange={() => togglePaymentSelection(p.id)} className="accent-accent h-4 w-4" />
                              </td>
                            )}
                            {editingPaymentId === p.id ? (
                              <>
                                <td className="p-3 font-mono text-xs">{p.receipt_number}</td>
                                <td className="p-3 font-semibold">{p.students?.student_name || "—"}</td>
                                <td className="p-3">{p.students?.standard} {p.students?.section}</td>
                                <td className="p-2">
                                  <Select value={editPaymentForm.term} onValueChange={(v) => setEditPaymentForm({ ...editPaymentForm, term: v })}>
                                    <SelectTrigger className="h-8 text-xs w-24"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="Term 1">Term 1</SelectItem>
                                      <SelectItem value="Term 2">Term 2</SelectItem>
                                      <SelectItem value="Term 3">Term 3</SelectItem>
                                      <SelectItem value="Annual">Annual</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </td>
                                <td className="p-2"><Input type="number" className="h-8 text-xs w-24" value={editPaymentForm.amount} onChange={(e) => setEditPaymentForm({ ...editPaymentForm, amount: e.target.value })} /></td>
                                <td className="p-2">
                                  <Select value={editPaymentForm.payment_method} onValueChange={(v) => setEditPaymentForm({ ...editPaymentForm, payment_method: v })}>
                                    <SelectTrigger className="h-8 text-xs w-24"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="Cash">Cash</SelectItem>
                                      <SelectItem value="UPI">UPI</SelectItem>
                                      <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                                      <SelectItem value="Online">Online</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </td>
                                <td className="p-3">{p.created_at ? new Date(p.created_at).toLocaleString("en-IN") : new Date(p.payment_date).toLocaleDateString("en-IN")}</td>
                                <td className="p-3 flex gap-1">
                                  <Button size="sm" className="gap-1 text-xs bg-accent hover:bg-accent/90 text-accent-foreground" onClick={handleSaveEditPayment} disabled={editPaymentLoading}>
                                    {editPaymentLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />} Save
                                  </Button>
                                  <Button size="sm" variant="outline" className="text-xs" onClick={() => setEditingPaymentId(null)}>
                                    <X className="h-3 w-3" />
                                  </Button>
                                </td>
                              </>
                            ) : (
                              <>
                                <td className="p-3 font-mono text-xs">{p.receipt_number}{pendingSyncIds.has(p.id) && <span className="ml-1 inline-flex items-center gap-0.5 text-[10px] font-bold text-amber-600 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400 px-1.5 py-0.5 rounded-full"><RefreshCw className="h-2.5 w-2.5" />Pending</span>}</td>
                                <td className="p-3 font-semibold">{p.students?.student_name || "—"}</td>
                                <td className="p-3">{p.students?.standard} {p.students?.section}</td>
                                <td className="p-3">{p.term}</td>
                                <td className="p-3 font-semibold text-accent">₹{p.amount}</td>
                                <td className="p-3">{p.payment_method}</td>
                                <td className="p-3">{p.created_at ? new Date(p.created_at).toLocaleString("en-IN") : new Date(p.payment_date).toLocaleDateString("en-IN")}</td>
                                <td className="p-3 flex gap-1">
                                  <Button size="sm" variant="outline" className="gap-1 text-xs" onClick={() => {
                                    openPrintableTemplate({
                                      title: "Fee Payment Receipt",
                                      subtitle: `${p.students?.student_name} — Class ${p.students?.standard} ${p.students?.section}`,
                                      fieldGroups: [
                                        { heading: "Payment Details", fields: [
                                          { label: "Receipt No", value: p.receipt_number },
                                          { label: "Term", value: p.term },
                                          { label: "Amount", value: `₹${p.amount}` },
                                          { label: "Method", value: p.payment_method },
                                          { label: "Collected At", value: p.created_at ? new Date(p.created_at).toLocaleString("en-IN") : new Date(p.payment_date).toLocaleDateString("en-IN") },
                                        ]},
                                      ],
                                      receiptMode: true,
                                      receiptDetails: { referenceId: p.receipt_number, paymentMethod: p.payment_method, amount: String(p.amount) },
                                    });
                                  }}>
                                    <Printer className="h-3 w-3" /> Print
                                  </Button>
                                  {role === "admin" && (
                                    <>
                                      <Button size="sm" variant="outline" className="gap-1 text-xs" onClick={() => startEditPayment(p)}>
                                        <Pencil className="h-3 w-3" /> Edit
                                      </Button>
                                      {deletePaymentId === p.id ? (
                                        <div className="flex gap-1 items-center">
                                          <Button size="sm" variant="destructive" className="gap-1 text-xs" disabled={deleteLoading} onClick={() => handleDeletePayment(p.id)}>
                                            {deleteLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : null} Confirm
                                          </Button>
                                          <Button size="sm" variant="ghost" className="text-xs" onClick={() => setDeletePaymentId(null)}>Cancel</Button>
                                        </div>
                                      ) : (
                                        <Button size="sm" variant="ghost" className="gap-1 text-xs text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => setDeletePaymentId(p.id)}>
                                          <Trash2 className="h-3 w-3" /> Delete
                                        </Button>
                                      )}
                                    </>
                                  )}
                                </td>
                              </>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <p className="text-xs text-muted-foreground mt-4">
                      Showing {historyPayments.length} payment(s){(paymentDateFrom || paymentDateTo) ? " (filtered)" : ""} | Total: ₹{historyPayments.reduce((s, p) => s + Number(p.amount), 0).toLocaleString("en-IN")}
                    </p>
                  </div>
                );
              })()}
            </div>
          </TabsContent>

          {/* Pending Approvals Tab */}
          <TabsContent value="pending-approvals">
            <div className="bg-background rounded-2xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-serif text-2xl font-bold text-primary">Pending Payment Approvals</h2>
                <Button variant="outline" size="sm" onClick={fetchPendingApprovals} disabled={pendingApprovalsLoading}>
                  <RefreshCw className={`h-4 w-4 mr-1 ${pendingApprovalsLoading ? "animate-spin" : ""}`} /> Refresh
                </Button>
              </div>
              {pendingApprovalsLoading ? (
                <div className="text-center py-12"><Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" /></div>
              ) : pendingApprovals.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <CheckCircle className="h-12 w-12 mx-auto mb-3 opacity-40" />
                  <p className="text-lg font-medium">No pending approvals</p>
                  <p className="text-sm">All online payment submissions have been reviewed.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-secondary/50">
                        <th className="p-3 text-left">Student</th>
                        <th className="p-3 text-left">Class</th>
                        <th className="p-3 text-left">Amount</th>
                        <th className="p-3 text-left">Method</th>
                        <th className="p-3 text-left">Reference ID</th>
                        <th className="p-3 text-left">Submitted</th>
                        <th className="p-3 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingApprovals.map((p: any) => (
                        <tr key={p.id} className="border-b hover:bg-secondary/30 transition-colors">
                          <td className="p-3 font-semibold">{p.student_name}</td>
                          <td className="p-3">{p.standard} {p.section}</td>
                          <td className="p-3 font-semibold text-accent">{p.amount ? `₹${p.amount}` : "—"}</td>
                          <td className="p-3">{p.payment_method}</td>
                          <td className="p-3 font-mono text-xs">{p.reference_id}</td>
                          <td className="p-3 text-xs text-muted-foreground">{new Date(p.created_at).toLocaleString("en-IN")}</td>
                          <td className="p-3 text-center">
                            <div className="flex gap-2 justify-center">
                              <Button size="sm" onClick={() => handleApprovePayment(p)} disabled={approvingId === p.id || rejectingId === p.id} className="bg-accent hover:bg-accent/90 text-accent-foreground gap-1">
                                {approvingId === p.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle className="h-3 w-3" />} Approve
                              </Button>
                              <Button size="sm" variant="destructive" onClick={() => handleRejectPayment(p)} disabled={approvingId === p.id || rejectingId === p.id} className="gap-1">
                                {rejectingId === p.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <XCircle className="h-3 w-3" />} Reject
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Reports Tab (Admin only) */}
          {role === "admin" && (
            <TabsContent value="reports">
              <div className="bg-background rounded-2xl shadow-lg p-6">
                <h2 className="font-serif text-2xl font-bold text-primary mb-6">Reports & Analytics</h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-secondary rounded-xl p-6 text-center">
                    <Users className="h-8 w-8 text-accent mx-auto mb-3" />
                    <p className="text-3xl font-bold text-primary">{students.length}</p>
                    <p className="text-muted-foreground">Total Students</p>
                  </div>
                  <div className="bg-secondary rounded-xl p-6 text-center">
                    <CreditCard className="h-8 w-8 text-accent mx-auto mb-3" />
                    <p className="text-3xl font-bold text-primary">{payments.length}</p>
                    <p className="text-muted-foreground">Total Payments (loaded)</p>
                  </div>
                  <div className="bg-secondary rounded-xl p-6 text-center">
                    <DollarSign className="h-8 w-8 text-accent mx-auto mb-3" />
                    <p className="text-3xl font-bold text-primary">₹{payments.reduce((sum, p) => sum + Number(p.amount), 0).toLocaleString("en-IN")}</p>
                    <p className="text-muted-foreground">Total Collected (loaded)</p>
                  </div>
                </div>

                {/* Custom date range filter */}
                <div className="mt-6 flex flex-wrap items-end gap-4 bg-secondary p-4 rounded-xl">
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold flex items-center gap-1"><Calendar className="h-3 w-3" /> From Date</Label>
                    <Input type="date" value={reportDateFrom} onChange={(e) => setReportDateFrom(e.target.value)} className="w-44" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold flex items-center gap-1"><Calendar className="h-3 w-3" /> To Date</Label>
                    <Input type="date" value={reportDateTo} onChange={(e) => setReportDateTo(e.target.value)} className="w-44" />
                  </div>
                  {(reportDateFrom || reportDateTo) && (
                    <Button variant="ghost" size="sm" onClick={() => { setReportDateFrom(""); setReportDateTo(""); }}>
                      Clear Filter
                    </Button>
                  )}
                </div>

                <div className="mt-8">
                  {(() => {
                    const rows = getFilteredPaymentsForReport();

                    const startOfWeekMonday = (d: Date) => {
                      const date = new Date(d);
                      const day = (date.getDay() + 6) % 7;
                      date.setDate(date.getDate() - day);
                      date.setHours(0, 0, 0, 0);
                      return date;
                    };

                    const keyFor = (mode: "daily" | "weekly" | "monthly" | "yearly", createdAt: string, paymentDate: string) => {
                      const base = createdAt ? new Date(createdAt) : new Date(paymentDate);
                      if (mode === "daily") {
                        const d = new Date(base);
                        d.setHours(0, 0, 0, 0);
                        return d.toISOString().slice(0, 10);
                      }
                      if (mode === "weekly") {
                        const w = startOfWeekMonday(base);
                        return w.toISOString().slice(0, 10);
                      }
                      if (mode === "monthly") {
                        return `${base.getFullYear()}-${String(base.getMonth() + 1).padStart(2, "0")}`;
                      }
                      return String(base.getFullYear());
                    };

                    const labelFor = (mode: "daily" | "weekly" | "monthly" | "yearly", key: string) => {
                      if (mode === "daily") return new Date(key).toLocaleDateString("en-IN");
                      if (mode === "weekly") return `Week of ${new Date(key).toLocaleDateString("en-IN")}`;
                      if (mode === "monthly") {
                        const [y, m] = key.split("-").map(Number);
                        return new Date(y, (m || 1) - 1, 1).toLocaleDateString("en-IN", { month: "short", year: "numeric" });
                      }
                      return key;
                    };

                    const build = (mode: "daily" | "weekly" | "monthly" | "yearly") => {
                      const map = new Map<string, { key: string; label: string; count: number; total: number; lastAt: string }>();
                      for (const p of rows) {
                        const k = keyFor(mode, p.created_at, p.payment_date);
                        const current = map.get(k) || { key: k, label: labelFor(mode, k), count: 0, total: 0, lastAt: "" };
                        current.count += 1;
                        current.total += Number(p.amount) || 0;
                        const at = p.created_at || "";
                        if (at && (!current.lastAt || at > current.lastAt)) current.lastAt = at;
                        map.set(k, current);
                      }
                      return Array.from(map.values()).sort((a, b) => (a.key < b.key ? 1 : -1));
                    };

                    const ReportTable = ({ mode }: { mode: "daily" | "weekly" | "monthly" | "yearly" }) => {
                      const report = build(mode);
                      if (report.length === 0) {
                        return <div className="p-8 text-center text-muted-foreground">No payment data to report for the selected period.</div>;
                      }
                      return (
                        <>
                          {/* Print / Download buttons */}
                          <div className="flex gap-3 mb-4 justify-end">
                            <Button variant="outline" size="sm" className="gap-2" onClick={() => handlePrintReport(mode, report)}>
                              <Printer className="h-4 w-4" /> Print Statement
                            </Button>
                            <Button variant="outline" size="sm" className="gap-2" onClick={() => handleDownloadReport(mode, report)}>
                              <Download className="h-4 w-4" /> Download Excel
                            </Button>
                          </div>
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="border-b text-left">
                                  <th className="p-3 font-semibold">Period</th>
                                  <th className="p-3 font-semibold">Payments</th>
                                  <th className="p-3 font-semibold">Total Collected</th>
                                  <th className="p-3 font-semibold">Last Entry</th>
                                </tr>
                              </thead>
                              <tbody>
                                {report.map((r) => (
                                  <tr key={r.key} className="border-b hover:bg-secondary/50 transition-colors">
                                    <td className="p-3 font-semibold">{r.label}</td>
                                    <td className="p-3">{r.count}</td>
                                    <td className="p-3 font-semibold text-accent">₹{r.total.toLocaleString("en-IN")}</td>
                                    <td className="p-3">{r.lastAt ? new Date(r.lastAt).toLocaleString("en-IN") : "—"}</td>
                                  </tr>
                                ))}
                                <tr className="border-t-2 border-primary/20 font-bold">
                                  <td className="p-3">TOTAL</td>
                                  <td className="p-3">{report.reduce((s, r) => s + r.count, 0)}</td>
                                  <td className="p-3 text-accent">₹{report.reduce((s, r) => s + r.total, 0).toLocaleString("en-IN")}</td>
                                  <td className="p-3"></td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </>
                      );
                    };

                    return (
                      <Tabs defaultValue="daily" className="space-y-4">
                        <TabsList className="bg-secondary rounded-xl p-1 flex-wrap h-auto">
                          <TabsTrigger value="daily">Day wise</TabsTrigger>
                          <TabsTrigger value="weekly">Weekly</TabsTrigger>
                          <TabsTrigger value="monthly">Monthly</TabsTrigger>
                          <TabsTrigger value="yearly">Yearly</TabsTrigger>
                        </TabsList>

                        <TabsContent value="daily"><ReportTable mode="daily" /></TabsContent>
                        <TabsContent value="weekly"><ReportTable mode="weekly" /></TabsContent>
                        <TabsContent value="monthly"><ReportTable mode="monthly" /></TabsContent>
                        <TabsContent value="yearly"><ReportTable mode="yearly" /></TabsContent>

                        <p className="text-xs text-muted-foreground">
                          Showing reports for {rows.length} payments{reportDateFrom || reportDateTo ? " (filtered)" : ""} loaded in this portal (up to 1000).
                        </p>
                      </Tabs>
                    );
                  })()}
                </div>
              </div>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
};

export default FeeDesk;
