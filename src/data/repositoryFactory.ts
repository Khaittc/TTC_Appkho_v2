import { IS_DEMO_MODE } from '../config/env';
import { DataProvider } from './interfaces/DataProvider';
import { DemoDataProvider } from './demo/DemoDataProvider';
import { FirebaseDataProvider } from './firebase/FirebaseDataProvider';

let providerInstance: DataProvider | null = null;

export const getDataProvider = (): DataProvider => {
  if (!providerInstance) {
    if (IS_DEMO_MODE) {
      providerInstance = new DemoDataProvider();
    } else {
      providerInstance = new FirebaseDataProvider();
    }
  }
  return providerInstance;
};

