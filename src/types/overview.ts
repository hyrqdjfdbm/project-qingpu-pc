export interface OverviewStats {
  totalProjects: number;
  pendingAudit: number;
  inImplementation: number;
  totalInvestment: number;
  byPoolStage: { stage: string; label: string; count: number }[];
  byStreetTown: { name: string; count: number }[];
}
