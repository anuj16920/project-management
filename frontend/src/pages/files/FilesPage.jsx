import React, { useEffect, useState, useCallback } from 'react'
import {
  HardDrive, Star, FolderOpen, Image,
  FileText, Video, Search, Grid, List,
} from 'lucide-react'
import { filesAPI }       from '@/lib/filesAPI'
import FolderGrid         from './components/FolderGrid'
import FileGrid           from './components/FileGrid'
import FileList           from './components/FileList'
import UploadZone         from './components/UploadZone'
import StorageStats       from './components/StorageStats'
import CreateFolderModal  from './components/CreateFolderModal'
import FilePreviewModal   from './components/FilePreviewModal'
import { toast }           from 'sonner'

const SIDEBAR_ITEMS = [
  { id: 'all',     label: 'All Files',   icon: HardDrive },
  { id: 'starred', label: 'Starred',     icon: Star      },
  { id: 'image',   label: 'Images',      icon: Image     },
  { id: 'pdf',     label: 'PDFs',        icon: FileText  },
  { id: 'video',   label: 'Videos',      icon: Video     },
  { id: 'doc',     label: 'Documents',   icon: FileText  },
]

export default function FilesPage() {
  const [section,       setSection]       = useState('all')
  const [folders,       setFolders]       = useState([])
  const [files,         setFiles]         = useState([])
  const [stats,         setStats]         = useState(null)
  const [loading,       setLoading]       = useState(true)
  const [viewMode,      setViewMode]      = useState('grid')
  const [search,        setSearch]        = useState('')
  const [currentFolder, setCurrentFolder] = useState(null)  // { id, name }
  const [breadcrumbs,   setBreadcrumbs]   = useState([])
  const [showNewFolder, setShowNewFolder] = useState(false)
  const [previewFile,   setPreviewFile]   = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = {}
      if (section === 'starred') params.starred    = true
      else if (section !== 'all') params.type      = section
      if (currentFolder?.id)      params.folder_id = currentFolder.id
      if (search)                 params.search    = search

      const [f, fol, s] = await Promise.all([
        filesAPI.listFiles(params),
        section === 'all' ? filesAPI.listFolders(currentFolder?.id || null) : Promise.resolve({ data: { data: [] } }),
        filesAPI.stats(),
      ])
      setFiles(f.data.data   || [])
      setFolders(fol.data.data || [])
      setStats(s.data.data)
    } catch { toast.error('Failed to load files') }
    finally { setLoading(false) }
  }, [section, currentFolder, search])

  useEffect(() => { load() }, [load])

  const openFolder = (folder) => {
    setCurrentFolder(folder)
    setBreadcrumbs(prev => [...prev, folder])
  }

  const navigateBreadcrumb = (index) => {
    if (index === -1) {
      setCurrentFolder(null)
      setBreadcrumbs([])
    } else {
      const crumb = breadcrumbs[index]
      setCurrentFolder(crumb)
      setBreadcrumbs(prev => prev.slice(0, index + 1))
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this file permanently?')) return
    try { await filesAPI.deleteFile(id); toast.success('Deleted'); load() }
    catch { toast.error('Failed') }
  }

  const handleStar = async (id) => {
    try { await filesAPI.toggleStar(id); load() }
    catch { toast.error('Failed') }
  }

  const handleDownload = async (file) => {
    try {
      const r = await filesAPI.getDownloadUrl(file.id)
      const a = document.createElement('a')
      a.href     = r.data.data.url
      a.download = r.data.data.file_name
      a.click()
    } catch { toast.error('Failed to download') }
  }

  const handleFolderDelete = async (id) => {
    if (!confirm('Delete folder and all its files?')) return
    try { await filesAPI.deleteFolder(id); toast.success('Deleted'); load() }
    catch { toast.error('Failed') }
  }

  const fmt = (n) => {
    const k = 1024
    const sizes = ['B','KB','MB','GB']
    if (!n) return '0 B'
    const i = Math.floor(Math.log(n) / Math.log(k))
    return `${(n / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`
  }

  return (
    <div className="flex h-[calc(100vh-64px)] -m-6 overflow-hidden">

      {/* ── Left sidebar ── */}
      <div className="w-52 flex-shrink-0 border-r border-white/5 flex flex-col bg-[#13121a] p-3">
        <p className="text-text-f text-xs font-semibold uppercase tracking-wider px-2 mb-2">Browse</p>
        <nav className="space-y-0.5">
          {SIDEBAR_ITEMS.map(item => {
            const Icon = item.icon
            return (
              <button key={item.id} onClick={() => { setSection(item.id); setCurrentFolder(null); setBreadcrumbs([]) }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm
                  font-medium transition-all text-left
                  ${section === item.id
                    ? 'bg-accent/15 text-accent'
                    : 'text-text-m hover:text-text-p hover:bg-white/4'}`}>
                <Icon size={15} className="flex-shrink-0"/>
                {item.label}
              </button>
            )
          })}
        </nav>

        {/* Storage meter */}
        {stats && (
          <div className="mt-auto pt-4 border-t border-white/5 px-2">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-text-f text-xs">Storage</span>
              <span className="text-text-f text-xs">{stats.storage_used_percent}%</span>
            </div>
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-accent rounded-full transition-all"
                style={{ width: `${Math.min(stats.storage_used_percent, 100)}%` }}/>
            </div>
            <p className="text-text-f text-xs mt-1">
              {stats.total_size_formatted} / 10 GB
            </p>
          </div>
        )}
      </div>

      {/* ── Main area ── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Toolbar */}
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-white/5 flex-shrink-0">

          {/* Breadcrumbs */}
          <div className="flex items-center gap-1 flex-1 min-w-0">
            <button onClick={() => navigateBreadcrumb(-1)}
              className="text-text-m hover:text-text-p text-sm font-medium transition-all">
              Files
            </button>
            {breadcrumbs.map((crumb, i) => (
              <React.Fragment key={crumb.id}>
                <span className="text-text-f text-sm">/</span>
                <button onClick={() => navigateBreadcrumb(i)}
                  className="text-text-m hover:text-text-p text-sm font-medium transition-all truncate max-w-32">
                  {crumb.name}
                </button>
              </React.Fragment>
            ))}
          </div>

          {/* Search */}
          <div className="flex items-center gap-2 bg-surface border border-white/10 rounded-xl px-3 py-2 w-52">
            <Search size={13} className="text-text-f flex-shrink-0"/>
            <input placeholder="Search files..."
              value={search} onChange={e => setSearch(e.target.value)}
              className="bg-transparent text-text-p text-xs outline-none w-full placeholder:text-text-f"/>
          </div>

          {/* View toggle */}
          <div className="flex gap-0.5 bg-surface border border-white/5 rounded-xl p-1">
            {[{id:'grid', icon:Grid}, {id:'list', icon:List}].map(v => (
              <button key={v.id} onClick={() => setViewMode(v.id)}
                className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all
                  ${viewMode===v.id ? 'bg-accent/20 text-accent' : 'text-text-f hover:text-text-m'}`}>
                <v.icon size={13}/>
              </button>
            ))}
          </div>

          {/* New Folder */}
          {section === 'all' && (
            <button onClick={() => setShowNewFolder(true)}
              className="border border-white/10 hover:border-white/20 text-text-m
                hover:text-text-p text-xs px-3 py-2 rounded-xl transition-all">
              + Folder
            </button>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-5">

            {/* Upload zone */}
            <UploadZone
              folderId={currentFolder?.id}
              onSuccess={load}
              className="mb-5"
            />

            {/* Folders */}
            {section === 'all' && folders.length > 0 && (
              <div className="mb-6">
                <p className="text-text-f text-xs font-semibold uppercase tracking-wider mb-3">
                  Folders ({folders.length})
                </p>
                <FolderGrid
                  folders={folders}
                  onOpen={openFolder}
                  onDelete={handleFolderDelete}
                  onRefresh={load}
                />
              </div>
            )}

            {/* Files */}
            {loading ? (
              <div className={`grid gap-3 ${viewMode === 'grid'
                ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
                : 'grid-cols-1'}`}>
                {Array(8).fill(0).map((_,i) => (
                  <div key={i} className={`bg-surface rounded-2xl animate-pulse
                    ${viewMode === 'grid' ? 'h-36' : 'h-14'}`}/>
                ))}
              </div>
            ) : files.length === 0 && folders.length === 0 ? (
              <div className="text-center py-20">
                <FolderOpen size={40} className="text-text-f mx-auto mb-3 opacity-40"/>
                <p className="text-text-m font-medium mb-1">
                  {section === 'starred' ? 'No starred files' : 'No files here'}
                </p>
                <p className="text-text-f text-sm">
                  {section === 'all' ? 'Upload files or create a folder to get started' : ''}
                </p>
              </div>
            ) : files.length > 0 ? (
              <>
                {files.length > 0 && (
                  <p className="text-text-f text-xs font-semibold uppercase tracking-wider mb-3">
                    Files ({files.length})
                  </p>
                )}
                {viewMode === 'grid' ? (
                  <FileGrid
                    files={files}
                    onPreview={setPreviewFile}
                    onDelete={handleDelete}
                    onStar={handleStar}
                    onDownload={handleDownload}
                  />
                ) : (
                  <FileList
                    files={files}
                    onPreview={setPreviewFile}
                    onDelete={handleDelete}
                    onStar={handleStar}
                    onDownload={handleDownload}
                  />
                )}
              </>
            ) : null}
          </div>
        </div>
      </div>

      {/* Modals */}
      {showNewFolder && (
        <CreateFolderModal
          parentId={currentFolder?.id}
          onClose={() => setShowNewFolder(false)}
          onSuccess={() => { load(); setShowNewFolder(false) }}
        />
      )}
      {previewFile && (
        <FilePreviewModal
          file={previewFile}
          onClose={() => setPreviewFile(null)}
          onDelete={(id) => { handleDelete(id); setPreviewFile(null) }}
          onDownload={handleDownload}
        />
      )}
    </div>
  )
}