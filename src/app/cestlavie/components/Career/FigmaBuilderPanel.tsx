'use client'

import { useState } from 'react'

export default function FigmaBuilderPanel() {
  const [targetRole, setTargetRole] = useState('')
  
  // A组 - 1st Expected Capabilities
  const [a1, setA1] = useState('')
  const [a2, setA2] = useState('')
  const [a3, setA3] = useState('')
  const [a4, setA4] = useState('')
  const [a5, setA5] = useState('')
  const [a6, setA6] = useState('')
  const [a7, setA7] = useState('')
  const [a8, setA8] = useState('')
  const [a9, setA9] = useState('')
  
  // B组 - 2nd Expected Capabilities
  const [b1, setB1] = useState('')
  const [b2, setB2] = useState('')
  const [b3, setB3] = useState('')
  const [b4, setB4] = useState('')
  const [b5, setB5] = useState('')
  const [b6, setB6] = useState('')
  const [b7, setB7] = useState('')
  const [b8, setB8] = useState('')
  const [b9, setB9] = useState('')
  
  // C组 - 3rd Expected Capabilities
  const [c1, setC1] = useState('')
  const [c2, setC2] = useState('')
  const [c3, setC3] = useState('')
  const [c4, setC4] = useState('')
  const [c5, setC5] = useState('')
  const [c6, setC6] = useState('')
  const [c7, setC7] = useState('')
  const [c8, setC8] = useState('')
  const [c9, setC9] = useState('')
  
  // D组 - 4th Expected Capabilities
  const [d1, setD1] = useState('')
  const [d2, setD2] = useState('')
  const [d3, setD3] = useState('')
  const [d4, setD4] = useState('')
  const [d5, setD5] = useState('')
  const [d6, setD6] = useState('')
  const [d7, setD7] = useState('')
  const [d8, setD8] = useState('')
  const [d9, setD9] = useState('')
  
  const [status, setStatus] = useState<{ message: string; type: 'success' | 'error' | '' }>({ message: '', type: '' })

  const generateConfig = async () => {
    if (!targetRole.trim()) {
      setStatus({ message: '请填写目标职位', type: 'error' })
      return
    }

    const config = {
      target_role: targetRole.trim(),
      A1: a1.trim(),
      A2: a2.trim(),
      A3: a3.trim(),
      A4: a4.trim(),
      A5: a5.trim(),
      A6: a6.trim(),
      A7: a7.trim(),
      A8: a8.trim(),
      A9: a9.trim(),
      B1: b1.trim(),
      B2: b2.trim(),
      B3: b3.trim(),
      B4: b4.trim(),
      B5: b5.trim(),
      B6: b6.trim(),
      B7: b7.trim(),
      B8: b8.trim(),
      B9: b9.trim(),
      C1: c1.trim(),
      C2: c2.trim(),
      C3: c3.trim(),
      C4: c4.trim(),
      C5: c5.trim(),
      C6: c6.trim(),
      C7: c7.trim(),
      C8: c8.trim(),
      C9: c9.trim(),
      D1: d1.trim(),
      D2: d2.trim(),
      D3: d3.trim(),
      D4: d4.trim(),
      D5: d5.trim(),
      D6: d6.trim(),
      D7: d7.trim(),
      D8: d8.trim(),
      D9: d9.trim()
    }

    try {
      await navigator.clipboard.writeText(JSON.stringify(config, null, 2))
      setStatus({ message: '配置已复制到剪贴板！现在可以在 Figma 中运行插件', type: 'success' })
    } catch (error) {
      setStatus({ message: '复制失败，请手动复制下方JSON', type: 'error' })
    }
  }

  const configJson = JSON.stringify({
    target_role: targetRole.trim(),
    A1: a1.trim(),
    A2: a2.trim(),
    A3: a3.trim(),
    A4: a4.trim(),
    A5: a5.trim(),
    A6: a6.trim(),
    A7: a7.trim(),
    A8: a8.trim(),
    A9: a9.trim(),
    B1: b1.trim(),
    B2: b2.trim(),
    B3: b3.trim(),
    B4: b4.trim(),
    B5: b5.trim(),
    B6: b6.trim(),
    B7: b7.trim(),
    B8: b8.trim(),
    B9: b9.trim(),
    C1: c1.trim(),
    C2: c2.trim(),
    C3: c3.trim(),
    C4: c4.trim(),
    C5: c5.trim(),
    C6: c6.trim(),
    C7: c7.trim(),
    C8: c8.trim(),
    C9: c9.trim(),
    D1: d1.trim(),
    D2: d2.trim(),
    D3: d3.trim(),
    D4: d4.trim(),
    D5: d5.trim(),
    D6: d6.trim(),
    D7: d7.trim(),
    D8: d8.trim(),
    D9: d9.trim()
  }, null, 2)

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-4 w-1/2">
        <label className="text-sm font-medium text-purple-700 whitespace-nowrap">
          Target Role
        </label>
        <input
          type="text"
          value={targetRole}
          onChange={(e) => setTargetRole(e.target.value)}
          placeholder="请输入目标职位"
          className="flex-1 p-3 border border-purple-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 break-words"
        />
      </div>

      {/* A组 - 1st Expected Capabilities */}
      <div className="bg-purple-50/30 rounded-lg p-6 border border-purple-100">
        <h3 className="text-lg font-semibold text-purple-900 mb-6">A组 - 1st Expected Capabilities</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-purple-700 mb-2">A1 - 1st Expected Capabilities</label>
            <textarea value={a1} onChange={(e) => setA1(e.target.value)} placeholder="请输入第一项期望能力" rows={3} className="w-full p-3 border border-purple-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-vertical break-words" />
          </div>
          
          <div className="space-y-3">
            <div className="grid grid-cols-5 gap-3">
              <div className="min-w-0">
                <label className="block text-sm font-medium text-purple-700 mb-2">A2 - Firm 1</label>
                <input type="text" value={a2} onChange={(e) => setA2(e.target.value)} placeholder="公司1" className="w-full p-3 border border-purple-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 break-words" />
              </div>
              <div className="col-span-4 min-w-0">
                <label className="block text-sm font-medium text-purple-700 mb-2">A3 - Description 1</label>
                <textarea value={a3} onChange={(e) => setA3(e.target.value)} placeholder="描述1" rows={3} className="w-full p-3 border border-purple-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-vertical break-words" />
              </div>
            </div>
            <div className="grid grid-cols-5 gap-3">
              <div className="min-w-0">
                <label className="block text-sm font-medium text-purple-700 mb-2">A4 - Firm 2</label>
                <input type="text" value={a4} onChange={(e) => setA4(e.target.value)} placeholder="公司2" className="w-full p-3 border border-purple-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 break-words" />
              </div>
              <div className="col-span-4 min-w-0">
                <label className="block text-sm font-medium text-purple-700 mb-2">A5 - Description 2</label>
                <textarea value={a5} onChange={(e) => setA5(e.target.value)} placeholder="描述2" rows={3} className="w-full p-3 border border-purple-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-vertical break-words" />
              </div>
            </div>
            <div className="grid grid-cols-5 gap-3">
              <div className="min-w-0">
                <label className="block text-sm font-medium text-purple-700 mb-2">A6 - Firm 3</label>
                <input type="text" value={a6} onChange={(e) => setA6(e.target.value)} placeholder="公司3" className="w-full p-3 border border-purple-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 break-words" />
              </div>
              <div className="col-span-4 min-w-0">
                <label className="block text-sm font-medium text-purple-700 mb-2">A7 - Description 3</label>
                <textarea value={a7} onChange={(e) => setA7(e.target.value)} placeholder="描述3" rows={3} className="w-full p-3 border border-purple-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-vertical break-words" />
              </div>
            </div>
            <div className="grid grid-cols-5 gap-3">
              <div className="min-w-0">
                <label className="block text-sm font-medium text-purple-700 mb-2">A8 - Firm 4</label>
                <input type="text" value={a8} onChange={(e) => setA8(e.target.value)} placeholder="公司4" className="w-full p-3 border border-purple-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 break-words" />
              </div>
              <div className="col-span-4 min-w-0">
                <label className="block text-sm font-medium text-purple-700 mb-2">A9 - Description 4</label>
                <textarea value={a9} onChange={(e) => setA9(e.target.value)} placeholder="描述4" rows={3} className="w-full p-3 border border-purple-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-vertical break-words" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* B组 - 2nd Expected Capabilities */}
      <div className="bg-purple-50/25 rounded-lg p-6 border border-purple-100">
        <h3 className="text-lg font-semibold text-purple-900 mb-6">B组 - 2nd Expected Capabilities</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-purple-700 mb-2">B1 - 2nd Expected Capabilities</label>
            <textarea value={b1} onChange={(e) => setB1(e.target.value)} placeholder="请输入第二项期望能力" rows={3} className="w-full p-3 border border-purple-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-vertical break-words" />
          </div>
          
          <div className="space-y-3">
            <div className="grid grid-cols-5 gap-3">
              <div className="min-w-0">
                <label className="block text-sm font-medium text-purple-700 mb-2">B2 - Firm 1</label>
                <input type="text" value={b2} onChange={(e) => setB2(e.target.value)} placeholder="公司1" className="w-full p-3 border border-purple-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 break-words" />
              </div>
              <div className="col-span-4 min-w-0">
                <label className="block text-sm font-medium text-purple-700 mb-2">B3 - Description 1</label>
                <textarea value={b3} onChange={(e) => setB3(e.target.value)} placeholder="描述1" rows={3} className="w-full p-3 border border-purple-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-vertical break-words" />
              </div>
            </div>
            <div className="grid grid-cols-5 gap-3">
              <div className="min-w-0">
                <label className="block text-sm font-medium text-purple-700 mb-2">B4 - Firm 2</label>
                <input type="text" value={b4} onChange={(e) => setB4(e.target.value)} placeholder="公司2" className="w-full p-3 border border-purple-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 break-words" />
              </div>
              <div className="col-span-4 min-w-0">
                <label className="block text-sm font-medium text-purple-700 mb-2">B5 - Description 2</label>
                <textarea value={b5} onChange={(e) => setB5(e.target.value)} placeholder="描述2" rows={3} className="w-full p-3 border border-purple-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-vertical break-words" />
              </div>
            </div>
            <div className="grid grid-cols-5 gap-3">
              <div className="min-w-0">
                <label className="block text-sm font-medium text-purple-700 mb-2">B6 - Firm 3</label>
                <input type="text" value={b6} onChange={(e) => setB6(e.target.value)} placeholder="公司3" className="w-full p-3 border border-purple-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 break-words" />
              </div>
              <div className="col-span-4 min-w-0">
                <label className="block text-sm font-medium text-purple-700 mb-2">B7 - Description 3</label>
                <textarea value={b7} onChange={(e) => setB7(e.target.value)} placeholder="描述3" rows={3} className="w-full p-3 border border-purple-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-vertical break-words" />
              </div>
            </div>
            <div className="grid grid-cols-5 gap-3">
              <div className="min-w-0">
                <label className="block text-sm font-medium text-purple-700 mb-2">B8 - Firm 4</label>
                <input type="text" value={b8} onChange={(e) => setB8(e.target.value)} placeholder="公司4" className="w-full p-3 border border-purple-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 break-words" />
              </div>
              <div className="col-span-4 min-w-0">
                <label className="block text-sm font-medium text-purple-700 mb-2">B9 - Description 4</label>
                <textarea value={b9} onChange={(e) => setB9(e.target.value)} placeholder="描述4" rows={3} className="w-full p-3 border border-purple-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-vertical break-words" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* C组 - 3rd Expected Capabilities */}
      <div className="bg-purple-50/15 rounded-lg p-6 border border-purple-100">
        <h3 className="text-lg font-semibold text-purple-900 mb-6">C组 - 3rd Expected Capabilities</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-purple-700 mb-2">C1 - 3rd Expected Capabilities</label>
            <textarea value={c1} onChange={(e) => setC1(e.target.value)} placeholder="请输入第三项期望能力" rows={3} className="w-full p-3 border border-purple-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-vertical break-words" />
          </div>
          
          <div className="space-y-3">
            <div className="grid grid-cols-5 gap-3">
              <div className="min-w-0">
                <label className="block text-sm font-medium text-purple-700 mb-2">C2 - Firm 1</label>
                <input type="text" value={c2} onChange={(e) => setC2(e.target.value)} placeholder="公司1" className="w-full p-3 border border-purple-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 break-words" />
              </div>
              <div className="col-span-4 min-w-0">
                <label className="block text-sm font-medium text-purple-700 mb-2">C3 - Description 1</label>
                <textarea value={c3} onChange={(e) => setC3(e.target.value)} placeholder="描述1" rows={3} className="w-full p-3 border border-purple-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-vertical break-words" />
              </div>
            </div>
            <div className="grid grid-cols-5 gap-3">
              <div className="min-w-0">
                <label className="block text-sm font-medium text-purple-700 mb-2">C4 - Firm 2</label>
                <input type="text" value={c4} onChange={(e) => setC4(e.target.value)} placeholder="公司2" className="w-full p-3 border border-purple-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 break-words" />
              </div>
              <div className="col-span-4 min-w-0">
                <label className="block text-sm font-medium text-purple-700 mb-2">C5 - Description 2</label>
                <textarea value={c5} onChange={(e) => setC5(e.target.value)} placeholder="描述2" rows={3} className="w-full p-3 border border-purple-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-vertical break-words" />
              </div>
            </div>
            <div className="grid grid-cols-5 gap-3">
              <div className="min-w-0">
                <label className="block text-sm font-medium text-purple-700 mb-2">C6 - Firm 3</label>
                <input type="text" value={c6} onChange={(e) => setC6(e.target.value)} placeholder="公司3" className="w-full p-3 border border-purple-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 break-words" />
              </div>
              <div className="col-span-4 min-w-0">
                <label className="block text-sm font-medium text-purple-700 mb-2">C7 - Description 3</label>
                <textarea value={c7} onChange={(e) => setC7(e.target.value)} placeholder="描述3" rows={3} className="w-full p-3 border border-purple-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-vertical break-words" />
              </div>
            </div>
            <div className="grid grid-cols-5 gap-3">
              <div className="min-w-0">
                <label className="block text-sm font-medium text-purple-700 mb-2">C8 - Firm 4</label>
                <input type="text" value={c8} onChange={(e) => setC8(e.target.value)} placeholder="公司4" className="w-full p-3 border border-purple-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 break-words" />
              </div>
              <div className="col-span-4 min-w-0">
                <label className="block text-sm font-medium text-purple-700 mb-2">C9 - Description 4</label>
                <textarea value={c9} onChange={(e) => setC9(e.target.value)} placeholder="描述4" rows={3} className="w-full p-3 border border-purple-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-vertical break-words" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* D组 - 4th Expected Capabilities */}
      <div className="bg-purple-50/10 rounded-lg p-6 border border-purple-100">
        <h3 className="text-lg font-semibold text-purple-900 mb-6">D组 - 4th Expected Capabilities</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-purple-700 mb-2">D1 - 4th Expected Capabilities</label>
            <textarea value={d1} onChange={(e) => setD1(e.target.value)} placeholder="请输入第四项期望能力" rows={3} className="w-full p-3 border border-purple-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-vertical break-words" />
          </div>
          
          <div className="space-y-3">
            <div className="grid grid-cols-5 gap-3">
              <div className="min-w-0">
                <label className="block text-sm font-medium text-purple-700 mb-2">D2 - Firm 1</label>
                <input type="text" value={d2} onChange={(e) => setD2(e.target.value)} placeholder="公司1" className="w-full p-3 border border-purple-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 break-words" />
              </div>
              <div className="col-span-4 min-w-0">
                <label className="block text-sm font-medium text-purple-700 mb-2">D3 - Description 1</label>
                <textarea value={d3} onChange={(e) => setD3(e.target.value)} placeholder="描述1" rows={3} className="w-full p-3 border border-purple-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-vertical break-words" />
              </div>
            </div>
            <div className="grid grid-cols-5 gap-3">
              <div className="min-w-0">
                <label className="block text-sm font-medium text-purple-700 mb-2">D4 - Firm 2</label>
                <input type="text" value={d4} onChange={(e) => setD4(e.target.value)} placeholder="公司2" className="w-full p-3 border border-purple-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 break-words" />
              </div>
              <div className="col-span-4 min-w-0">
                <label className="block text-sm font-medium text-purple-700 mb-2">D5 - Description 2</label>
                <textarea value={d5} onChange={(e) => setD5(e.target.value)} placeholder="描述2" rows={3} className="w-full p-3 border border-purple-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-vertical break-words" />
              </div>
            </div>
            <div className="grid grid-cols-5 gap-3">
              <div className="min-w-0">
                <label className="block text-sm font-medium text-purple-700 mb-2">D6 - Firm 3</label>
                <input type="text" value={d6} onChange={(e) => setD6(e.target.value)} placeholder="公司3" className="w-full p-3 border border-purple-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 break-words" />
              </div>
              <div className="col-span-4 min-w-0">
                <label className="block text-sm font-medium text-purple-700 mb-2">D7 - Description 3</label>
                <textarea value={d7} onChange={(e) => setD7(e.target.value)} placeholder="描述3" rows={3} className="w-full p-3 border border-purple-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-vertical break-words" />
              </div>
            </div>
            <div className="grid grid-cols-5 gap-3">
              <div className="min-w-0">
                <label className="block text-sm font-medium text-purple-700 mb-2">D8 - Firm 4</label>
                <input type="text" value={d8} onChange={(e) => setD8(e.target.value)} placeholder="公司4" className="w-full p-3 border border-purple-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 break-words" />
              </div>
              <div className="col-span-4 min-w-0">
                <label className="block text-sm font-medium text-purple-700 mb-2">D9 - Description 4</label>
                <textarea value={d9} onChange={(e) => setD9(e.target.value)} placeholder="描述4" rows={3} className="w-full p-3 border border-purple-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-vertical break-words" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={generateConfig}
        className="w-full px-6 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
      >
        生成配置并复制到剪贴板
      </button>

      {status.message && (
        <div className={`p-4 rounded-md text-sm ${
          status.type === 'success' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
          status.type === 'error' ? 'bg-purple-100/50 text-purple-800 border border-purple-300' :
          'bg-purple-50/50 text-purple-700 border border-purple-200'
        }`}>
          {status.message}
        </div>
      )}

      {(targetRole.trim() || a1.trim() || a2.trim() || a3.trim() || b1.trim() || c1.trim() || d1.trim()) && (
        <div className="bg-purple-50/30 rounded-lg p-4 border border-purple-100">
          <h3 className="text-sm font-semibold text-purple-700 mb-2">生成的配置：</h3>
          <div className="text-xs text-purple-600 bg-white p-3 rounded border border-purple-200 break-all whitespace-pre-wrap">
            {configJson}
          </div>
        </div>
      )}

      <div className="bg-purple-50/40 rounded-lg p-4 border border-purple-200">
        <h3 className="text-lg font-semibold text-purple-900 mb-3">使用流程</h3>
        <div className="space-y-2 text-sm text-purple-700">
          <p>1. 填写目标职位和各组期望能力信息</p>
          <p>2. 点击"生成配置并复制到剪贴板"</p>
          <p>3. 打开 Figma，确保有 Resume_Page 页面</p>
          <p>4. 在 Figma 中运行 Resume Builder 插件</p>
          <p>5. 插件会自动读取剪贴板并更新模板</p>
          <p>6. 在 Figma 中导出 PDF</p>
        </div>
      </div>

      <div className="bg-purple-50/30 rounded-lg p-4 border border-purple-200">
        <h3 className="text-lg font-semibold text-purple-800 mb-3">Figma 设置要求</h3>
        <div className="space-y-2 text-sm text-purple-700">
          <p>• 页面名称：<code className="bg-purple-100 px-1 rounded">Resume_Page</code></p>
          <p>• 文本图层名称：</p>
          <div className="ml-4 space-y-1 text-xs">
            <p><code className="bg-purple-100 px-1 rounded">target_role</code> - Target Role</p>
            <p><strong>A组:</strong> A1(1st Capabilities), A2-A9(Firm1-4 & Description1-4)</p>
            <p><strong>B组:</strong> B1(2nd Capabilities), B2-B9(Firm1-4 & Description1-4)</p>
            <p><strong>C组:</strong> C1(3rd Capabilities), C2-C9(Firm1-4 & Description1-4)</p>
            <p><strong>D组:</strong> D1(4th Capabilities), D2-D9(Firm1-4 & Description1-4)</p>
          </div>
          <p>• <strong>布局说明：</strong></p>
          <div className="ml-4 space-y-1 text-xs">
            <p>1. 空内容的图层会自动隐藏</p>
            <p>2. 其他图层位置保持固定不变</p>
            <p>3. 支持自适应行高的字段会根据内容调整高度</p>
            <p>4. 图层可以使用绝对定位或固定间距布局</p>
          </div>
        </div>
      </div>
    </div>
  )
}