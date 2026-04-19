import { useState, useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { fetchLatest, fetchHistory } from '../utils/api';

const SOCKET_URL = 'http://localhost:5000';
const POLL_INTERVAL = 10000; // 10s fallback polling

/**
 * Custom hook that manages all sensor data state.
 * Connects to Socket.IO for real-time updates with polling fallback.
 */
export function useSensorData() {
  const [latest, setLatest] = useState(null);
  const [history, setHistory] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const socketRef = useRef(null);
  const pollRef = useRef(null);

  // Fetch initial data
  const loadInitialData = useCallback(async () => {
    try {
      setLoading(true);
      const [latestData, historyData] = await Promise.all([
        fetchLatest().catch(() => null),
        fetchHistory({ limit: 100 }).catch(() => []),
      ]);
      if (latestData) setLatest(latestData);
      if (historyData.length) setHistory(historyData.reverse()); // Oldest first for charts
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Start polling as fallback
  const startPolling = useCallback(() => {
    if (pollRef.current) return;
    pollRef.current = setInterval(async () => {
      try {
        const data = await fetchLatest();
        if (data) {
          setLatest(data);
          setHistory((prev) => {
            const updated = [...prev, data];
            return updated.slice(-100); // Keep last 100
          });
        }
      } catch {
        // Silently fail during polling
      }
    }, POLL_INTERVAL);
  }, []);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  useEffect(() => {
    // Load initial data
    loadInitialData();

    // Setup Socket.IO connection
    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('[Socket.IO] Connected');
      setIsConnected(true);
      stopPolling(); // Stop polling when socket is connected
    });

    socket.on('disconnect', () => {
      console.log('[Socket.IO] Disconnected');
      setIsConnected(false);
      startPolling(); // Start polling as fallback
    });

    socket.on('newSensorData', (data) => {
      setLatest(data);
      setHistory((prev) => {
        const updated = [...prev, data];
        return updated.slice(-100); // Keep last 100
      });
    });

    socket.on('connect_error', () => {
      setIsConnected(false);
      startPolling(); // Fallback to polling on connection error
    });

    return () => {
      socket.disconnect();
      stopPolling();
    };
  }, [loadInitialData, startPolling, stopPolling]);

  // Refresh function for manual refresh
  const refresh = useCallback(() => {
    loadInitialData();
  }, [loadInitialData]);

  return {
    latest,
    history,
    isConnected,
    loading,
    error,
    refresh,
  };
}
