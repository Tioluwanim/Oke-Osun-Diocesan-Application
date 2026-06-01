import { useCallback, useRef, useState } from 'react';
import { Linking, Alert } from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../context/AuthContext';
import { paymentApi } from '../../../utils/paymentApi';
import { MIN_AMOUNT } from '../../../utils/paymentTypes';

/**
 * useGivePayment – all Give screen logic in one hook.
 * Screens stay thin; all async/state lives here.
 */
export function useGivePayment() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  const [confirmVisible, setConfirmVisible] = useState(false);
  const [resultVisible,  setResultVisible]  = useState(false);
  const [resultStatus,   setResultStatus]   = useState(null);
  const [currentRef,     setCurrentRef]     = useState(null);
  const pollTimer = useRef(null);

  // ── Fetch personal history ──
  const historyQuery = useQuery({
    queryKey: ['payments', 'my'],
    queryFn: () => paymentApi.myHistory(token),
    enabled: !!token,
    staleTime: 60_000,
  });

  // ── Poll for confirmation after Paystack redirect ──
  const pollStatus = useCallback((reference) => {
    let attempts = 0;
    pollTimer.current = setInterval(async () => {
      attempts++;
      try {
        const data = await paymentApi.verify(reference, token);
        const status = data?.payment?.status;
        if (status === 'success' || status === 'failed' || attempts >= 12) {
          clearInterval(pollTimer.current);
          setResultStatus(status || 'pending');
          setResultVisible(true);
          if (status === 'success') {
            queryClient.invalidateQueries({ queryKey: ['payments', 'my'] });
          }
        }
      } catch {
        if (attempts >= 12) {
          clearInterval(pollTimer.current);
          setResultStatus('pending');
          setResultVisible(true);
        }
      }
    }, 3000);
  }, [token, queryClient]);

  // ── Initiate mutation ──
  const initiateMutation = useMutation({
    mutationFn: (body) => paymentApi.initiate(body, token),
    onSuccess: async (data) => {
      setCurrentRef(data.reference);
      setConfirmVisible(false);
      if (data.checkout_url) {
        await Linking.openURL(data.checkout_url);
        pollStatus(data.reference);
      }
    },
    onError: (err) => {
      setConfirmVisible(false);
      Alert.alert('Error', err.message || 'Could not initiate payment. Please try again.');
    },
  });

  return {
    historyQuery,
    initiateMutation,
    confirmVisible, setConfirmVisible,
    resultVisible,  setResultVisible,
    resultStatus,
    currentRef,
    pollStatus,
  };
}