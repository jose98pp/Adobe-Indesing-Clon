import express from 'express';
import http from 'http';
import path from 'path';
import { WebSocketServer, WebSocket } from 'ws';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

interface CollaboratorSession {
  id: string;
  name: string;
  color: string;
  cursor?: { x: number; y: number };
  activeElementId?: string | null;
  lastSeen: number;
}

interface RoomData {
  project: any;
  versions: any[];
  clients: Map<WebSocket, CollaboratorSession>;
}

// In-memory room store for real-time collaboration
const rooms = new Map<string, RoomData>();

function getOrCreateRoom(roomId: string, initialProject?: any): RoomData {
  let room = rooms.get(roomId);
  if (!room) {
    room = {
      project: initialProject || null,
      versions: [],
      clients: new Map()
    };
    rooms.set(roomId, room);
  }
  return room;
}

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: Date.now(), 
    activeRooms: rooms.size 
  });
});

app.get('/api/rooms/:roomId/versions', (req, res) => {
  const room = rooms.get(req.params.roomId);
  res.json({ versions: room ? room.versions : [] });
});

app.post('/api/rooms/:roomId/versions', (req, res) => {
  const { roomId } = req.params;
  const { name, author, description, projectData } = req.body;
  const room = getOrCreateRoom(roomId, projectData);

  const newVersion = {
    id: 'ver-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
    name: name || `Versión ${room.versions.length + 1}`,
    timestamp: Date.now(),
    author: author || 'Redactor',
    description: description || 'Instantánea de maquetación',
    elementCount: projectData?.elements?.length || 0,
    projectData: projectData || room.project
  };

  room.versions.unshift(newVersion);
  // Keep max 50 versions
  if (room.versions.length > 50) {
    room.versions.pop();
  }

  // Broadcast to room
  broadcastToRoom(room, null, {
    type: 'version:saved',
    version: newVersion,
    versions: room.versions
  });

  res.json({ success: true, version: newVersion });
});

// Broadcast helper
function broadcastToRoom(room: RoomData, senderWs: WebSocket | null, payload: any) {
  const message = JSON.stringify(payload);
  for (const [clientWs] of room.clients.entries()) {
    if (clientWs !== senderWs && clientWs.readyState === WebSocket.OPEN) {
      try {
        clientWs.send(message);
      } catch (err) {
        console.error('Error broadcasting to client:', err);
      }
    }
  }
}

async function startServer() {
  const server = http.createServer(app);
  const wss = new WebSocketServer({ server });

  wss.on('connection', (ws: WebSocket) => {
    let currentRoomId = 'default-edition';
    let currentRoom = getOrCreateRoom(currentRoomId);

    ws.on('message', (data: string) => {
      try {
        const msg = JSON.parse(data.toString());

        switch (msg.type) {
          case 'room:join': {
            currentRoomId = msg.roomId || 'default-edition';
            currentRoom = getOrCreateRoom(currentRoomId, msg.initialProject);
            
            const session: CollaboratorSession = {
              id: msg.user.id,
              name: msg.user.name,
              color: msg.user.color,
              cursor: undefined,
              activeElementId: null,
              lastSeen: Date.now()
            };
            
            currentRoom.clients.set(ws, session);

            // Send init state to the newly joined client
            const collaborators = Array.from(currentRoom.clients.values()).filter(c => c.id !== session.id);
            ws.send(JSON.stringify({
              type: 'room:init',
              project: currentRoom.project,
              versions: currentRoom.versions,
              collaborators
            }));

            // Notify others
            broadcastToRoom(currentRoom, ws, {
              type: 'user:joined',
              user: session
            });
            break;
          }

          case 'document:update': {
            if (msg.project) {
              currentRoom.project = msg.project;
              broadcastToRoom(currentRoom, ws, {
                type: 'document:updated',
                project: msg.project,
                senderId: msg.senderId
              });
            }
            break;
          }

          case 'cursor:move': {
            const session = currentRoom.clients.get(ws);
            if (session) {
              session.cursor = msg.cursor;
              session.lastSeen = Date.now();
              broadcastToRoom(currentRoom, ws, {
                type: 'cursor:moved',
                userId: session.id,
                cursor: msg.cursor
              });
            }
            break;
          }

          case 'element:select': {
            const session = currentRoom.clients.get(ws);
            if (session) {
              session.activeElementId = msg.elementId;
              broadcastToRoom(currentRoom, ws, {
                type: 'element:selected',
                userId: session.id,
                elementId: msg.elementId
              });
            }
            break;
          }

          case 'version:save': {
            const newVersion = {
              id: 'ver-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
              name: msg.name || `Versión ${currentRoom.versions.length + 1}`,
              timestamp: Date.now(),
              author: msg.author || 'Colaborador',
              description: msg.description || 'Punto de control editorial',
              elementCount: msg.project?.elements?.length || currentRoom.project?.elements?.length || 0,
              projectData: msg.project || currentRoom.project
            };

            currentRoom.versions.unshift(newVersion);
            if (currentRoom.versions.length > 50) currentRoom.versions.pop();

            // Broadcast version list to everyone including sender
            const broadcastMsg = JSON.stringify({
              type: 'version:saved',
              version: newVersion,
              versions: currentRoom.versions
            });

            for (const [clientWs] of currentRoom.clients.entries()) {
              if (clientWs.readyState === WebSocket.OPEN) {
                clientWs.send(broadcastMsg);
              }
            }
            break;
          }

          case 'version:restore': {
            const targetVersion = currentRoom.versions.find(v => v.id === msg.versionId);
            if (targetVersion && targetVersion.projectData) {
              currentRoom.project = targetVersion.projectData;
              
              const restoreMsg = JSON.stringify({
                type: 'version:restored',
                project: targetVersion.projectData,
                version: targetVersion,
                restoredBy: msg.author
              });

              for (const [clientWs] of currentRoom.clients.entries()) {
                if (clientWs.readyState === WebSocket.OPEN) {
                  clientWs.send(restoreMsg);
                }
              }
            }
            break;
          }

          default:
            break;
        }
      } catch (err) {
        console.error('Error handling websocket message:', err);
      }
    });

    ws.on('close', () => {
      const session = currentRoom.clients.get(ws);
      if (session) {
        currentRoom.clients.delete(ws);
        broadcastToRoom(currentRoom, null, {
          type: 'user:left',
          userId: session.id
        });
      }
    });
  });

  // Vite Middleware integration
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`PrensaStudio editorial server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
