import {useState, useEffect, useRef} from "react";
import {useParams} from "react-router-dom";
import {doc, getDoc} from "firebase/firestore";
import {db} from "../../firebase";
import {motion, AnimatePresence} from "framer-motion";
import musicSRC from "../assets/bg/bgmusic.mp3";
import titleFontSRC from "../assets/fonts/Kh Ang Penh.ttf"
import guestNameFontSRC from "../assets/fonts/Taprom.ttf"

import {
    Calendar,
    Clock,
    MapPin,
    Image,
    Volume2,
    VolumeX,
    Gift,
    X
} from "lucide-react";
import lineNameImg from "../assets/img/lineName.png";
import buttonOpenImg from "../assets/img/buttonOpen.png";

import {Button} from "../components/ui/button";
import { Separator } from "@/components/ui/separator";
import { WeddingCountdown } from "@/components/CountDown";
import Lottie from "lottie-react";
import giftAnimationData from "../assets/lottie/Referralgift.json";
import arrowAnimationData from "../assets/lottie/arrow.json";

interface Guest {
    id: string;
    fullName: string;
    title?: string;
    email?: string;
    phone?: string;
    address?: string;
}

export default function WeddingFlowPage() {
    // --- Image Optimization Utility ---
    const optimizeUrl = (url: string, options: { width?: number; quality?: number; blur?: number } = {}) => {
        if (!url) return "";
        const { width, quality = 80, blur } = options;
        
        // Cloudinary Optimization
        if (url.includes("res.cloudinary.com")) {
            const parts = url.split("/upload/");
            if (parts.length === 2) {
                const transformations = [
                    "f_auto",
                    "q_auto:eco",
                    width ? `w_${width}` : "",
                    blur ? `e_blur:${blur}` : ""
                ].filter(Boolean).join(",");
                return `${parts[0]}/upload/${transformations}/${parts[1]}`;
            }
            if(parts.length === 3) {
                const transformations = [
                    "f_auto",
                    "q_auto:eco",
                    width ? `w_${width}` : "",
                    blur ? `e_blur:${blur}` : ""
                ].filter(Boolean).join(",");
                return `${parts[0]}/upload/${transformations}/${parts[2]}`;
            }
        }
        
        // ImageKit Optimization
        if (url.includes("ik.imagekit.io")) {
            const separator = url.includes("?") ? "&" : "?";
            const transformations = [
                "tr:f-auto",
                `q-${quality}`,
                width ? `w-${width}` : "",
                blur ? `bl-${blur}` : ""
            ].filter(Boolean).join(",");
            return `${url}${separator}${transformations}`;
        }
        
        return url;
    };

    if (optimizeUrl("https://ik.imagekit.io/lhuqyhzsd/bg-1.mp4/ik-video.mp4?updatedAt=1761989014277")) {
        console.log("Video optimized");
    }

    const bgVideo: string = "https://ik.imagekit.io/lhuqyhzsd/bg-1.mp4/ik-video.mp4?updatedAt=1761989014277";
    const introVideo: string = "https://ik.imagekit.io/lhuqyhzsd/intro2.mp4";
    const bgInfoVideo: string = "https://ik.imagekit.io/lhuqyhzsd/bg-light.mp4?updatedAt=1762929599409";
    
    const info001: string = "https://res.cloudinary.com/dfs1iwbh3/image/upload/v1770878132/Picture7_qltipm.png";
    const photoBanner: string = "https://res.cloudinary.com/dfs1iwbh3/image/upload/v1770788445/0F4A7010_pbmkut.jpg";

    const photos = [
        "https://res.cloudinary.com/dfs1iwbh3/image/upload/v1770790329/0F4A7060_nvozih.jpg",
        "https://res.cloudinary.com/dfs1iwbh3/image/upload/v1770887879/0F4A7418_t0dugr.jpg",
    ];

    if(photos[3] === null) {
        console.log("No photos");
    }
     
    const {id} = useParams();
    const [guest, setGuest] = useState < Guest | null > (null);
    const [loading, setLoading] = useState(true);

    const [stage, setStage] = useState < "invite" | "intro" | "info" > ("invite");
    const [isMusicPlaying, setIsMusicPlaying] = useState(true);
    const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

    const audioRef = useRef < HTMLAudioElement | null > (null);

    useEffect(() => {
        const fetchGuest = async () => {
            try {
                const docRef = doc(db, "guests", id !);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setGuest(docSnap.data()as Guest);
                }
            } finally {
                setLoading(false);
            }
        };
        if (id) 
            fetchGuest();
        

    }, [id, isMusicPlaying]);

    const handleOpenClick = () => {
        setStage("intro");
        // if (audioRef.current) {
        //     audioRef.current.volume = 1.0;
        //     audioRef.current.play().then(() => {
        //         setIsMusicPlaying(true);
        //     }).catch(err => {
        //         console.log("Music autoplay blocked:", err);
        //     });
        // }
    };

    // removed unused handleIntroEnded

    useEffect(() => { // if (stage == 'info') {
        if (audioRef.current) {
            audioRef.current !.volume = 0.5;
            audioRef.current !.play()
        }
        // }
    }, [audioRef.current])

    const toggleMusic = () => {
        if (! audioRef.current) 
            return;
        if (isMusicPlaying) {
            audioRef.current.pause();
            setIsMusicPlaying(false);
        } else {
            audioRef.current.play();
            setIsMusicPlaying(true);
        }
    };

    const scrollToSection = (id : string) => {
        const section = document.getElementById(id);
        if (section)
            section.scrollIntoView({behavior: "smooth"});
        

    };

    const fadeVariants = {
        hidden: {
            opacity: 0
        },
        visible: {
            opacity: 1,
            transition: {
                duration: 1
            }
        },
        exit: {
            opacity: 0,
            transition: {
                duration: 1
            }
        }
    }; <style>{
        `
        @font-face {
          font-family: 'TitleFont';
          src: url(${titleFontSRC}) format('truetype');
          font-display: swap;
        }
        @font-face {
          font-family: 'GuestNameFont';
          src: url(${guestNameFontSRC}) format('truetype');
          font-display: swap;
        }
        .golden-metallic-text {
          background: linear-gradient(to bottom, #FCF6BA 0%, #BF953F 22%, #8A6E2F 50%, #BF953F 78%, #FCF6BA 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          filter: drop-shadow(0 2px 2px rgba(0,0,0,0.5));
          font-weight: bold;
        }
        .khmer-gold-border {
          border: 1px solid transparent;
          background: linear-gradient(#1a1103, #1a1103) padding-box,
                      linear-gradient(to bottom, #BF953F, #FCF6BA, #8A6E2F) border-box;
        }
        .ornate-separator {
          height: 2px;
          background: linear-gradient(to right, transparent, #BF953F, #FCF6BA, #BF953F, transparent);
          position: relative;
        }
        .ornate-separator::before {
          content: '❖';
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          color: #FCF6BA;
          font-size: 12px;
          text-shadow: 0 0 5px rgba(138, 110, 47, 0.8);
        }
      `
    }</style>

