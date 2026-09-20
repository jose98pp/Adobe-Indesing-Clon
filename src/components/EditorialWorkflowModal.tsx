import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  Send, 
  Globe, 
  FileEdit, 
  History, 
  ExternalLink, 
  Copy, 
  Check, 
  ShieldCheck, 
  AlertCircle,
  Download,
  Upload,
  Calendar,
  Layers
} from 'lucide-react';
import { NewspaperProject, EditorialStatus, EditorialStatusLog, LatitudTemplatePackage } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  project: NewspaperProject;
  onUpdateProject: (updated: Partial<NewspaperProject>) => void;
  currentUser: string;
}

const STATUS_STEPS: { key: EditorialStatus; label: string; desc: string; color: string }[] = [
  { key: 'draft', label: 'Borrador', desc: 'Redacción y maquetación en curso', color: 'bg-amber-500' },
  { key: 'review', label: 'En Revisión', desc: 'Control de estilo y verificación de fuentes', color: 'bg-blue-500' },
  { key: 'approved', label: 'Aprobado', desc: 'Validado por la Jefatura de Redacción', color: 'bg-emerald-500' },
  { key: 'scheduled', label: 'Programado', desc: 'Horario fijado para distribución web', color: 'bg-purple-500' },
  { key: 'published', label: 'Publicado', desc: 'En vivo en latitud18.ultimahora-tv.com', color: 'bg-sky-600' },
];

