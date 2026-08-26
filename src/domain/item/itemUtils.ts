import { Item } from '../../types';

export const normalizeBrandName = (value: string): string => {
  return value.trim().normalize('NFC').replace(/\s+/g, ' ').toUpperCase();
};

export const normalizeModel = (value: string): string => {
  return value.trim().normalize('NFC').replace(/\s+/g, ' ').toUpperCase();
};



export const calculatePriceDifference = (currentPrice: number, previousPrice: number | undefined): number => {
  if (!previousPrice) return 0;
  return currentPrice - previousPrice;
};

export const calculatePriceDifferencePercent = (currentPrice: number, previousPrice: number | undefined): number => {
  if (!previousPrice) return 0;
  return ((currentPrice - previousPrice) / previousPrice) * 100;
};
