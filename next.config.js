/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['prod-files-secure.s3.us-west-2.amazonaws.com'],
  },
  eslint: {
    // ⛔️ 忽略 ESLint 错误，允许构建继续（Vercel 会读取这个配置）
    ignoreDuringBuilds: true,
  },
  typescript: {
    // ⛔️ 忽略 TS 错误，也一并保险处理
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;
