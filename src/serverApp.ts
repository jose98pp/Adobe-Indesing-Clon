import express from 'express';
import { WebSocket } from 'ws';

export interface CollaboratorSession {
  id: string;
  name: string;
  color: string;
  cursor?: { x: number; y: number };
  activeElementId?: string | null;
  lastSeen: number;
}

export interface RoomData {
  project: any;
  versions: any[];
  clients: Map<WebSocket, CollaboratorSession>;
}

// In-memory room store for real-time collaboration
export const rooms = new Map<string, RoomData>();

export function getOrCreateRoom(roomId: string, initialProject?: any): RoomData {
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

// In-memory editions store (Latitud 18 Editorial CMS)
export const editionsStore = new Map<string, any>();

// Broadcast helper for WebSocket clients
export function broadcastToRoom(room: RoomData, senderWs: WebSocket | null, payload: any) {
  const message = JSON.stringify(payload);
  for (const [clientWs] of room.clients.entries()) {
    if (clientWs !== senderWs && clientWs.readyState === 1) { // 1 = WebSocket.OPEN
      try {
        clientWs.send(message);
      } catch (err) {
        console.error('Error broadcasting to client:', err);
      }
    }
  }
}

export const app = express();

app.use(express.json({ limit: '10mb' }));

// Router with routes mounted on both /api and root (for Vercel path rewrites compatibility)
const router = express.Router();

router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: Date.now(),
    activeRooms: rooms.size,
    platform: process.env.VERCEL ? 'vercel' : 'node'
  });
});

router.get('/rooms/:roomId/versions', (req, res) => {
  const room = rooms.get(req.params.roomId);
  res.json({ versions: room ? room.versions : [] });
});

router.post('/rooms/:roomId/versions', (req, res) => {
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
  if (room.versions.length > 50) {
    room.versions.pop();
  }

  broadcastToRoom(room, null, {
    type: 'version:saved',
    version: newVersion,
    versions: room.versions
  });

  res.json({ success: true, version: newVersion });
});

router.get('/editions', (req, res) => {
  const list = Array.from(editionsStore.values());
  res.json({ success: true, editions: list });
});

router.post('/editions', (req, res) => {
  const { id, title, design, status, assignedReviewer, scheduledAt, domain } = req.body;
  const editionId = id || 'ed-' + Date.now();
  const edition = {
    id: editionId,
    title: title || 'Edición Digital Latitud 18',
    status: status || 'draft',
    domain: domain || 'latitud18.ultimahora-tv.com',
    assignedReviewer: assignedReviewer || 'Editor en Jefe',
    scheduledAt: scheduledAt || null,
    publishedAt: null,
    publishedUrl: null,
    design: design || {},
    updatedAt: Date.now(),
    history: [
      {
        id: 'hist-' + Date.now(),
        fromStatus: null,
        toStatus: status || 'draft',
        user: req.body.user || 'Periodista',
        timestamp: Date.now(),
        comment: 'Creación de borrador de edición'
      }
    ]
  };
  editionsStore.set(editionId, edition);
  res.json({ success: true, edition });
});

router.put('/editions/:id/status', (req, res) => {
  const { id } = req.params;
  const { status, user, comment, scheduledAt } = req.body;

  let edition = editionsStore.get(id);
  if (!edition) {
    edition = {
      id,
      title: req.body.title || 'Edición Digital',
      status: 'draft',
      domain: 'latitud18.ultimahora-tv.com',
      history: []
    };
  }

  const previousStatus = edition.status;
  edition.status = status;
  edition.updatedAt = Date.now();
  if (scheduledAt) {
    edition.scheduledAt = scheduledAt;
  }
  if (status === 'published') {
    edition.publishedAt = Date.now();
    const slug = (edition.title || 'edicion-especial').toLowerCase().replace(/[^a-z0-9]+/g, '-');
    edition.publishedUrl = `https://latitud18.ultimahora-tv.com/edicion-digital/${slug}-${Date.now().toString().slice(-4)}`;
  }

  edition.history = edition.history || [];
  edition.history.unshift({
    id: 'hist-' + Date.now(),
    fromStatus: previousStatus,
    toStatus: status,
    user: user || 'Redacción Latitud 18',
    timestamp: Date.now(),
    comment: comment || `Cambio de estado editorial a ${status}`
  });

  editionsStore.set(id, edition);

  for (const room of rooms.values()) {
    broadcastToRoom(room, null, {
      type: 'editorial:status_changed',
      editionId: id,
      status: edition.status,
      publishedUrl: edition.publishedUrl,
      scheduledAt: edition.scheduledAt,
      history: edition.history
    });
  }

  res.json({ success: true, edition });
});

router.post('/editions/:id/publish', (req, res) => {
  const { id } = req.params;
  const { user, title, projectData } = req.body;

  let edition = editionsStore.get(id) || { id, history: [] };
  const previousStatus = edition.status;
  edition.status = 'published';
  edition.publishedAt = Date.now();
  edition.title = title || edition.title || 'Edición Digital Latitud 18';

  const slug = edition.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  edition.publishedUrl = `https://latitud18.ultimahora-tv.com/edicion-digital/${slug}-${Date.now().toString().slice(-4)}`;

  edition.history = edition.history || [];
  edition.history.unshift({
    id: 'hist-' + Date.now(),
    fromStatus: previousStatus,
    toStatus: 'published',
    user: user || 'Director Editorial',
    timestamp: Date.now(),
    comment: 'Publicación automática aprobada y desplegada en latitud18.ultimahora-tv.com'
  });

  editionsStore.set(id, edition);

  for (const room of rooms.values()) {
    if (room.project) {
      room.project.status = 'published';
      room.project.publishedUrl = edition.publishedUrl;
      room.project.publishedAt = edition.publishedAt;
    }
    broadcastToRoom(room, null, {
      type: 'editorial:published',
      editionId: id,
      publishedUrl: edition.publishedUrl,
      publishedAt: edition.publishedAt,
      title: edition.title,
      user
    });
  }

  res.json({
    success: true,
    message: 'Edición publicada con éxito en latitud18.ultimahora-tv.com',
    publishedUrl: edition.publishedUrl,
    edition
  });
});

router.post('/templates/import', (req, res) => {
  const { templatePackage } = req.body;
  if (!templatePackage || !templatePackage.project) {
    return res.status(400).json({ error: 'Formato de plantilla .latitud-template inválido.' });
  }

  res.json({
    success: true,
    message: 'Plantilla Latitud 18 importada correctamente en el CMS',
    project: templatePackage.project
  });
});

// Mount on both /api and /
app.use('/api', router);
app.use('/', router);

export default app;