if (loading) 
        return <div>Loading...</div>;
    return (
        <div className="relative w-full h-screen overflow-hidden">
            <audio ref={audioRef}
                src={musicSRC}
                loop
                preload="auto"/>
            
            {/* Photo Modal */}
            <AnimatePresence>
                {selectedPhoto && (
                    <motion.div 
                        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedPhoto(null)}
                    >
                        <motion.div
                            className="relative max-w-4xl max-h-full"
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.8 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button 
                                className="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-75 transition"
                                onClick={() => setSelectedPhoto(null)}
                            >
                                <X size={24} />
                            </button>
                            <img 
                                src={optimizeUrl(selectedPhoto, { width: 1600 })} 
                                alt="Selected" 
                                className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
                            />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
            
            <AnimatePresence mode="wait">
                {
                stage === "invite" && (
                    <motion.div key="invite" className="absolute inset-0"
                        variants={fadeVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit">
                        <video src={bgVideo}
                            autoPlay
                            muted
                            loop
                            playsInline
                            className="absolute inset-0 w-full h-full object-fill"/>

                        <div className="absolute inset-0 flex flex-col items-center justify-end text-center text-white">
                            <style>{
                                `
                                @font-face {
                                font-family: 'TitleFont';
                                src: url(${titleFontSRC}) format('truetype');
                                }
                                @font-face {
                                font-family: 'GuestNameFont';
                                src: url(${guestNameFontSRC}) format('truetype');
                                }
                            `
                            }</style>
                            <h1 className="text-2xl w-2/3">
                                <span className="golden-text"
                                    style={
                                        {
                                            fontFamily: "TitleFont",
                                            fontSize: "22px"
                                        }
                                }>
                                    {
                                    guest ?. title
                                } </span>
                                {" "}
                                <span className="golden-text"
                                    style={
                                        {
                                            fontFamily: "GuestNameFont",
                                            fontSize: "1.2rem"
                                        }
                                }>
                                    {
                                    guest ?. fullName
                                } </span>
                            </h1>
                            <img src={lineNameImg}
                                className="w-96 mb-6"/>
                            <motion.img src={buttonOpenImg}
                                className="w-50 mb-33 cursor-pointer bg-amber-50"
                                onClick={handleOpenClick}
                                animate={
                                    {
                                        scale: [
                                            1, 1.1, 1
                                        ],
                                        opacity: [1, 0.9, 1]
                                    }
                                }
                                transition={
                                    {
                                        duration: 2,
                                        repeat: Infinity,
                                        repeatType: "loop",
                                        ease: "easeInOut"
                                    }
                                }/>
                        </div>
                    </motion.div>
                )
            }

                {
                stage === "intro" && (
                    <motion.div key="intro" className="absolute inset-0"
                        variants={fadeVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit">
                        <video src={introVideo}
                            autoPlay
                            playsInline
                            preload="auto"
                            muted={true}
                            controls={false}
                            className="absolute inset-0 w-full h-full object-cover"
                            onEnded={
                                () => { 
                                    setStage("info")
                                }
                            }
                            onLoadedData={
                                (e) => {
                                    const video = e.currentTarget;
                                    video.play().catch(err => {
                                        console.error("Video play failed:", err);
                                    });
                                }
                            }/>
                    </motion.div>
                )
            }
                {
                stage === "info" && (
                    <motion.div key="info" className="absolute inset-0 w-full h-full overflow-y-auto"
                        variants={fadeVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit">
                        {/* Top-right music toggle */}
                        <Button onClick={toggleMusic}
                            variant="outline" size="icon" className="rounded-full bg-amber-800 border-amber-500 fixed top-4 right-4 z-50 ">
                            {
                            isMusicPlaying ? <Volume2 size={20} className="text-yellow-400"/> : <VolumeX size={20} className="text-yellow-400"/>
                        } </Button>

                        {/* Bottom floating buttons */}
                        <div className="fixed  bottom-6 left-1/2 -translate-x-1/2 flex justify-between gap-3 z-50 bg-amber-900  rounded-full p-4 border-1 border-amber-500 by">
                            <Button onClick={
                                    () => scrollToSection("calendar")
                                }
                               variant="outline" size="icon" className="rounded-full bg-amber-800 border-amber-500">
                                <Calendar size={24} className="text-yellow-400"/>
                            </Button>
                             <Button onClick={
                                    () => scrollToSection("time")
                                }
                               variant="outline" size="icon" className="rounded-full bg-amber-800 border-amber-500">
                                <Clock size={24} className="text-yellow-400"/>
                            </Button>
                            <Button onClick={
                                    () => scrollToSection("map")
                                }
                                variant="outline" size="icon" className="rounded-full bg-amber-800 border-amber-500">
                                <MapPin size={24} className="text-yellow-400"/>
                            </Button>
                            <Button onClick={
                                    () => scrollToSection("gallery")
                                }
                                variant="outline" size="icon" className="rounded-full bg-amber-800 border-amber-500">
                                <Image size={24} className="text-yellow-400"/>
                            </Button>
                            <Button onClick={
                                    () => scrollToSection("gift")
                                }
                                variant="outline" size="icon" className="rounded-full bg-amber-800 border-amber-500">
                                <Gift size={24} className="text-yellow-400"/>
                            </Button>
                            {/* <Button onClick={
                                    () => scrollToSection("message")
                                }
                                variant="outline" size="icon" className="rounded-full bg-amber-800 border-amber-500">
                                <MessageSquare size={24} className="text-yellow-400"/>
                            </Button> */}
                        </div>
                        {/* Section content with background video */}
                        <div className="relative w-full min-h-screen overflow-x-hidden">
                            {/* Fixed background video */}
                            <video src={bgInfoVideo}
                                autoPlay
                                muted
                                loop
                                playsInline
                                className="fixed left-[50%] top-1/2 h-[120%] w-[120%]  object-cover -z-10  bg-cover"
                                // className="fixed top-0 left-0 w-full h-full object-cover -z-10"
 
                                style={
                                    {touchAction: 'none', transform: "translate(-50%, -50%) scale(1.1)"}
                                }/> {/* Scrollable sections */}
                            <section id="calendar" className="flex flex-col items-center justify-center bg-transparent">
                                
                                <div className="flex flex-col items-center justify-center">

                                    <img src={optimizeUrl("https://res.cloudinary.com/dfs1iwbh3/image/upload/v1770886092/Name_copy_2_ts4ncy.png", { width: 600 })}
                                    alt=""
                                    className="mt-[40px] w-60"/>
                                    <img src={info001}
                                    alt=""
                                    className="p-4 scale-[1.1]"/>

                                </div>
                                <div>
                                    <img src={optimizeUrl("https://res.cloudinary.com/dfs1iwbh3/image/upload/v1770886093/Untitled_design_2_pnzehy.png", { width: 600 })}
                                        alt=""
                                        className="mt-[50px] w-60"/>
                                    
                                </div>
                                <div style={{fontFamily: "Nellasue", fontSize: "1.5rem", color: "#a27501", paddingTop: "10px"}}>
                                    Mr. Khourn Ramy
                                </div>
                                <div style={{color: "#a27501"}} className="pt-5">
                                    Forever in love with
                                </div>
                                 <div>
                                    <img src={optimizeUrl("https://res.cloudinary.com/dfs1iwbh3/image/upload/v1770886093/Untitled_design_pzd19h.png", { width: 600 })}
                                        alt=""
                                        className="mt-[30px] w-60"/>
                                    
                                </div>
                                <div style={{fontFamily: "Nellasue", fontSize: "1.5rem", color: "#a27501"}}>
                                    Ms. Hour Mengchou
                                </div>
                            </section>
                            <div className="flex flex-row items-center justify-center pt-28 pb-6 w-full" id="">
                                <div className="flex-1 px-4">
                                    <Separator className="bg-gradient-to-r from-transparent via-[#BF953F] to-transparent"/>
                                </div>
                                <div className="px-6 items-center justify-center flex">
                                    <div style={{fontFamily: "Moulpali", fontSize: "1.5rem", color: "#BF953F"}} className="golden-metallic-text">
                                        វិរៈកម្មវិធី
                                    </div>
                                </div>
                                <div className="flex-1 px-4">
                                    <Separator className="bg-gradient-to-r from-transparent via-[#BF953F] to-transparent"/>
                                </div>
                            </div>
                            <section id="" className="flex items-center justify-center bg-transparent">
                                <div className="p-5">
                                    <img src={optimizeUrl("https://res.cloudinary.com/dfs1iwbh3/image/upload/v1770864787/Form-2_PNG_ziz6ij.png", { width: 800 })}
                                    alt=""
                                   />
                                </div>
                            </section>
                            {/* <section id="calendar" className="flex items-center justify-center bg-transparent">
                                <img src={info002}
                                    alt=""
                                    className="max-w-full max-h-full"/>
                            </section> */}
                               <div className="flex flex-row items-center justify-center pt-28 pb-4" id="time">
                                <div className="flex-1 px-4">
                                    <Separator className="bg-gradient-to-r from-transparent via-[#BF953F] to-transparent"/>
                                </div>
                                <div className="px-6 items-center justify-center flex text-center">
                                    <div style={{fontFamily: "Moulpali", fontSize: "1.2rem", color: "#BF953F"}} className="golden-metallic-text">
                                        ម៉ោងរាប់ថយក្រោយ
                                    </div>
                                </div>
                                <div className="flex-1 px-4">
                                    <Separator className="bg-gradient-to-r from-transparent via-[#BF953F] to-transparent"/>
                                </div>
                               

                            </div>
                            <div className="relative z-20 -mb-16 mt-16 w-full">
                                <WeddingCountdown
                                    weddingDate="2026-03-22T17:00:00"
                                />
                             </div>
                            <section id="photo" className="relative z-10 flex justify-center items-center px-4 pb-8">
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 1, ease: "easeOut" }}
                                    className="relative group max-w-4xl w-full"
                                >
                                    {/* Traditional Gold Frame */}
                                    <div className="absolute -inset-2 border border-amber-500/30 rounded-[1.5rem] pointer-events-none" />
                                    
                                    {/* Main Photo Container */}
                                    <div className="relative p-1.5 overflow-hidden rounded-xl border-2 border-amber-500/50 bg-[#1a1103]/40 backdrop-blur-sm shadow-[0_15px_45px_rgba(0,0,0,0.5)]">
                                        <img 
                                            src={optimizeUrl(photoBanner, { width: 1200 })}
                                            alt="Wedding Banner"
                                            loading="lazy"
                                            className="w-full h-auto max-h-[75vh] object-cover rounded-lg"
                                        />
                                        
                                        {/* Elegant Gradient Overlay */}
                                        <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                                    </div>

                                    {/* Khmer Traditional Corner Accents */}
                                    <div className="absolute -top-1 -left-1 w-8 h-8 border-t-2 border-l-2 border-[#BF953F] rounded-tl-lg shadow-[0_0_10px_rgba(191,149,63,0.3)]" />
                                    <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-2 border-r-2 border-[#BF953F] rounded-br-lg shadow-[0_0_10px_rgba(191,149,63,0.3)]" />
                                </motion.div>
                            </section>
                            <section id="banner-video" className="relative z-10 flex justify-center items-center px-4 py-8">
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 1, ease: "easeOut" }}
                                    className="relative group max-w-4xl w-full"
                                >
                                    {/* Traditional Gold Frame */}
                                    <div className="absolute -inset-2 border border-amber-500/30 rounded-[1.5rem] pointer-events-none" />
                                    
                                    {/* Video Container */}
                                    <div className="relative p-1.5 overflow-hidden rounded-xl border-2 border-amber-500/50 bg-[#1a1103]/40 backdrop-blur-sm shadow-[0_15px_45px_rgba(0,0,0,0.5)]">
                                        <video src={"https://ik.imagekit.io/lhuqyhzsd/video/VID_20251017122915592.MP4/ik-video.mp4?updatedAt=1762941643378"}
                                            autoPlay
                                            muted
                                            loop
                                            playsInline
                                            className="w-full h-auto max-h-[75vh] object-cover rounded-lg"
                                        />
                                        
                                        {/* Overlay Glow */}
                                        <div className="absolute inset-0 pointer-events-none ring-1 ring-inset ring-amber-500/20 shadow-[inset_0_0_100px_rgba(0,0,0,0.15)]" />
                                    </div>

                                    {/* Corner Accents */}
                                    <div className="absolute -top-1 -left-1 w-8 h-8 border-t-2 border-l-2 border-[#BF953F] rounded-tl-lg shadow-[0_0_10px_rgba(191,149,63,0.3)]" />
                                    <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-2 border-r-2 border-[#BF953F] rounded-br-lg shadow-[0_0_10px_rgba(191,149,63,0.3)]" />
                                </motion.div>
                            </section>
                            
                            {/* <div className="mt-10" id="map">
                                <motion.img src={locationtitle}
                                    alt=""
                                    className="object-cover"
                                    animate={
                                        {
                                            scale: [
                                                0.95, 1.05, 0.95
                                            ],
                                            opacity: [0.9, 1, 0.9]
                                        }
                                    }
                                    transition={
                                        {
                                            duration: 2.5,
                                            ease: "easeInOut",
                                            repeat: Infinity,
                                            repeatType: "loop"
                                        }
                                    }/>
                            </div> */}
                            <div className="flex flex-row items-center justify-center pt-28 pb-4 w-full" id="map">
                                <div className="flex-1 px-4">
                                    <Separator className="bg-gradient-to-r from-transparent via-[#BF953F] to-transparent" />
                                </div>
                                <div className="px-6 items-center justify-center flex">
                                    <div style={{fontFamily: "Moulpali", fontSize: "1.5rem", color: "#BF953F"}} className="golden-metallic-text">
                                        ទីតាំងកម្មវិធី
                                    </div>
                                </div>
                                <div className="flex-1 px-4">
                                    <Separator className="bg-gradient-to-r from-transparent via-[#BF953F] to-transparent" />
                                </div>
                            </div>
                            <section className="bg-transparent flex justify-center items-center px-6 py-12 md:p-12">
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.8, ease: "easeOut" }}
                                    className="relative group max-w-2xl"
                                >
                                    {/* Decorative Outer Border */}
                                    <div className="absolute -inset-3 border border-amber-500/20 rounded-[2rem] pointer-events-none" />
                                    
                                    {/* Glass Container */}
                                    <div className="relative p-1.5 overflow-hidden rounded-xl border-2 border-amber-500/50 bg-[#1a1103]/40 backdrop-blur-sm shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
                                        <img 
                                            src={optimizeUrl("https://res.cloudinary.com/dfs1iwbh3/image/upload/v1770781768/Screenshot_2026-02-11_104622_v0fqgy.png", { width: 800 })}
                                            alt="Wedding Location Map"
                                            loading="lazy"
                                            className="w-full h-auto rounded-lg transition-transform duration-1000 group-hover:scale-[1.01]"
                                        />
                                        
                                        {/* Overlay Glow */}
                                        <div className="absolute inset-0 pointer-events-none rounded-lg ring-1 ring-inset ring-amber-500/20 shadow-[inset_0_0_100px_rgba(0,0,0,0.15)]" />
                                    </div>

                                    {/* Corner Accents */}
                                    <div className="absolute -top-1 -left-1 w-8 h-8 border-t-2 border-l-2 border-[#BF953F] rounded-tl-lg shadow-[0_0_10px_rgba(191,149,63,0.3)]" />
                                    <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-2 border-r-2 border-[#BF953F] rounded-br-lg shadow-[0_0_10px_rgba(191,149,63,0.3)]" />
                                </motion.div>
                            </section>
                            <div className="flex flex-row items-center justify-center pt-8 pb-4" id="map-button">
                                <a href="https://maps.app.goo.gl/eDfFnEecVdKs1NyM9" target="_blank">
                                    <motion.img src={optimizeUrl("https://ik.imagekit.io/lhuqyhzsd/button/btn_loc.png?updatedAt=1762930145649", { width: 300 })}
                                    alt="googlemap_button"
                                    loading="lazy"
                                    className="object-cover w-40"
                                    
                                    animate={
                                        {
                                            scale: [
                                                0.95, 1.05, 0.95
                                            ],
                                            opacity: [0.9, 1, 0.9]
                                        }
                                    }
                                    transition={
                                        {
                                            duration: 2.5,
                                            ease: "easeInOut",
                                            repeat: Infinity,
                                            repeatType: "loop"
                                        }
                                    }/>
                                </a>
                            </div>

                            <div className="flex flex-row items-center justify-center pt-32 pb-8 w-full" id="gallery">
                                <div className="flex-1 px-4">
                                    <Separator className="bg-gradient-to-r from-transparent via-[#BF953F] to-transparent"/>
                                </div>
                                <div className="px-6 items-center justify-center flex">
                                    <div style={{fontFamily: "Moulpali", fontSize: "1.5rem", color: "#BF953F"}} className="golden-metallic-text">
                                        វិចត្រសាល
                                    </div>
                                </div>
                                <div className="flex-1 px-4">
                                    <Separator className="bg-gradient-to-r from-transparent via-[#BF953F] to-transparent"/>
                                </div>
                            </div>
                            <section id="gallery-framed" className="relative z-10 flex justify-center items-center px-4 py-8">
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 1, ease: "easeOut" }}
                                    className="relative group max-w-6xl w-full"
                                >
                                    {/* Traditional Gold Frame */}
                                    <div className="absolute -inset-2 border border-amber-500/30 rounded-[2rem] pointer-events-none" />
                                    
                                    {/* Main Gallery Container */}
                                    <div className="relative p-2 overflow-hidden rounded-xl border-2 border-amber-500/50 bg-[#1a1103]/40 backdrop-blur-sm shadow-[0_15px_45px_rgba(0,0,0,0.5)]">
                                        <div className="grid grid-cols-4 gap-3 sm:gap-4 p-1 sm:p-2">
                                    <div className="col-span-4 row-span-4 bg-amber-900/20 h-70 rounded-lg">
                                        <img 
                                            src={optimizeUrl(photos[0], { width: 600 })} 
                                            alt="" 
                                            loading="lazy"
                                            className="object-cover w-full h-full rounded-lg cursor-pointer hover:opacity-90 transition-opacity" 
                                            onClick={() => setSelectedPhoto(photos[0])}
                                        />
                                    </div>
                                    <div className="col-span-2 bg-[#1a1103]/40 h-40 rounded-xl">
                                        <img 
                                            src={optimizeUrl(photos[1], { width: 400 })}
                                            alt="" 
                                            loading="lazy"
                                            className="object-cover w-full h-full rounded-lg cursor-pointer hover:opacity-90 transition-opacity" 
                                            onClick={() => setSelectedPhoto(photos[1])}
                                        />
                                    </div>
                                    <div className="col-span-2 bg-[#1a1103]/40 h-40 rounded-xl">
                                        <img 
                                            src={optimizeUrl(photos[2], { width: 400 })} 
                                            alt="" 
                                            loading="lazy"
                                            className="object-cover w-full h-full rounded-lg cursor-pointer hover:opacity-90 transition-opacity" 
                                            onClick={() => setSelectedPhoto(photos[2])}
                                        />
                                    </div>
                                    <div className="col-span-4 row-span-4 bg-amber-900/20 h-70 rounded-lg">
                                        <img 
                                            src={optimizeUrl(photos[3], { width: 600 })} 
                                            alt="" 
                                            loading="lazy"
                                            className="object-cover w-full h-full rounded-lg cursor-pointer hover:opacity-90 transition-opacity" 
                                            onClick={() => setSelectedPhoto(photos[3])}
                                        />
                                    </div>
                                    <div className="col-span-2 bg-[#1a1103]/40 h-80 rounded-xl">
                                        <img 
                                            src={optimizeUrl(photos[4], { width: 400 })} 
                                            alt="" 
                                            loading="lazy"
                                            className="object-cover w-full h-full rounded-lg cursor-pointer hover:opacity-90 transition-opacity" 
                                            onClick={() => setSelectedPhoto(photos[4])}
                                        />
                                    </div>
                                    <div className="col-span-2 bg-[#1a1103]/40 h-80 rounded-xl">
                                        <img 
                                            src={optimizeUrl(photos[5], { width: 400 })}
                                            alt="" 
                                            loading="lazy"
                                            className="object-cover w-full h-full rounded-lg cursor-pointer hover:opacity-90 transition-opacity" 
                                            onClick={() => setSelectedPhoto(photos[5])}
                                        />
                                    </div>
                                    <div className="col-span-2  bg-[#1a1103]/40 h-80 rounded-xl">
                                        <img
                                            src={optimizeUrl(photos[6], { width: 400 })}
                                            alt="" 
                                            loading="lazy"
                                            className="object-cover w-full h-full rounded-lg cursor-pointer hover:opacity-90 transition-opacity" 
                                            onClick={() => setSelectedPhoto(photos[6])}
                                        />
                                    </div>
                                    <div className="col-span-2 bg-[#1a1103]/40 h-80 rounded-xl">
                                        <img 
                                            src={optimizeUrl(photos[7], { width: 400 })} 
                                            alt="" 
                                            loading="lazy"
                                            className="object-cover w-full h-full rounded-lg cursor-pointer hover:opacity-90 transition-opacity" 
                                            onClick={() => setSelectedPhoto(photos[7])}
                                        />
                                    </div>
                                    <div className="col-span-4 row-span-4 bg-amber-900/20 h-70 rounded-lg">
                                        <img 
                                            src={optimizeUrl(photos[8], { width: 600 })} 
                                            alt="" 
                                            loading="lazy"
                                            className="object-cover w-full h-full rounded-lg cursor-pointer hover:opacity-90 transition-opacity" 
                                            onClick={() => setSelectedPhoto(photos[8])}
                                        />
                                    </div>
                                    <div className="col-span-2 bg-[#1a1103]/40 h-40 rounded-xl">
                                        <img 
                                            src={optimizeUrl(photos[9], { width: 400 })} 
                                            alt="" 
                                            loading="lazy"
                                            className="object-cover w-full h-full rounded-lg cursor-pointer hover:opacity-90 transition-opacity" 
                                            onClick={() => setSelectedPhoto(photos[9])}
                                        />
                                    </div>
                                    <div className="col-span-2 bg-[#1a1103]/40 h-40 rounded-xl">
                                        <img 
                                            src={optimizeUrl(photos[10], { width: 400 })} 
                                            alt="" 
                                            loading="lazy"
                                            className="object-cover w-full h-full rounded-lg cursor-pointer hover:opacity-90 transition-opacity" 
                                            onClick={() => setSelectedPhoto(photos[10])}
                                        />
                                    </div>
                                    <div className="col-span-4 row-span-4 bg-amber-900/20 h-70 rounded-lg">
                                        <img 
                                            src={optimizeUrl(photos[11], { width: 600 })} 
                                            alt="" 
                                            loading="lazy"
                                            className="object-cover w-full h-full rounded-lg cursor-pointer hover:opacity-90 transition-opacity" 
                                            onClick={() => setSelectedPhoto(photos[11])}
                                        />
                                    </div>
                                    <div className="col-span-2 bg-[#1a1103]/40 h-80 rounded-xl">
                                        <img 
                                            src={optimizeUrl(photos[12], { width: 400 })} 
                                            alt="" 
                                            loading="lazy"
                                            className="object-cover w-full h-full rounded-lg cursor-pointer hover:opacity-90 transition-opacity" 
                                            onClick={() => setSelectedPhoto(photos[12])}
                                        />
                                    </div>
                                    <div className="col-span-2 bg-[#1a1103]/40 h-80 rounded-xl">
                                        <img 
                                            src={optimizeUrl(photos[13], { width: 400 })} 
                                            alt="" 
                                            loading="lazy"
                                            className="object-cover w-full h-full rounded-lg cursor-pointer hover:opacity-90 transition-opacity" 
                                            onClick={() => setSelectedPhoto(photos[13])}
                                        />
                                    </div>
                                    <div className="col-span-2 bg-[#1a1103]/40 h-80 rounded-xl">
                                        <img 
                                            src={optimizeUrl(photos[14], { width: 400 })} 
                                            alt="" 
                                            loading="lazy"
                                            className="object-cover w-full h-full rounded-lg cursor-pointer hover:opacity-90 transition-opacity" 
                                            onClick={() => setSelectedPhoto(photos[14])}
                                        />
                                    </div>
                                    <div className="col-span-2 bg-[#1a1103]/40 h-80 rounded-xl">
                                        <img 
                                            src={optimizeUrl(photos[15], { width: 400 })} 
                                            alt="" 
                                            loading="lazy"
                                            className="object-cover w-full h-full rounded-lg cursor-pointer hover:opacity-90 transition-opacity" 
                                            onClick={() => setSelectedPhoto(photos[15])}
                                        />
                                    </div>
                                    <div className="col-span-4 row-span-4 bg-amber-900/20 h-70 rounded-lg">
                                        <img 
                                            src={optimizeUrl(photos[16], { width: 600 })} 
                                            alt="" 
                                            loading="lazy"
                                            className="object-cover w-full h-full rounded-lg cursor-pointer hover:opacity-90 transition-opacity" 
                                            onClick={() => setSelectedPhoto(photos[16])}
                                        />
                                    </div>
                                    <div className="col-span-2 bg-[#1a1103]/40 h-40 rounded-xl">
                                        <img 
                                            src={optimizeUrl(photos[17], { width: 400 })} 
                                            alt="" 
                                            loading="lazy"
                                            className="object-cover w-full h-full rounded-lg cursor-pointer hover:opacity-90 transition-opacity" 
                                            onClick={() => setSelectedPhoto(photos[17])}
                                        />
                                    </div>
                                    <div className="col-span-2 bg-[#1a1103]/40 h-40 rounded-xl">
                                        <img 
                                            src={optimizeUrl(photos[18], { width: 400 })} 
                                            alt="" 
                                            loading="lazy"
                                            className="object-cover w-full h-full rounded-lg cursor-pointer hover:opacity-90 transition-opacity" 
                                            onClick={() => setSelectedPhoto(photos[18])}
                                        />
                                    </div>
                                    <div className="col-span-4 row-span-4 bg-amber-900/20 h-70 rounded-lg">
                                         <img 
                                            src={optimizeUrl(photos[19], { width: 600 })}
                                            alt="" 
                                            loading="lazy"
                                            className="object-cover w-full h-full rounded-lg cursor-pointer hover:opacity-90 transition-opacity" 
                                            onClick={() => setSelectedPhoto(photos[19])}
                                        />
                                    </div>
                                    <div className="col-span-2 bg-[#1a1103]/40 h-40 rounded-xl">
                                        <img 
                                            src={optimizeUrl(photos[20], { width: 400 })} 
                                            alt="" 
                                            loading="lazy"
                                            className="object-cover w-full h-full rounded-lg cursor-pointer hover:opacity-90 transition-opacity" 
                                            onClick={() => setSelectedPhoto(photos[20])}
                                        />
                                    </div>
                                    <div className="col-span-2 bg-[#1a1103]/40 h-40 rounded-xl">
                                        <img 
                                            src={optimizeUrl(photos[21], { width: 400 })} 
                                            alt="" 
                                            loading="lazy"
                                            className="object-cover w-full h-full rounded-lg cursor-pointer hover:opacity-90 transition-opacity" 
                                            onClick={() => setSelectedPhoto(photos[21])}
                                        />
                                    </div>
                                    <div className="col-span-4 row-span-4 bg-amber-900/20 h-70 rounded-lg">
                                        <img 
                                            src={optimizeUrl(photos[22], { width: 600 })} 
                                            alt="" 
                                            loading="lazy"
                                            className="object-cover w-full h-full rounded-lg cursor-pointer hover:opacity-90 transition-opacity" 
                                            onClick={() => setSelectedPhoto(photos[22])}
                                        />
                                    </div>
                                    <div className="col-span-2 bg-[#1a1103]/40 h-80 rounded-xl">
                                        <img 
                                            src={optimizeUrl(photos[23], { width: 400 })} 
                                            alt="" 
                                            loading="lazy"
                                            className="object-cover w-full h-full rounded-lg cursor-pointer hover:opacity-90 transition-opacity" 
                                            onClick={() => setSelectedPhoto(photos[23])}
                                        />
                                    </div>
                                    <div className="col-span-2 bg-[#1a1103]/40 h-80 rounded-xl">
                                        <img 
                                            src={optimizeUrl(photos[24], { width: 400 })} 
                                            alt="" 
                                            loading="lazy"
                                            className="object-cover w-full h-full rounded-lg cursor-pointer hover:opacity-90 transition-opacity" 
                                            onClick={() => setSelectedPhoto(photos[24])}
                                        />
                                    </div>
                                    <div className="col-span-2 bg-[#1a1103]/40 h-40 rounded-xl">
                                        <img 
                                            src={optimizeUrl(photos[25], { width: 400 })} 
                                            alt="" 
                                            loading="lazy"
                                            className="object-cover w-full h-full rounded-lg cursor-pointer hover:opacity-90 transition-opacity" 
                                            onClick={() => setSelectedPhoto(photos[25])}
                                        />
                                    </div>
                                    <div className="col-span-2 bg-[#1a1103]/40 h-40 rounded-xl">
                                        <img 
                                            src={optimizeUrl(photos[26], { width: 400 })} 
                                            alt="" 
                                            loading="lazy"
                                            className="object-cover w-full h-full rounded-lg cursor-pointer hover:opacity-90 transition-opacity" 
                                            onClick={() => setSelectedPhoto(photos[26])}
                                        />
                                    </div>


                                    <div className="col-span-4 row-span-4 bg-amber-900/20 h-70 rounded-lg">
                                        <img 
                                            src={optimizeUrl(photos[27], { width: 600 })} 
                                            alt="" 
                                            loading="lazy"
                                            className="object-cover w-full h-full rounded-lg cursor-pointer hover:opacity-90 transition-opacity" 
                                            onClick={() => setSelectedPhoto(photos[27])}
                                        />
                                    </div>
                                    <div className="col-span-2 bg-[#1a1103]/40 h-80 rounded-xl">
                                        <img 
                                            src={optimizeUrl(photos[28], { width: 400 })} 
                                            alt="" 
                                            loading="lazy"
                                            className="object-cover w-full h-full rounded-lg cursor-pointer hover:opacity-90 transition-opacity" 
                                            onClick={() => setSelectedPhoto(photos[28])}
                                        />
                                    </div>
                                    <div className="col-span-2 bg-[#1a1103]/40 h-80 rounded-xl">
                                        <img 
                                            src={optimizeUrl(photos[29], { width: 400 })} 
                                            alt="" 
                                            loading="lazy"
                                            className="object-cover w-full h-full rounded-lg cursor-pointer hover:opacity-90 transition-opacity" 
                                            onClick={() => setSelectedPhoto(photos[29])}
                                        />
                                    </div>
                                    
                                    <div className="col-span-4 row-span-4 bg-amber-900/20 h-70 rounded-lg">
                                        <img 
                                            src={optimizeUrl(photos[30], { width: 600 })} 
                                            alt="" 
                                            loading="lazy"
                                            className="object-cover w-full h-full rounded-lg cursor-pointer hover:opacity-90 transition-opacity" 
                                            onClick={() => setSelectedPhoto(photos[30])}
                                        />
                                    </div>
                                    <div className="col-span-2 bg-[#1a1103]/40 h-80 rounded-xl">
                                         <img 
                                            src={optimizeUrl(photos[31], { width: 400 })} 
                                            alt="" 
                                            loading="lazy"
                                            className="object-cover w-full h-full rounded-lg cursor-pointer hover:opacity-90 transition-opacity" 
                                            onClick={() => setSelectedPhoto(photos[31])}
                                        />
                                    </div>
                                    <div className="col-span-2 bg-[#1a1103]/40 h-80 rounded-xl">
                                         <img 
                                            src={optimizeUrl(photos[32], { width: 400 })} 
                                            alt="" 
                                            loading="lazy"
                                            className="object-cover w-full h-full rounded-lg cursor-pointer hover:opacity-90 transition-opacity" 
                                            onClick={() => setSelectedPhoto(photos[32])}
                                        />
                                    </div>

                                    <div className="col-span-2 bg-[#1a1103]/40 h-40 rounded-xl">
                                        <img 
                                            src={optimizeUrl(photos[33], { width: 400 })} 
                                            alt="" 
                                            loading="lazy"
                                            className="object-cover w-full h-full rounded-lg cursor-pointer hover:opacity-90 transition-opacity" 
                                            onClick={() => setSelectedPhoto(photos[33])}
                                        />
                                    </div>
                                    <div className="col-span-2 bg-[#1a1103]/40 h-40 rounded-xl">
                                        <img 
                                            src={optimizeUrl(photos[34], { width: 400 })} 
                                            alt="" 
                                            loading="lazy"
                                            className="object-cover w-full h-full rounded-lg cursor-pointer hover:opacity-90 transition-opacity" 
                                            onClick={() => setSelectedPhoto(photos[34])}
                                        />
                                    </div>

                                    <div className="col-span-4 row-span-4 bg-amber-900/20 h-70 rounded-lg">
                                        <img 
                                            src={optimizeUrl(photos[35], { width: 600 })} 
                                            alt="" 
                                            loading="lazy"
                                            className="object-cover w-full h-full rounded-lg cursor-pointer hover:opacity-90 transition-opacity" 
                                            onClick={() => setSelectedPhoto(photos[35])}
                                        />
                                    </div>
                                    <div className="col-span-2 bg-[#1a1103]/40 h-80 rounded-xl">
                                         <img 
                                            src={optimizeUrl(photos[36], { width: 400 })} 
                                            alt="" 
                                            loading="lazy"
                                            className="object-cover w-full h-full rounded-lg cursor-pointer hover:opacity-90 transition-opacity" 
                                            onClick={() => setSelectedPhoto(photos[36])}
                                        />
                                    </div>
                                    <div className="col-span-2 bg-[#1a1103]/40 h-80 rounded-xl">
                                         <img 
                                            src={optimizeUrl(photos[37], { width: 400 })} 
                                            alt="" 
                                            loading="lazy"
                                            className="object-cover w-full h-full rounded-lg cursor-pointer hover:opacity-90 transition-opacity" 
                                            onClick={() => setSelectedPhoto(photos[37])}
                                        />
                                    </div>
                                    <div className="col-span-4 row-span-4 bg-amber-900/20 h-70 rounded-lg">
                                        <img 
                                            src={optimizeUrl(photos[38], { width: 600 })} 
                                            alt="" 
                                            loading="lazy"
                                            className="object-cover w-full h-full rounded-lg cursor-pointer hover:opacity-90 transition-opacity" 
                                            onClick={() => setSelectedPhoto(photos[38])}
                                        />
                                    </div>
                                    <div className="col-span-2 bg-[#1a1103]/40 h-80 rounded-xl">
                                         <img 
                                            src={optimizeUrl(photos[39], { width: 400 })} 
                                            alt="" 
                                            loading="lazy"
                                            className="object-cover w-full h-full rounded-lg cursor-pointer hover:opacity-90 transition-opacity" 
                                            onClick={() => setSelectedPhoto(photos[39])}
                                        />
                                    </div>
                                    <div className="col-span-2 bg-[#1a1103]/40 h-80 rounded-xl">
                                         <img 
                                            src={optimizeUrl(photos[40], { width: 400 })} 
                                            alt="" 
                                            loading="lazy"
                                            className="object-cover w-full h-full rounded-lg cursor-pointer hover:opacity-90 transition-opacity" 
                                            onClick={() => setSelectedPhoto(photos[40])}
                                        />
                                    </div>
                                        </div>
                                    </div>

                                    {/* Khmer Traditional Corner Accents */}
                                    <div className="absolute -top-2 -left-2 w-10 h-10 border-t-2 border-l-2 border-[#BF953F] rounded-tl-[1.5rem] shadow-[0_0_15px_rgba(191,149,63,0.4)]" />
                                    <div className="absolute -bottom-2 -right-2 w-10 h-10 border-b-2 border-r-2 border-[#BF953F] rounded-br-[1.5rem] shadow-[0_0_15px_rgba(191,149,63,0.4)]" />
                                </motion.div>
                            </section>
                            <div className="flex flex-row items-center justify-center pt-32 pb-8 w-full" id="gift">
                                <div className="flex-1 px-4">
                                    <Separator className="bg-gradient-to-r from-transparent via-[#BF953F] to-transparent"/>
                                </div>
                                <div className="px-6 items-center justify-center flex">
                                    <div style={{fontFamily: "Moulpali", fontSize: "1.5rem", color: "#BF953F"}} className="golden-metallic-text">
                                        ចំណងដៃ
                                    </div>
                                </div>
                                <div className="flex-1 px-4">
                                    <Separator className="bg-gradient-to-r from-transparent via-[#BF953F] to-transparent"/>
                                </div>
                            </div>
                            
                            <section id="gift-framed" className="relative z-10 flex justify-center items-center px-4 py-8">
                                <motion.div 
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    className="relative group max-w-2xl w-full"
                                >
                                    {/* Gold Accent Ring */}
                                    <div className="absolute -inset-2 border border-amber-500/20 rounded-[2rem] pointer-events-none" />
                                    
                                    {/* Gift Image Container */}
                                    <div className="relative p-1.5 overflow-hidden rounded-xl border-2 border-amber-500/50 bg-[#1a1103]/40 backdrop-blur-sm shadow-[0_15px_45px_rgba(0,0,0,0.5)]">
                                        <img 
                                            src={optimizeUrl("https://res.cloudinary.com/dfs1iwbh3/image/upload/v1770811125/IMG_2866_keyqfy.jpg", { width: 800 })} 
                                            className="w-full h-auto rounded-lg shadow-inner" 
                                            alt="Wedding Gift Presentation" 
                                            loading="lazy" 
                                        />
                                    </div>

                                    {/* Smaller Corner Accents for Gift */}
                                    <div className="absolute -top-1 -left-1 w-6 h-6 border-t-2 border-l-2 border-[#BF953F] rounded-tl-lg" />
                                    <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-2 border-r-2 border-[#BF953F] rounded-br-lg" />
                                </motion.div>
                            </section>
                            <div className="text-center pt-10">
                                <div style={{fontFamily: "Taprom", fontSize: "0.9rem"}} className="text-[#c18c14]">
                                    ចុចលើកាដូខាងក្រោមនេះ
                                </div>    
                            </div>
                            <div className="flex flex-row items-center justify-center ">
                                <div style={{ height: 50, width: 50, rotate: "270deg", marginTop:'30px'}}>
                                    <Lottie
                                            animationData={arrowAnimationData}
                                            loop={true} 
                                            autoplay={true} 
                                    />
                                </div>
                                <div style={{ height: 120, width: 120 }}>
                                <a href="https://pay.ababank.com/oRF8/5q4ta6w3" target="_blank" rel="noopener noreferrer">
                                    <Lottie
                                        animationData={giftAnimationData}
                                        loop={true} 
                                        autoplay={true} 
                                    />
                                </a>
                                
                            </div>
                            <div style={{ height: 50, width: 50, rotate: "90deg", marginTop:'30px'}}>
                                    <Lottie
                                            animationData={arrowAnimationData}
                                            loop={true} 
                                            autoplay={true} 
                                    />
                                </div>
                            </div>
                
                            <section  className="h-screen flex flex-col items-center justify-center bg-transparent text-white">
                                <div className="p-5">
                                    <img src={optimizeUrl("https://res.cloudinary.com/dfs1iwbh3/image/upload/v1770864789/Form-1_PNG_ulit4q.png", { width: 800 })} alt="" loading="lazy" />
                                </div>
                            </section>
                            <section id="message" className="h-screen flex flex-col items-center justify-center bg-transparent text-white">
                                <div className="">
                                    <img src={optimizeUrl("https://ik.imagekit.io/lhuqyhzsd/info/_ticker_wipe_bg.png", { width: 1200 })} alt="" />
                                </div>
                            </section>
                        </div>
                    </motion.div>
                )
            } </AnimatePresence>
        </div>
    );
}
