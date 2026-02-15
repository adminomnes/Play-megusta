/**
 * Base de datos centralizada de Programas
 * Reemplaza los paths de assets con tus archivos reales (.jpg, .mp4, etc.)
 */
const PROGRAMAS_DATA = [
    {
        id: "globinobys",
        nombre: "Globinobys",
        categoria: "Infantil",
        etiqueta: "Infantil",
        descripcion: "Un mundo de aventuras musicales y educativas para los más pequeños de la casa.",
        duracion: "24 min",
        badge: "Nuevo",
        color: "#ff00e5", // Rosa Neón
        cover: "https://i.ibb.co/bRNvRCjX/Image-3.png",
        trailer: "https://v.ftcdn.net/05/27/29/42/700_F_527294242_p1q4G1B1mQ0V5V5V5V5V5V5V5V5V5.mp4", // Mock video placeholder
        fotos: [
            { thumb: "https://picsum.photos/300/200?random=1", src: "https://picsum.photos/1200/800?random=1", alt: "Globinobys Foto 1" },
            { thumb: "https://picsum.photos/300/200?random=2", src: "https://picsum.photos/1200/800?random=2", alt: "Globinobys Foto 2" },
            { thumb: "https://picsum.photos/300/200?random=3", src: "https://picsum.photos/1200/800?random=3", alt: "Globinobys Foto 3" }
        ],
        videos: [
            { thumb: "https://picsum.photos/300/200?random=4", src: "assets/videos/glo-v1.mp4", titulo: "Capítulo 1: El inicio" },
            { thumb: "https://picsum.photos/300/200?random=5", src: "assets/videos/glo-v2.mp4", titulo: "Capítulo 2: La aventura" }
        ]
    },
    {
        id: "programados",
        nombre: "Programados",
        categoria: "Entretención",
        etiqueta: "Entretención",
        descripcion: "El show más divertido con invitados especiales, retos y mucha música.",
        duracion: "45 min",
        badge: "",
        color: "#cfff00", // Amarillo Neón
        cover: "https://i.ibb.co/hFzZmJ1w/Chat-GPT-Image-30-ene-2026-18-58-00.png",
        trailer: "",
        fotos: [
            { thumb: "https://picsum.photos/300/200?random=6", src: "https://picsum.photos/1200/800?random=6", alt: "P2 Foto 1" }
        ],
        videos: []
    },
    {
        id: "frecuencia-paranormal",
        nombre: "Frecuencia Paranormal",
        categoria: "Podcast",
        etiqueta: "Podcast",
        descripcion: "Relatos de terror, misterio y fenómenos inexplicables que te dejarán sin dormir.",
        duracion: "60 min",
        badge: "Nuevo",
        color: "#9d00ff", // Morado Neón
        cover: "https://images.unsplash.com/photo-1509248961158-e54f6934749c?auto=format&fit=crop&w=500&q=80",
        trailer: "",
        fotos: [],
        videos: [
            {
                type: "spotify",
                src: "https://open.spotify.com/embed/episode/3zdbzWB97GEBepTpkohgbt?utm_source=generator",
                titulo: "Episodio: La Casa de los Susurros", // Using a generic title or fetching if possible, but user just gave link. I will use a placeholder that fits the theme. or just "Escuchar en Spotify"
                height: "152"
            }
        ]
    },
    {
        id: "baul-del-ayer",
        nombre: "Baúl del Ayer",
        categoria: "Recuerdo",
        etiqueta: "Música del Recuerdo",
        descripcion: "Un viaje nostálgico por los grandes éxitos que marcaron una época.",
        duracion: "En Vivo",
        badge: "",
        color: "#00f7ff", // Cian Neón
        cover: "https://i.ibb.co/Q3kK71mx/images-2.jpg",
        trailer: "",
        fotos: [],
        videos: []
    }
];
