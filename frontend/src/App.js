import React, { useEffect, useMemo, useState } from "react";
import "./App.css";
import { BrowserRouter } from "react-router-dom";
import axios from "axios";
import { Header, Footer } from "./components/SiteChrome";
import { hero, site, about, services, engagements, experience, caseStudies, approach } from "./mock/mock";
import { Button } from "./components/ui/button";
import { Card, CardContent } from "./components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./components/ui/accordion";
import { Input } from "./components/ui/input";
import { Textarea } from "./components/ui/textarea";
import { Label } from "./components/ui/label";
import { Toaster } from "./components/ui/sonner";
import { toast } from "sonner";
import { CheckCircle2, Factory, FlaskConical, LineChart, Wrench, Layers, ArrowRight, Mail, FileDown } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = BACKEND_URL ? `${BACKEND_URL}/api` : "/api";

function HomePage() {
  // Call hello world API for connectivity check
  useEffect(() => {
    const helloWorldApi = async () => {
      try {
        const response = await axios.get(`${API}/`);
        // eslint-disable-next-line no-console
        console.log(response.data.message);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e, "errored out requesting / api");
      }
    };
    helloWorldApi();
  }, []);

  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    company: "",
    role: "",
    summary: "",
    startDate: "",
    budget: "",
    file: null,
  });

  const servicesIcons = useMemo(() => [Factory, FlaskConical, Wrench, Layers, LineChart], []);

  const onChange = (e) => {
    const { name, value, files } = e.target;
    setForm((s) => ({ ...s, [name]: files ? files[0] : value }));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      try {
        const submissions = JSON.parse(localStorage.getItem("consult_requests") || "[]");
        const payload = { ...form, id: Date.now() };
        submissions.push(payload);
        localStorage.setItem("consult_requests", JSON.stringify(submissions));
        toast.success("Consult request sent. I will reply shortly.");
        setForm({ name: "", company: "", role: "", summary: "", startDate: "", budget: "", file: null });
      } catch (err) {
        toast.error("Could not save your request locally. Please try again.");
      } finally {
        setSubmitting(false);
      }
    }, 700);
  };

  const scrollToContact = () => {
    document.querySelector("#contact")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div>
      <Header />

      {/* Hero */}
      <section id="home" className="hero-section">
        <div className="hero-background">
          <img src={hero.bgImage} alt="Modern workspace" className="hero-image" />
          <div className="hero-overlay" />
        </div>
        <div className="container flex flex-col lg:flex-row items-start gap-10 relative z-10">
          <div className="hero-content">
            <h1 className="brand-display">{hero.title}</h1>
            <p className="body-medium mt-6">{hero.subtitle}</p>
            <p className="mt-4 text-[var(--text-secondary)]">{hero.intro}</p>
            <div className="flex items-center gap-3 mt-8">
              <Button className="btn-primary btn-hover-scale" onClick={scrollToContact}>
                {hero.ctaPrimary}
              </Button>
              <a href="#services">
                <Button className="btn-secondary btn-hover-scale" asChild>
                  <span className="inline-flex items-center gap-2">
                    {hero.ctaSecondary} <ArrowRight size={16} />
                  </span>
                </Button>
              </a>
            </div>
          </div>

          <div className="flex-1 w-full max-w-md lg:ml-auto">
            <div className="card-glass p-4 lg:p-6 flex items-center gap-4">
              <img src={hero.headshot} alt={hero.headshotAlt} className="w-24 h-24 rounded-full object-cover border border-[var(--border-light)]" />
              <div>
                <p className="heading-4 text-[var(--text-primary)]">{site.name}</p>
                <p className="caption">{site.role}</p>
                <div className="flex items-center gap-3 mt-3">
                  <a href={`mailto:${site.email}`} className="link-text inline-flex items-center gap-2">
                    <Mail size={16} /> {site.email}
                  </a>
                  <a href={site.cvUrl} target="_blank" rel="noreferrer" className="link-text inline-flex items-center gap-2">
                    <FileDown size={16} /> CV
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Ribbon accents */}
        <div className="creative-ribbon-back">Polymer • Process • Delivery</div>
        <div className="creative-ribbon">Process clarity. Predictable production.</div>
      </section>

      {/* About */}
      <section id="about" className="section">
        <div className="container">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <p className="kicker mb-2">About</p>
              <h2 className="heading-4 text-[var(--text-primary)] mb-6">{about.headline}</h2>
              {about.paragraphs.map((p, i) => (
                <p key={i} className="mb-4 text-[var(--text-secondary)]">{p}</p>
              ))}
            </div>
            <div className="card-glass p-5 h-max">
              <p className="kicker">Quick facts</p>
              <ul className="mt-3 space-y-3">
                {about.quickFacts.map((q, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 size={18} className="text-[var(--brand-primary)] mt-0.5" />
                    <span className="text-sm text-[var(--text-secondary)]">{q}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="section">
        <div className="container">
          <p className="kicker mb-2">Services</p>
          <h2 className="heading-4 text-[var(--text-primary)] mb-4">Targeted services that turn material know-how into production results</h2>
          <Accordion type="single" collapsible className="w-full">
            {services.map((s, i) => {
              const Icon = servicesIcons[i % servicesIcons.length];
              return (
                <AccordionItem key={s.name} value={`item-${i}`} className="border-b border-[var(--border-light)]">
                  <AccordionTrigger className="text-left">
                    <div className="flex items-center gap-3">
                      <Icon className="text-[var(--brand-primary)]" size={18} />
                      <span className="font-semibold">{s.name}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="grid md:grid-cols-3 gap-4 md:gap-6 py-2">
                      <Card className="card-glass md:col-span-1">
                        <CardContent className="p-4">
                          <p className="caption mb-1">What it is</p>
                          <p className="text-sm text-[var(--text-secondary)]">{s.what}</p>
                        </CardContent>
                      </Card>
                      <Card className="card-glass md:col-span-1">
                        <CardContent className="p-4">
                          <p className="caption mb-1">Deliverables</p>
                          <p className="text-sm text-[var(--text-secondary)]">{s.deliverables}</p>
                        </CardContent>
                      </Card>
                      <Card className="card-glass md:col-span-1">
                        <CardContent className="p-4">
                          <p className="caption mb-1">Outcome</p>
                          <p className="text-sm text-[var(--text-secondary)]">{s.outcome}</p>
                        </CardContent>
                      </Card>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>

          <div className="flex items-center gap-3 mt-6">
            {engagements.map((e) => (
              <div key={e.title} className="card-glass px-4 py-3">
                <p className="text-sm text-[var(--text-primary)] font-semibold">{e.title}</p>
                <p className="caption opacity-80">{e.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Approach / Method */}
      <section id="approach" className="section">
        <div className="container">
          <p className="kicker mb-2">Method</p>
          <h2 className="heading-4 text-[var(--text-primary)] mb-6">{approach.headline}</h2>
          <div className="grid md:grid-cols-5 gap-4">
            {approach.steps.map((st, i) => (
              <div key={st.name} className="card-glass p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="caption">Step {i + 1}</span>
                  <span className="text-[var(--brand-primary)] font-bold">{i + 1}</span>
                </div>
                <p className="font-semibold text-sm text-[var(--text-primary)]">{st.name}</p>
                <p className="caption mt-2">{st.details}</p>
              </div>
            ))}
          </div>
          <div className="grid md:grid-cols-2 gap-4 mt-6">
            {approach.expectations.map((ex, i) => (
              <div key={i} className="card-glass p-4 flex items-start gap-2">
                <CheckCircle2 size={18} className="text-[var(--brand-primary)] mt-0.5" />
                <p className="text-sm text-[var(--text-secondary)]">{ex}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Experience */}
      <section id="experience" className="section">
        <div className="container">
          <p className="kicker mb-2">Experience</p>
          <h2 className="heading-4 text-[var(--text-primary)] mb-6">{experience.headline}</h2>
          <div className="space-y-4">
            {experience.roles.map((r) => (
              <div key={r.company + r.title} className="card-glass p-5">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                  <p className="text-[var(--text-primary)] font-semibold">{r.company} — {r.title}</p>
                  <p className="caption">{r.period}</p>
                </div>
                <ul className="mt-3 list-disc pl-5">
                  {r.bullets.map((b, i) => (
                    <li key={i} className="text-sm text-[var(--text-secondary)]">{b}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="card-glass p-5 mt-4">
            {experience.education.map((e, i) => (
              <div key={i} className="flex items-start justify-between">
                <p className="text-[var(--text-primary)] font-semibold">{e.degree}</p>
                <p className="caption">{e.details}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Case Studies */}
      <section id="cases" className="section">
        <div className="container">
          <p className="kicker mb-2">Case Studies</p>
          <h2 className="heading-4 text-[var(--text-primary)] mb-6">{caseStudies.headline}</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {caseStudies.items.map((c) => (
              <div key={c.title} className="event-card rounded-lg overflow-hidden">
                <div className="event-card-content">
                  <div>
                    <p className="event-card-title">{c.title}</p>
                    <div className="space-y-2">
                      <p className="caption">Challenge</p>
                      <p className="text-sm text-[var(--bg-light)]/90">{c.challenge}</p>
                      <p className="caption mt-3">Approach</p>
                      <p className="text-sm text-[var(--bg-light)]/90">{c.approach}</p>
                      <p className="caption mt-3">Outcome</p>
                      <p className="text-sm text-[var(--bg-light)]/90">{c.outcome}</p>
                    </div>
                  </div>
                  <div>
                    <a href="#contact">
                      <Button className="btn-secondary">Discuss a similar project</Button>
                    </a>
                  </div>
                </div>
                <div className="event-card-image bg-[var(--border-medium)]" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="section">
        <div className="container">
          <div className="grid md:grid-cols-3 gap-6 items-start">
            <div className="md:col-span-2">
              <p className="kicker mb-2">Contact</p>
              <h2 className="heading-4 text-[var(--text-primary)] mb-4">Let’s talk about your next polymer or process challenge</h2>
              <p className="mb-6 text-[var(--text-secondary)] max-w-2xl">If you’re launching a new polymer part, integrating recycled feedstock, or stuck on a production issue, I’ll help you turn the problem into a predictable outcome. Tell me about the project and I’ll recommend the right engagement for your needs.</p>

              <form onSubmit={onSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" name="name" value={form.name} onChange={onChange} placeholder="Your name" required className="bg-transparent" />
                  </div>
                  <div>
                    <Label htmlFor="company">Company</Label>
                    <Input id="company" name="company" value={form.company} onChange={onChange} placeholder="Company" className="bg-transparent" />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="role">Role</Label>
                    <Input id="role" name="role" value={form.role} onChange={onChange} placeholder="Your role" className="bg-transparent" />
                  </div>
                  <div>
                    <Label htmlFor="startDate">Desired start date</Label>
                    <Input id="startDate" name="startDate" value={form.startDate} onChange={onChange} placeholder="e.g., 2025-09-01" className="bg-transparent" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="summary">Project summary</Label>
                  <Textarea id="summary" name="summary" value={form.summary} onChange={onChange} placeholder="Briefly describe your project or challenge" rows={5} className="bg-transparent" />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="budget">Budget range (optional)</Label>
                    <Input id="budget" name="budget" value={form.budget} onChange={onChange} placeholder="e.g., €10k–€50k" className="bg-transparent" />
                  </div>
                  <div>
                    <Label htmlFor="file">Attach file (PDF)</Label>
                    <Input id="file" type="file" accept="application/pdf" name="file" onChange={onChange} className="bg-transparent" />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Button disabled={submitting} className="btn-primary">
                    {submitting ? "Sending..." : "Request a consult"}
                  </Button>
                  <a href={`mailto:${site.email}`} className="btn-secondary inline-flex items-center gap-2">
                    <Mail size={16} /> Email directly
                  </a>
                </div>
              </form>
            </div>
            <div className="card-glass p-5">
              <p className="kicker">Direct details</p>
              <div className="mt-3 space-y-2">
                <p className="text-sm text-[var(--text-secondary)]"><span className="text-[var(--text-primary)] font-semibold">Email:</span> {site.email}</p>
                <p className="text-sm text-[var(--text-secondary)]"><span className="text-[var(--text-primary)] font-semibold">LinkedIn:</span> Available on request</p>
                <p className="text-sm text-[var(--text-secondary)]"><span className="text-[var(--text-primary)] font-semibold">Location:</span> {site.location}</p>
                <a href={site.cvUrl} target="_blank" rel="noreferrer" className="btn-secondary inline-flex items-center gap-2 mt-4">
                  <FileDown size={16} /> Download CV (PDF)
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />

      {/* Sticky CTA */}
      <button onClick={scrollToContact} className="fixed bottom-6 right-6 z-40 btn-primary shadow-xl">
        {site.stickyCtaText}
      </button>

      <Toaster position="top-right" richColors />
    </div>
  );
}

function App() {
  return (
    <div>
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    </div>
  );
}

export default App;