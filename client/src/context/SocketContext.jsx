import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { useOrg } from './OrgContext';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const { activeOrg } = useOrg();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: 'init-1',
      title: 'Welcome to Sprint 24',
      message: 'Core gateway deliverables are scheduled for this week.',
      time: 'Just now',
      read: false,
    },
  ]);

  useEffect(() => {
    if (!isAuthenticated) {
      if (socket) socket.disconnect();
      setSocket(null);
      setIsConnected(false);
      return;
    }

    const socketUrl = import.meta.env.VITE_API_BASE_URL
      ? import.meta.env.VITE_API_BASE_URL.replace('/api', '')
      : 'http://localhost:5000';

    const newSocket = io(socketUrl, {
      transports: ['websocket', 'polling'],
    });

    newSocket.on('connect', () => {
      console.log('[Socket] Connected to server:', newSocket.id);
      setIsConnected(true);

      if (activeOrg?._id) {
        newSocket.emit('join:org', activeOrg._id);
      }
    });

    newSocket.on('disconnect', () => {
      console.log('[Socket] Disconnected from server');
      setIsConnected(false);
    });

    // Real-time task notifications
    newSocket.on('task:created', (task) => {
      setNotifications((prev) => [
        {
          id: Date.now(),
          title: 'New Task Created',
          message: `[${task.key}] ${task.title}`,
          time: 'Just now',
          read: false,
        },
        ...prev,
      ]);
    });

    newSocket.on('task:moved', (data) => {
      setNotifications((prev) => [
        {
          id: Date.now(),
          title: 'Task Status Updated',
          message: `[${data.task?.key || 'Task'}] moved to ${data.newStatus}`,
          time: 'Just now',
          read: false,
        },
        ...prev,
      ]);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [isAuthenticated, activeOrg?._id]);

  const joinChannel = (channel) => {
    if (socket && activeOrg?._id) {
      socket.emit('join:channel', { orgId: activeOrg._id, channel });
    }
  };

  const leaveChannel = (channel) => {
    if (socket && activeOrg?._id) {
      socket.emit('leave:channel', { orgId: activeOrg._id, channel });
    }
  };

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        notifications,
        markAllRead,
        joinChannel,
        leaveChannel,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
