/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [{ hostname: "lh3.googleusercontent.com" }],
    },
    reactStrictMode: true,
    experimental: {
        largePageDataBytes: 128 * 1000
    },
    swcMinify: true,
}

module.exports = nextConfig
