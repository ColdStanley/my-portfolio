/** @type {import('next').NextConfig} */
const nextConfig = {
  // ✅ 此处可添加其他配置项，如 images、i18n 等
  // 🔧 如果以后你需要开启 appDir、swcMinify 等，也写在这里
  images: {
    domains: ['prod-files-secure.s3.us-west-2.amazonaws.com'],
  },
};

export default nextConfig;
