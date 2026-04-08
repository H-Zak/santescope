import { CommuneData } from "@/lib/types";

interface CommuneEquipmentsProps {
  data: CommuneData;
}

export function CommuneEquipments({ data }: CommuneEquipmentsProps) {
  const equipments = [
    { label: "Maison de Santé (MSP)", present: data.msp_presente as boolean | null },
    { label: "Hôpital", present: data.has_hopital },
    { label: "EHPAD", present: data.has_ehpad },
  ];

  const has = equipments.filter((e) => e.present === true);
  const missing = equipments.filter((e) => e.present === false);
  const unknown = equipments.filter((e) => e.present === null);

  return (
    <div style={{ borderRadius: 10, overflow: "hidden", border: "1px solid #e2e8f0" }}>
      {has.length > 0 && (
        <div style={{ background: "#f0fdf4", padding: "10px 12px", borderBottom: (missing.length > 0 || unknown.length > 0) ? "1px solid #e2e8f0" : "none" }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#16a34a", marginBottom: 4, display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{
              display: "inline-flex", width: 14, height: 14, borderRadius: "50%",
              background: "#22C55E", alignItems: "center", justifyContent: "center",
            }}>
              <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </span>
            Équipements présents
          </div>
          {has.map((e) => (
            <div key={e.label} style={{ fontSize: 12, color: "#166534", padding: "2px 0" }}>
              {e.label}
            </div>
          ))}
        </div>
      )}
      {missing.length > 0 && (
        <div style={{ background: "#fefce8", padding: "10px 12px", borderBottom: unknown.length > 0 ? "1px solid #e2e8f0" : "none" }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#a16207", marginBottom: 4, display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ fontSize: 12 }}>&#9888;</span>
            Absents de la commune
          </div>
          {missing.map((e) => (
            <div key={e.label} style={{ fontSize: 12, color: "#854d0e", padding: "2px 0" }}>
              {e.label}
            </div>
          ))}
        </div>
      )}
      {unknown.length > 0 && (
        <div style={{ background: "#f8fafc", padding: "10px 12px" }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#94a3b8", marginBottom: 4 }}>
            Données non disponibles
          </div>
          {unknown.map((e) => (
            <div key={e.label} style={{ fontSize: 12, color: "#94a3b8", padding: "2px 0" }}>
              {e.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
