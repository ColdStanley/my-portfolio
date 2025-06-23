'use client'

interface Props {
  maskSetting: {
    color: string
    width: number
    height: number
    opacity: number
  }
  onChangeSetting: (value: any) => void
  onAdd: () => void
  onComplete: () => void
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  onSave: () => void
  onLoad: () => void
  statusText: string
  isAdding: boolean
  deletableMode: boolean
  saveProjectName: string
  setSaveProjectName: (value: string) => void
  loadProjectName: string
  setLoadProjectName: (value: string) => void
  isSaving: boolean
  isLoading: boolean
}

export default function MaskControlPanel({
  maskSetting, onChangeSetting, onAdd, onComplete,
  onUpload, onSave, onLoad,
  statusText, isAdding, deletableMode,
  saveProjectName, setSaveProjectName,
  loadProjectName, setLoadProjectName,
  isSaving, isLoading,
}: Props) {
  return (
    <div className="h-full flex flex-col divide-y divide-gray-200 text-sm text-gray-700">
      {/* Upper section: upload + buttons + project name inputs */}
      <div className="flex-1 overflow-hidden flex flex-col justify-between">
        <div className="flex flex-col gap-3">
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={onUpload}
            className="w-full text-sm"
          />

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onAdd}
              className="bg-purple-600 hover:bg-purple-700 text-white rounded px-2 py-1.5 shadow-sm"
            >
              mask
            </button>
            <button
              onClick={onComplete}
              className="bg-purple-600 hover:bg-purple-700 text-white rounded px-2 py-1.5 shadow-sm"
            >
              reveal
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 mt-4">
          <div className="flex flex-col">
            <button
              onClick={onSave}
              disabled={isSaving}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded px-2 py-1.5 shadow-sm"
            >
              {isSaving ? 'saving...' : 'save'}
            </button>
            <input
              type="text"
              value={saveProjectName}
              onChange={(e) => setSaveProjectName(e.target.value)}
              placeholder="Project name"
              className="mt-1 w-full border rounded px-2 py-1 text-xs"
            />
          </div>
          <div className="flex flex-col">
            <button
              onClick={onLoad}
              disabled={isLoading}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded px-2 py-1.5 shadow-sm"
            >
              {isLoading ? 'loading...' : 'load'}
            </button>
            <input
              type="text"
              value={loadProjectName}
              onChange={(e) => setLoadProjectName(e.target.value)}
              placeholder="Project name"
              className="mt-1 w-full border rounded px-2 py-1 text-xs"
            />
          </div>
        </div>
      </div>

      {/* Lower section: status text + mode + mask config */}
      <div className="flex-1 overflow-auto pt-3 flex flex-col gap-2">
        <div className="text-center text-gray-500 italic line-clamp-2 select-none pointer-events-none">
          {statusText}
        </div>

        <div className="text-center text-gray-600 text-xs">
          Current Mode:{' '}
          <span className="font-semibold text-purple-600">
            {isAdding ? 'Masking' : (deletableMode ? 'Deletable' : 'Idle')}
          </span>
        </div>

        {isAdding && (
          <div className="space-y-2">
            <div>
              <label className="block text-xs mb-1">Mask Color</label>
              <select
                value={maskSetting.color}
                onChange={e => onChangeSetting({ ...maskSetting, color: e.target.value })}
                className="w-full border rounded px-2 py-1 text-xs"
              >
                <option value="rgba(155, 89, 182, 1.0)">Purple</option>
                <option value="black">Black</option>
                <option value="white">White</option>
                <option value="gray">Gray</option>
              </select>
            </div>

            <div className="flex gap-2">
              <div className="w-1/2">
                <label className="block text-xs mb-1">Width</label>
                <input
                  type="number"
                  value={maskSetting.width}
                  onChange={e => onChangeSetting({ ...maskSetting, width: +e.target.value })}
                  className="w-full border rounded px-2 py-1 text-xs"
                />
              </div>
              <div className="w-1/2">
                <label className="block text-xs mb-1">Height</label>
                <input
                  type="number"
                  value={maskSetting.height}
                  onChange={e => onChangeSetting({ ...maskSetting, height: +e.target.value })}
                  className="w-full border rounded px-2 py-1 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs mb-1">Opacity (0–100)</label>
              <input
                type="number"
                value={maskSetting.opacity}
                onChange={e => onChangeSetting({ ...maskSetting, opacity: +e.target.value })}
                className="w-full border rounded px-2 py-1 text-xs"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}