import { useState, useEffect, useRef, useCallback } from 'react';
import { Collaborator, NewspaperProject, VersionSnapshot } from '../types';

const COLLABORATOR_COLORS = [
  '#ef4444', // Red
  '#3b82f6', // Blue
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#8b5cf6', // Purple
  '#ec4899', // Pink
  '#14b8a6', // Teal
  '#f97316'  // Orange
];

const COLLABORATOR_NAMES = [
  'Editor Jefe',
  'Maquetador Gráfico',
  'Redactor de Portada',
  'Corrector de Estilo',
  'Director de Arte',
  'Corresponsal Gráfico'
];

export function useCollaboration(
  roomId: string,
  initialProject: NewspaperProject,
  onRemoteUpdate: (project: NewspaperProject) => void,
  onVersionRestored: (project: NewspaperProject, author?: string) => void
) {
  const [connected, setConnected] = useState(false);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [versions, setVersions] = useState<VersionSnapshot[]>([]);

  // Current user info stored locally
  const [currentUser, setCurrentUser] = useState<Collaborator>(() => {
    const saved = localStorage.getItem('prensastudio_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    const randomColor = COLLABORATOR_COLORS[Math.floor(Math.random() * COLLABORATOR_COLORS.length)];
    const randomName = COLLABORATOR_NAMES[Math.floor(Math.random() * COLLABORATOR_NAMES.length)];
    const user: Collaborator = {
      id: 'user-' + Math.random().toString(36).substring(2, 9),
      name: randomName,
      color: randomColor,
      lastSeen: Date.now()
    };
    localStorage.setItem('prensastudio_user', JSON.stringify(user));
    return user;
  });

  const wsRef = useRef<WebSocket | null>(null);
  const channelRef = useRef<BroadcastChannel | null>(null);
  const lastCursorSentRef = useRef<number>(0);
  const isSelfEmittingRef = useRef<boolean>(false);

  // Initialize BroadcastChannel for immediate multi-tab sync
  useEffect(() => {
    try {
      const channel = new BroadcastChannel(`prensastudio_${roomId}`);
      channelRef.current = channel;

      channel.onmessage = (event) => {
        const msg = event.data;
        if (!msg || msg.senderId === currentUser.id) return;

        if (msg.type === 'document:update' && msg.project) {
          onRemoteUpdate(msg.project);
        } else if (msg.type === 'cursor:move') {
          setCollaborators(prev => {
            const index = prev.findIndex(c => c.id === msg.userId);
            if (index >= 0) {
              const updated = [...prev];
              updated[index] = { ...updated[index], cursor: msg.cursor, lastSeen: Date.now() };
              return updated;
            } else {
              return [...prev, {
                id: msg.userId,
                name: msg.userName || 'Colega',
                color: msg.userColor || '#3b82f6',
                cursor: msg.cursor,
                lastSeen: Date.now()
              }];
            }
          });
        } else if (msg.type === 'version:saved') {
          setVersions(prev => [msg.version, ...prev.filter(v => v.id !== msg.version.id)]);
        } else if (msg.type === 'version:restored') {
          onVersionRestored(msg.project, msg.restoredBy);
        }
      };
    } catch (e) {
      console.warn('BroadcastChannel not supported in this environment');
    }

    return () => {
      channelRef.current?.close();
    };
  }, [roomId, currentUser.id, onRemoteUpdate, onVersionRestored]);

  // Connect WebSocket
  useEffect(() => {
    let reconnectTimer: any;
    let isCancelled = false;

    function connect() {
      if (isCancelled) return;
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = window.location.host || 'localhost:3000';
      const wsUrl = `${protocol}//${host}`;

      try {
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          setConnected(true);
          // Join room
          ws.send(JSON.stringify({
            type: 'room:join',
            roomId,
            user: currentUser,
            initialProject
          }));
        };

        ws.onmessage = (e) => {
          try {
            const data = JSON.parse(e.data);
            switch (data.type) {
              case 'room:init':
                if (data.collaborators) {
                  setCollaborators(data.collaborators);
                }
                if (data.versions) {
                  setVersions(data.versions);
                }
                if (data.project) {
                  onRemoteUpdate(data.project);
                }
                break;

              case 'user:joined':
                if (data.user && data.user.id !== currentUser.id) {
                  setCollaborators(prev => {
                    const exists = prev.some(c => c.id === data.user.id);
                    if (exists) return prev;
                    return [...prev, data.user];
                  });
                }
                break;

              case 'user:left':
                setCollaborators(prev => prev.filter(c => c.id !== data.userId));
                break;

              case 'document:updated':
                if (data.senderId !== currentUser.id && data.project) {
                  onRemoteUpdate(data.project);
                }
                break;

              case 'cursor:moved':
                if (data.userId !== currentUser.id) {
                  setCollaborators(prev => {
                    return prev.map(c => {
                      if (c.id === data.userId) {
                        return { ...c, cursor: data.cursor, lastSeen: Date.now() };
                      }
                      return c;
                    });
                  });
                }
                break;

              case 'element:selected':
                if (data.userId !== currentUser.id) {
                  setCollaborators(prev => {
                    return prev.map(c => {
                      if (c.id === data.userId) {
                        return { ...c, activeElementId: data.elementId };
                      }
                      return c;
                    });
                  });
                }
                break;

              case 'version:saved':
                if (data.versions) {
                  setVersions(data.versions);
                } else if (data.version) {
                  setVersions(prev => [data.version, ...prev]);
                }
                break;

              case 'version:restored':
                if (data.project) {
                  onVersionRestored(data.project, data.restoredBy);
                }
                break;

              default:
                break;
            }
          } catch (err) {
            console.error('Error processing websocket message:', err);
          }
        };

        ws.onclose = () => {
          setConnected(false);
          if (!isCancelled) {
            reconnectTimer = setTimeout(connect, 3000);
          }
        };

        ws.onerror = () => {
          // Handled in onclose
        };
      } catch (err) {
        setConnected(false);
        if (!isCancelled) {
          reconnectTimer = setTimeout(connect, 4000);
        }
      }
    }

    connect();

    return () => {
      isCancelled = true;
      clearTimeout(reconnectTimer);
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [roomId]);

  // Clean inactive collaborators
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setCollaborators(prev => prev.filter(c => now - c.lastSeen < 60000));
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const sendDocumentUpdate = useCallback((project: NewspaperProject) => {
    isSelfEmittingRef.current = true;
    
    // Broadcast via BroadcastChannel
    try {
      channelRef.current?.postMessage({
        type: 'document:update',
        senderId: currentUser.id,
        project
      });
    } catch (e) {
      // ignore
    }

    // Broadcast via WebSocket
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'document:update',
        senderId: currentUser.id,
        project
      }));
    }
  }, [currentUser.id]);

  const sendCursorMove = useCallback((x: number, y: number) => {
    const now = Date.now();
    if (now - lastCursorSentRef.current < 40) return; // 25fps throttle
    lastCursorSentRef.current = now;

    const cursor = { x: Math.round(x), y: Math.round(y) };

    try {
      channelRef.current?.postMessage({
        type: 'cursor:move',
        senderId: currentUser.id,
        userId: currentUser.id,
        userName: currentUser.name,
        userColor: currentUser.color,
        cursor
      });
    } catch (e) {
      // ignore
    }

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'cursor:move',
        cursor
      }));
    }
  }, [currentUser]);

  const sendElementSelect = useCallback((elementId: string | null) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'element:select',
        elementId
      }));
    }
  }, []);

  const saveVersion = useCallback((name: string, description: string, currentProject: NewspaperProject) => {
    const newVersion: VersionSnapshot = {
      id: 'ver-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      name: name || `Versión ${versions.length + 1}`,
      timestamp: Date.now(),
      author: currentUser.name,
      description: description || 'Instantánea de maquetación',
      elementCount: currentProject.elements.length,
      projectData: JSON.parse(JSON.stringify(currentProject))
    };

    setVersions(prev => [newVersion, ...prev]);

    // Send to WebSocket
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'version:save',
        name,
        description,
        author: currentUser.name,
        project: currentProject
      }));
    }

    // BroadcastChannel
    try {
      channelRef.current?.postMessage({
        type: 'version:saved',
        senderId: currentUser.id,
        version: newVersion
      });
    } catch (e) {
      // ignore
    }

    return newVersion;
  }, [currentUser.name, versions.length]);

  const restoreVersion = useCallback((versionId: string) => {
    const target = versions.find(v => v.id === versionId);
    if (!target) return;

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'version:restore',
        versionId,
        author: currentUser.name
      }));
    }

    try {
      channelRef.current?.postMessage({
        type: 'version:restored',
        senderId: currentUser.id,
        project: target.projectData,
        restoredBy: currentUser.name
      });
    } catch (e) {
      // ignore
    }

    onVersionRestored(target.projectData, currentUser.name);
  }, [versions, currentUser.name, onVersionRestored]);

  const updateCurrentUser = useCallback((updates: Partial<Collaborator>) => {
    setCurrentUser(prev => {
      const updated = { ...prev, ...updates };
      localStorage.setItem('prensastudio_user', JSON.stringify(updated));
      return updated;
    });
  }, []);

  return {
    connected,
    collaborators,
    currentUser,
    versions,
    updateCurrentUser,
    sendDocumentUpdate,
    sendCursorMove,
    sendElementSelect,
    saveVersion,
    restoreVersion
  };
}
