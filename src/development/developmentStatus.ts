import statusData from '../../development-status.json';
import { DevelopmentStatusData, RoadmapModule, RoadmapUI } from './types';

export const getDevelopmentStatus = (): DevelopmentStatusData => {
  return statusData as DevelopmentStatusData;
};

export const getSummary = () => {
  const data = getDevelopmentStatus();
  
  // Do not include module 12 in web demo progress
  const webModules = data.modules.filter(m => m.id !== '12');
  
  const total = webModules.length;
  const accepted = webModules.filter(m => m.status === 'ACCEPTED').length;
  const ready = webModules.filter(m => m.status === 'READY_FOR_ACCEPTANCE').length;
  const active = webModules.filter(m => m.status === 'ACTIVE').length;
  const blocked = webModules.filter(m => m.status === 'BLOCKED').length;
  const needsFix = webModules.filter(m => m.status === 'NEEDS_FIX').length;
  
  return {
    total,
    accepted,
    ready,
    active,
    blocked,
    needsFix,
    progress: total > 0 ? Math.round((accepted / total) * 100) : 0
  };
};

export const getCurrentModule = (): RoadmapModule | null => {
  const data = getDevelopmentStatus();
  const activeModule = data.modules.find(m => m.status === 'ACTIVE');
  if (activeModule) return activeModule;
  
  const readyModule = data.modules.find(m => m.status === 'READY_FOR_ACCEPTANCE');
  if (readyModule) return readyModule;
  
  return null;
};

export const getUISummary = () => {
  const data = getDevelopmentStatus();
  const items = data.uiPrototype || [];

  const total = items.length;
  const accepted = items.filter(m => m.status === 'ACCEPTED').length;
  const ready = items.filter(m => m.status === 'READY_FOR_ACCEPTANCE').length;
  const active = items.filter(m => m.status === 'ACTIVE').length;
  const blocked = items.filter(m => m.status === 'BLOCKED').length;
  const needsFix = items.filter(m => m.status === 'NEEDS_FIX').length;
  const eligible = items.filter(m => m.status === 'ELIGIBLE').length;

  return {
    total,
    accepted,
    ready,
    active,
    blocked,
    needsFix,
    eligible,
    progress: total > 0 ? Math.round((accepted / total) * 100) : 0
  };
};

export const getCurrentUI = (): RoadmapUI | null => {
  const data = getDevelopmentStatus();
  const items = data.uiPrototype || [];

  const activeUI = items.find(m => m.status === 'ACTIVE');
  if (activeUI) return activeUI;

  const readyUI = items.find(m => m.status === 'READY_FOR_ACCEPTANCE');
  if (readyUI) return readyUI;

  return null;
};
