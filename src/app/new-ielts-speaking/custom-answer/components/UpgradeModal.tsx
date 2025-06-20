'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

interface UpgradeModalProps {
  open: boolean
  onClose: () => void
}

export default function UpgradeModal({ open, onClose }: UpgradeModalProps) {
  const router = useRouter()

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl text-purple-700">
            🎓 解锁你的专属口语定制体验
          </DialogTitle>
        </DialogHeader>
        <div className="text-gray-800 text-sm leading-relaxed space-y-2">
          <p>你已达到今日游客使用上限。</p>
          <p>注册后可免费体验一次完整定制，并自动保存你的练习记录。</p>
          <p>升级会员，还能解锁更多高级功能与个性化指导。</p>
        </div>
        <DialogFooter className="flex justify-between gap-2 mt-4">
          <Button variant="outline" onClick={() => router.push('/register')}>
            注册体验
          </Button>
          <Button onClick={() => router.push('/membership')}>
            升级会员
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
