"use client";

import { useState } from "react";
import { CommuneData } from "@/lib/types";

interface ActionPathwaysProps {
  data: CommuneData;
}

interface Pathway {
  id: string;
  trigger: (data: CommuneData) => boolean;
  title: string;
  urgency: "haute" | "moyenne";
  icon: string;
  steps: Array<{
    label: string;
    detail: string;
    link?: { text: string; url: string };
  }>;
  timeline: string;
}

const PATHWAYS: Pathway[] = [
  {
    id: "msp",
    trigger: (d) => d.msp_presente === false && d.pop > 3000,
    title: "Créer une Maison de Santé (MSP)",
    urgency: "haute",
    icon: "🏥",
    steps: [
      {
        label: "Diagnostic territorial",
        detail: "Réaliser un diagnostic partagé avec l'ARS sur l'offre de soins. Contacter le délégué territorial de votre département.",
        link: { text: "Annuaire ARS", url: "https://www.ars.sante.fr/les-delegations-departementales" },
      },
      {
        label: "Constituer le projet de santé",
        detail: "Réunir au moins 2 médecins et 1 paramédical. Rédiger le projet de santé selon le cahier des charges ARS.",
        link: { text: "Guide MSP (Ministère)", url: "https://sante.gouv.fr/systeme-de-sante/structures-de-soins/les-maisons-de-sante/" },
      },
      {
        label: "Demander le financement",
        detail: "Déposer le dossier FIR (Fonds d'Intervention Régional) auprès de l'ARS. Montant : 50K-300K€ selon projet.",
        link: { text: "Formulaire FIR", url: "https://www.ars.sante.fr/le-fonds-dintervention-regional-fir" },
      },
      {
        label: "Conventionnement CPAM",
        detail: "Signer l'Accord Conventionnel Interprofessionnel (ACI) pour bénéficier des rémunérations d'équipe.",
        link: { text: "ACI CPAM", url: "https://www.ameli.fr/medecin/exercice-liberal/vie-cabinet/aides-financieres/accord-conventionnel-interprofessionnel" },
      },
    ],
    timeline: "12-24 mois",
  },
  {
    id: "medecin",
    trigger: (d) => d.medecins.total > 0 && d.domino !== null,
    title: "Anticiper les départs de médecins",
    urgency: "haute",
    icon: "👨‍⚕️",
    steps: [
      {
        label: "Identifier les départs prévisibles",
        detail: "Contacter le Conseil de l'Ordre départemental pour connaître les médecins proches de la retraite dans la commune.",
        link: { text: "CDOM", url: "https://www.conseil-national.medecin.fr/lordre-medecins/conseils-departementaux" },
      },
      {
        label: "Candidater au zonage médecin",
        detail: "Vérifier si la commune est en ZIP (Zone d'Intervention Prioritaire) ou ZAC. Si oui, les médecins qui s'installent bénéficient d'aides.",
        link: { text: "Zonage ARS", url: "https://www.ars.sante.fr/zonage-medecins" },
      },
      {
        label: "Proposer une aide à l'installation",
        detail: "CESP (Contrat d'Engagement de Service Public) : 1200€/mois pour internes en échange de 2 ans d'exercice. PTMG : 6900€/mois garanti.",
        link: { text: "Aides installation (Ameli)", url: "https://www.ameli.fr/medecin/exercice-liberal/vie-cabinet/aides-financieres/aides-a-l-installation" },
      },
    ],
    timeline: "6-18 mois",
  },
  {
    id: "ehpad",
    trigger: (d) => d.has_ehpad === false && d.score_detail.pct_75_seuls > 0.10,
    title: "Renforcer l'offre pour les 75+",
    urgency: "moyenne",
    icon: "🏠",
    steps: [
      {
        label: "Évaluer les besoins",
        detail: "Solliciter le Conseil départemental pour un diagnostic des besoins en hébergement et services à domicile.",
        link: { text: "Portail autonomie", url: "https://www.pour-les-personnes-agees.gouv.fr/" },
      },
      {
        label: "Développer les SSIAD",
        detail: "Services de Soins Infirmiers à Domicile — alternative à l'EHPAD. Demander une autorisation via l'appel à projets ARS.",
      },
      {
        label: "Candidater au programme ICOPE",
        detail: "Programme OMS de prévention de la perte d'autonomie. Déployé par les ARS depuis 2022.",
        link: { text: "ICOPE France", url: "https://www.has-sante.fr/jcms/p_3218498/fr/icope-monitor" },
      },
    ],
    timeline: "12-36 mois",
  },
];

export function ActionPathways({ data }: ActionPathwaysProps) {
  const applicable = PATHWAYS.filter((p) => p.trigger(data));
  const [openId, setOpenId] = useState<string | null>(null);

  if (applicable.length === 0) return null;

  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 600, color: "#475569", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.04em" }}>
        Parcours d&apos;action recommandés
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {applicable.map((pathway) => {
          const isOpen = openId === pathway.id;
          return (
            <div key={pathway.id} style={{ border: "1px solid #e2e8f0", borderRadius: 10, overflow: "hidden" }}>
              <button
                onClick={() => setOpenId(isOpen ? null : pathway.id)}
                style={{
                  width: "100%", padding: "10px 14px", display: "flex", alignItems: "center", gap: 10,
                  background: isOpen ? "#f8fafc" : "#fff", border: "none", cursor: "pointer", fontFamily: "inherit",
                  transition: "background 0.1s",
                }}
              >
                <span style={{ fontSize: 18 }}>{pathway.icon}</span>
                <div style={{ flex: 1, textAlign: "left" }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#1e293b" }}>{pathway.title}</div>
                  <div style={{ fontSize: 10, color: "#64748b" }}>
                    {pathway.steps.length} étapes · {pathway.timeline}
                    <span style={{
                      marginLeft: 8, padding: "1px 6px", borderRadius: 4, fontSize: 9, fontWeight: 600,
                      background: pathway.urgency === "haute" ? "#fef2f2" : "#fefce8",
                      color: pathway.urgency === "haute" ? "#DC2626" : "#a16207",
                    }}>
                      Priorité {pathway.urgency}
                    </span>
                  </div>
                </div>
                <svg
                  width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round"
                  style={{ flexShrink: 0, transition: "transform 0.15s", transform: isOpen ? "rotate(90deg)" : "rotate(0deg)" }}
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>

              {isOpen && (
                <div style={{ padding: "0 14px 14px", background: "#f8fafc" }}>
                  {pathway.steps.map((step, i) => (
                    <div key={i} style={{ display: "flex", gap: 10, padding: "10px 0", borderBottom: i < pathway.steps.length - 1 ? "1px solid #e2e8f0" : "none" }}>
                      <div style={{
                        width: 22, height: 22, borderRadius: "50%", flexShrink: 0,
                        background: "#0F766E", color: "#fff", fontSize: 11, fontWeight: 700,
                        display: "flex", alignItems: "center", justifyContent: "center", marginTop: 1,
                      }}>
                        {i + 1}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: "#1e293b", marginBottom: 2 }}>{step.label}</div>
                        <div style={{ fontSize: 11, color: "#64748b", lineHeight: 1.5 }}>{step.detail}</div>
                        {step.link && (
                          <a
                            href={step.link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: "inline-flex", alignItems: "center", gap: 4, marginTop: 4,
                              fontSize: 11, color: "#0F766E", fontWeight: 600, textDecoration: "none",
                            }}
                          >
                            {step.link.text} →
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
