import { HardDrive, File, Image, FileText, Video } from 'lucide-react'

export default function StorageStats({ stats }) {
  if (!stats) return null

  const { total_size_formatted, total_files, storage_used_percent, by_type = {} } = stats

  const typeIcons = {
    image: Image,
    pdf: FileText,
    video: Video,
    doc: FileText,
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center gap-3 mb-4">
        <HardDrive className="w-5 h-5 text-indigo-600" />
        <h3 className="text-lg font-semibold text-gray-900">Storage</h3>
      </div>

      {/* Storage Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>{total_size_formatted} used</span>
          <span>{storage_used_percent}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-indigo-600 h-2 rounded-full transition-all"
            style={{ width: `${Math.min(storage_used_percent, 100)}%` }}
          />
        </div>
      </div>

      {/* File Count */}
      <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
        <File className="w-4 h-4" />
        <span>{total_files} files</span>
      </div>

      {/* File Types */}
      {Object.keys(by_type).length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-gray-500 uppercase">By Type</p>
          {Object.entries(by_type).map(([type, count]) => {
            const Icon = typeIcons[type] || File
            return (
              <div key={type} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-700 capitalize">{type}</span>
                </div>
                <span className="text-gray-500">{count}</span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
