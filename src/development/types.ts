export type DevelopmentStatus =
  | 'ACCEPTED'
  | 'READY_FOR_ACCEPTANCE'
  | 'ACTIVE'
  | 'BLOCKED'
  | 'ELIGIBLE'
  | 'NEEDS_FIX';

export interface RoadmapModule {
  id: string;
  name: string;
  status: DevelopmentStatus;
  checkpoint?: string;
  dependsOn: string[];
}

export interface RoadmapUI {
  id: string;
  name: string;
  status: DevelopmentStatus;
  checkpoint?: string | null;
  dependsOn: string[];
  scope?: string[];
}

export interface DevelopmentStatusData {
  version: number;
  currentModule: string;
  currentUI: string;
  uiPrototype: RoadmapUI[];
  modules: RoadmapModule[];
}
