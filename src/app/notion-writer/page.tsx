'use client'

import { useEffect, useState } from 'react'

export default function NotionWriterPage() {
  const [databaseId, setDatabaseId] = useState('')
  const [content, setContent] = useState('')
  const [isConfirmed, setIsConfirmed] = useState(false)
  const [fieldSchema, setFieldSchema] = useState<Record<string, string>>({})
  const [writeProgress, setWriteProgress] = useState<number | null>(null)
  const [writeStatus, setWriteStatus] = useState<string[]>([])
  const [isWriting, setIsWriting] = useState(false)
  const [isConfirming, setIsConfirming] = useState(false)

  // load saved databaseId
  useEffect(() => {
    const saved = localStorage.getItem('notion-db-id')
    if (saved) setDatabaseId(saved)
  }, [])

  const handleConfirmDatabase = async () => {
    setIsConfirming(true)
    try {
      const res = await fetch('/api/notionwriter/get-schema', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ databaseId }),
      })
      const data = await res.json()
      if (data.schema) {
        setIsConfirmed(true)
        setFieldSchema(data.schema)
        localStorage.setItem('notion-db-id', databaseId)
      } else {
        alert('Failed to fetch schema')
      }
    } catch {
      alert('Error connecting to server')
    } finally {
      setIsConfirming(false)
    }
  }

  const handleWriteToNotion = async () => {
    setIsWriting(true)
    setWriteStatus(['Writing...'])
    setWriteProgress(0)

    try {
      const res = await fetch('/api/notionwriter/write-multiple', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ databaseId, content }),
      })
      const result = await res.json()

      const total = result.successCount + result.failureCount
      setWriteProgress(100)

      const logs: string[] = []

      logs.push(`✅ ${result.successCount} entries written successfully.`)

      if (result.failureCount > 0) {
        logs.push(`❌ ${result.failureCount} entries failed:`)
        result.failures.forEach((f: any) => {
          const isUnrecognized = f.reason.toLowerCase().includes('unrecognized field')
          logs.push(
            isUnrecognized
              ? `<span class="text-red-500">• Line ${f.line}: ${f.reason}</span>`
              : `• Line ${f.line}: ${f.reason}`
          )
        })
      }

      setWriteStatus(logs)
    } catch {
      setWriteStatus(['❌ Failed to connect to server.'])
    } finally {
      setIsWriting(false)
    }
  }

  return (
    <main className="max-w-7xl mx-auto px-4 py-10 space-y-10">
      {/* Main grid */}
      <div className="grid grid-cols-3 gap-6">
        {/* Left content */}
        <div className="col-span-2">
          <textarea
            className="w-full h-[500px] p-4 border border-gray-300 rounded-xl shadow text-sm focus:outline-purple-500 resize-none"
            placeholder="Enter multiple records here. Each field must follow the format: FieldName: Value. Use a blank line between records."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={!isConfirmed}
          />
        </div>

        {/* Right sidebar */}
        <div className="col-span-1 flex flex-col gap-4">
          {/* Database ID */}
          <input
            type="text"
            className="w-full p-3 border border-gray-300 rounded-lg shadow-sm text-sm focus:outline-purple-500"
            placeholder="Enter your Notion Database ID"
            value={databaseId}
            onChange={(e) => setDatabaseId(e.target.value)}
          />

          {/* Confirm button */}
          <button
            onClick={handleConfirmDatabase}
            className="bg-purple-600 hover:bg-purple-700 text-white font-medium text-sm rounded-lg px-4 py-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isConfirming}
          >
            {isConfirming ? 'Confirming...' : 'Confirm Database'}
          </button>

          {/* Write button */}
          <button
            onClick={handleWriteToNotion}
            disabled={!isConfirmed || isWriting}
            className="bg-purple-600 hover:bg-purple-700 text-white font-medium text-sm rounded-lg px-4 py-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isWriting ? 'Writing...' : 'Write to Notion'}
          </button>

          {/* Schema */}
          {isConfirmed && (
            <div className="bg-gray-50 border rounded-md p-4 text-sm shadow">
              <p className="font-semibold mb-2">Field Schema</p>
              <ul className="space-y-1">
                {Object.entries(fieldSchema).map(([key, type]) => (
                  <li key={key}>
                    <span className="text-purple-600 font-medium">{key}</span>: {type}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Progress & status */}
          {writeProgress !== null && (
            <div className="space-y-3">
              <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-purple-400 via-purple-500 to-purple-600 h-4 animate-pulse transition-all duration-700 ease-in-out"
                  style={{ width: `${writeProgress}%` }}
                ></div>
              </div>
              <div
                className="text-xs text-gray-700 space-y-1 max-h-40 overflow-y-auto"
                dangerouslySetInnerHTML={{
                  __html: writeStatus.map((line) => `<p>${line}</p>`).join(''),
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Usage instructions */}
      {/* Usage instructions */}
<div className="bg-purple-50 border-l-4 border-purple-400 p-6 rounded-xl shadow-sm text-sm text-gray-700 leading-relaxed space-y-2">
  <p className="font-semibold text-purple-700">Usage Instructions</p>
  <ul className="list-disc list-inside space-y-1">
    <li>Each line must follow the format: <code>FieldName: Value</code></li>
    <li>Field names must exactly match those in the database (case-sensitive)</li>
    <li><code>multi_select</code> values should be comma-separated (e.g., <code>AI, NLP</code>)</li>
    <li>Each record must include at least one <code>Title</code> field</li>
    <li>Separate each record by a <strong>blank line</strong></li>
  </ul>

  <p className="font-semibold text-purple-700 pt-4">If you are using GPT or Claude to generate data:</p>
  <ul className="list-disc list-inside space-y-1">
    <li>Upload a screenshot of your Notion database's field structure</li>
    <li>Then send the following prompt to the model:</li>
  </ul>

  <div className="bg-white border border-purple-200 p-4 mt-2 rounded-md text-xs text-gray-700 whitespace-pre-line">
    请根据我上传的截图中的 Notion 数据库字段，生成 2–3 条符合格式要求的模拟数据。
    
    ⚠️ 输出格式要求如下：
    - 每一行必须是：字段名: 内容（字段名后必须是英文冒号:）
    - 字段名必须完全一致地来自截图中的字段名，注意大小写、空格等
    - 每条记录之间请用空一行分隔
    - 不要添加任何引号、序号、markdown 格式或额外解释说明
    - 不要添加表格，只返回纯文本内容

    ✅ 我稍后将把你生成的内容粘贴进一个 Notion 写入工具中，请严格遵守格式规则
  </div>
  <div className="bg-white border border-purple-200 p-4 mt-2 rounded-md text-xs text-gray-700 whitespace-pre-line">
  Based on the uploaded screenshot of my Notion database fields, please generate 2–3 sample records that follow the format strictly.

  ⚠️ Output requirements:
  - Each line must follow the format: FieldName: Value (use a colon immediately after the field name)
  - Field names must exactly match those in the screenshot, including correct spelling and capitalization
  - Separate each record with one blank line
  - Do not include any quotation marks, numbering, markdown formatting, or additional explanations
  - Do not use tables — only return plain text

  ✅ I will copy and paste your output directly into a Notion Writer tool, so please follow the format exactly.
</div>

</div>

    </main>
  )
}
