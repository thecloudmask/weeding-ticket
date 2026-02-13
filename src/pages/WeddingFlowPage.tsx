import {useState, useEffect, useRef} from "react";
import {useParams} from "react-router-dom";
import {doc, getDoc, updateDoc} from "firebase/firestore";
import {db} from "../../firebase";
import {motion, AnimatePresence, useScroll, useSpring} from "framer-motion";
import musicSRC from "../assets/bg/bgmusic.mp3";
import titleFontSRC from "../assets/fonts/Kh Ang Penh.ttf"
import guestNameFontSRC from "../assets/fonts/Taprom.ttf"
import moulpaliFontSRC from "../assets/fonts/Moulpali-Regular.ttf"
import nellasueFontSRC from "../assets/fonts/NellaSue.ttf"

import {
    Calendar,
    MapPin,
    Image as ImageIcon,
    VolumeX,
    Gift,
    X,
    Check,
    UserX,
    Phone,
    QrCode,
    Play,
    ChevronLeft,
    ChevronRight,
    Sparkles,
    Music,
    Share2,
    Clock
} from "lucide-react";
import buttonOpenImg from "../assets/img/buttonOpen.png";
import telegramQR from "../assets/img/mengley.svg";

import {Button} from "../components/ui/button";
import { Separator } from "@/components/ui/separator";
import { WeddingCountdown } from "@/components/CountDown";
import { toast } from "sonner";

interface Guest {
    id: string;
    fullName: string;
    title?: string;
    email?: string;
    phone?: string;
    address?: string;
    status?: 'attending' | 'declined' | 'pending' | 'viewed';
    declineReason?: string;
    wishes?: string;
}

