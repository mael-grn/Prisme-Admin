import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Prisme Admin',
        short_name: 'Prismadmin',
        description: 'Edit your prisme websites',
        start_url: '/secure',
        display: 'standalone',
        background_color: '#000000',
        theme_color: '#ffffff',
        icons: [
            {
                src: '/img/icon192.png',
                sizes: '192x192',
                type: 'image/png',
            }
        ],
    }
}