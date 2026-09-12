import React, { useState, useCallback, useEffect, useRef } from 'react';
import { NewspaperProject, NewspaperElement } from './types';
import { TEMPLATES } from './data/templates';
import { useCollaboration } from './hooks/useCollaboration';
import { Header } from './components/Header';
import { ToolboxSidebar } from './components/ToolboxSidebar';
import { PropertiesSidebar } from './components/PropertiesSidebar';
import { Canvas } from './components/Canvas';
import { VersionHistoryModal } from './components/VersionHistoryModal';
import { TemplatesModal } from './components/TemplatesModal';
import { PdfExportModal } from './components/PdfExportModal';
import { Bell, CheckCircle2 } from 'lucide-react';

export default function App() {
  // Current editorial project
  const [project, setProject] = useState<NewspaperProject>(() => {
    return JSON.parse(JSON.stringify(TEMPLATES[0].project));
  });

  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [zoom, setZoom] = useState<number>(0.8);
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [showRulers, setShowRulers] = useState<boolean>(true);
  const [showBleed, setShowBleed] = useState<boolean>(true);
  const [snapToGrid, setSnapToGrid] = useState<boolean>(true);

  // Undo / Redo history
  const [historyPast, setHistoryPast] = useState<NewspaperProject[]>([]);
  const [historyFuture, setHistoryFuture] = useState<NewspaperProject[]>([]);

  // Modals
  const [isVersionsOpen, setIsVersionsOpen] = useState(false);
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
  const [isPdfExportOpen, setIsPdfExportOpen] = useState(false);

  // Notification toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 4000);
  }, []);

  // Remote updates handler
  const handleRemoteUpdate = useCallback((remoteProject: NewspaperProject) => {
    setProject(remoteProject);
  }, []);

  const handleVersionRestored = useCallback((restoredProject: NewspaperProject, author?: string) => {
    setProject(restoredProject);
    showToast(`Versión restaurada con éxito ${author ? `por ${author}` : ''}`);
  }, [showToast]);

  // Real-time collaboration hook
  const {
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
  } = useCollaboration(
    'redaccion-central',
    project,
    handleRemoteUpdate,
    handleVersionRestored
  );

  // Push to local undo history & broadcast to network
  const commitProjectChange = useCallback((newProject: NewspaperProject) => {
    setHistoryPast((prev) => [JSON.parse(JSON.stringify(project)), ...prev.slice(0, 20)]);
    setHistoryFuture([]);
    setProject(newProject);
    sendDocumentUpdate(newProject);
  }, [project, sendDocumentUpdate]);

  // Undo / Redo
  const handleUndo = useCallback(() => {
    if (historyPast.length === 0) return;
    const previous = historyPast[0];
    const newPast = historyPast.slice(1);
    setHistoryFuture((prev) => [JSON.parse(JSON.stringify(project)), ...prev]);
    setHistoryPast(newPast);
    setProject(previous);
    sendDocumentUpdate(previous);
  }, [historyPast, project, sendDocumentUpdate]);

  const handleRedo = useCallback(() => {
    if (historyFuture.length === 0) return;
    const next = historyFuture[0];
    const newFuture = historyFuture.slice(1);
    setHistoryPast((prev) => [JSON.parse(JSON.stringify(project)), ...prev]);
    setHistoryFuture(newFuture);
    setProject(next);
    sendDocumentUpdate(next);
  }, [historyFuture, project, sendDocumentUpdate]);

  // Element Actions
  const handleSelectElement = useCallback((id: string | null) => {
    setSelectedElementId(id);
    sendElementSelect(id);
  }, [sendElementSelect]);

  const handleAddElement = useCallback((newElement: NewspaperElement) => {
    const updatedProject: NewspaperProject = {
      ...project,
      elements: [...project.elements, newElement]
    };
    commitProjectChange(updatedProject);
    setSelectedElementId(newElement.id);
  }, [project, commitProjectChange]);

  const handleUpdateElement = useCallback((updatedElement: NewspaperElement) => {
    const updatedProject: NewspaperProject = {
      ...project,
      elements: project.elements.map((el) => (el.id === updatedElement.id ? updatedElement : el))
    };
    // Direct update without bloating undo history on every drag tick, but broadcast debounced
    setProject(updatedProject);
    sendDocumentUpdate(updatedProject);
  }, [project, sendDocumentUpdate]);

  const handleDeleteElement = useCallback((id: string) => {
    const updatedProject: NewspaperProject = {
      ...project,
      elements: project.elements.filter((el) => el.id !== id)
    };
    commitProjectChange(updatedProject);
    if (selectedElementId === id) {
      setSelectedElementId(null);
    }
  }, [project, selectedElementId, commitProjectChange]);

  const handleDuplicateElement = useCallback((element: NewspaperElement) => {
    const maxZ = project.elements.reduce((max, el) => Math.max(max, el.zIndex), 0);
    const clone: NewspaperElement = {
      ...JSON.parse(JSON.stringify(element)),
      id: `el-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      x: Math.min(project.width - element.width, element.x + 24),
      y: Math.min(project.height - element.height, element.y + 24),
      zIndex: maxZ + 1
    };
    const updatedProject: NewspaperProject = {
      ...project,
      elements: [...project.elements, clone]
    };
    commitProjectChange(updatedProject);
    setSelectedElementId(clone.id);
  }, [project, commitProjectChange]);

  const handleBringToFront = useCallback((id: string) => {
    const maxZ = project.elements.reduce((max, el) => Math.max(max, el.zIndex), 0);
    const updatedProject: NewspaperProject = {
      ...project,
      elements: project.elements.map((el) => (el.id === id ? { ...el, zIndex: maxZ + 1 } : el))
    };
    commitProjectChange(updatedProject);
  }, [project, commitProjectChange]);

  const handleSendToBack = useCallback((id: string) => {
    const minZ = project.elements.reduce((min, el) => Math.min(min, el.zIndex), 0);
    const updatedProject: NewspaperProject = {
      ...project,
      elements: project.elements.map((el) => (el.id === id ? { ...el, zIndex: Math.max(1, minZ - 1) } : el))
    };
    commitProjectChange(updatedProject);
  }, [project, commitProjectChange]);

  const handleReorderElement = useCallback((id: string, direction: 'up' | 'down') => {
    const index = project.elements.findIndex((el) => el.id === id);
    if (index < 0) return;

    const newElements = [...project.elements];
    if (direction === 'up' && index < newElements.length - 1) {
      const temp = newElements[index];
      newElements[index] = newElements[index + 1];
      newElements[index + 1] = temp;
    } else if (direction === 'down' && index > 0) {
      const temp = newElements[index];
      newElements[index] = newElements[index - 1];
      newElements[index - 1] = temp;
    }

    // Re-assign z-indices
    const reindexed = newElements.map((el, i) => ({ ...el, zIndex: i + 1 }));
    const updatedProject: NewspaperProject = {
      ...project,
      elements: reindexed
    };
    commitProjectChange(updatedProject);
  }, [project, commitProjectChange]);

  const handleUpdateProject = useCallback((updates: Partial<NewspaperProject>) => {
    const updated: NewspaperProject = {
      ...project,
      ...updates
    };
    commitProjectChange(updated);
  }, [project, commitProjectChange]);

  // Load preset or custom template
  const handleLoadTemplate = useCallback((templateProject: NewspaperProject) => {
    const cloned = JSON.parse(JSON.stringify(templateProject));
    commitProjectChange(cloned);
    setSelectedElementId(null);
    showToast(`Maqueta "${cloned.title}" cargada en el pliego.`);
  }, [commitProjectChange, showToast]);

  const handleSaveVersion = useCallback((name: string, description: string) => {
    saveVersion(name, description, project);
    showToast(`Instantánea "${name}" guardada en el historial.`);
  }, [saveVersion, project, showToast]);

  // Global keyboard shortcuts (Ctrl+Z, Ctrl+Y, Ctrl+S)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        handleRedo();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        setIsVersionsOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo]);

  const selectedElement = project.elements.find((el) => el.id === selectedElementId) || null;

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#18181b] text-neutral-100 font-sans">
      {/* Top Application Header */}
      <Header
        project={project}
        onUpdateProjectTitle={(title) => handleUpdateProject({ title })}
        collaborators={collaborators}
        currentUser={currentUser}
        onUpdateCurrentUser={updateCurrentUser}
        connected={connected}
        canUndo={historyPast.length > 0}
        canRedo={historyFuture.length > 0}
        onUndo={handleUndo}
        onRedo={handleRedo}
        zoom={zoom}
        onZoomChange={setZoom}
        showGrid={showGrid}
        onToggleGrid={() => setShowGrid(!showGrid)}
        showRulers={showRulers}
        onToggleRulers={() => setShowRulers(!showRulers)}
        showBleed={showBleed}
        onToggleBleed={() => setShowBleed(!showBleed)}
        snapToGrid={snapToGrid}
        onToggleSnap={() => setSnapToGrid(!snapToGrid)}
        versionsCount={versions.length}
        onOpenVersions={() => setIsVersionsOpen(true)}
        onOpenTemplates={() => setIsTemplatesOpen(true)}
        onOpenPdfExport={() => setIsPdfExportOpen(true)}
      />

      {/* Main Workspace: Left Palette + Canvas + Right Inspector */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Left Toolbox */}
        <ToolboxSidebar
          project={project}
          onAddElement={handleAddElement}
          selectedElementId={selectedElementId}
          onSelectElement={handleSelectElement}
          onUpdateProject={handleUpdateProject}
          onDeleteElement={handleDeleteElement}
          onReorderElement={handleReorderElement}
        />

        {/* Center Artboard Canvas */}
        <Canvas
          project={project}
          selectedElementId={selectedElementId}
          onSelectElement={handleSelectElement}
          onUpdateElement={handleUpdateElement}
          onDeleteElement={handleDeleteElement}
          zoom={zoom}
          showGrid={showGrid}
          showRulers={showRulers}
          showBleed={showBleed}
          snapToGrid={snapToGrid}
          collaborators={collaborators}
          onCursorMove={sendCursorMove}
        />

        {/* Right Properties & Typography Inspector */}
        <PropertiesSidebar
          selectedElement={selectedElement}
          onUpdateElement={handleUpdateElement}
          onDeleteElement={handleDeleteElement}
          onDuplicateElement={handleDuplicateElement}
          onBringToFront={handleBringToFront}
          onSendToBack={handleSendToBack}
          project={project}
        />
      </div>

      {/* Real-time Notification Toast */}
      {toastMessage && (
        <div className="fixed bottom-4 right-84 bg-[#242429] text-white border border-[#3f3f4c] shadow-2xl rounded-lg px-4 py-2.5 flex items-center gap-2.5 text-xs z-50 animate-in slide-in-from-bottom-2 duration-150">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Modals */}
      <VersionHistoryModal
        isOpen={isVersionsOpen}
        onClose={() => setIsVersionsOpen(false)}
        versions={versions}
        currentProject={project}
        onSaveVersion={handleSaveVersion}
        onRestoreVersion={restoreVersion}
      />

      <TemplatesModal
        isOpen={isTemplatesOpen}
        onClose={() => setIsTemplatesOpen(false)}
        currentProject={project}
        onLoadTemplate={handleLoadTemplate}
        onImportCustomTemplate={handleLoadTemplate}
      />

      <PdfExportModal
        isOpen={isPdfExportOpen}
        onClose={() => setIsPdfExportOpen(false)}
        project={project}
      />
    </div>
  );
}
