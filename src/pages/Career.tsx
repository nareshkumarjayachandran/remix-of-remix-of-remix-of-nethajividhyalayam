import DuotoneIcon, { toneAt } from "@/components/common/DuotoneIcon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Briefcase, Users, Award, Heart, Send, Printer, Upload, X, FileText } from "lucide-react";
import { useState, useRef } from "react";
import { toast } from "@/hooks/use-toast";
import { sendEmail, sendParentCopy, sendFormEmail } from "@/lib/emailjs";
import { openPrintableTemplate, buildEmailMessage } from "@/lib/printTemplate";
import { supabase } from "@/integrations/supabase/client";

const Career = () => {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeUploading, setResumeUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    name: "",
    dob: "",
    gender: "",
    email: "",
    phone: "",
    address: "",
    qualification: "",
    professionalDegree: "",
    currentPosition: "",
    positionApplying: "",
    experience: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const getFieldGroups = () => [
    {
      heading: "Personal Details",
      fields: [
        { label: "Name of the Applicant", value: formData.name },
        { label: "Date of Birth", value: formData.dob },
        { label: "Gender", value: formData.gender || "N/A" },
        { label: "Email ID", value: formData.email },
        { label: "Contact Number", value: formData.phone },
        { label: "Address", value: formData.address || "N/A" },
      ],
    },
    {
      heading: "Academic & Professional Details",
      fields: [
        { label: "Academic Qualification", value: formData.qualification },
        { label: "Professional Degree", value: formData.professionalDegree },
        { label: "Current Position", value: formData.currentPosition || "N/A" },
        { label: "Position Applying For", value: formData.positionApplying || "N/A" },
        { label: "Experience", value: formData.experience || "N/A" },
      ],
    },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowed = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!allowed.includes(file.type)) {
      toast({ title: "Invalid file type", description: "Please upload a PDF or DOC/DOCX file.", variant: "destructive" });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "File too large", description: "Resume must be under 5MB.", variant: "destructive" });
      return;
    }
    setResumeFile(file);
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    const fakeEvent = { target: { files: [file] } } as unknown as React.ChangeEvent<HTMLInputElement>;
    handleFileChange(fakeEvent);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      let resumeStoragePath = "";
      let resumeFileName = "";
      let resumeMimeType = "";

      if (resumeFile) {
        setResumeUploading(true);
        const ext = resumeFile.name.split(".").pop();
        const storageName = `${Date.now()}_${formData.name.replace(/\s+/g, "_")}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("resumes")
          .upload(storageName, resumeFile, { contentType: resumeFile.type, upsert: false });
        setResumeUploading(false);
        if (uploadError) {
          console.error("Resume upload error:", uploadError);
          toast({ title: "Resume upload failed", description: "Please try again.", variant: "destructive" });
          setLoading(false);
          return;
        }
        resumeStoragePath = storageName;
        resumeFileName = resumeFile.name;
        resumeMimeType = resumeFile.type;
      }

      const fieldGroups = getFieldGroups();

      sendEmail({
        from_name: formData.name,
        from_email: formData.email,
        phone: formData.phone || "Not provided",
        subject: `Career Application: ${formData.positionApplying || "General"}`,
        message: buildEmailMessage("Career Inquiry Form", fieldGroups),
      }).catch(console.error);

      sendParentCopy(
        formData.email,
        formData.name,
        "Career Application",
        buildEmailMessage("Career Inquiry Form", fieldGroups),
      ).catch(console.error);

      sendFormEmail({
        formType: "career",
        title: "Career Inquiry Form",
        subtitle: formData.positionApplying || "General Application",
        fieldGroups,
        senderName: formData.name,
        senderEmail: formData.email,
        resumeStoragePath,
        resumeFileName,
        resumeMimeType,
      }).catch(console.error);

      setSubmitted(true);
      toast({ title: "Application Received!", description: "A confirmation copy has been sent to your email." });
    } catch (err: any) {
      console.error(err);
      toast({ title: "Failed to send", description: err?.text || "Please try again later.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    openPrintableTemplate({
      title: "Career Inquiry Form",
      subtitle: "Job Application",
      fieldGroups: getFieldGroups(),
    });
  };

  return (
    <>
      <section className="bg-primary text-primary-foreground py-20">
        <div className="container-custom text-center">
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">Join Our Team</h1>
          <p className="text-lg text-primary-foreground/80">Shape the future with us at Nethaji Vidyalayam.</p>
        </div>
      </section>

      {/* Why Join Us */}
      <section className="section-padding bg-secondary">
        <div className="container-custom">
          <h2 className="section-title text-center mb-12">Why Join Nethaji Vidhyalayam?</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { icon: Briefcase, title: "Growth Opportunities", desc: "Professional development and career advancement programs" },
              { icon: Users, title: "Collaborative Culture", desc: "Work with passionate educators and supportive staff" },
              { icon: Award, title: "Competitive Salary", desc: "Attractive compensation benefits with Reinforces that the base itself is strong" },
              { icon: Heart, title: "Work-Life Balance", desc: "Supportive policies for a healthy work-life balance" },
            ].map((item, i) => (
              <div key={i} className="bg-card p-6 rounded-2xl shadow-lg text-center card-hover">
                <DuotoneIcon icon={item.icon} tone={toneAt(i)} size="md" className="mx-auto mb-4" />
                <h3 className="font-serif font-bold text-primary mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Career Inquiry Form */}
      <section className="section-padding bg-background">
        <div className="container-custom max-w-3xl">
          <h2 className="section-title text-center mb-8">Career Inquiry Form</h2>
          {submitted ? (
            <div className="text-center bg-card p-12 rounded-2xl shadow-lg">
              <Send className="h-16 w-16 text-accent mx-auto mb-4" />
              <h3 className="font-serif text-2xl font-bold text-primary mb-2">Application Submitted!</h3>
              <p className="text-muted-foreground">We will review your application and contact you soon.</p>
              <div className="flex gap-3 justify-center mt-6">
                <Button onClick={handlePrint} variant="outline" className="gap-2">
                  <Printer className="h-4 w-4" /> Print / Download Copy
                </Button>
                <Button
                  onClick={() => {
                    setSubmitted(false);
                    setResumeFile(null);
                    setFormData({
                      name: "", dob: "", gender: "", email: "", phone: "", address: "",
                      qualification: "", professionalDegree: "", currentPosition: "",
                      positionApplying: "", experience: "",
                    });
                  }}
                  className="bg-accent hover:bg-accent/90 text-accent-foreground"
                >
                  Submit Another
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-card p-8 rounded-2xl shadow-lg space-y-6">
              <h3 className="font-serif text-xl font-bold text-primary border-b pb-3">Personal Details</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-semibold">Name of the Applicant *</Label>
                  <Input required name="name" value={formData.name} onChange={handleChange} placeholder="Full name" />
                </div>
                <div className="space-y-2">
                  <Label className="font-semibold">Date of Birth *</Label>
                  <Input required type="date" name="dob" value={formData.dob} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label className="font-semibold">Gender</Label>
                  <Select value={formData.gender} onValueChange={(v) => setFormData((prev) => ({ ...prev, gender: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select Gender" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground italic">
                    * Current openings are for female candidates only as per school policy.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label className="font-semibold">Email ID *</Label>
                  <Input required type="email" name="email" value={formData.email} onChange={handleChange} placeholder="email@example.com" />
                </div>
                <div className="space-y-2">
                  <Label className="font-semibold">Contact Number *</Label>
                  <Input required name="phone" value={formData.phone} onChange={handleChange} placeholder="10-digit mobile" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label className="font-semibold">Address</Label>
                  <Textarea name="address" value={formData.address} onChange={handleChange} placeholder="Full address" rows={2} />
                </div>
              </div>

              <h3 className="font-serif text-xl font-bold text-primary border-b pb-3 pt-4">
                Academic & Professional Details
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-semibold">Academic Qualification *</Label>
                  <Input required name="qualification" value={formData.qualification} onChange={handleChange} placeholder="Highest qualification" />
                </div>
                <div className="space-y-2">
                  <Label className="font-semibold">Professional Degree *</Label>
                  <Input required name="professionalDegree" value={formData.professionalDegree} onChange={handleChange} placeholder="e.g. B.Ed, M.Ed" />
                </div>
                <div className="space-y-2">
                  <Label className="font-semibold">Current Position (If any)</Label>
                  <Input name="currentPosition" value={formData.currentPosition} onChange={handleChange} placeholder="Current role" />
                </div>
                <div className="space-y-2">
                  <Label className="font-semibold">Position Applying For</Label>
                  <Select value={formData.positionApplying} onValueChange={(v) => setFormData((prev) => ({ ...prev, positionApplying: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="teaching">Teaching</SelectItem>
                      <SelectItem value="non-teaching">Non-Teaching</SelectItem>
                      <SelectItem value="admin">Office Administration</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="font-semibold">Experience</Label>
                  <Select value={formData.experience} onValueChange={(v) => setFormData((prev) => ({ ...prev, experience: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select Experience Level" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fresher">Fresher</SelectItem>
                      <SelectItem value="less-1">Less than 1 year</SelectItem>
                      <SelectItem value="1-5">1–5 years</SelectItem>
                      <SelectItem value="5+">Above 5 years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Resume Upload */}
              <div className="space-y-2">
                <Label className="font-semibold">Attach Resume *</Label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleFileDrop}
                  className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 ${
                    resumeFile
                      ? "border-accent bg-accent/5"
                      : "border-primary/30 hover:border-accent hover:bg-accent/5 bg-secondary/50"
                  }`}
                >
                  {resumeFile ? (
                    <div className="flex items-center justify-center gap-3">
                      <FileText className="h-8 w-8 text-accent" />
                      <div className="text-left">
                        <p className="font-semibold text-foreground text-sm">{resumeFile.name}</p>
                        <p className="text-xs text-muted-foreground">{(resumeFile.size / 1024).toFixed(1)} KB</p>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setResumeFile(null);
                          if (fileInputRef.current) fileInputRef.current.value = "";
                        }}
                        className="ml-2 p-1 rounded-full hover:bg-destructive/10 text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <Upload className="h-8 w-8 text-primary/60" />
                      <p className="text-sm font-semibold text-foreground">Click to upload or drag and drop</p>
                      <p className="text-xs text-muted-foreground">PDF, DOC, DOCX — Max 5MB</p>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading || resumeUploading}
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold text-lg py-6"
              >
                {resumeUploading ? "Uploading Resume..." : loading ? "Sending..." : "Submit Application"}
              </Button>
            </form>
          )}
        </div>
      </section>
    </>
  );
};

export default Career;
