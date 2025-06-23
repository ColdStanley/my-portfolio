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
  isAdding: boolean
  deletableMode: boolean
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export default function MaskControlPanel({
  maskSetting, onChangeSetting, onAdd, onComplete,
  isAdding, deletableMode, onUpload,
}: Props) {
  return (
    <div className="flex flex-col gap-4 w-full">
      <input type="file" accept="image/*" multiple onChange={onUpload} className="w-full" />

      <div>
        <label className="block text-sm font-medium">Mask Color</label>
        <select
          value={maskSetting.color}
          onChange={e => onChangeSetting({ ...maskSetting, color: e.target.value })}
          className="w-full border rounded px-2 py-1"
        >
          <option value="black">Black</option>
          <option value="white">White</option>
          <option value="gray">Gray</option>
          <option value="purple">Purple</option>
        </select>
      </div>

      <div className="flex gap-2">
        <div className="w-1/2">
          <label>Width</label>
          <input
            type="number"
            value={maskSetting.width}
            onChange={e => onChangeSetting({ ...maskSetting, width: +e.target.value })}
            className="w-full border rounded px-2 py-1"
          />
        </div>
        <div className="w-1/2">
          <label>Height</label>
          <input
            type="number"
            value={maskSetting.height}
            onChange={e => onChangeSetting({ ...maskSetting, height: +e.target.value })}
            className="w-full border rounded px-2 py-1"
          />
        </div>
      </div>

      <div>
        <label>Opacity (0–100)</label>
        <input
          type="number"
          value={maskSetting.opacity}
          onChange={e => onChangeSetting({ ...maskSetting, opacity: +e.target.value })}
          className="w-full border rounded px-2 py-1"
        />
      </div>

      <button onClick={onAdd} className="bg-purple-600 text-white w-full py-2 rounded">
        ➕ Add Mask
      </button>
      <button onClick={onComplete} className="bg-green-600 text-white w-full py-2 rounded">
        ✅ Complete Mask Settings
      </button>
    </div>
  )
}
