export interface TeamConfig {
  teamName: string;
  college: string;
  event: string;
  track?: string;
  members: string[];
}

export const teamConfig: TeamConfig = {
  // USER: fill these in with your real team and institution details if desired!
  teamName: "[TEAM_NAME]",
  college: "[COLLEGE_NAME]",
  event: "NOVEX Hackathon 2026",
  track: "Maritime Decision Intelligence",
  members: [],
};

export function isPlaceholder(val?: string | null): boolean {
  if (!val) return true;
  const clean = val.trim().toLowerCase();
  return (
    clean === "" ||
    clean.includes("[") ||
    clean.includes("]") ||
    clean.includes("team_name") ||
    clean.includes("college_name") ||
    clean.includes("tbd") ||
    clean.includes("placeholder")
  );
}

