// 5 selectable outfit colors for the jumper — recolors only the "T-shirt"
// and "short" (shorts) materials, never skin/hair/eyes. Deliberately not 5
// different character *models*: this project doesn't have a free, rigged,
// animation-compatible library of humanoid glTF assets to draw from, and
// sourcing even one (HVGirl.glb) already surfaced several real bugs — see
// docs/3D_PROTOTYPE.md. Recoloring the same rig is the same idea most
// platformers use for cheap, low-risk character variety (a "skin"), without
// the asset-sourcing/rigging risk of swapping the actual mesh per option.
export const PERSONAS = [
  { id: "classic", name: "Classic", shirtColor: null, shortsColor: null, swatch: "#5a84cc" },
  { id: "coral", name: "Coral", shirtColor: [0.85, 0.28, 0.32], shortsColor: [0.95, 0.92, 0.88], swatch: "#d9484f" },
  { id: "azure", name: "Azure", shirtColor: [0.15, 0.35, 0.75], shortsColor: [0.08, 0.14, 0.32], swatch: "#2a59bf" },
  { id: "golden", name: "Golden", shirtColor: [0.85, 0.65, 0.15], shortsColor: [0.35, 0.24, 0.1], swatch: "#d9a626" },
  { id: "emerald", name: "Emerald", shirtColor: [0.16, 0.55, 0.32], shortsColor: [0.08, 0.28, 0.16], swatch: "#2a8c52" },
];