const NavButton = ({ onClick, icon: Icon, label, active }: { onClick: () => void, icon: any, label: string, active: boolean }) => (
    <button 
        onClick={onClick}
        className={`flex flex-col items-center justify-center p-2 rounded-2xl transition-all duration-300 min-w-[56px] group ${
            active ? 'bg-[#BF953F] text-black' : 'text-[#BF953F] hover:bg-[#BF953F]/10'
        }`}
    >
        <Icon size={20} className={`mb-1 transition-transform duration-300 group-active:scale-90 ${active ? 'fill-black/20' : ''}`} />
        <span className="text-[9px] font-['Moulpali'] tracking-tighter uppercase opacity-80">{label}</span>
    </button>
);

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


    const bgVideo: string = "https://res.cloudinary.com/dfs1iwbh3/video/upload/v1770971876/1080_eayu3q.mov";
    const introVideo: string = "https://res.cloudinary.com/dfs1iwbh3/video/upload/v1770982568/save_the_dated_xb3me4.mov";
    const bgInfoVideo: string = "https://ik.imagekit.io/lhuqyhzsd/bg-light.mp4?updatedAt=1762929599409";
    
    const info001: string = "https://res.cloudinary.com/dfs1iwbh3/image/upload/v1770994369/%E1%9E%98%E1%9E%84%E1%9F%92%E1%9E%82%E1%9E%9B%E1%9E%80%E1%9E%B6%E1%9E%9A_sjczci.png";
    const photoBanner: string = "https://res.cloudinary.com/dfs1iwbh3/image/upload/v1770891072/0F4A7939_aodi0b.jpg";

    const photos = [
        "https://res.cloudinary.com/dfs1iwbh3/image/upload/v1770905053/0X4A0490_sxyozb.jpg",
        "https://res.cloudinary.com/dfs1iwbh3/image/upload/v1770905052/0F4A7428_pwxz2j.jpg",
        "https://res.cloudinary.com/dfs1iwbh3/image/upload/v1770905052/0F4A7475_luptlh.jpg",
        "https://res.cloudinary.com/dfs1iwbh3/image/upload/v1770905053/B14A1829_zykada.jpg",
        "https://res.cloudinary.com/dfs1iwbh3/image/upload/v1770905054/0X4A0500_ht33p0.jpg",
        "https://res.cloudinary.com/dfs1iwbh3/image/upload/v1770905863/0F4A7842_cv54z0.jpg",
        "https://res.cloudinary.com/dfs1iwbh3/image/upload/v1770905862/0F4A7763_nhtcq8.jpg",
        "https://res.cloudinary.com/dfs1iwbh3/image/upload/v1770905861/0F4A7742_tavoey.jpg",
        "https://res.cloudinary.com/dfs1iwbh3/image/upload/v1770905861/0F4A7752_cimosi.jpg",
        "https://res.cloudinary.com/dfs1iwbh3/image/upload/v1770905862/0F4A7798_edrvbz.jpg",
        "https://res.cloudinary.com/dfs1iwbh3/image/upload/v1770905994/B14A1484_jvzc2f.jpg",
        "https://res.cloudinary.com/dfs1iwbh3/image/upload/v1770905991/0X4A0037_kwgbcl.jpg",
        "https://res.cloudinary.com/dfs1iwbh3/image/upload/v1770905990/0X4A0008_qoiun9.jpg",
        "https://res.cloudinary.com/dfs1iwbh3/image/upload/v1770905992/0X4A0225_uzw44p.jpg",
        "https://res.cloudinary.com/dfs1iwbh3/image/upload/v1770905978/0F4A7335_w4kzj1.jpg",
        "https://res.cloudinary.com/dfs1iwbh3/image/upload/v1770906139/0F4A7049_jnaolh.jpg",
        "https://res.cloudinary.com/dfs1iwbh3/image/upload/v1770906136/0F4A6769_ihehmv.jpg",
        "https://res.cloudinary.com/dfs1iwbh3/image/upload/v1770906138/0F4A6780_bphdc5.jpg",
        "https://res.cloudinary.com/dfs1iwbh3/image/upload/v1770906143/0F4A7114_yuhzjb.jpg",
        "https://res.cloudinary.com/dfs1iwbh3/image/upload/v1770906142/0F4A7089_osrokg.jpg",
        "https://res.cloudinary.com/dfs1iwbh3/image/upload/v1770906307/B14A2069_ssvrxx.jpg",
        "https://res.cloudinary.com/dfs1iwbh3/image/upload/v1770906309/B14A2439_iiqijp.jpg",
        "https://res.cloudinary.com/dfs1iwbh3/image/upload/v1770906303/0X4A0836_bjbik0.jpg",
        "https://res.cloudinary.com/dfs1iwbh3/image/upload/v1770906305/0X4A0877_ntdbtt.jpg",
        "https://res.cloudinary.com/dfs1iwbh3/image/upload/v1770906301/0X4A0779_tnae7x.jpg",
        "https://res.cloudinary.com/dfs1iwbh3/image/upload/v1770906428/0F4A8561_vmwbu9.jpg",
        "https://res.cloudinary.com/dfs1iwbh3/image/upload/v1770906436/0X4A0803_grkskp.jpg",
        "https://res.cloudinary.com/dfs1iwbh3/image/upload/v1770906434/0X4A0708_vu4xmz.jpg",
        "https://res.cloudinary.com/dfs1iwbh3/image/upload/v1770906431/0X4A0705_sunk7f.jpg",
        "https://res.cloudinary.com/dfs1iwbh3/image/upload/v1770906430/0X4A0616_nlwvzk.jpg",
        "https://res.cloudinary.com/dfs1iwbh3/image/upload/v1770906613/B14A7852_szerkw.jpg",
        "https://res.cloudinary.com/dfs1iwbh3/image/upload/v1770906609/0F4A3445_c6itdd.jpg",
        "https://res.cloudinary.com/dfs1iwbh3/image/upload/v1770906612/0F4A3483_ijhx8j.jpg",
        "https://res.cloudinary.com/dfs1iwbh3/image/upload/v1770906616/B14A7871_mszgcr.jpg",
        "https://res.cloudinary.com/dfs1iwbh3/image/upload/v1770906620/B14A7905_d4b1al.jpg",
        "https://res.cloudinary.com/dfs1iwbh3/image/upload/v1770906769/6C5A7212_v5phj6.jpg",
        "https://res.cloudinary.com/dfs1iwbh3/image/upload/v1770906767/6C5A7210_xnd8xo.jpg",
        "https://res.cloudinary.com/dfs1iwbh3/image/upload/v1770906764/6C5A7116_wmyw4d.jpg",
        "https://res.cloudinary.com/dfs1iwbh3/image/upload/v1770906758/0F4A3801_lkafzz.jpg",
        "https://res.cloudinary.com/dfs1iwbh3/image/upload/v1770906760/0F4A3805_e9fjp0.jpg",
        "https://res.cloudinary.com/dfs1iwbh3/image/upload/v1770906883/0F4A4284_dsqjhb.jpg",
        "https://res.cloudinary.com/dfs1iwbh3/image/upload/v1770906887/0F4A4285_lswpel.jpg",
        "https://res.cloudinary.com/dfs1iwbh3/image/upload/v1770906896/0F4A4314_eq6vk3.jpg",
        "https://res.cloudinary.com/dfs1iwbh3/image/upload/v1770906908/6C5A7495_iz91sv.jpg",
        "https://res.cloudinary.com/dfs1iwbh3/image/upload/v1770906917/B14A8795_zueh9o.jpg",
        "https://res.cloudinary.com/dfs1iwbh3/image/upload/v1770906921/B14A8867_e2l58p.jpg",
        "https://res.cloudinary.com/dfs1iwbh3/image/upload/v1770906917/B14A8795_zueh9o.jpg",
        "https://res.cloudinary.com/dfs1iwbh3/image/upload/v1770906914/B14A8671_lkjvdm.jpg",
        "https://res.cloudinary.com/dfs1iwbh3/image/upload/v1770906878/0F4A4094_xpu8tq.jpg",
        "https://res.cloudinary.com/dfs1iwbh3/image/upload/v1770906880/0F4A4202_xxugsy.jpg",
        "https://res.cloudinary.com/dfs1iwbh3/image/upload/v1770906911/B14A8632_vz4bcl.jpg"
    ];

    const {id} = useParams();
    const [guest, setGuest] = useState < Guest | null > (null);
    const [loading, setLoading] = useState(true);

    const [stage, setStage] = useState < "invite" | "intro" | "info" > ("invite");
    const [isMusicPlaying, setIsMusicPlaying] = useState(true);
    const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
    const [declineReason, setDeclineReason] = useState("");
    const [wishes, setWishes] = useState("");
    const [showDeclineInput, setShowDeclineInput] = useState(false);
    const [showWishesInput, setShowWishesInput] = useState(false);
    const [showTelegramQR, setShowTelegramQR] = useState(false);
    const [showScrollTop, setShowScrollTop] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    // --- Enhanced UI Hooks ---
    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });


    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: 'Wedding Invitation',
                text: `សូមអញ្ជើញចូលរួមក្នុងកម្មវិធីមង្គលការរបស់ពួកយើង`,
                url: window.location.href,
            })
            .catch((error) => console.error('Error sharing', error));
        } else {
            navigator.clipboard.writeText(window.location.href);
            toast.success("បានចម្លង Link រួចរាល់សម្រាប់ចែករំលែក!");
        }
    };

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 400) {
                setShowScrollTop(true);
            } else {
                setShowScrollTop(false);
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const audioRef = useRef < HTMLAudioElement | null > (null);

    useEffect(() => {
        const fetchGuest = async () => {
            try {
                const docRef = doc(db, "guests", id!);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const data = docSnap.data() as Guest;
                    if (!data.status) {
                        // Legacy guest without status - default to pending and update DB
                        await updateDoc(docRef, { status: 'pending' });
                        data.status = 'pending';
                    }
                    setGuest(data);
                    if (data.wishes) setWishes(data.wishes);
                    if (data.declineReason) setDeclineReason(data.declineReason);
                }
            } catch (error) {
                console.error("Error fetching guest:", error);
            } finally {
                setLoading(false);
            }
        };
        if (id) 
            fetchGuest();
        

    }, [id, isMusicPlaying]);

    const handleOpenClick = async () => {
        setStage("intro");
        
        // Mark as viewed if pending
        if (guest && id && (!guest.status || guest.status === 'pending')) {
            try {
                const docRef = doc(db, "guests", id);
                await updateDoc(docRef, { status: 'viewed' });
                setGuest({ ...guest, status: 'viewed' } as Guest);
            } catch (err) {
                console.error("Error updating view status:", err);
            }
        }
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

    const handleRSVP = async (status: 'attending' | 'declined', message?: string) => {
        if (!guest || !id) return;
        try {
            const docRef = doc(db, "guests", id);
            const updateData: any = { status };
            
            if (status === 'declined' && message) {
                updateData.declineReason = message;
            } else if (status === 'attending' && message) {
                updateData.wishes = message;
            }

            await updateDoc(docRef, updateData);
            
            setGuest(prev => ({ 
                ...prev!, 
                status, 
                declineReason: status === 'declined' ? message : prev?.declineReason,
                wishes: status === 'attending' ? message : prev?.wishes
            }));

            setIsEditing(false);
            if (status === 'declined') setShowDeclineInput(false);
            if (status === 'attending') setShowWishesInput(false);
            
            toast.success(status === 'attending' ? "អរគុណសម្រាប់ការឆ្លើយតប!" : "សោកស្តាយដែលបងមិនបានចូលរួម");
        } catch (err) {
            console.error("Error updating RSVP:", err);
        }
    };

    const scrollToSection = (id : string) => {
        const section = document.getElementById(id);
        if (section)
            section.scrollIntoView({behavior: "smooth"});
    };

    const handleNextPhoto = (e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        if (selectedPhotoIndex === null) return;
        setSelectedPhotoIndex((selectedPhotoIndex + 1) % photos.length);
    };

    const handlePrevPhoto = (e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        if (selectedPhotoIndex === null) return;
        setSelectedPhotoIndex((selectedPhotoIndex - 1 + photos.length) % photos.length);
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (selectedPhotoIndex === null) return;
            if (e.key === "ArrowRight") handleNextPhoto();
            if (e.key === "ArrowLeft") handlePrevPhoto();
            if (e.key === "Escape") setSelectedPhotoIndex(null);
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [selectedPhotoIndex]);

    const addToGoogleCalendar = () => {
        const title = encodeURIComponent("ពិធីមង្គលការ Ramy & Mengchou");
        const details = encodeURIComponent("យើងខ្ញុំមានកិត្តិយសសូមគោរពអញ្ជើញ ឯកឧត្តម លោកជំទាវ អ្នកឧកញ៉ា លោកឧកញ៉ា លោក លោកស្រី អ្នកនាងកញ្ញា ចូលរួមពិសារភោជនាហារក្នុងពិធីមង្គលការរបស់យើងខ្ញុំ។");
        const location = encodeURIComponent("https://maps.app.goo.gl/eDfFnEecVdKs1NyM9");
        const startDate = "20260322T170000";
        const endDate = "20260322T230000";
        
        const url = `https://www.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}&dates=${startDate}/${endDate}`;
        window.open(url, '_blank');
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
                {selectedPhotoIndex !== null && (
                    <motion.div 
                        className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center backdrop-blur-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedPhotoIndex(null)}
                    >
                        {/* Close Button */}
                        <button 
                            className="absolute top-6 right-6 text-white/70 hover:text-white z-50 p-2 bg-white/10 rounded-full transition-all"
                            onClick={() => setSelectedPhotoIndex(null)}
                        >
                            <X size={28} />
                        </button>

                        {/* Navigation - PREV */}
                        <button 
                            className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 text-[#BF953F] hover:text-[#BF953F]/80 z-50 p-3 md:p-4 bg-white/5 hover:bg-white/10 rounded-full transition-all group scale-90 md:scale-100"
                            onClick={handlePrevPhoto}
                        >
                            <ChevronLeft size={40} className="group-hover:-translate-x-1 transition-transform" />
                        </button>

                        {/* Main Image */}
                        <motion.div
                            key={selectedPhotoIndex}
                            className="relative max-w-[90vw] max-h-[85vh] flex items-center justify-center"
                            initial={{ opacity: 0, scale: 0.9, x: 20 }}
                            animate={{ opacity: 1, scale: 1, x: 0 }}
                            exit={{ opacity: 0, scale: 0.9, x: -20 }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <img 
                                src={optimizeUrl(photos[selectedPhotoIndex], { width: 1600 })} 
                                alt={`Wedding ${selectedPhotoIndex}`} 
                                className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10"
                            />
                            
                            {/* Counter Label */}
                            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-white/50 text-sm font-mono tracking-widest">
                                {selectedPhotoIndex + 1} / {photos.length}
                            </div>
                        </motion.div>

                        {/* Navigation - NEXT */}
                        <button 
                            className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 text-[#BF953F] hover:text-[#BF953F]/80 z-50 p-3 md:p-4 bg-white/5 hover:bg-white/10 rounded-full transition-all group scale-90 md:scale-100"
                            onClick={handleNextPhoto}
                        >
                            <ChevronRight size={40} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
            
            <AnimatePresence mode="wait">
                {
                stage === "invite" && (
                    <motion.div key="invite" className="absolute inset-0"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1 }}
                    >
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
                                @font-face {
                                font-family: 'Moulpali';
                                src: url(${moulpaliFontSRC}) format('truetype');
                                }
                                @font-face {
                                font-family: 'NellaSue';
                                src: url(${nellasueFontSRC}) format('truetype');
                                }
                            `
                            }</style>
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 8, duration: 1.5, ease: "easeOut" }}
                                className="flex flex-col items-center w-full"
                            >
                                <h1 className="flex flex-wrap items-center justify-center mb-14 gap-x-2 gap-y-1 max-w-[90vw] px-4">
                                    <span 
                                        className="font-bold tracking-wide uppercase leading-tight"
                                        style={{ 
                                            color: '#FFFFFF',
                                            fontFamily: guest?.title && /[\u1780-\u17FF]/.test(guest.title) ? "'Kantumruy Pro'" : "'Poppins'", 
                                            fontSize: "clamp(1.1rem, 4vw, 1.4rem)",
                                            textShadow: `
                                                0 0 8px rgba(255, 255, 255, 0.8),
                                                0 0 15px rgba(255, 215, 0, 0.6),
                                                0 0 30px rgba(255, 215, 0, 0.4)
                                            `
                                        }}
                                    >
                                        {guest?.title}
                                    </span>
                                    <span 
                                        className="font-bold tracking-wide leading-tight"
                                        style={{ 
                                            color: '#FFFFFF',
                                            fontFamily: guest?.fullName && /[\u1780-\u17FF]/.test(guest.fullName) ? "'Kantumruy Pro'" : "'Poppins'", 
                                            fontSize: "clamp(1.4rem, 5vw, 1.8rem)",
                                            textShadow: `
                                                0 0 8px rgba(255, 255, 255, 0.8),
                                                0 0 15px rgba(255, 215, 0, 0.6),
                                                0 0 30px rgba(255, 215, 0, 0.4)
                                            `
                                        }}
                                    >
                                        {guest?.fullName}
                                    </span>
                                </h1>
                            <motion.img src={buttonOpenImg}
                                className="w-50 mb-20 cursor-pointer bg-amber-50"
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
                            </motion.div>
                        </div>
                    </motion.div>
                )
            }

            {/* Curtain Animation Overlay
            <AnimatePresence>
                {isOpening && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex"
                    >
                        <motion.div 
                            initial={{ x: "-100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "-100%" }}
                            transition={{ duration: 0.8, ease: "easeInOut" }}
                            className="w-1/2 h-full bg-[#1a1103] border-r border-[#BF953F]/20 flex items-center justify-end"
                        >
                             <div className="w-px h-1/2 bg-gradient-to-b from-transparent via-[#BF953F]/40 to-transparent" />
                        </motion.div>
                        <motion.div 
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ duration: 0.8, ease: "easeInOut" }}
                            className="w-1/2 h-full bg-[#1a1103] border-l border-[#BF953F]/20 flex items-center justify-start"
                        >
                            <div className="w-px h-1/2 bg-gradient-to-b from-transparent via-[#BF953F]/40 to-transparent" />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence> */}


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
                {/* Floating Particles Overlay - Globally active in info stage */}
                {stage === "info" && (
                    <div className="fixed inset-0 pointer-events-none z-[45] overflow-hidden" style={{ transform: 'translateZ(0)' }}>
                        {[...Array(35)].map((_, i) => (
                            <motion.div
                                key={i}
                                className="absolute text-[#BF953F]/30"
                                style={{
                                    left: `${Math.random() * 100}%`,
                                    top: `${Math.random() * 110}%`,
                                    willChange: 'transform, opacity'
                                }}
                                animate={{
                                    y: [0, -200, 0],
                                    x: [0, Math.random() * 80 - 40, 0],
                                    opacity: [0, 0.6, 0],
                                    rotate: [0, 180, 360],
                                    scale: [0.4, 1.1, 0.4]
                                }}
                                transition={{
                                    duration: Math.random() * 15 + 10,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                    delay: Math.random() * 10,
                                }}
                            >
                                <Sparkles 
                                    size={Math.random() * 10 + 6} 
                                    className="drop-shadow-[0_0_10px_rgba(191,149,63,0.5)]"
                                />
                            </motion.div>
                        ))}
                    </div>
                )}

                {
                stage === "info" && (
                    <motion.div key="info" className="absolute inset-0 w-full h-full overflow-y-auto"
                        variants={fadeVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit">
                        <motion.div 
                            className="fixed top-0 left-0 right-0 h-1 bg-[#BF953F] origin-left z-[100] shadow-[0_0_10px_rgba(191,149,63,0.5)]"
                            style={{ scaleX }}
                        />

                        {/* Top-right music toggle */}
                        <Button onClick={toggleMusic}
                            variant="outline" size="icon" className="rounded-full bg-amber-900/80 border-[#BF953F]/40 fixed top-4 right-4 z-[60] backdrop-blur-md shadow-lg shadow-black/20 group overflow-hidden">
                            <motion.div
                                animate={isMusicPlaying ? { rotate: 360 } : { rotate: 0 }}
                                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                                className="relative flex items-center justify-center"
                            >
                                {isMusicPlaying ? (
                                    <>
                                        <div className="absolute inset-0 bg-[#BF953F]/20 blur-md rounded-full" />
                                        <Music size={20} className="text-[#BF953F] relative z-10" />
                                    </>
                                ) : (
                                    <VolumeX size={20} className="text-white/50" />
                                )}
                            </motion.div>
                            
                            {/* Inner Shine */}
                            <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 pointer-events-none" />
                        </Button>

                        {/* Top-left share toggle */}
                        <Button onClick={handleShare}
                            variant="outline" size="icon" className="rounded-full bg-amber-900/80 border-[#BF953F]/40 fixed top-4 left-4 z-[60] backdrop-blur-md shadow-lg shadow-black/20 group">
                            <Share2 size={20} className="text-[#BF953F]" />
                        </Button>

                        {/* Premium Floating Navigation Bar */}
                        <motion.div 
                            initial={{ y: 100, x: "-50%", opacity: 0 }}
                            animate={{ y: 0, x: "-50%", opacity: 1 }}
                            transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
                            className="fixed bottom-6 left-1/2 flex items-center gap-1.5 sm:gap-4 z-50 bg-[#1a1103]/70 backdrop-blur-xl rounded-full p-2.5 border border-[#BF953F]/20 shadow-[0_20px_50px_rgba(0,0,0,0.5)] ring-1 ring-white/5"
                        >
                            <NavButton onClick={() => scrollToSection("calendar")} icon={Calendar} label="កម្មវិធី" active={false} />
                            <NavButton onClick={() => scrollToSection("count-down")} icon={Clock} label="ម៉ោង" active={false} />
                            <NavButton onClick={() => scrollToSection("map")} icon={MapPin} label="ផែនទី" active={false} />
                            <NavButton onClick={() => scrollToSection("gallery")} icon={ImageIcon} label="រូបថត" active={false} />
                            <NavButton onClick={() => scrollToSection("gift")} icon={Gift} label="ចំណងដៃ" active={false} />
                        </motion.div>
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
 
                                style={{
                                    touchAction: 'none', 
                                    transform: "translate(-50%, -50%) scale(1.16) translateZ(0)",
                                    willChange: 'transform'
                                }}/> {/* Scrollable sections */}
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
                            <div className="flex flex-col items-center justify-center pt-28 pb-10 w-full">
                                <div className="flex flex-row items-center justify-center w-full">
                                    <div className="flex-1 px-4">
                                        <Separator className="bg-gradient-to-r from-transparent via-[#BF953F] to-transparent"/>
                                    </div>
                                    <div className="px-6 items-center justify-center flex">
                                        <div style={{fontFamily: "Moulpali", fontSize: "1.6rem", color: "#BF953F"}} className="golden-metallic-text">
                                            កម្មវិធីមង្គលការ
                                        </div>
                                    </div>
                                    <div className="flex-1 px-4">
                                        <Separator className="bg-gradient-to-r from-transparent via-[#BF953F] to-transparent"/>
                                    </div>
                                </div>
                            </div>
                            <section id="" className="flex items-center justify-center bg-transparent">
                                <div className="">
                                    <img src={optimizeUrl("https://res.cloudinary.com/dfs1iwbh3/image/upload/v1770994369/%E1%9E%80%E1%9E%98%E1%9F%92%E1%9E%98%E1%9E%9C%E1%9E%B7%E1%9E%92%E1%9E%B8%E1%9E%94%E1%9E%BB%E1%9E%8E%E1%9F%92%E1%9E%99_a3gzvd.png", { width: 800 })}
                                    alt=""
                                   />
                                </div>
                            </section>
                            {/* <section id="calendar" className="flex items-center justify-center bg-transparent">
                                <img src={info002}
                                    alt=""
                                    className="max-w-full max-h-full"/>
                            </section> */}
                               <div className="flex flex-row items-center justify-center pt-28 pb-4" id="count-down">
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
                            <div className="relative z-20 -mb-12 mt-8 w-full flex flex-col items-center gap-6">
                                <motion.button 
                                    onClick={addToGoogleCalendar}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="relative group cursor-pointer"
                                >
                                    {/* Subtle Glow */}
                                    <div className="absolute inset-0 bg-[#BF953F]/10 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                    
                                    <img 
                                        src="https://res.cloudinary.com/dfs1iwbh3/image/upload/v1770953900/btn_save_date_azptcx.png" 
                                        alt="Save The Date" 
                                        className="w-60 h-auto relative z-10 drop-shadow-[0_10px_20px_rgba(0,0,0,0.4)] transition-all duration-300 group-hover:drop-shadow-[0_15px_30px_rgba(191,149,63,0.5)]"
                                    />

                                    {/* Shine overlay effect */}
                                    <div className="absolute inset-0 overflow-hidden rounded-full z-20 pointer-events-none w-full h-full">
                                        <motion.div 
                                            className="absolute inset-y-0 -left-[100%] w-1/3 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12"
                                            animate={{ 
                                                left: ["-100%", "200%"] 
                                            }}
                                            transition={{ 
                                                duration: 3, 
                                                repeat: Infinity, 
                                                repeatDelay: 2,
                                                ease: "linear"
                                            }}
                                        />
                                    </div>
                                </motion.button>
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
                                        <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-black">
                                            {/* High-res Thumbnail Fallback (Shows while loading) */}
                                            <img 
                                                src="https://img.youtube.com/vi/hin00ElLsYw/maxresdefault.jpg" 
                                                alt=""
                                                className="absolute inset-0 w-full h-full object-cover opacity-40 blur-[2px]"
                                            />

                                            {/* Looping "GIF-style" Video Preview */}
                                            <iframe 
                                                src="https://www.youtube.com/embed/hin00ElLsYw?autoplay=1&mute=1&loop=1&playlist=hin00ElLsYw&controls=0&modestbranding=1&rel=0&iv_load_policy=3&showinfo=0&enablejsapi=1"
                                                title="Wedding Video Loop"
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                className="absolute inset-0 w-full h-full scale-[1.12] border-0"
                                                style={{ pointerEvents: 'none' }}
                                            />

                                            {/* Click Overlay to open in new tab */}
                                            <div 
                                                className="absolute inset-0 z-20 cursor-pointer group/vid flex flex-col items-center justify-center bg-transparent active:bg-black/20 transition-all duration-300"
                                                onClick={() => window.open("https://www.youtube.com/watch?v=hin00ElLsYw", "_blank")}
                                            >
                                                <motion.div 
                                                    whileHover={{ scale: 1.15 }}
                                                    whileTap={{ scale: 0.9 }}
                                                    className="w-16 h-16 rounded-full bg-amber-500/20 backdrop-blur-xl border border-amber-500/40 flex items-center justify-center opacity-0 group-hover/vid:opacity-100 transition-all duration-300 shadow-[0_0_20px_rgba(191,149,63,0.5)]"
                                                >
                                                    <Play size={32} className="text-amber-500 fill-amber-500 ml-1" />
                                                </motion.div>
                                                
                                                <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-md border border-white/10 opacity-0 group-hover/vid:opacity-100 transition-opacity duration-300">
                                                    <span className="text-[10px] text-white/90 tracking-widest font-medium">WATCH FULL VIDEO</span>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {/* Overlay Glow */}
                                        <div className="absolute inset-0 pointer-events-none ring-1 ring-inset ring-amber-500/20 shadow-[inset_0_0_100px_rgba(0,0,0,0.2)] z-30" />
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
                            <div className="flex flex-row items-center justify-center pt-16 pb-4 w-full" id="map">
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
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 pb-4" id="map-button">
                                <motion.a 
                                    href="https://maps.app.goo.gl/eDfFnEecVdKs1NyM9" 
                                    target="_blank" 
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="relative group cursor-pointer"
                                >
                                    {/* Subtle Glow behind the image */}
                                    <div className="absolute inset-0 bg-[#BF953F]/10 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                    <div className="flex flex-col items-center justify-center gap-4">
                                    <div style={{fontFamily: "Moulpali", fontSize: "0.8rem", color: "#BF953F"}} className="golden-metallic-text flex text-center justify-center items-center text-wrap">កម្មវិធីនឹងប្រារព្ធធ្វើឡើងនៅ បាត់ដំបង ស៊ីធីហល៍ <br/> សូមមេត្តាអញ្ជើញចូលរួមដោយមេត្រីភាព</div>
                                    <img 
                                        src="https://ik.imagekit.io/lhuqyhzsd/button/btn_loc.png?updatedAt=1762930145649" 
                                        alt="Google Maps" 
                                        className="w-60 h-auto relative z-10 drop-shadow-[0_10px_20px_rgba(0,0,0,0.4)] transition-all duration-300 group-hover:drop-shadow-[0_15px_30px_rgba(191,149,63,0.5)]"
                                    />
                                    </div>
                                    {/* Shine overlay effect */}
                                    <div className="absolute inset-0 overflow-hidden rounded-full z-20 pointer-events-none w-full h-full">
                                        <motion.div 
                                            className="absolute inset-y-0 -left-[100%] w-1/3 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12"
                                            animate={{ 
                                                left: ["-100%", "200%"] 
                                            }}
                                            transition={{ 
                                                duration: 3, 
                                                repeat: Infinity, 
                                                repeatDelay: 2,
                                                ease: "linear"
                                            }}
                                        />
                                    </div>
                                </motion.a>
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
                            <section id="gallery-framed" className="relative z-10 flex justify-center items-center px-4 py-8" style={{ contentVisibility: 'auto', contain: 'paint' } as any}>
                                <div className="relative group max-w-6xl w-full">
                                    {/* Traditional Gold Frame */}
                                    <div className="absolute -inset-2 border border-amber-500/30 rounded-[2rem] pointer-events-none" />
                                    
                                    {/* Main Gallery Container - Removed expensive filters */}
                                    <div className="relative p-2 overflow-hidden rounded-xl border-2 border-amber-500/50 bg-[#1a1103]/80 shadow-2xl">
                                        <div className="grid grid-cols-4 gap-3 sm:gap-4 p-1 sm:p-2">
                                            {photos.map((photo, index) => {
                                                const patternIndex = index % 5;
                                                const isFullWidth = patternIndex === 0;
                                                
                                                return (
                                                    <div 
                                                        key={index}
                                                        className={`${
                                                            isFullWidth 
                                                            ? "col-span-4 h-64 sm:h-[400px] md:h-[500px]" 
                                                            : "col-span-2 h-48 sm:h-[300px] md:h-[350px]"
                                                        } bg-amber-900/10 rounded-xl overflow-hidden relative group cursor-pointer transition-transform duration-300 active:scale-95`}
                                                        style={{ 
                                                            willChange: "transform",
                                                            transform: "translateZ(0)"
                                                        }}
                                                        onClick={() => setSelectedPhotoIndex(index)}
                                                    >
                                                        <img
                                                            src={optimizeUrl(photo, isFullWidth ? { width: 800 } : { width: 350 })} 
                                                            alt={`Gallery ${index}`} 
                                                            loading="lazy"
                                                            decoding="async"
                                                            className="object-cover w-full h-full rounded-lg transition-transform duration-500 group-hover:scale-105" 
                                                        />
                                                        {/* Simple Static Overlay instead of blur */}
                                                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none flex items-center justify-center">
                                                            <div className="p-3 rounded-full bg-amber-500/20 border border-amber-500/30">
                                                                <ImageIcon size={24} className="text-white" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Khmer Traditional Corner Accents */}
                                    <div className="absolute -top-2 -left-2 w-10 h-10 border-t-2 border-l-2 border-[#BF953F] rounded-tl-[1.5rem] shadow-[#BF953F]/20" />
                                    <div className="absolute -bottom-2 -right-2 w-10 h-10 border-b-2 border-r-2 border-[#BF953F] rounded-br-[1.5rem] shadow-[#BF953F]/20" />
                                </div>
                            </section>
                            <div className="flex flex-row items-center justify-center pt-20 pb-6 w-full" id="gift">
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

                            <div>

                            </div>

                            <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="max-w-xl mx-auto px-8 pt-4 pb-2 text-center"
                            >
                                <div className="h-px w-32 mx-auto bg-gradient-to-r from-transparent via-[#BF953F]/40 to-transparent mb-4" />
                                <p style={{fontFamily: "Taprom", fontSize: "1.1rem"}} className="text-[#BF953F] leading-relaxed italic drop-shadow-lg">
                                    លោកអ្នកក៏អាចផ្ញើចំណងដៃតាមរយៈធនាគារ <span style={{fontFamily: "Moulpali"}} className="text-[#BF953F] golden-metallic-text font-bold">ABA</span> របស់ពួកយើងបាន 
                                   ដោយស្កេន QR Code ឬ ចុចប៊ូតុងខាងក្រោម៖
                                </p>
                                <div className="h-px w-32 mx-auto bg-gradient-to-r from-transparent via-[#BF953F]/40 to-transparent mt-4" />
                            </motion.div>
                            
                            <section id="gift-framed" className="relative z-10 flex justify-center items-center px-14 py-8">
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 1, ease: "easeOut" }}
                                    className="relative group max-w-lg w-full"
                                >
                                    {/* Ornate Inner Glow */}
                                    <div className="absolute inset-x-8 -inset-y-4 bg-amber-500/5 blur-3xl rounded-[3rem] pointer-events-none" />
                                    
                                    {/* Traditional Frame Style Container */}
                                    <div className="relative p-2 overflow-hidden rounded-2xl border-2 border-amber-500/40 bg-[#1a1103]/60 backdrop-blur-md shadow-[0_25px_60px_rgba(0,0,0,0.6)]">
                                        <div className="relative rounded-xl overflow-hidden">
                                            <img 
                                                src={optimizeUrl("https://res.cloudinary.com/dfs1iwbh3/image/upload/v1770811125/IMG_2866_keyqfy.jpg", { width: 500 })} 
                                                className="w-full h-auto object-cover transform transition-transform duration-[2s] group-hover:scale-105" 
                                                alt="Wedding Gift Presentation" 
                                                loading="lazy" 
                                            />
                                            {/* Subtle Inner Highlight Overlay */}
                                            <div className="absolute inset-0 ring-1 ring-inset ring-white/10" />
                                            {/* Vignette */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20" />
                                        </div>
                                    </div>

                                    {/* Ornate Corner Accents */}
                                    <div className="absolute -top-3 -left-3 w-12 h-12 border-t-2 border-l-2 border-[#BF953F] rounded-tl-[1.5rem] shadow-[0_0_15px_rgba(191,149,63,0.3)]" />
                                    <div className="absolute -bottom-3 -right-3 w-12 h-12 border-b-2 border-r-2 border-[#BF953F] rounded-br-[1.5rem] shadow-[0_0_15px_rgba(191,149,63,0.3)]" />
                                </motion.div>
                            </section>

                            <section id="gift-framed" className="relative z-10 flex justify-center items-center px-14 py-8">
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 1, ease: "easeOut" }}
                                    className="relative group max-w-lg w-full"
                                >
                                    {/* Ornate Inner Glow */}
                                    <div className="absolute inset-x-8 -inset-y-4 bg-amber-500/5 blur-3xl rounded-[3rem] pointer-events-none" />
                                    
                                    {/* Traditional Frame Style Container */}
                                    <div className="relative p-2 overflow-hidden rounded-2xl border-2 border-amber-500/40 bg-[#1a1103]/60 backdrop-blur-md shadow-[0_25px_60px_rgba(0,0,0,0.6)]">
                                        <div className="relative rounded-xl overflow-hidden">
                                            <img 
                                                src={optimizeUrl("https://res.cloudinary.com/dfs1iwbh3/image/upload/v1770984411/rielqr_afhekx.jpg", { width: 500 })} 
                                                className="w-full h-auto object-cover transform transition-transform duration-[2s] group-hover:scale-105" 
                                                alt="Wedding Gift Presentation" 
                                                loading="lazy" 
                                            />
                                            {/* Subtle Inner Highlight Overlay */}
                                            <div className="absolute inset-0 ring-1 ring-inset ring-white/10" />
                                            {/* Vignette */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20" />
                                        </div>
                                    </div>

                                    {/* Ornate Corner Accents */}
                                    <div className="absolute -top-3 -left-3 w-12 h-12 border-t-2 border-l-2 border-[#BF953F] rounded-tl-[1.5rem] shadow-[0_0_15px_rgba(191,149,63,0.3)]" />
                                    <div className="absolute -bottom-3 -right-3 w-12 h-12 border-b-2 border-r-2 border-[#BF953F] rounded-br-[1.5rem] shadow-[0_0_15px_rgba(191,149,63,0.3)]" />
                                </motion.div>
                            </section>
                           

                            
                            <div className="flex flex-row items-center justify-center pt-2 pb-6 w-full max-w-2xl mx-auto px-4 text-center">
                                <div className="flex-1">
                                    <Separator className="bg-gradient-to-r from-transparent via-[#BF953F]/40 to-transparent h-px" />
                                </div>
                                <div className="px-8 relative">
                                    <div style={{fontFamily: "Moulpali", fontSize: "1.1rem", color: "#BF953F"}} className="golden-metallic-text tracking-wide">
                                        ដោយសេចក្តីគោរព និងមេត្រីភាព
                                    </div>
                                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />
                                </div>
                                <div className="flex-1">
                                    <Separator className="bg-gradient-to-r from-transparent via-[#BF953F]/40 to-transparent h-px" />
                                </div>
                            </div>

                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.8 }}
                                className="flex flex-row items-center justify-center gap-6 sm:gap-12 pb-12"
                            >
                                <motion.div 
                                    animate={{ x: [0, 8, 0], opacity: [0.3, 0.8, 0.3] }}
                                    transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                                    className="hidden md:block"
                                >
                                    <ChevronRight size={32} className="text-[#BF953F]/40" />
                                </motion.div>
                                
                                <motion.a 
                                    href="https://pay.ababank.com/oRF8/bqjwmrsc" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    whileHover={{ scale: 1.05, y: -5 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="relative group cursor-pointer z-20"
                                >
                                    {/* Elevated Aura */}
                                    <div className="absolute inset-0 bg-[#BF953F]/15 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                                    
                                    <img 
                                        src="https://res.cloudinary.com/dfs1iwbh3/image/upload/v1770953899/btn_gift_ybpzwc.png" 
                                        alt="Send Gift" 
                                        className="w-64 h-auto relative z-10 drop-shadow-[0_15px_30px_rgba(0,0,0,0.5)] transition-all duration-500 group-hover:drop-shadow-[0_20px_40px_rgba(191,149,63,0.4)]"
                                    />

                                    {/* Refined Shine Effect */}
                                    <div className="absolute inset-0 overflow-hidden rounded-full z-20 pointer-events-none">
                                        <motion.div 
                                            className="absolute inset-y-0 -left-[100%] w-1/2 bg-gradient-to-r from-transparent via-white/15 to-transparent skew-x-[35deg]"
                                            animate={{ 
                                                left: ["-100%", "200%"] 
                                            }}
                                            transition={{ 
                                                duration: 4, 
                                                repeat: Infinity, 
                                                repeatDelay: 1,
                                                ease: "easeInOut"
                                            }}
                                        />
                                    </div>
                                </motion.a>

                                
                                <motion.div 
                                    animate={{ x: [0, -8, 0], opacity: [0.3, 0.8, 0.3] }}
                                    transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                                    className="hidden md:block"
                                >
                                    <ChevronLeft size={32} className="text-[#BF953F]/40" />
                                </motion.div>
                            </motion.div>

                             <section className="relative z-10 px-6 py-20 pb-0">
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    className="max-w-md mx-auto bg-[#1a1103]/60 backdrop-blur-md border border-[#BF953F]/30 p-8 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.4)] text-center relative overflow-hidden"
                                >
                                    {/* Background Decor */}
                                    <div className="absolute top-0 left-0 w-24 h-24 bg-[#BF953F]/10 rounded-full -translate-x-12 -translate-y-12 blur-2xl" />
                                    
                                    <div style={{fontFamily: "Moulpali", fontSize: "1.2rem", color: "#BF953F"}} className="mb-6 golden-metallic-text uppercase tracking-widest">
                                        ការឆ្លើយតប (RSVP)
                                    </div>

                                    <div style={{fontFamily: "Taprom", fontSize: "1.1rem"}} className="text-white/90 mb-8 leading-relaxed">
                                        តើលោកអ្នកនឹងផ្តល់កិត្តិយស អញ្ជើញចូលរួមកម្មវិធីពិសាភោជនាហារដែរឬទេ?
                                    </div>

                                    <div className="flex flex-col gap-4">
                                        {((guest?.status === 'attending' || guest?.status === 'declined') && !isEditing) ? (
                                            <motion.div 
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="bg-white/5 border border-[#BF953F]/30 rounded-2xl p-6"
                                            >
                                                <div className="flex flex-col items-center gap-4">
                                                    <div className={`w-16 h-16 rounded-full flex items-center justify-center ${guest.status === 'attending' ? 'bg-[#BF953F]/20 text-[#BF953F]' : 'bg-red-500/20 text-red-500'}`}>
                                                        {guest.status === 'attending' ? <Check size={32} /> : <UserX size={32} />}
                                                    </div>
                                                    
                                                    <div>
                                                        <div style={{fontFamily: "Moulpali"}} className={`text-lg mb-1 ${guest.status === 'attending' ? 'text-[#BF953F]' : 'text-red-400'}`}>
                                                            {guest.status === 'attending' ? 'យល់ព្រមចូលរួម' : 'មិនអាចចូលរួមបាន'}
                                                        </div>
                                                        <p style={{fontFamily: "Taprom"}} className="text-white/60 text-sm italic">
                                                            {guest.status === 'attending' 
                                                                ? (guest.wishes ? `"${guest.wishes}"` : "លោកអ្នកនឹងចូលរួមកម្មវិធីនេះ") 
                                                                : (guest.declineReason ? `"${guest.declineReason}"` : "លោកអ្នកមិនអាចចូលរួមបានទេ")
                                                            }
                                                        </p>
                                                    </div>

                                                    <button 
                                                        onClick={() => setIsEditing(true)}
                                                        className="mt-2 text-[#BF953F] hover:text-[#F3E5AB] text-sm font-bold flex items-center gap-2 transition-colors group"
                                                    >
                                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:rotate-12 transition-transform">
                                                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                                        </svg>
                                                        កែប្រែការឆ្លើយតប
                                                    </button>
                                                </div>
                                            </motion.div>
                                        ) : (
                                            <>
                                                <button
                                                    onClick={() => {
                                                        setShowWishesInput(true);
                                                        setShowDeclineInput(false);
                                                    }}
                                                    className={`relative group h-14 overflow-hidden rounded-2xl transition-all active:scale-95 ${
                                                        guest?.status === 'attending' 
                                                        ? 'bg-[#BF953F] text-black font-bold shadow-[0_0_20px_rgba(191,149,63,0.5)]' 
                                                        : 'bg-white/5 border border-white/10 text-white hover:bg-white/10'
                                                    }`}
                                                >
                                                    <div className="flex items-center justify-center gap-3 relative z-10 px-6">
                                                        <Check size={20} strokeWidth={3} className={guest?.status === 'attending' ? 'text-black' : 'text-[#BF953F]'} />
                                                        <span style={{fontFamily: "Taprom", fontSize: "1.1rem"}}>យល់ព្រមចូលរួម</span>
                                                    </div>
                                                    {guest?.status === 'attending' && <motion.div layoutId="rsvp-active" className="absolute inset-0 bg-white/20" />}
                                                </button>

                                                <AnimatePresence>
                                                    {showWishesInput && (
                                                        <motion.div
                                                            initial={{ opacity: 0, height: 0 }}
                                                            animate={{ opacity: 1, height: 'auto' }}
                                                            exit={{ opacity: 0, height: 0 }}
                                                            className="overflow-hidden"
                                                        >
                                                            <div className="bg-[#BF953F]/10 border border-[#BF953F]/30 rounded-2xl p-4 mt-2 mb-4">
                                                                <label className="text-[#BF953F] text-sm mb-2 block font-['Taprom']">សូមសរសេរពាក្យជូនពរ (មិនបង្ខំ):</label>
                                                                <textarea
                                                                    value={wishes}
                                                                    onChange={(e) => setWishes(e.target.value)}
                                                                    className="w-full bg-black/20 border border-[#BF953F]/30 rounded-xl p-3 text-white placeholder:text-white/30 focus:outline-none focus:border-[#BF953F] h-24 resize-none mb-3"
                                                                    placeholder="ជូនពរឱ្យ..."
                                                                />
                                                                <div className="flex gap-2 justify-end">
                                                                    <button
                                                                        onClick={() => {
                                                                            setShowWishesInput(false);
                                                                            if (isEditing) setIsEditing(false);
                                                                        }}
                                                                        className="px-4 py-2 rounded-xl text-sm text-white/60 hover:bg-white/5 transition-colors"
                                                                    >
                                                                        ត្រឡប់ក្រោយ
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleRSVP('attending', wishes)}
                                                                        className="px-6 py-2 rounded-xl text-sm bg-[#BF953F] hover:bg-[#a27e33] text-black font-bold transition-colors shadow-lg shadow-[#BF953F]/20"
                                                                    >
                                                                        បញ្ជូនចម្លើយ
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>

                                                <button
                                                    onClick={() => {
                                                        setShowDeclineInput(true);
                                                        setShowWishesInput(false);
                                                    }}
                                                    className={`relative h-14 rounded-2xl transition-all active:scale-95 ${
                                                        guest?.status === 'declined' 
                                                        ? 'bg-red-500/80 text-white font-bold shadow-[0_0_20px_rgba(239,68,68,0.3)]' 
                                                        : 'bg-white/5 border border-white/10 text-white/60 hover:bg-white/10'
                                                    }`}
                                                >
                                                    <div className="flex items-center justify-center gap-3 px-6">
                                                        <UserX size={20} strokeWidth={3} className={guest?.status === 'declined' ? 'text-white' : 'text-red-400/60'} />
                                                        <span style={{fontFamily: "Taprom", fontSize: "1rem"}}>មិនអាចចូលរួមបាន</span>
                                                    </div>
                                                </button>
                                                
                                                <AnimatePresence>
                                                    {showDeclineInput && (
                                                        <motion.div
                                                            initial={{ opacity: 0, height: 0 }}
                                                            animate={{ opacity: 1, height: 'auto' }}
                                                            exit={{ opacity: 0, height: 0 }}
                                                            className="overflow-hidden"
                                                        >
                                                            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mt-2">
                                                                <label className="text-white/80 text-sm mb-2 block font-['Taprom']">សូមបញ្ជាក់មូលហេតុ (មិនបង្ខំ):</label>
                                                                <textarea
                                                                    value={declineReason}
                                                                    onChange={(e) => setDeclineReason(e.target.value)}
                                                                    className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white placeholder:text-white/30 focus:outline-none focus:border-[#BF953F] h-24 resize-none mb-3"
                                                                    placeholder="មូលហេតុ..."
                                                                />
                                                                <div className="flex gap-2 justify-end">
                                                                    <button
                                                                        onClick={() => {
                                                                            setShowDeclineInput(false);
                                                                            if (isEditing) setIsEditing(false);
                                                                        }}
                                                                        className="px-4 py-2 rounded-xl text-sm text-white/60 hover:bg-white/5 transition-colors"
                                                                    >
                                                                        ត្រឡប់ក្រោយ
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleRSVP('declined', declineReason)}
                                                                        className="px-6 py-2 rounded-xl text-sm bg-red-500 hover:bg-red-600 text-white font-bold transition-colors shadow-lg shadow-red-500/20"
                                                                    >
                                                                        បញ្ជូនចម្លើយ
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </>
                                        )}
                                    </div>

                                    {(guest?.status === 'attending' || guest?.status === 'declined') && !isEditing && (
                                        <motion.div 
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="mt-6 text-[#BF953F] text-sm font-bold flex items-center justify-center gap-2 italic"
                                        >
                                            <div className="w-1 h-1 rounded-full bg-[#BF953F]" />
                                            បានឆ្លើយតបរួចរាល់។ សូមអរគុណ!
                                            <div className="w-1 h-1 rounded-full bg-[#BF953F]" />
                                        </motion.div>
                                    )}
                                </motion.div>
                             </section>
                
                             <section  className="h-screen flex flex-col items-center justify-center bg-transparent text-white pb-10">
                                <div className="p-5">
                                    <img src={optimizeUrl("https://res.cloudinary.com/dfs1iwbh3/image/upload/v1770864789/Form-1_PNG_ulit4q.png", { width: 800 })} alt="" loading="lazy" />
                                </div>
                            </section>

                             <footer className="relative z-10 py-12 pb-24 flex flex-col items-center justify-center text-center pointer-events-auto">
                                <div className="w-32 h-px bg-gradient-to-r from-transparent via-[#BF953F]/40 to-transparent mb-6" />

                                {/* Telegram QR Modal */}
                                <AnimatePresence>
                                    {showTelegramQR && (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                                            onClick={() => setShowTelegramQR(false)}
                                        >
                                            <motion.div
                                                initial={{ scale: 0.9, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                exit={{ scale: 0.9, opacity: 0 }}
                                                className="bg-[#1a1103] border border-[#BF953F]/50 p-6 rounded-3xl max-w-sm w-full relative shadow-[0_0_50px_rgba(191,149,63,0.2)]"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <button 
                                                    onClick={() => setShowTelegramQR(false)}
                                                    className="absolute top-4 right-4 text-[#BF953F]/50 hover:text-[#BF953F] transition-colors"
                                                >
                                                    <X size={24} />
                                                </button>
                                                
                                                <div className="text-center">
                                                    <h3 style={{fontFamily: "Moulpali"}} className="text-[#BF953F] text-lg mb-6">ទំនាក់ទំនងតាម Telegram</h3>
                                                    <div className="bg-white p-4 rounded-xl inline-block mb-4 relative overflow-hidden group/qr">
                                                        <img 
                                                            src={telegramQR} 
                                                            alt="Telegram QR Code" 
                                                            className="w-48 h-48 object-contain"
                                                        />
                                                        {/* Scanning Line Animation */}
                                                        <motion.div 
                                                            className="absolute inset-x-0 h-1 bg-sky-500/50 shadow-[0_0_15px_#0ea5e9] z-10"
                                                            animate={{ top: ["0%", "100%", "0%"] }}
                                                            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                                        />
                                                    </div>
                                                    <p className="text-white/50 text-sm font-light">
                                                        ស្កេនដើម្បីទំនាក់ទំនង
                                                    </p>
                                                </div>
                                            </motion.div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Refined & Legible Credits Section */}
                                <div className="mt-28 flex flex-col items-center gap-16 pb-20">
                                    
                                    {/* Obsidian Glass Card for Maximum Contrast */}
                                    <div className="w-full max-w-sm flex flex-col items-center gap-12 p-10 rounded-[50px] bg-black/60 border border-white/10 backdrop-blur-xl shadow-[0_0_50px_rgba(0,0,0,0.3)]">
                                        
                                        {/* Technical Credits */}
                                        <div className="flex flex-col items-center gap-8 w-full">
                                            <div className="flex flex-col items-center gap-2">
                                                <span 
                                                    style={{ fontFamily: "'Poppins'", fontSize: "0.75rem" }}
                                                    className="text-[#FFDD73]/60 uppercase tracking-[0.4em] font-medium"
                                                >
                                                    System Developed By
                                                </span>
                                                <h3 
                                                    style={{ 
                                                        fontFamily: "Moulpali", 
                                                        fontSize: "1.5rem",
                                                        textShadow: "0 2px 15px rgba(255, 221, 115, 0.3)"
                                                    }}
                                                    className="text-[#FFDD73] drop-shadow-md"
                                                >
                                                    ក្រុមការងារបច្ចេកទេស
                                                </h3>
                                            </div>

                                            <div className="flex flex-col gap-3 w-full">
                                                <div className="flex flex-row items-center gap-3 w-full">
                                                    <a 
                                                        href="tel:098943324"
                                                        className="flex-1 flex items-center justify-center gap-3 px-4 py-3.5 rounded-2xl bg-white/[0.05] border border-[#FFDD73]/30 hover:bg-[#FFDD73]/10 hover:border-[#FFDD73] transition-all duration-500 group"
                                                    >
                                                        <Phone size={12} className="text-[#FFDD73] group-hover:scale-110 transition-transform" />
                                                        <span style={{ fontFamily: "'Poppins'" }} className="text-[#FFDD73] text-[10px] font-semibold tracking-wide">098 943 324</span>
                                                    </a>
                                                    <button 
                                                        onClick={() => setShowTelegramQR(true)}
                                                        className="flex-1 flex items-center justify-center gap-3 px-4 py-3.5 rounded-2xl bg-white/[0.05] border border-[#FFDD73]/30 hover:bg-[#FFDD73]/10 hover:border-[#FFDD73] transition-all duration-500 group"
                                                    >
                                                        <QrCode size={12} className="text-[#FFDD73] group-hover:scale-110 transition-transform" />
                                                        <span style={{ fontFamily: "'Poppins'" }} className="text-[#FFDD73] text-[10px] font-semibold uppercase tracking-wider">Telegram</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Elegant Star Separator */}
                                        <div className="flex items-center gap-4 w-full opacity-40">
                                            <div className="h-px flex-1 bg-gradient-to-l from-[#FFDD73] to-transparent" />
                                            <div className="rotate-45 w-1.5 h-1.5 bg-[#FFDD73]" />
                                            <div className="h-px flex-1 bg-gradient-to-r from-[#FFDD73] to-transparent" />
                                        </div>

                                        {/* Cinematic Studio Credits */}
                                        <div className="flex flex-col items-center gap-6 w-full">
                                            <span 
                                                style={{ fontFamily: "'Poppins'", fontSize: "0.75rem" }}
                                                className="text-[#FFDD73]/60 uppercase tracking-[0.4em] font-medium"
                                            >
                                                Cinematic Experience By
                                            </span>
                                            <motion.a 
                                                href="https://blendstudio.web.app/" 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.98 }}
                                                className="relative group px-1 py-1 rounded-full bg-white/[0.03] border border-white/10 hover:border-[#FFDD73]/40 transition-all duration-700 overflow-hidden"
                                            >
                                                {/* Ambient Glow */}
                                                <div className="absolute inset-0 bg-gradient-to-b from-[#FFDD73]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                                                
                                                <img 
                                                    src="https://firebasestorage.googleapis.com/v0/b/thecosmosdigi.appspot.com/o/logo%2Fblend_studio.png?alt=media&token=dcb16bf4-c08f-4260-924d-1ccae4163dbf" 
                                                    alt="Blend Studio" 
                                                    className="h-16 w-16 object-contain brightness-125 opacity-90 group-hover:opacity-100 transition-all duration-700" 
                                                />
                                            </motion.a>
                                        </div>
                                    </div>

                                    {/* Final Footer Details */}
                                    <div className="flex flex-col items-center gap-6">
                                        <div className="flex items-center gap-3 opacity-20">
                                            <div className="h-px w-16 bg-gradient-to-l from-white to-transparent" />
                                            <Sparkles size={14} className="text-[#FFDD73]" />
                                            <div className="h-px w-16 bg-gradient-to-r from-white to-transparent" />
                                        </div>
                                        
                                        <p 
                                            style={{ fontFamily: "'Poppins'", fontSize: "0.75rem" }}
                                            className="text-[#FFDD73] font-light"
                                        >
                                            ©{new Date().getFullYear()} RAMY & MENGCHOU រក្សាសិទ្ធិគ្រប់យ៉ាង។
                                        </p>
                                    </div>
                                </div>
                            </footer>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Scroll to Top Button */}
            <AnimatePresence>
                {showScrollTop && (
                    <motion.button
                        initial={{ opacity: 0, scale: 0.5, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.5, y: 20 }}
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                        className="fixed bottom-8 right-8 z-50 p-4 rounded-full bg-[#BF953F] text-black shadow-[0_0_20px_rgba(191,149,63,0.4)] hover:scale-110 active:scale-95 transition-transform"
                    >
                        <svg 
                            width="20" 
                            height="20" 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="3" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                        >
                            <path d="m18 15-6-6-6 6"/>
                        </svg>
                    </motion.button>
                )}
            </AnimatePresence>
        </div>
    );
}
