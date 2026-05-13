import { useState, useEffect, useCallback } from 'react';
import * as loyaltyService from '../services/loyaltyService';

const useLoyalty = () => {
  const [account, setAccount]       = useState(null);
  const [history, setHistory]       = useState({ transactions: [], pagination: {} });
  const [tierDiscount, setTierDiscount] = useState(null);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState(null);

  const fetchAccount = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await loyaltyService.getAccount();
      setAccount(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load loyalty data');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchHistory = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const data = await loyaltyService.getHistory(params);
      setHistory(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load history');
    } finally {
      setLoading(false);
    }
  }, []);

  const redeemPoints = useCallback(async (points) => {
    const result = await loyaltyService.redeemPoints(points);
    await fetchAccount();
    return result;
  }, [fetchAccount]);

  const fetchTierDiscount = useCallback(async () => {
    try {
      const data = await loyaltyService.checkTierDiscount();
      setTierDiscount(data);
      return data;
    } catch {
      return null;
    }
  }, []);

  const applyTierDiscount = useCallback(async () => {
    const result = await loyaltyService.applyTierDiscount();
    await fetchAccount();
    setTierDiscount(null);
    return result;
  }, [fetchAccount]);

  useEffect(() => {
    fetchAccount();
  }, [fetchAccount]);

  return {
    account,
    summary: account,          // backward compat alias
    history,
    tierDiscount,
    loading,
    error,
    fetchAccount,
    fetchSummary: fetchAccount, // backward compat alias
    fetchHistory,
    redeemPoints,
    fetchTierDiscount,
    applyTierDiscount,
  };
};

export default useLoyalty;
