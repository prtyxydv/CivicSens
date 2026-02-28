"use client";
import { SectionWrapper } from "@/components/ui/SectionWrapper";

export default function PrivacyPage() {
  return (
    <SectionWrapper className="max-w-3xl mx-auto space-y-12">
      <div className="space-y-4">
        <h1 className="text-5xl font-black tracking-tighter">Privacy <span className="text-primary">Policy</span></h1>
        <p className="text-sm text-muted-foreground font-bold uppercase tracking-widest">Last Updated: February 2026</p>
      </div>

      <div className="prose prose-invert max-w-none text-muted-foreground space-y-8">
        <section>
          <h2 className="text-2xl font-black text-white mb-4">1. Data Minimization Principle</h2>
          <p>
            CivicSens is engineered to operate on minimum viable data. We collect only what is strictly necessary to route and resolve civic infrastructure anomalies. Your identity is cryptographic and anonymized before entering the AI classification queue.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-black text-white mb-4">2. Information Collection</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Geospatial Data:</strong> Precise coordinates are required to pinpoint infrastructure decay.</li>
            <li><strong>Visual Matrices:</strong> Uploaded images are scrubbed of EXIF metadata prior to storage.</li>
            <li><strong>Authentication:</strong> Email addresses are utilized solely for session integrity and status notifications.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-black text-white mb-4">3. Data Retention</h2>
          <p>
            Resolved reports enter a cold-storage ledger for historical pattern analysis. Personally Identifiable Information (PII) linked to these reports is purged 30 days post-resolution in compliance with standard GDPR guidelines.
          </p>
        </section>
      </div>
    </SectionWrapper>
  );
}
