"use client";
import { SectionWrapper } from "@/components/ui/SectionWrapper";

export default function TermsPage() {
  return (
    <SectionWrapper className="max-w-3xl mx-auto space-y-12">
      <div className="space-y-4">
        <h1 className="text-5xl font-black tracking-tighter">Terms of <span className="text-secondary">Service</span></h1>
        <p className="text-sm text-muted-foreground font-bold uppercase tracking-widest">Effective Date: February 2026</p>
      </div>

      <div className="prose prose-invert max-w-none text-muted-foreground space-y-8">
        <section>
          <h2 className="text-2xl font-black text-white mb-4">1. Acceptance of Protocol</h2>
          <p>
            By accessing the CivicSens Intelligence Console, you agree to abide by these Terms of Service. If you do not agree to these terms, you must immediately terminate your connection to the node.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-black text-white mb-4">2. Citizen Responsibilities</h2>
          <p>
            You agree to use CivicSens solely for the purpose of reporting genuine civic infrastructure issues. Intentional submission of false data, spoofed coordinates, or malicious matrices will result in an immediate IP and hardware ban.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-black text-white mb-4">3. AI Liability Disclaimer</h2>
          <p>
            CivicSens utilizes advanced neural networks (Gemini Pro) to classify and prioritize reports. While our AI maintains a 99% accuracy rate, the platform and its creators are not liable for misclassifications or delays in municipal response times resulting from algorithmic triage.
          </p>
        </section>
      </div>
    </SectionWrapper>
  );
}