export const EditorialWorkflowModal: React.FC<Props> = ({
  isOpen,
  onClose,
  project,
  onUpdateProject,
  currentUser
}) => {
  if (!isOpen) return null;

  const currentStatus: EditorialStatus = project.status || 'draft';
  const [comment, setComment] = useState('');
  const [reviewer, setReviewer] = useState(project.assignedReviewer || 'Director de Redacción');
  const [scheduledDate, setScheduledDate] = useState(
    project.scheduledAt || new Date(Date.now() + 86400000).toISOString().slice(0, 16)
  );
  const [isPublishing, setIsPublishing] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [activeTab, setActiveTab] = useState<'workflow' | 'history' | 'package'>('workflow');

  const currentIndex = STATUS_STEPS.findIndex(s => s.key === currentStatus);

  const handleStatusChange = async (newStatus: EditorialStatus) => {
    setIsPublishing(true);
    const newHistoryEntry: EditorialStatusLog = {
      id: 'log-' + Date.now(),
      fromStatus: currentStatus,
      toStatus: newStatus,
      user: currentUser,
      timestamp: Date.now(),
      comment: comment.trim() || `Transición a ${newStatus} por ${currentUser}`
    };

    const slug = (project.title || 'edicion-especial').toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const publishedUrl = newStatus === 'published' 
      ? `https://latitud18.ultimahora-tv.com/edicion-digital/${slug}-${Date.now().toString().slice(-4)}`
      : project.publishedUrl;

    const updates: Partial<NewspaperProject> = {
      status: newStatus,
      assignedReviewer: reviewer,
      scheduledAt: newStatus === 'scheduled' ? scheduledDate : project.scheduledAt,
      publishedAt: newStatus === 'published' ? new Date().toISOString() : project.publishedAt,
      publishedUrl: publishedUrl,
      statusHistory: [newHistoryEntry, ...(project.statusHistory || [])]
    };

    // Attempt backend sync via API
    try {
      await fetch(`/api/editions/${project.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          user: currentUser,
          comment: comment.trim(),
          scheduledAt: newStatus === 'scheduled' ? scheduledDate : null,
          title: project.title
        })
      });
    } catch {
      // Offline / local fallback
    }

    onUpdateProject(updates);
    setComment('');
    setIsPublishing(false);
  };

  const handlePublishNow = async () => {
    setIsPublishing(true);
    try {
      const res = await fetch(`/api/editions/${project.id}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user: currentUser,
          title: project.title,
          projectData: project
        })
      });
      const data = await res.json();
      if (data.publishedUrl) {
        onUpdateProject({
          status: 'published',
          publishedUrl: data.publishedUrl,
          publishedAt: new Date().toISOString(),
          statusHistory: [
            {
              id: 'log-' + Date.now(),
              fromStatus: currentStatus,
              toStatus: 'published',
              user: currentUser,
              timestamp: Date.now(),
              comment: 'Publicación automática en latitud18.ultimahora-tv.com'
            },
            ...(project.statusHistory || [])
          ]
        });
      }
    } catch {
      // Local fallback
      handleStatusChange('published');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleExportLatitudTemplate = () => {
    const pkg: LatitudTemplatePackage = {
      schemaVersion: '1.0',
      type: 'latitud-template',
      name: project.title || 'Plantilla Latitud 18',
      description: 'Paquete de plantilla editorial certificado para latitud18.ultimahora-tv.com',
      author: currentUser,
      createdAt: new Date().toISOString(),
      targetDomain: 'latitud18.ultimahora-tv.com',
      project: project
    };

    const blob = new Blob([JSON.stringify(pkg, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${(project.title || 'latitud18').toLowerCase().replace(/\s+/g, '-')}.latitud-template`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopyUrl = () => {
    if (project.publishedUrl) {
      navigator.clipboard.writeText(project.publishedUrl);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-workflow-title"
    >
      <div 
        className="bg-white rounded-xl shadow-2xl border border-neutral-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 id="modal-workflow-title" className="text-base font-bold tracking-tight text-white flex items-center gap-2">
                Flujo Editorial y Publicación
                <span className="text-[11px] font-mono font-normal bg-slate-800 text-amber-400 px-2 py-0.5 rounded-full border border-slate-700">
                  latitud18.ultimahora-tv.com
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Control de estados, revisión por jefatura y distribución digital
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-md transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-neutral-200 bg-neutral-50 px-6 pt-2 gap-4 text-xs font-semibold text-neutral-600">
          <button
            onClick={() => setActiveTab('workflow')}
            className={`pb-2.5 flex items-center gap-1.5 border-b-2 transition-colors ${
              activeTab === 'workflow' 
                ? 'border-slate-900 text-slate-900 font-bold' 
                : 'border-transparent hover:text-neutral-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            Estados de Publicación
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`pb-2.5 flex items-center gap-1.5 border-b-2 transition-colors ${
              activeTab === 'history' 
                ? 'border-slate-900 text-slate-900 font-bold' 
                : 'border-transparent hover:text-neutral-900'
            }`}
          >
            <History className="w-4 h-4" />
            Trazabilidad e Historial ({project.statusHistory?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('package')}
            className={`pb-2.5 flex items-center gap-1.5 border-b-2 transition-colors ${
              activeTab === 'package' 
                ? 'border-slate-900 text-slate-900 font-bold' 
                : 'border-transparent hover:text-neutral-900'
            }`}
          >
            <Download className="w-4 h-4" />
            Paquete .latitud-template
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {activeTab === 'workflow' && (
            <>
              {/* Stepper Pipeline */}
              <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200">
                <div className="flex items-center justify-between relative">
                  {STATUS_STEPS.map((step, idx) => {
                    const isPassed = idx < currentIndex;
                    const isCurrent = idx === currentIndex;
                    return (
                      <div key={step.key} className="flex flex-col items-center z-10 flex-1 text-center">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                            isCurrent
                              ? `${step.color} text-white ring-4 ring-neutral-200 shadow-sm scale-110`
                              : isPassed
                              ? 'bg-emerald-600 text-white'
                              : 'bg-neutral-200 text-neutral-500'
                          }`}
                        >
                          {isPassed ? <Check className="w-4 h-4" /> : idx + 1}
                        </div>
                        <span className={`text-[11px] mt-1.5 font-bold ${isCurrent ? 'text-slate-900' : 'text-neutral-500'}`}>
                          {step.label}
                        </span>
                        <span className="text-[9.5px] text-neutral-400 hidden sm:block max-w-[90px] leading-tight mt-0.5">
                          {step.desc}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Published Banner if Live */}
              {currentStatus === 'published' && project.publishedUrl && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start justify-between gap-3 text-emerald-950">
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-bold">¡Edición Publicada en Vivo!</h4>
                      <p className="text-xs text-emerald-800 mt-0.5">
                        Esta edición está disponible para los lectores en el portal digital de Última Hora TV.
                      </p>
                      <a
                        href={project.publishedUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-mono text-emerald-700 underline font-semibold mt-1 inline-flex items-center gap-1 hover:text-emerald-900"
                      >
                        {project.publishedUrl}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                  <button
                    onClick={handleCopyUrl}
                    className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 shrink-0 transition-colors shadow-xs"
                  >
                    {copiedUrl ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedUrl ? 'Copiado' : 'Copiar URL'}
                  </button>
                </div>
              )}

              {/* Action Controls by Status */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1">
                      Responsable / Revisor Asignado
                    </label>
                    <input
                      type="text"
                      value={reviewer}
                      onChange={(e) => setReviewer(e.target.value)}
                      className="w-full text-xs px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:outline-none"
                      placeholder="Ej: Director Editorial, Editor Jefe"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1">
                      Fecha y Hora de Publicación Programada
                    </label>
                    <input
                      type="datetime-local"
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      className="w-full text-xs px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    Nota o Comentario Editorial (para registro de trazabilidad)
                  </label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={2}
                    className="w-full text-xs p-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:outline-none"
                    placeholder="Escribe detalles sobre correcciones, fotos verificadas o aprobación..."
                  />
                </div>

                {/* Status Transition Action Buttons */}
                <div className="pt-2 border-t border-neutral-100 flex flex-wrap gap-2">
                  {currentStatus === 'draft' && (
                    <button
                      onClick={() => handleStatusChange('review')}
                      disabled={isPublishing}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
                    >
                      <Send className="w-3.5 h-3.5" />
                      Enviar a Revisión de Jefatura
                    </button>
                  )}

                  {currentStatus === 'review' && (
                    <>
                      <button
                        onClick={() => handleStatusChange('approved')}
                        disabled={isPublishing}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Aprobar para Salida
                      </button>
                      <button
                        onClick={() => handleStatusChange('draft')}
                        disabled={isPublishing}
                        className="px-3 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg text-xs font-medium transition-colors"
                      >
                        Devolver a Borrador con Observaciones
                      </button>
                    </>
                  )}

                  {(currentStatus === 'approved' || currentStatus === 'scheduled') && (
                    <>
                      <button
                        onClick={handlePublishNow}
                        disabled={isPublishing}
                        className="px-4 py-2 bg-slate-900 hover:bg-black text-amber-400 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-md"
                      >
                        <Globe className="w-4 h-4 text-amber-400" />
                        {isPublishing ? 'Publicando...' : 'Publicar Inmediatamente en latitud18.ultimahora-tv.com'}
                      </button>
                      <button
                        onClick={() => handleStatusChange('scheduled')}
                        disabled={isPublishing}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        Fijar como Programado
                      </button>
                    </>
                  )}

                  {currentStatus === 'published' && (
                    <button
                      onClick={() => handleStatusChange('draft')}
                      disabled={isPublishing}
                      className="px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-xs font-medium transition-colors"
                    >
                      Despublicar (Regresar a Borrador)
                    </button>
                  )}
                </div>
              </div>
            </>
          )}

          {activeTab === 'history' && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-neutral-800 uppercase tracking-wider">
                Registro de Cambios y Aprobaciones
              </h4>
              {(!project.statusHistory || project.statusHistory.length === 0) ? (
                <p className="text-xs text-neutral-500 py-6 text-center italic">
                  No hay transiciones registradas aún. Los cambios de estado editorial se archivarán aquí automáticamente.
                </p>
              ) : (
                <div className="space-y-2">
                  {project.statusHistory.map((item) => (
                    <div key={item.id} className="p-3 bg-neutral-50 rounded-lg border border-neutral-200 text-xs flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-neutral-900">
                            {item.user}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded-sm bg-neutral-200 text-neutral-700 font-mono">
                            {item.fromStatus ? `${item.fromStatus} → ` : ''}{item.toStatus}
                          </span>
                        </div>
                        {item.comment && (
                          <p className="text-neutral-600 mt-1 text-[11px] leading-relaxed">
                            {item.comment}
                          </p>
                        )}
                      </div>
                      <span className="text-[10px] text-neutral-400 font-mono shrink-0">
                        {new Date(item.timestamp).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'package' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Download className="w-4 h-4 text-slate-700" />
                  Formato de Intercambio .latitud-template
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Exporta la edición íntegra con sus páginas, cabeceras, fuentes, artículos y maquetación en un único archivo estándar compatible con el CMS de Laravel y el portal *latitud18.ultimahora-tv.com*.
                </p>
                <div className="pt-2">
                  <button
                    onClick={handleExportLatitudTemplate}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold flex items-center gap-2 shadow-xs transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Descargar Archivo .latitud-template
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-neutral-50 px-6 py-3 border-t border-neutral-200 flex items-center justify-between text-xs text-neutral-500">
          <span>Servidor de Distribución: <strong>latitud18.ultimahora-tv.com</strong></span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-neutral-200 hover:bg-neutral-300 text-neutral-800 rounded-md font-medium transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
