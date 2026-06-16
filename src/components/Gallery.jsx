import React, { useState, useEffect } from 'react';

const photos = [
    'IMG-20210522-WA0048.jpg',
    'IMG-20211030-WA0018.jpg',
    'IMG-20220717-WA0035.jpg',
    'IMG-20240113-WA0022.jpg',
    'IMG_20241130_181535397_HDR.png'
];

const Gallery = () => {
    const [currentIndex, setCurrentIndex] = useState(0);

    // Auto-play interval
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % photos.length);
        }, 5000); // Cambia la imagen cada 5.0 segundos

        return () => clearInterval(timer);
    }, []);

    return (
        <div className="w-full max-w-3xl mx-auto px-4 py-8">
            <div className="relative w-full h-[400px] md:h-[500px] rounded-sm overflow-hidden shadow-2xl bg-white border-4 border-double border-secondary-blue/30">
                {photos.map((photo, index) => (
                    <div
                        key={index}
                        className={`absolute top-0 left-0 w-full h-full transition-opacity duration-1000 ease-in-out ${index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}
                    >
                        <img
                            src={`/src/assets/${photo}`}
                            alt={`Samantha momento ${index + 1}`}
                            className="w-full h-full object-contain bg-blue-50/20 p-4"
                            loading="lazy"
                        />
                    </div>
                ))}

                {/* Controles del Carrusel (Puntos) con estilo Cenicienta */}
                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-3 z-30">
                    {photos.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => setCurrentIndex(idx)}
                            className={`rounded-full transition-all duration-500 ease-in-out ${idx === currentIndex ? 'bg-secondary-blue w-8 h-2 shadow-[0_0_10px_rgba(137,168,214,0.6)]' : 'bg-gray-300 w-2 h-2 hover:bg-secondary-blue/50'}`}
                            aria-label={`Ir a la foto ${idx + 1}`}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Gallery;
