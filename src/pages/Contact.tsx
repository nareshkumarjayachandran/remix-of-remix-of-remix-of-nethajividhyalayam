import DuotoneIcon from "@/components/common/DuotoneIcon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Phone, Mail, MapPin, Send, ExternalLink, Loader2, Printer } from "lucide-react";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { sendEmail, sendParentCopy, sendFormEmail } from "@/lib/emailjs";
import { openPrintableTemplate, buildEmailMessage } from "@/lib/printTemplate";

const Contact = () => {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", subject: "", message: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const getFieldGroups = () => [
    {
      heading: "Contact Details",
      fields: [
        { label: "Full Name", value: formData.name },
        { label: "Email Address", value: formData.email },
        { label: "Phone Number", value: formData.phone || "Not provided" },
      ],
    },
    {
      heading: "Message Details",
      fields: [
        { label: "Subject", value: formData.subject },
        { label: "Message", value: formData.message },
      ],
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fieldGroups = getFieldGroups();
      // Send via EmailJS (school)
      sendEmail({
        from_name: formData.name,
        from_email: formData.email,
        phone: formData.phone || "Not provided",
        subject: `Contact Enquiry: ${formData.subject}`,
        message: buildEmailMessage("Contact Us — Send Us a Message", fieldGroups),
      }).catch(console.error);
      // Send thank-you copy to parent/enquirer via EmailJS
      sendParentCopy(formData.email, formData.name, "Contact Enquiry", buildEmailMessage("Contact Us — Send Us a Message", fieldGroups)).catch(console.error);
      // Send rich HTML email with attachment via backend
      sendFormEmail({
        formType: "contact",
        title: "Contact Enquiry",
        subtitle: formData.subject,
        fieldGroups,
        senderName: formData.name,
        senderEmail: formData.email,
      }).catch(console.error);
      setSubmitted(true);
      toast({ title: "Message Sent!", description: "A confirmation copy has been sent to your email." });
    } catch (err: any) {
      console.error(err);
      toast({ title: "Failed to send", description: err?.text || "Please try again later.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    openPrintableTemplate({
      title: "Contact Enquiry",
      subtitle: "Send Us a Message",
      fieldGroups: getFieldGroups(),
    });
  };

  return (
    <>
      <section className="bg-primary text-primary-foreground py-20">
        <div className="container-custom text-center">
          <p className="text-accent font-semibold mb-2 uppercase tracking-wider text-sm">We're Here to Help</p>
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">Contact Nethaji Vidyalayam</h1>
          <p className="text-lg text-primary-foreground/80">
            Have questions about admissions, our curriculum, or campus life? We'd love to hear from you.
          </p>
        </div>
      </section>

      <section className="section-padding bg-background">
        <div className="container-custom">
          {/* Contact Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            {/* Phone Card */}
            <div className="bg-card p-8 rounded-2xl shadow-lg text-center card-hover">
              <DuotoneIcon icon={Phone} tone="emerald" size="lg" className="mx-auto mb-4" />
              <h3 className="font-serif text-lg font-bold text-primary mb-2">Call Us Directly</h3>
              <div className="mb-1 space-y-1">
                <a href="tel:+919841594945" className="text-muted-foreground hover:text-accent transition-colors block">+91 9841594945</a>
                <a href="tel:+916380967675" className="text-muted-foreground hover:text-accent transition-colors block">6380967675</a>
              </div>
              <p className="text-sm text-muted-foreground mb-4">Mon-Sat, 8:50 AM - 3:30 PM</p>
              <a href="tel:+919841594945" className="inline-flex items-center gap-1 bg-accent text-accent-foreground px-4 py-2 rounded-md font-semibold text-sm hover:bg-accent/90 transition-colors">
                Call Now
              </a>
            </div>

            {/* Email Card */}
            <div className="bg-card p-8 rounded-2xl shadow-lg text-center card-hover">
              <DuotoneIcon icon={Mail} tone="sky" size="lg" className="mx-auto mb-4" />
              <h3 className="font-serif text-lg font-bold text-primary mb-2">Send an Email</h3>
              <div className="mb-1 space-y-1">
                <a href="mailto:nethajividhyalayam@gmail.com" className="text-muted-foreground hover:text-accent transition-colors block">nethajividhyalayam@gmail.com</a>
                <a href="mailto:info@nethajividhyalayam.org" className="text-muted-foreground hover:text-accent transition-colors block">info@nethajividhyalayam.org</a>
              </div>
              <p className="text-sm text-muted-foreground mb-4">24-hour response time</p>
              <a
                href="mailto:nethajividhyalayam@gmail.com,info@nethajividhyalayam.org"
                className="inline-flex items-center gap-1 bg-accent text-accent-foreground px-4 py-2 rounded-md font-semibold text-sm hover:bg-accent/90 transition-colors"
              >
                <Mail className="h-4 w-4" />
                Email Us
              </a>
            </div>

            {/* Location Card */}
            <div className="bg-card p-8 rounded-2xl shadow-lg text-center card-hover">
              <DuotoneIcon icon={MapPin} tone="amber" size="lg" className="mx-auto mb-4" />
              <h3 className="font-serif text-lg font-bold text-primary mb-2">Visit Campus</h3>
              <p className="text-muted-foreground block mb-1">5/325, Rajiv Nagar, S.Kolathur Main Road</p>
              <p className="text-sm text-muted-foreground mb-4">S.Kolathur, Kovilambakkam Post, Chennai&nbsp;-&nbsp;600129</p>
              <a href="https://www.google.com/maps/dir/?api=1&destination=Nethaji+Vidhyalayam+S.Kolathur+Chennai" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 bg-accent text-accent-foreground px-4 py-2 rounded-md font-semibold text-sm hover:bg-accent/90 transition-colors">
                Get Directions
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            <div>
              <h2 className="section-title mb-2">Send Us a Message</h2>
              <p className="text-muted-foreground mb-8">Fill out the form and our team will respond within 24 hours.</p>
              {submitted ? (
                <div className="text-center bg-card p-12 rounded-2xl shadow-lg">
                  <DuotoneIcon icon={Send} tone="emerald" size="lg" className="mx-auto mb-4" />
                  <h3 className="font-serif text-2xl font-bold text-primary mb-2">Message Sent!</h3>
                  <p className="text-muted-foreground">Thank you for reaching out. We will respond within 24 hours.</p>
                  <div className="flex gap-3 justify-center mt-6">
                    <Button onClick={handlePrint} variant="outline" className="gap-2">
                      <Printer className="h-4 w-4" /> Print / Download Copy
                    </Button>
                    <Button onClick={() => { setSubmitted(false); setFormData({ name: "", email: "", phone: "", subject: "", message: "" }); }} className="bg-accent hover:bg-accent/90 text-accent-foreground">
                      Send Another Message
                    </Button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="bg-card p-8 rounded-2xl shadow-lg space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="font-semibold">Full Name *</Label>
                      <Input required name="name" value={formData.name} onChange={handleChange} placeholder="Full name" />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-semibold">Email Address *</Label>
                      <Input required type="email" name="email" value={formData.email} onChange={handleChange} placeholder="email@example.com" />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="font-semibold">Phone Number</Label>
                      <Input name="phone" value={formData.phone} onChange={handleChange} placeholder="Mobile number" />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-semibold">Subject *</Label>
                      <Input required name="subject" value={formData.subject} onChange={handleChange} placeholder="Subject of enquiry" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="font-semibold">Your Message *</Label>
                    <Textarea required name="message" value={formData.message} onChange={handleChange} placeholder="Your message..." rows={5} />
                  </div>
                  <Button type="submit" disabled={loading} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold text-lg py-6">
                    {loading ? <><Loader2 className="h-5 w-5 animate-spin mr-2" /> Sending...</> : "Send Message"}
                  </Button>
                </form>
              )}
            </div>

            {/* Map & Hours */}
            <div className="space-y-8">
              <div>
                <h3 className="font-serif text-xl font-bold text-primary mb-4">Visit Our Campus</h3>
                <div className="bg-card p-6 rounded-2xl shadow-lg space-y-3">
                  <p className="font-semibold text-foreground">Nethaji Vidhyalayam</p>
                  <p className="text-muted-foreground text-sm">5/325, Rajiv Nagar, S.Kolathur Main Road,<br />S.Kolathur, Kovilambakkam Post, Chennai - 600129</p>
                  <a href="https://www.google.com/maps/dir/?api=1&destination=Nethaji+Vidhyalayam+S.Kolathur+Chennai" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-accent hover:underline text-sm font-semibold">
                    Get Directions <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
              <div>
                <h3 className="font-serif text-xl font-bold text-primary mb-4">We're Open!</h3>
                <div className="bg-card p-6 rounded-2xl shadow-lg">
                  <p className="text-sm text-muted-foreground mb-4">Visit us during office hours or call for appointments.</p>
                  <div className="space-y-3">
                    {[
                      { day: "Mon - Fri", time: "8:50 AM - 3:30 PM" },
                      { day: "Saturday", time: "8:50 AM - 3:30 PM" },
                      { day: "Sunday", time: "Closed" },
                    ].map((item, i) => (
                      <div key={i} className="flex justify-between items-center py-2 border-b last:border-b-0">
                        <span className="font-semibold text-foreground text-sm">{item.day}</span>
                        <span className="text-muted-foreground text-sm">{item.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="rounded-2xl overflow-hidden shadow-lg h-64">
                <iframe src="https://maps.google.com/maps?q=Nethaji+Vidhyalayam,+S.Kolathur,+Kovilambakkam,+Chennai+600129&output=embed" width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" title="School Location" />
              </div>
              <a
                href="https://www.google.com/maps/dir/?api=1&destination=Nethaji+Vidhyalayam,+S.Kolathur,+Kovilambakkam,+Chennai+600129"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-2 bg-accent text-accent-foreground px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-accent/90 transition-colors"
              >
                <MapPin className="h-4 w-4" />
                Get Directions
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Contact;
