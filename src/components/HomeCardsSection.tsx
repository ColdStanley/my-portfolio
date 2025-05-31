'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image'; // ✅ 用于处理图片

// 数据定义
const techCards = [
  {
    title: 'Technology1',
    content: "I have worked across hardware, software, AI, consulting, and more—rising from engineer to regional lead.",
    subtext: 'From American, Japanese to Singaporean tech firms and unicorns.',
    link: '/tech-career',
    image: '/images/tech-HW.png'
  },
  {
    title: 'Technology2',
    content: "I have worked across hardware, software, AI, consulting, and more—rising from engineer to regional lead. ".repeat(3),
    subtext: 'From American, Japanese to Singaporean tech firms and unicorns.',
    link: '/tech-career',
  },
];

const tutorCards = [
  {
    title: 'Tutor',
    content: 'I help beginners master Python and Excel through real-world projects and 1-on-1 coaching.',
    subtext: "It is about clarity, practice, and growing confidence.",
    link: '/tutor',
  },
];

const lifeCards = [
  {
    title: 'Life',
    content: 'Love your life',
    subtext: 'You Live Only Once, so make it count.',
    link: '/about',
  },
];

// 卡片列组件
function CardColumn({ cards }: { cards: typeof techCards }) {
  return (
    <div className="flex flex-col gap-6">
      {cards.map((card, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: idx * 0.1 }}
          className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-gray-100 flex flex-col justify-between p-6"
        >
          {/* 内容主体 */}
          <div className="flex-1">
            <h3 className="text-xl font-bold text-purple-700 mb-2">{card.title}</h3>
            <p className="text-gray-700 mb-2 leading-relaxed">{card.content}</p>
            <p className="text-sm text-gray-500 italic">{card.subtext}</p>
          </div>

          {/* 底部按钮 + 图片 */}
          <div className="flex items-center justify-between mt-6">
            <Link
                href={card.link}
                className="bg-purple-600 text-white px-4 py-2 rounded-md text-sm hover:bg-purple-700 hover:scale-105 transition-transform duration-200"
            >
                Learn more
            </Link>
            {card.image && (
                <div className="h-10 w-auto ml-4 flex-shrink-0">
                <Image
                    src={card.image}
                    alt={card.title}
                    height={40}
                    width={100}
                    className="h-10 w-auto object-contain"
                />
                </div>
            )}
            </div>
        </motion.div>
      ))}
    </div>
  );
}

// ✅ 主组件导出
export default function HomeCardsSection() {
  return (
    <section id="home-cards" className="pt-8 px-6 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <CardColumn cards={techCards} />
        <CardColumn cards={tutorCards} />
        <CardColumn cards={lifeCards} />
      </div>
    </section>
  );
}
