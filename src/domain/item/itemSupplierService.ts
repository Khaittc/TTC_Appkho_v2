import { ItemSupplier } from '../../types';

export const determinePreferredSupplier = (itemSuppliers: ItemSupplier[], newSupplierId: string): boolean => {
  // If this is the first supplier for the item, make it preferred
  return itemSuppliers.length === 0;
};

export const getLowestActivePrice = (itemSuppliers: ItemSupplier[]): number => {
  const activePricedSuppliers = itemSuppliers.filter(
    is => is.status === 'ACTIVE' && is.currentPrice && is.currentPrice > 0 && is.currency === 'VND'
  );
  if (activePricedSuppliers.length === 0) return -1;
  return Math.min(...activePricedSuppliers.map(is => is.currentPrice as number));
};

export const processPriceUpdate = (
  currentSupplier: ItemSupplier,
  newPrice: number,
  newQuoteDate: string
): Partial<ItemSupplier> => {
  return {
    previousPrice: currentSupplier.currentPrice,
    currentPrice: newPrice,
    priceQuoteDate: newQuoteDate,
    priceUpdatedAt: new Date().toISOString()
  };
};

export const setPreferredStatus = (
  targetId: string, 
  itemSuppliers: ItemSupplier[]
): { id: string; changes: Partial<ItemSupplier> }[] => {
  const updates: { id: string; changes: Partial<ItemSupplier> }[] = [];
  
  itemSuppliers.forEach(is => {
    if (is.id === targetId) {
      if (!is.isPreferred) {
        updates.push({ id: is.id, changes: { isPreferred: true } });
      }
    } else {
      if (is.isPreferred) {
        updates.push({ id: is.id, changes: { isPreferred: false } });
      }
    }
  });
  
  return updates;
};
