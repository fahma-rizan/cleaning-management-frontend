import { useState, useEffect, useCallback } from 'react';
import * as inventoryService from '../services/inventoryService';

const useInventory = () => {
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({});
  const [lowStockItems, setLowStockItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchItems = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const data = await inventoryService.getItems(params);
      setItems(data.items);
      setPagination(data.pagination);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load inventory');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchLowStock = useCallback(async () => {
    try {
      const data = await inventoryService.getLowStock();
      setLowStockItems(data);
    } catch {
      // Non-critical: silently fail
    }
  }, []);

  const addItem = useCallback(async (data) => {
    const item = await inventoryService.createItem(data);
    setItems((prev) => [item, ...prev]);
    return item;
  }, []);

  const editItem = useCallback(async (id, data) => {
    const updated = await inventoryService.updateItem(id, data);
    setItems((prev) => prev.map((i) => (i._id === id ? updated : i)));
    return updated;
  }, []);

  const removeItem = useCallback(async (id) => {
    await inventoryService.deleteItem(id);
    setItems((prev) => prev.filter((i) => i._id !== id));
  }, []);

  const adjust = useCallback(async (id, data) => {
    const result = await inventoryService.adjustStock(id, data);
    setItems((prev) => prev.map((i) => (i._id === id ? result.item : i)));
    await fetchLowStock();
    return result;
  }, [fetchLowStock]);

  useEffect(() => {
    fetchItems();
    fetchLowStock();
  }, [fetchItems, fetchLowStock]);

  return {
    items, pagination, lowStockItems, loading, error,
    fetchItems, fetchLowStock, addItem, editItem, removeItem, adjust,
  };
};

export default useInventory;
