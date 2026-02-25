import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import useScrollToHash from "@/hooks/useScrollToHash";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { sendEmail, sendParentCopy, sendFormEmail } from "@/lib/emailjs";
import { openPrintableTemplate, buildEmailMessage } from "@/lib/printTemplate";
import { QRCodeSVG } from "qrcode.react";
import { CheckCircle, FileText, CreditCard, ClipboardList, Printer, Loader2, Search } from "lucide-react";

const standards = ["Pre-KG", "LKG", "UKG", "I", "II", "III", "IV", "V"];
const sections = ["A", "B", "C", "D"];

const Admissions = () => {
  useScrollToHash();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<"process" | "fees" | "apply">("process");

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get("tab");
    const hash = location.hash.replace("#", "");

    if (tabParam === "fees" || hash === "fees") setActiveTab("fees");
    else if (tabParam === "apply" || hash === "apply") setActiveTab("apply");
    else if (hash === "process" || hash === "") setActiveTab("process");
  }, [location.search, location.hash]);

  // Fee payment state
  const [feeForm, setFeeForm] = useState({ childName: "", standard: "", section: "", referenceId: "", paymentMethod: "UPI (GPay/PhonePe/Paytm)", amount: "" });
  const [feeSubmitted, setFeeSubmitted] = useState(false);
  const [feeLoading, setFeeLoading] = useState(false);
  const [studentVerified, setStudentVerified] = useState<boolean | null>(null);
  const [verifying, setVerifying] = useState(false);

  // Pre-fill fee form from URL query params (from AI chatbot)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const name = params.get("name");
    const std = params.get("std");
    const sec = params.get("sec");
    if (name || std || sec) {
      setFeeForm((prev) => ({
        ...prev,
        childName: name || prev.childName,
        standard: std || prev.standard,
        section: sec || prev.section,
      }));
    }
  }, [location.search]);

  // Autocomplete state
  const [studentSuggestions, setStudentSuggestions] = useState<{ student_name: string }[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  // Fetch matching students via secure edge function (no direct DB access)
  useEffect(() => {
    const name = feeForm.childName.trim();
    if (name.length < 2 || !feeForm.standard || !feeForm.section) {
      setStudentSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoadingSuggestions(true);
      try {
        const { data, error } = await supabase.functions.invoke("student-fee-api", {
          body: { action: "suggest-students", studentName: name, standard: feeForm.standard, section: feeForm.section },
        });
        if (!error && data?.suggestions) {
          setStudentSuggestions(data.suggestions);
          setShowSuggestions(data.suggestions.length > 0);
        }
      } catch {
        // silently fail
      }
      setLoadingSuggestions(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [feeForm.childName, feeForm.standard, feeForm.section]);

  const selectStudent = (student: typeof studentSuggestions[0]) => {
    setFeeForm({ ...feeForm, childName: student.student_name });
    setShowSuggestions(false);
    setStudentVerified(true);
  };

  const verifyStudent = async () => {
    const name = feeForm.childName.trim();
    const std = feeForm.standard;
    const sec = feeForm.section;
    if (!name || !std || !sec) return;
    setVerifying(true);
    setStudentVerified(null);
    try {
      const { data, error } = await supabase.functions.invoke("student-fee-api", {
        body: { action: "verify-student", studentName: name, standard: std, section: sec },
      });
      if (error) throw error;

      if (data?.verified) {
        setStudentVerified(true);
        if (data.student_name) {
          setFeeForm((prev) => ({ ...prev, childName: data.student_name }));
        }
      } else {
        setStudentVerified(false);
        toast({ title: "⚠️ Student Not Found", description: `No active student matching "${name}" found in Class ${std} ${sec}. Please check the details.`, variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Could not verify student. Please try again.", variant: "destructive" });
      setStudentVerified(false);
    }
    setVerifying(false);
  };

  // Reset verification when fields change
  useEffect(() => {
    setStudentVerified(null);
  }, [feeForm.childName, feeForm.standard, feeForm.section]);

  const isQrEnabled = studentVerified === true;

  // Apply Now form state
  const [applyForm, setApplyForm] = useState({
    student_name: "", date_of_birth: "", gender: "", aadhaar_number: "",
    parent_name: "", parent_phone: "", parent_email: "", address: "",
    standard_applying: "", previous_school: "", blood_group: "",
    nationality: "Indian", religion: "", community: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const getApplyFieldGroups = () => [
    {
      heading: "Student Details",
      fields: [
        { label: "Student Name", value: applyForm.student_name },
        { label: "Date of Birth", value: applyForm.date_of_birth },
        { label: "Gender", value: applyForm.gender },
        { label: "Aadhaar Number", value: applyForm.aadhaar_number },
        { label: "Blood Group", value: applyForm.blood_group || "N/A" },
        { label: "Standard Applying For", value: applyForm.standard_applying },
      ],
    },
    {
      heading: "Parent / Guardian Details",
      fields: [
        { label: "Parent/Guardian Name", value: applyForm.parent_name },
        { label: "Phone Number", value: applyForm.parent_phone },
        { label: "Email", value: applyForm.parent_email || "N/A" },
        { label: "Nationality", value: applyForm.nationality },
        { label: "Religion", value: applyForm.religion || "N/A" },
        { label: "Community", value: applyForm.community || "N/A" },
        { label: "Address", value: applyForm.address },
        { label: "Previous School", value: applyForm.previous_school || "N/A" },
      ],
    },
  ];

  const getFeeFieldGroups = () => [
    {
      heading: "Student Details",
      fields: [
        { label: "Child's Name", value: feeForm.childName },
        { label: "Standard", value: feeForm.standard },
        { label: "Section", value: feeForm.section },
      ],
    },
  ];

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!applyForm.student_name || !applyForm.date_of_birth || !applyForm.gender ||
      !applyForm.aadhaar_number || !applyForm.parent_name || !applyForm.parent_phone ||
      !applyForm.address || !applyForm.standard_applying) {
      toast({ title: "Missing Fields", description: "Please fill all required fields.", variant: "destructive" });
      return;
    }
    if (!/^\d{12}$/.test(applyForm.aadhaar_number)) {
      toast({ title: "Invalid Aadhaar", description: "Aadhaar number must be exactly 12 digits.", variant: "destructive" });
      return;
    }
    if (!/^\d{10}$/.test(applyForm.parent_phone)) {
      toast({ title: "Invalid Phone", description: "Phone number must be exactly 10 digits.", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.from("admission_applications").insert([applyForm]);
      if (error) throw error;

      const fieldGroups = getApplyFieldGroups();
      // EmailJS to school
      sendEmail({
        from_name: applyForm.parent_name,
        from_email: applyForm.parent_email || "Not provided",
        phone: applyForm.parent_phone,
        subject: `Admission Application: ${applyForm.student_name} - ${applyForm.standard_applying}`,
        message: buildEmailMessage("Apply Now — Admission Application", fieldGroups),
      }).catch(console.error);
      // Send thank-you copy to parent via EmailJS
      if (applyForm.parent_email) {
        sendParentCopy(applyForm.parent_email, applyForm.parent_name, "Admission Application", buildEmailMessage("Apply Now — Admission Application", fieldGroups)).catch(console.error);
      }
      // Send rich HTML email with attachment via backend
      sendFormEmail({
        formType: "admission",
        title: "Admission Application",
        subtitle: `${applyForm.student_name} — ${applyForm.standard_applying}`,
        fieldGroups,
        senderName: applyForm.parent_name,
        senderEmail: applyForm.parent_email || undefined,
      }).catch(console.error);

      setSubmitted(true);
      toast({ title: "Application Submitted!", description: "A confirmation copy has been sent to the parent's email." });
    } catch (err: any) {
      console.error(err);
      toast({ title: "Submission Failed", description: "Please try again later.", variant: "destructive" });
    }
    setSubmitting(false);
  };

  const handleFeeReceiptSubmit = async () => {
    if (!feeForm.referenceId.trim()) {
      toast({ title: "Missing Reference ID", description: "Please enter the GPay/Paytm transaction reference ID.", variant: "destructive" });
      return;
    }
    setFeeLoading(true);
    try {
      const fieldGroups = getFeeFieldGroups();
      const paymentFields = {
        heading: "Payment Details",
        fields: [
          { label: "Reference / Transaction ID", value: feeForm.referenceId },
          { label: "Payment Method", value: feeForm.paymentMethod },
          { label: "Amount Paid", value: feeForm.amount ? `₹${feeForm.amount}` : "N/A" },
        ],
      };
      // Save to pending_fee_payments via secure edge function
      const { data: feeResult, error: pendingError } = await supabase.functions.invoke("student-fee-api", {
        body: {
          action: "submit-fee-payment",
          studentName: feeForm.childName.trim(),
          standard: feeForm.standard,
          section: feeForm.section,
          amount: feeForm.amount || null,
          paymentMethod: feeForm.paymentMethod,
          referenceId: feeForm.referenceId.trim(),
        },
      });
      if (pendingError) console.error("Failed to save pending payment:", pendingError);
      // EmailJS to school
      sendEmail({
        from_name: feeForm.childName,
        from_email: "Fee Payment",
        phone: "N/A",
        subject: `Fee Payment: ${feeForm.childName} - ${feeForm.standard} ${feeForm.section}`,
        message: buildEmailMessage("Fee Payment Receipt", [...fieldGroups, paymentFields]),
      }).catch(console.error);
      // Send rich HTML receipt with attachment via backend
      sendFormEmail({
        formType: "fee_payment",
        title: "Fee Payment Receipt",
        subtitle: `${feeForm.childName} — Class ${feeForm.standard} ${feeForm.section}`,
        fieldGroups: [...fieldGroups, paymentFields],
        senderName: feeForm.childName,
        receiptDetails: {
          referenceId: feeForm.referenceId,
          paymentMethod: feeForm.paymentMethod,
          amount: feeForm.amount,
        },
      }).catch(console.error);
      setFeeSubmitted(true);
      toast({ title: "Receipt Generated!", description: "Payment receipt sent to school for approval." });
    } catch (err: any) {
      console.error(err);
      toast({ title: "Failed", description: "Please try again.", variant: "destructive" });
    }
    setFeeLoading(false);
  };

  const handleApplyPrint = () => {
    openPrintableTemplate({ title: "Admission Application", subtitle: "Apply Now", fieldGroups: getApplyFieldGroups() });
  };

  const handleFeePrint = () => {
    openPrintableTemplate({
      title: "Fee Payment Receipt",
      subtitle: `${feeForm.childName} — Class ${feeForm.standard} ${feeForm.section}`,
      fieldGroups: getFeeFieldGroups(),
      receiptMode: true,
      receiptDetails: {
        referenceId: feeForm.referenceId,
        paymentMethod: feeForm.paymentMethod,
        amount: feeForm.amount,
      },
    });
  };

  const upiPaymentString = isQrEnabled
    ? `upi://pay?pa=nethajividhyalayam@upi&pn=Nethaji%20Vidhyalayam&tn=Fee%20Payment%20-%20${encodeURIComponent(feeForm.childName)}%20-%20${feeForm.standard}%20${feeForm.section}&cu=INR`
    : "";

  const tabs = [
    { id: "process" as const, label: "Admission Process", icon: ClipboardList },
    { id: "fees" as const, label: "Fee Payment", icon: CreditCard },
    { id: "apply" as const, label: "Apply Now", icon: FileText },
  ];

  return (
    <>
      <section className="bg-primary text-primary-foreground py-20">
        <div className="container-custom text-center">
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">Admissions Overview</h1>
          <p className="text-lg text-primary-foreground/80 max-w-2xl mx-auto">
            Join the Nethaji Vidyalayam family. A simple, transparent process to begin your child's journey of excellence.
          </p>
        </div>
      </section>

      <section className="section-padding bg-background">
        <div className="container-custom">
          <div className="flex flex-wrap gap-2 mb-12 justify-center">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-base transition-all duration-200 shadow-sm ${
                  activeTab === tab.id
                    ? "bg-accent text-accent-foreground shadow-accent/30 scale-105"
                    : "bg-primary text-primary-foreground hover:bg-primary/80"
                }`}
              >
                <tab.icon className="h-5 w-5" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Admission Process */}
          {activeTab === "process" && (
            <div className="max-w-4xl mx-auto">
              <h2 className="section-title text-center mb-8">Admission Process</h2>
              <div className="space-y-8">
                {[
                  { step: "01", title: "Enquiry & Registration", desc: "Visit the school or fill the online application form. Our team will guide you through the process." },
                  { step: "02", title: "Document Submission", desc: "Submit required documents including birth certificate, previous school records, Aadhaar card, and passport-size photos." },
                  { step: "03", title: "Interaction Round", desc: "A brief interaction with the student and parents to understand the child's needs and expectations." },
                  { step: "04", title: "Admission Confirmation", desc: "Upon successful evaluation, admission is confirmed and fee payment details are shared." },
                  { step: "05", title: "Welcome to the Family", desc: "Collect the admission kit, uniform details, and join the Nethaji Vidhyalayam family!" },
                ].map((item) => (
                  <div key={item.step} className="flex gap-6 items-start">
                    <div className="w-16 h-16 bg-accent text-accent-foreground rounded-xl flex items-center justify-center font-bold text-xl flex-shrink-0">{item.step}</div>
                    <div>
                      <h3 className="font-serif text-xl font-bold text-primary mb-2">{item.title}</h3>
                      <p className="text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Fee Payment */}
          {activeTab === "fees" && (
            <div id="fees" className="max-w-xl mx-auto">
              <h2 className="section-title text-center mb-8">Fee Payment</h2>
              <p className="text-center text-muted-foreground mb-8">Fill in your child's details below to generate a UPI QR code for fee payment.</p>

              {feeSubmitted ? (
                <div className="text-center bg-card p-12 rounded-2xl shadow-lg">
                  <CheckCircle className="h-16 w-16 text-accent mx-auto mb-4" />
                  <h3 className="font-serif text-2xl font-bold text-primary mb-2">Payment Recorded!</h3>
                  <p className="text-muted-foreground mb-6">Your fee payment details have been sent to the school.</p>
                  <div className="flex gap-3 justify-center">
                    <Button onClick={handleFeePrint} variant="outline" className="gap-2">
                      <Printer className="h-4 w-4" /> Print / Download Receipt
                    </Button>
                    <Button onClick={() => { setFeeSubmitted(false); setFeeForm({ childName: "", standard: "", section: "", referenceId: "", paymentMethod: "UPI (GPay/PhonePe/Paytm)", amount: "" }); }} className="bg-accent hover:bg-accent/90 text-accent-foreground">
                      New Payment
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="bg-card p-8 rounded-2xl shadow-lg space-y-6">
                  <div className="space-y-2 relative">
                    <Label className="font-semibold">Child's Name *</Label>
                    <div className="relative">
                      <Input
                        placeholder="Enter child's name (initials optional)"
                        value={feeForm.childName}
                        onChange={(e) => { setFeeForm({ ...feeForm, childName: e.target.value }); setShowSuggestions(true); }}
                        onFocus={() => studentSuggestions.length > 0 && setShowSuggestions(true)}
                        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                        autoComplete="off"
                      />
                      {loadingSuggestions && <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-pulse text-muted-foreground" />}
                    </div>
                    {showSuggestions && studentSuggestions.length > 0 && (
                      <div className="absolute z-50 w-full bg-popover border rounded-md shadow-lg mt-1 max-h-48 overflow-y-auto">
                        {studentSuggestions.map((s, idx) => (
                          <button
                            key={idx}
                            type="button"
                            className="w-full text-left px-4 py-2.5 text-sm hover:bg-accent hover:text-accent-foreground transition-colors border-b last:border-b-0"
                            onMouseDown={() => selectStudent(s)}
                          >
                            <span className="font-medium">{s.student_name}</span>
                          </button>
                        ))}
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground">Type your child's name — suggestions will appear. Select to auto-verify.</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="font-semibold">Standard *</Label>
                      <Select value={feeForm.standard} onValueChange={(v) => setFeeForm({ ...feeForm, standard: v })}>
                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>{standards.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="font-semibold">Section *</Label>
                      <Select value={feeForm.section} onValueChange={(v) => setFeeForm({ ...feeForm, section: v })}>
                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>{sections.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Verify Button */}
                  {feeForm.childName.trim() && feeForm.standard && feeForm.section && studentVerified !== true && (
                    <Button onClick={verifyStudent} disabled={verifying} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-4">
                      {verifying ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Verifying Student...</> : "Verify Student & Show QR Code"}
                    </Button>
                  )}

                  {/* Warning if not found */}
                  {studentVerified === false && (
                    <div className="text-center p-6 rounded-xl border-2 border-destructive bg-destructive/5">
                      <p className="font-semibold text-destructive">❌ Student not found in our records</p>
                      <p className="text-sm text-muted-foreground mt-1">Please check the name, standard, and section. The name must match exactly as registered in the school.</p>
                    </div>
                  )}

                  {/* QR Code - only shown after verification */}
                  {studentVerified === true && (
                    <div className="text-center p-8 rounded-xl border-2 border-dashed border-accent bg-accent/5 transition-all">
                      <div className="space-y-4">
                        <p className="font-semibold text-primary">✅ Student Verified — Scan QR Code to Pay</p>
                        <div className="inline-block bg-white p-4 rounded-xl shadow-md">
                          <img src="/photos/qr-payment.jpg" alt="UPI QR Code for Fee Payment" className="w-[200px] h-[200px] object-contain" />
                        </div>
                        <p className="text-sm text-muted-foreground">{feeForm.childName} — Class {feeForm.standard} {feeForm.section}</p>
                      </div>
                    </div>
                  )}

                  {/* After payment section */}
                  {isQrEnabled && (
                    <div className="border-t pt-6 space-y-4">
                      <h3 className="font-serif text-lg font-bold text-primary">After Payment — Generate Receipt</h3>
                      <p className="text-sm text-muted-foreground">After scanning and paying, enter your transaction details below to generate a receipt.</p>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="font-semibold">Transaction / Reference ID *</Label>
                          <Input placeholder="GPay/Paytm Ref ID" value={feeForm.referenceId} onChange={(e) => setFeeForm({ ...feeForm, referenceId: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                          <Label className="font-semibold">Amount Paid</Label>
                          <Input placeholder="e.g. 5000" value={feeForm.amount} onChange={(e) => setFeeForm({ ...feeForm, amount: e.target.value })} />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="font-semibold">Payment Method</Label>
                        <Select value={feeForm.paymentMethod} onValueChange={(v) => setFeeForm({ ...feeForm, paymentMethod: v })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="UPI (GPay/PhonePe/Paytm)">UPI (GPay/PhonePe/Paytm)</SelectItem>
                            <SelectItem value="GPay">GPay</SelectItem>
                            <SelectItem value="PhonePe">PhonePe</SelectItem>
                            <SelectItem value="Paytm">Paytm</SelectItem>
                            <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button onClick={handleFeeReceiptSubmit} disabled={feeLoading} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold py-4">
                        {feeLoading ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Generating...</> : "Generate Receipt & Send to School"}
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Apply Now */}
          {activeTab === "apply" && (
            <div id="apply" className="max-w-3xl mx-auto">
              <h2 className="section-title text-center mb-8">Apply Now</h2>
              {submitted ? (
                <div className="text-center bg-card p-12 rounded-2xl shadow-lg">
                  <CheckCircle className="h-16 w-16 text-accent mx-auto mb-4" />
                  <h3 className="font-serif text-2xl font-bold text-primary mb-2">Application Submitted!</h3>
                  <p className="text-muted-foreground">Thank you for applying. Our team will contact you shortly.</p>
                  <div className="flex gap-3 justify-center mt-6">
                    <Button onClick={handleApplyPrint} variant="outline" className="gap-2">
                      <Printer className="h-4 w-4" /> Print / Download Copy
                    </Button>
                    <Button onClick={() => { setSubmitted(false); setApplyForm({ student_name: "", date_of_birth: "", gender: "", aadhaar_number: "", parent_name: "", parent_phone: "", parent_email: "", address: "", standard_applying: "", previous_school: "", blood_group: "", nationality: "Indian", religion: "", community: "" }); }} className="bg-accent hover:bg-accent/90 text-accent-foreground">
                      Submit Another
                    </Button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleApplySubmit} className="bg-card p-8 rounded-2xl shadow-lg space-y-6">
                  <h3 className="font-serif text-xl font-bold text-primary border-b pb-3">Student Details</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="font-semibold">Student Name *</Label>
                      <Input required value={applyForm.student_name} onChange={(e) => setApplyForm({ ...applyForm, student_name: e.target.value })} placeholder="Full name" />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-semibold">Date of Birth *</Label>
                      <Input required type="date" value={applyForm.date_of_birth} onChange={(e) => setApplyForm({ ...applyForm, date_of_birth: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-semibold">Gender *</Label>
                      <Select value={applyForm.gender} onValueChange={(v) => setApplyForm({ ...applyForm, gender: v })}>
                        <SelectTrigger><SelectValue placeholder="Select Gender" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Female">Female</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="font-semibold">Aadhaar Number *</Label>
                      <Input required value={applyForm.aadhaar_number} onChange={(e) => setApplyForm({ ...applyForm, aadhaar_number: e.target.value.replace(/\D/g, "").slice(0, 12) })} placeholder="12-digit Aadhaar" maxLength={12} />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-semibold">Blood Group</Label>
                      <Select value={applyForm.blood_group} onValueChange={(v) => setApplyForm({ ...applyForm, blood_group: v })}>
                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>{["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((bg) => <SelectItem key={bg} value={bg}>{bg}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="font-semibold">Standard Applying For *</Label>
                      <Select value={applyForm.standard_applying} onValueChange={(v) => setApplyForm({ ...applyForm, standard_applying: v })}>
                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>{standards.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                  </div>

                  <h3 className="font-serif text-xl font-bold text-primary border-b pb-3 pt-4">Parent / Guardian Details</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="font-semibold">Parent/Guardian Name *</Label>
                      <Input required value={applyForm.parent_name} onChange={(e) => setApplyForm({ ...applyForm, parent_name: e.target.value })} placeholder="Full name" />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-semibold">Phone Number *</Label>
                      <Input required value={applyForm.parent_phone} onChange={(e) => setApplyForm({ ...applyForm, parent_phone: e.target.value.replace(/\D/g, "").slice(0, 10) })} placeholder="10-digit mobile" maxLength={10} />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-semibold">Email</Label>
                      <Input type="email" value={applyForm.parent_email} onChange={(e) => setApplyForm({ ...applyForm, parent_email: e.target.value })} placeholder="email@example.com" />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-semibold">Nationality</Label>
                      <Input value={applyForm.nationality} onChange={(e) => setApplyForm({ ...applyForm, nationality: e.target.value })} />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="font-semibold">Religion</Label>
                      <Input value={applyForm.religion} onChange={(e) => setApplyForm({ ...applyForm, religion: e.target.value })} placeholder="Religion" />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-semibold">Community</Label>
                      <Input value={applyForm.community} onChange={(e) => setApplyForm({ ...applyForm, community: e.target.value })} placeholder="Community" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="font-semibold">Address *</Label>
                    <Textarea required value={applyForm.address} onChange={(e) => setApplyForm({ ...applyForm, address: e.target.value })} placeholder="Full address" rows={3} />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-semibold">Previous School</Label>
                    <Input value={applyForm.previous_school} onChange={(e) => setApplyForm({ ...applyForm, previous_school: e.target.value })} placeholder="Previous school name (if any)" />
                  </div>
                  <Button type="submit" disabled={submitting} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold text-lg py-6">
                    {submitting ? "Submitting..." : "Submit Application"}
                  </Button>
                </form>
              )}
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default Admissions;
