import {useState, useEffect, useRef} from "react";
import {useParams} from "react-router-dom";
import {doc, getDoc, updateDoc} from "firebase/firestore";
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
    X,
    Check,
    UserX,
    CalendarPlus,
    Map,
    Navigation,
    Phone,
    QrCode
} from "lucide-react";
import lineNameImg from "../assets/img/lineName.png";
import buttonOpenImg from "../assets/img/buttonOpen.png";
import telegramQR from "../assets/img/mengley.svg";

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
    status?: 'attending' | 'declined' | 'pending' | 'viewed';
    declineReason?: string;
    wishes?: string;
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


    const bgVideo: string = "https://ik.imagekit.io/lhuqyhzsd/bg-1.mp4/ik-video.mp4?updatedAt=1761989014277";
    const introVideo: string = "https://ik.imagekit.io/lhuqyhzsd/intro2.mp4";
    const bgInfoVideo: string = "https://ik.imagekit.io/lhuqyhzsd/bg-light.mp4?updatedAt=1762929599409";
    
    const info001: string = "https://res.cloudinary.com/dfs1iwbh3/image/upload/v1770878132/Picture7_qltipm.png";
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
    const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
    const [declineReason, setDeclineReason] = useState("");
    const [wishes, setWishes] = useState("");
    const [showDeclineInput, setShowDeclineInput] = useState(false);
    const [showWishesInput, setShowWishesInput] = useState(false);
    const [showTelegramQR, setShowTelegramQR] = useState(false);
    const [showScrollTop, setShowScrollTop] = useState(false);

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

            if (status === 'declined') setShowDeclineInput(false);
            if (status === 'attending') setShowWishesInput(false);

        } catch (err) {
            console.error("Error updating RSVP:", err);
        }
    };

    const scrollToSection = (id : string) => {
        const section = document.getElementById(id);
        if (section)
            section.scrollIntoView({behavior: "smooth"});
        

    };

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
                                    {touchAction: 'none', transform: "translate(-50%, -50%) scale(1.15)"}
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
                                <div className="p-2">
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

                            
                            
                            <div className="relative z-20 -mb-16 mt-8 w-full flex flex-col items-center gap-6">
                                <button 
                                    onClick={addToGoogleCalendar}
                                    className="flex items-center gap-2 px-6 py-3 bg-[#BF953F]/10 border border-[#BF953F] rounded-full text-[#BF953F] hover:bg-[#BF953F] hover:text-white transition-all duration-300 backdrop-blur-sm group cursor-pointer"
                                >
                                    <CalendarPlus size={20} />
                                    <span style={{fontFamily: "Taprom", fontSize: "0.9rem"}}>ដាក់កាលវិភាគ</span>
                                </button>
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
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8 pb-4" id="map-button">
                                <a href="https://maps.app.goo.gl/eDfFnEecVdKs1NyM9" target="_blank" 
                                   className="flex items-center gap-3 px-6 py-3 bg-white/5 border border-amber-500/30 rounded-xl text-amber-500 hover:bg-amber-500 hover:text-white transition-all duration-300 w-48 justify-center group cursor-pointer">
                                    <Map size={20} />
                                    <span className="font-bold">Google Maps</span>
                                </a>
                                <a href="https://waze.com/ul/hw232cn7j8" target="_blank" 
                                   className="flex items-center gap-3 px-6 py-3 bg-white/5 border border-amber-500/30 rounded-xl text-amber-500 hover:bg-amber-500 hover:text-white transition-all duration-300 w-48 justify-center group cursor-pointer">
                                    <Navigation size={20} />
                                    <span className="font-bold">Waze</span>
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
                                            {photos.map((photo, index) => {
                                                const patternIndex = index % 5;
                                                const isFullWidth = patternIndex === 0;
                                                
                                                return (
                                                    <motion.div 
                                                        key={index}
                                                        initial={{ opacity: 0, y: 30 }}
                                                        whileInView={{ opacity: 1, y: 0 }}
                                                        viewport={{ once: true, margin: "-50px" }}
                                                        transition={{ duration: 0.6, delay: (index % 5) * 0.1 }}
                                                        className={`${
                                                            isFullWidth 
                                                            ? "col-span-4 row-span-4 h-80 sm:h-[500px] md:h-[650px]" 
                                                            : "col-span-2 h-64 sm:h-[350px] md:h-[450px]"
                                                        } bg-amber-900/10 rounded-xl overflow-hidden relative group`}
                                                    >
                                                        <img 
                                                            src={optimizeUrl(photo, isFullWidth ? { width: 1000 } : { width: 500 })} 
                                                            alt={`Gallery ${index}`} 
                                                            loading="lazy"
                                                            className="object-cover w-full h-full rounded-lg cursor-pointer transition-transform duration-700 group-hover:scale-110" 
                                                            onClick={() => setSelectedPhoto(photo)}
                                                        />
                                                        {/* Subtle Overlay on Hover */}
                                                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none flex items-center justify-center">
                                                            <div className="p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 scale-50 group-hover:scale-100 transition-transform duration-500">
                                                                <Image size={24} className="text-white" />
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                );
                                            })}
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
                            
                            <section id="gift-framed" className="relative z-10 flex justify-center items-center px-20 py-8">
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
                                            src={optimizeUrl("https://res.cloudinary.com/dfs1iwbh3/image/upload/v1770811125/IMG_2866_keyqfy.jpg", { width: 250 })} 
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
                            <div className="flex flex-row items-center justify-center pt-8 pb-8 w-full">
                                <div className="flex-1 px-4">
                                    <Separator className="bg-gradient-to-r from-transparent via-[#BF953F]/40 to-transparent"/>
                                </div>
                                <div className="px-6 items-center justify-center flex">
                                    <div style={{fontFamily: "Taprom", fontSize: "1rem"}} className="text-[#BF953F]/80 whitespace-nowrap italic">
                                        ចុចលើកាដូខាងក្រោមនេះ
                                    </div>
                                </div>
                                <div className="flex-1 px-4">
                                    <Separator className="bg-gradient-to-r from-transparent via-[#BF953F]/40 to-transparent"/>
                                </div>
                            </div>

                            <motion.div 
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                className="flex flex-row items-center justify-center"
                            >
                                <div style={{ height: 50, width: 50, rotate: "270deg", marginTop:'30px'}}>
                                    <Lottie
                                            animationData={arrowAnimationData}
                                            loop={true} 
                                            autoplay={true} 
                                    />
                                </div>
                                
                                <motion.div 
                                    style={{ height: 140, width: 140 }}
                                    animate={{ 
                                        scale: [1, 1.1, 1],
                                        filter: ["drop-shadow(0 0 0px #BF953F00)", "drop-shadow(0 0 15px #BF953F66)", "drop-shadow(0 0 0px #BF953F00)"]
                                    }}
                                    transition={{ 
                                        duration: 2, 
                                        repeat: Infinity,
                                        ease: "easeInOut" 
                                    }}
                                    className="cursor-pointer relative z-20"
                                >
                                    <a href="https://pay.ababank.com/oRF8/bqjwmrsc" target="_blank" rel="noopener noreferrer" className="block w-full h-full">
                                        <Lottie
                                            animationData={giftAnimationData}
                                            loop={true} 
                                            autoplay={true} 
                                        />
                                    </a>
                                </motion.div>
                                
                                <div style={{ height: 50, width: 50, rotate: "90deg", marginTop:'30px'}}>
                                    <Lottie
                                            animationData={arrowAnimationData}
                                            loop={true} 
                                            autoplay={true} 
                                    />
                                </div>
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
                                        <button
                                            onClick={() => setShowWishesInput(true)}
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
                                                                onClick={() => setShowWishesInput(false)}
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
                                            onClick={() => setShowDeclineInput(true)}
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
                                                                onClick={() => setShowDeclineInput(false)}
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
                                    </div>

                                    {(guest?.status === 'attending' || guest?.status === 'declined') && (
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
                                
                                <p className="text-[#BF953F]/50 text-[10px] uppercase tracking-[0.3em] font-light mb-3">
                                    System Developed By
                                </p>
                                
                                <div className="group relative cursor-pointer hover:scale-105 transition-transform duration-300">
                                    <div className="absolute -inset-3 bg-[#BF953F]/10 blur-lg rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                    <h3 
                                        style={{fontFamily: "Moulpali"}} 
                                        className="relative text-transparent bg-clip-text bg-gradient-to-r from-[#BF953F] via-[#F3E5AB] to-[#BF953F] text-base md:text-lg animate-gradient bg-300% drop-shadow-[0_2px_10px_rgba(191,149,63,0.2)]"
                                    >
                                        ក្រុមការងារបច្ចេកទេស
                                    </h3>
                                </div>

                                <div className="mt-5 flex items-center gap-4">
                                   <a href="tel:098943324" className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#BF953F]/10 border border-[#BF953F]/30 hover:bg-[#BF953F]/20 transition-all group">
                                        <Phone size={14} className="text-[#BF953F] group-hover:scale-110 transition-transform" />
                                        <span className="text-[#BF953F] text-xs font-mono tracking-wider">098 943 324</span>
                                   </a>
                                   
                                   <button 
                                        onClick={() => setShowTelegramQR(true)}
                                        className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#BF953F]/10 border border-[#BF953F]/30 hover:bg-[#BF953F]/20 transition-all group cursor-pointer"
                                    >
                                        <QrCode size={14} className="text-[#BF953F] group-hover:scale-110 transition-transform" />
                                        <span className="text-[#BF953F] text-xs font-mono tracking-wider uppercase">Telegram</span>
                                   </button>
                                </div>
                                
                                <p className="text-white/10 text-[9px] mt-8 tracking-widest font-light">
                                    © {new Date().getFullYear()} E-INVITATION SYSTEM
                                </p>

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
                                                    <div className="bg-white p-4 rounded-xl inline-block mb-4">
                                                        <img 
                                                            src={telegramQR} 
                                                            alt="Telegram QR Code" 
                                                            className="w-48 h-48 object-contain"
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
