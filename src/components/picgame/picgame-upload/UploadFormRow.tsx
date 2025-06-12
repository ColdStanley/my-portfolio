'use client'

export default function UploadFormRow() {
  return (
    <>
      <div className="flex flex-col md:flex-row gap-4 w-full mb-8">
        {/* 左栏：图片上传 */}
        <div className="flex-1 bg-white shadow rounded-xl p-6 flex flex-col justify-between h-[300px]">
          <div className="text-gray-700 text-sm mb-4 font-semibold">上传图片</div>
          <input type="file" accept="image/*" className="mb-4" />
          <div className="flex justify-end">
            <button className="px-4 py-2 text-sm rounded-lg bg-purple-500 text-white hover:bg-purple-600 transition-all">
              确认上传
            </button>
          </div>
        </div>

        {/* 中栏：Quotes */}
        <div className="flex-1 bg-white shadow rounded-xl p-6 flex flex-col justify-between h-[300px]">
          <div className="text-gray-700 text-sm mb-2 font-semibold">Quotes</div>
          <textarea
            rows={4}
            placeholder="写给某人，自己，或未来的几句话……"
            className="flex-grow border border-purple-200 rounded-lg p-3 resize-none text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
          />

          <div className="flex justify-center gap-x-4 mt-4">
            <button className="w-[30%] text-sm rounded-lg bg-purple-100 text-purple-600 hover:bg-purple-200 transition-all py-1">
              一键生成表白
            </button>
            <button className="w-[30%] text-sm rounded-lg bg-purple-100 text-purple-600 hover:bg-purple-200 transition-all py-1">
              一键生成 Say Sorry
            </button>
            <button className="w-[30%] text-sm rounded-lg bg-purple-100 text-purple-600 hover:bg-purple-200 transition-all py-1">
              一键生成祝福
            </button>
          </div>

          <div className="flex justify-end mt-4">
            <button className="px-4 py-2 text-sm rounded-lg bg-purple-500 text-white hover:bg-purple-600 transition-all">
              确认 Quotes
            </button>
          </div>
        </div>

        {/* 右栏：图片描述 */}
        <div className="flex-1 bg-white shadow rounded-xl p-6 flex flex-col justify-between h-[300px]">
          <div className="text-gray-700 text-sm mb-2 font-semibold">图片描述</div>
          <textarea
            rows={4}
            placeholder="请输入这张图片背后的故事、情绪、时间或想法……"
            className="flex-grow border border-purple-200 rounded-lg p-3 resize-none text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
          />

          <div className="flex justify-end mt-4">
            <button className="px-4 py-2 text-sm rounded-lg bg-purple-500 text-white hover:bg-purple-600 transition-all">
              确认描述
            </button>
          </div>
        </div>
      </div>

      {/* 新增行：确认生成链接 */}
      <div className="grid grid-cols-3 gap-4 w-full mb-8">
        {/* 左栏按钮：宽度与上方保持一致 */}
        <div className="flex items-center justify-start">
          <button className="w-[450px] py-2 text-sm rounded-lg bg-purple-500 text-white hover:bg-purple-600 transition-all">
            确认生成可分享的链接
          </button>
        </div>

        {/* 中 + 右栏：链接展示输入框 */}
        <div className="col-span-2">
          <input
            type="text"
            readOnly
            placeholder="生成的链接将显示在这里"
            className="w-full border border-purple-300 rounded-lg px-4 py-2 text-sm bg-gray-50 text-gray-700 focus:outline-none"
          />
        </div>
      </div>
    </>
  )
}
