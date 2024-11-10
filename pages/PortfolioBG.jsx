import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import Lenis from "lenis";

const PfloBG = () => {
    const canvasRef = useRef(null);
    const [images, setImages] = useState([]);
    const frames = useRef({ currentIndex: 0, maxIndex: 257 }).current;
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Import ScrollTrigger dynamically on client side only
        const initGSAP = async () => {
            const ScrollTrigger = (await import('gsap/ScrollTrigger')).default;
            gsap.registerPlugin(ScrollTrigger);
            return ScrollTrigger;
        };

        const ctx = canvasRef.current.getContext("2d");
        
        // Adjusted Lenis settings for smoother scrolling
        const lenis = new Lenis({
            duration: 2.4,  // Increased duration
            smoothWheel: true,
            wheelMultiplier: 0.5,  // Reduced wheel multiplier for slower scroll
            touchMultiplier: 0.5,  // Reduced touch multiplier for mobile
            infinite: false
        });

        const handleRaf = (time) => {
            lenis.raf(time);
            requestAnimationFrame(handleRaf);
        };
        requestAnimationFrame(handleRaf);

        const preloadImgs = async () => {
            let imagesloaded = 0;
            const loadedImages = [];

            for (let i = 1; i <= frames.maxIndex; i++) {
                const imgUrl = `./frames/frame_${i.toString().padStart(4, "0")}.jpeg`;
                const img = new Image();
                img.src = imgUrl;
                img.onload = async () => {
                    imagesloaded++;
                    loadedImages[i-1] = img;
                    if (imagesloaded === frames.maxIndex) {
                        setImages(loadedImages);
                        loadImages(0, loadedImages, ctx);
                        setIsLoading(false);
                        
                        const ScrollTrigger = await initGSAP();
                        initScrollAnimation(loadedImages, ctx, ScrollTrigger);
                    }
                };
            }
        };

        const loadImages = (index, imgs, context) => {
            if (index >= 0 && index <= frames.maxIndex && imgs[index]) {
                const img = imgs[index];
                
                canvasRef.current.width = window.innerWidth;
                canvasRef.current.height = window.innerHeight;

                const scaleX = canvasRef.current.width / img.width;
                const scaleY = canvasRef.current.height / img.height;
                const scale = Math.max(scaleX, scaleY);

                const newWidth = img.width * scale;
                const newHeight = img.height * scale;

                const offsetX = (canvasRef.current.width - newWidth) / 2;
                const offsetY = (canvasRef.current.height - newHeight) / 2;

                context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
                context.imageSmoothingEnabled = true;
                context.imageSmoothingQuality = "high";
                context.drawImage(img, offsetX, offsetY, newWidth, newHeight);
                frames.currentIndex = index;
            }
        };

        const initScrollAnimation = (imgs, context, ScrollTrigger) => {
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: "#parent",
                    start: "top top",
                    end: "bottom bottom",
                    scrub: 3,  // Increased scrub value for smoother animation
                    pin: "#child",
                    anticipatePin: 1,
                    immediateRender: false,
                    ease: "power1.inOut"
                }
            });

            tl.to(frames, {
                currentIndex: frames.maxIndex,
                roundProps: "currentIndex",
                ease: "none",  // Linear animation between frames
                onUpdate: () => {
                    if (imgs.length > 0) {
                        loadImages(Math.floor(frames.currentIndex), imgs, context);
                    }
                }
            });
        };

        preloadImgs();

        const handleResize = () => {
            if (images.length > 0) {
                loadImages(frames.currentIndex, images, ctx);
            }
        };
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            lenis.destroy();
            if (typeof window !== 'undefined') {
                import('gsap/ScrollTrigger').then(({ default: ScrollTrigger }) => {
                    ScrollTrigger.getAll().forEach(trigger => trigger.kill());
                });
            }
        };
    }, []);

    return (
        <main className="w-full bg-zinc-900">
            {isLoading && (
                <div className="fixed inset-0 flex items-center justify-center bg-zinc-900 text-white z-50">
                    Loading...
                </div>
            )}
            <div id="parent" className="w-full min-h-[700vh] bg-zinc-900 relative">
                <div id="child" className="w-full h-screen">
                    <canvas ref={canvasRef} className="w-full h-screen" />
                </div>
            </div>
        </main>
    );
};

export default PfloBG;