import React, { useState, useEffect, useRef } from 'react';

// --- 1. 아이콘 (SVG 직접 정의로 오류 방지) ---
const Icons = {
  ChevronLeft: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>,
  ChevronRight: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>,
  Heart: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="#f43f5e" stroke="#f43f5e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>,
  MapPin: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>,
  Sparkles: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L12 3Z"/></svg>,
  Copy: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>,
  Phone: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
};

export default function App() {
  const [currentPage, setCurrentPage] = useState(0);
  const totalPages = 6;
  
  // 데이터
  const babyName = "백서한";
  const eventDate = "2026.03.14 (토) 오후 6:30";
  const realBirthday = "03.12";
  const locationName = "노보텔 앰배서더 수원";
  const locationAddress = "경기 수원시 팔달구 덕영대로 902";
  const parents = {
    dad: { name: "백호준", phone: "010-1234-5678" },
    mom: { name: "심다은", phone: "010-8765-4321" }
  };
  const mainPhotoUrl = "https://images.unsplash.com/photo-1544126566-475a89762df7?q=80&w=800&auto=format&fit=crop";

  // 갤러리 이미지 ID 목록 (12장)
  const galleryImageIds = [
    '1522771753037-993b27958acd', // 1
    '1519689680058-324335c77eba', // 2
    '1510153806139-0b7274029272', // 3
    '1503454537195-1dcabb73ffb9', // 4
    '1467635626247-493484f4292e', // 5
    '1515488042361-af9246005d7b', // 6
    '1555252333-9f8e90e6e8e9',    // 7
    '1556910103-1c02745a30bf',    // 8
    '1505314771844-306917711283', // 9
    '1520004434532-3d06d955923e', // 10
    '1512762291583-4a11b069695d', // 11
    '1519340333755-56e9c1d04579'  // 12
  ];

  // Gemini States
  const [relation, setRelation] = useState("");
  const [wishKeyword, setWishKeyword] = useState("");
  const [generatedMessage, setGeneratedMessage] = useState("");
  const [isGeneratingMsg, setIsGeneratingMsg] = useState(false);
  const [selectedDoljabi, setSelectedDoljabi] = useState(null);
  const [doljabiResult, setDoljabiResult] = useState("");
  const [isPredicting, setIsPredicting] = useState(false);

  // 터치 스와이프 로직
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => setTouchEnd(e.targetTouches[0].clientX);

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    if (isLeftSwipe) nextPage();
    if (isRightSwipe) prevPage();
  };

  const nextPage = () => {
    if (currentPage < totalPages - 1) setCurrentPage(curr => curr + 1);
  };

  const prevPage = () => {
    if (currentPage > 0) setCurrentPage(curr => curr - 1);
  };

  const copyToClipboard = (text) => {
    const el = document.createElement('textarea');
    el.value = text;
    document.body.appendChild(el);
    el.select();
    try {
        document.execCommand('copy');
        alert("복사되었습니다!");
    } catch(e) { alert("지원되지 않는 환경입니다."); }
    document.body.removeChild(el);
  };

  // AI API Call
  const callGemini = async (prompt) => {
    const API_KEY = ""; // System key
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        }
      );
      if (!response.ok) throw new Error(`API call failed`);
      const data = await response.json();
      return data.candidates[0].content.parts[0].text;
    } catch (error) {
      return "죄송해요, AI가 잠시 쉬고 있어요.";
    }
  };

  const handleGenerateMessage = async () => {
    if(!relation) return alert("관계를 입력해주세요!");
    setIsGeneratingMsg(true);
    setGeneratedMessage("");
    const prompt = `Write a warm, short Korean congratulatory message for baby ${babyName}'s 1st birthday. From: ${relation}, Wish: ${wishKeyword}. Use emojis.`;
    const result = await callGemini(prompt);
    setGeneratedMessage(result);
    setIsGeneratingMsg(false);
  };

  const handleDoljabiPrediction = async (item) => {
    setSelectedDoljabi(item);
    setIsPredicting(true);
    setDoljabiResult("");
    const prompt = `Baby ${babyName} picked ${item} at Doljanchi. Predict future career/personality in Korean. Fun tone. 2 sentences.`;
    const result = await callGemini(prompt);
    setDoljabiResult(result);
    setIsPredicting(false);
  };

  // --- 페이지 컴포넌트들 ---

  const renderPage = () => {
    switch(currentPage) {
      case 0: // Cover
        return (
          <div className="h-full flex flex-col items-center justify-center p-6 text-center animate-fadeIn">
            <div className="mb-2 text-stone-500 tracking-[0.3em] text-xs uppercase">Invitation</div>
            <h1 className="text-3xl font-serif text-stone-800 mb-6">{babyName}의 첫 생일</h1>
            <div className="relative w-56 h-72 mb-8 shadow-xl rotate-1 border-4 border-white bg-white">
                <img src={mainPhotoUrl} className="w-full h-full object-cover" alt="Main" />
                <div className="absolute -bottom-10 -right-10 text-6xl font-serif text-stone-200 opacity-50 -z-10">1st</div>
            </div>
            <div className="space-y-1 font-light text-stone-600">
                <p className="text-lg font-serif text-stone-900">{eventDate}</p>
                <p className="text-sm">{locationName}</p>
            </div>
            <div className="mt-8 text-xs text-stone-400 animate-pulse">
                넘겨서 확인해주세요 →
            </div>
          </div>
        );
      case 1: // Greeting
        return (
          <div className="h-full flex flex-col items-center justify-center p-8 text-center animate-fadeIn bg-white/50">
            <div className="mb-6"><Icons.Heart /></div>
            <h2 className="text-xl font-bold mb-6 text-stone-700 font-serif">초대합니다</h2>
            <div className="space-y-4 text-stone-600 leading-loose text-sm font-light">
              <p>화이트데이 사탕처럼 달콤한<br/>서한이가 첫 생일을 맞이했습니다.</p>
              <p>사랑스러운 아이로 자랄 수 있도록<br/>함께 자리하셔서 축복해주세요.</p>
            </div>
            <div className="mt-12 w-full border-t border-stone-200 pt-6">
                <div className="flex justify-around text-sm text-stone-600">
                    <div>
                        <span className="block text-xs text-stone-400 mb-1">아빠</span>
                        <span className="font-bold">{parents.dad.name}</span>
                    </div>
                    <div>
                        <span className="block text-xs text-stone-400 mb-1">엄마</span>
                        <span className="font-bold">{parents.mom.name}</span>
                    </div>
                </div>
            </div>
          </div>
        );
      case 2: // Calendar & Location
        return (
          <div className="h-full flex flex-col p-6 animate-fadeIn">
             <div className="text-center mb-6">
                 <div className="text-xs font-bold text-stone-400 tracking-widest mb-1">DATE & LOCATION</div>
                 <h2 className="text-xl font-bold text-stone-800">언제, 어디서?</h2>
             </div>
             
             {/* Calendar View */}
             <div className="bg-white p-4 rounded-lg shadow-sm mb-6 border border-stone-100">
                <div className="flex justify-between items-end mb-2 border-b border-stone-100 pb-2">
                    <span className="text-xl font-bold text-stone-700">3월</span>
                    <span className="text-xs text-stone-400">2026</span>
                </div>
                <div className="grid grid-cols-7 text-center text-xs gap-y-3 text-stone-500">
                    <div className="text-rose-400">일</div><div>월</div><div>화</div><div>수</div><div>목</div><div>금</div><div>토</div>
                    <div>1</div><div>2</div><div>3</div><div>4</div><div>5</div><div>6</div><div>7</div>
                    <div>8</div><div>9</div><div>10</div><div>11</div><div className="relative"><span className="absolute -top-1 right-0 text-[8px] text-yellow-500">🎂</span>12</div><div>13</div>
                    <div className="relative"><div className="absolute inset-0 bg-rose-500 rounded-full opacity-20"></div><span className="relative font-bold text-rose-600">14</span></div>
                    <div>15</div><div>16</div><div>17</div><div>18</div><div>19</div><div>20</div><div>21</div>
                    <div>22</div><div>23</div><div>24</div><div>25</div><div>26</div><div>27</div><div>28</div>
                    <div>29</div><div>30</div><div>31</div>
                </div>
             </div>

             <div className="bg-stone-100 p-4 rounded-lg text-sm space-y-2">
                <div className="flex items-start gap-2">
                    <div className="mt-1 text-stone-400"><Icons.MapPin /></div>
                    <div>
                        <div className="font-bold text-stone-700">{locationName}</div>
                        <div className="text-stone-500 text-xs">{locationAddress}</div>
                    </div>
                </div>
                <div className="pl-7 text-xs text-stone-500">
                    * 수원역 AK플라자 주차장 이용 (3시간 무료)
                </div>
             </div>
          </div>
        );
      case 3: // Gallery (Updated to 12 images)
        return (
          <div className="h-full flex flex-col p-6 animate-fadeIn">
            <div className="text-center mb-6">
                 <div className="text-xs font-bold text-stone-400 tracking-widest mb-1">GALLERY</div>
                 <h2 className="text-xl font-bold text-stone-800">서한이의 순간들</h2>
            </div>
            <div className="grid grid-cols-2 gap-3 overflow-y-auto pb-4 custom-scrollbar">
                {galleryImageIds.map((id, index) => (
                    <div key={index} className="aspect-square bg-stone-200 rounded-lg overflow-hidden shadow-sm">
                        <img 
                           src={`https://images.unsplash.com/photo-${id}?q=80&w=300&auto=format&fit=crop`}
                           className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                           alt={`Gallery ${index + 1}`}
                           loading="lazy"
                        />
                    </div>
                ))}
            </div>
          </div>
        );
      case 4: // Gemini 1
        return (
          <div className="h-full flex flex-col p-6 animate-fadeIn">
            <div className="text-center mb-6">
                 <div className="text-xs font-bold text-purple-400 tracking-widest mb-1 flex items-center justify-center gap-1"><Icons.Sparkles /> AI GEMINI</div>
                 <h2 className="text-xl font-bold text-stone-800">AI 덕담 한마디</h2>
                 <p className="text-xs text-stone-500 mt-1">AI가 축하 메시지를 대신 써드려요!</p>
            </div>
            
            <div className="bg-white p-4 rounded-xl shadow-sm border border-purple-100 space-y-3">
                <input 
                    className="w-full bg-stone-50 border border-stone-200 p-2 rounded text-sm focus:outline-purple-300"
                    placeholder="관계 (예: 삼촌)"
                    value={relation}
                    onChange={e => setRelation(e.target.value)}
                />
                <input 
                    className="w-full bg-stone-50 border border-stone-200 p-2 rounded text-sm focus:outline-purple-300"
                    placeholder="키워드 (예: 건강, 행복)"
                    value={wishKeyword}
                    onChange={e => setWishKeyword(e.target.value)}
                />
                <button 
                    onClick={handleGenerateMessage}
                    className="w-full bg-purple-500 text-white py-2 rounded font-bold text-sm hover:bg-purple-600 transition-colors"
                >
                    {isGeneratingMsg ? "AI가 글 쓰는 중..." : "메시지 생성하기"}
                </button>
            </div>

            {generatedMessage && (
                <div className="mt-4 p-4 bg-purple-50 rounded-xl relative text-sm text-stone-700 leading-relaxed animate-slideUp">
                    "{generatedMessage}"
                    <button 
                        onClick={() => copyToClipboard(generatedMessage)}
                        className="absolute bottom-2 right-2 text-stone-400 hover:text-purple-600"
                    >
                        <Icons.Copy />
                    </button>
                </div>
            )}
          </div>
        );
      case 5: // Gemini 2 & End
        return (
          <div className="h-full flex flex-col p-6 animate-fadeIn">
            <div className="text-center mb-4">
                 <div className="text-xs font-bold text-blue-400 tracking-widest mb-1 flex items-center justify-center gap-1"><Icons.Sparkles /> AI FUN</div>
                 <h2 className="text-xl font-bold text-stone-800">돌잡이 예언</h2>
            </div>
            
            <div className="grid grid-cols-3 gap-2 mb-4">
                {['연필', '실', '돈', '마이크', '청진기', '판사봉'].map(item => (
                    <button 
                        key={item}
                        onClick={() => handleDoljabiPrediction(item)}
                        className={`aspect-video rounded border text-xs flex flex-col items-center justify-center gap-1 ${selectedDoljabi === item ? 'bg-blue-100 border-blue-300 text-blue-800' : 'bg-white border-stone-200 text-stone-600'}`}
                    >
                        <span>{item}</span>
                    </button>
                ))}
            </div>
            
            <div className="bg-stone-50 p-3 rounded h-20 text-xs text-stone-600 overflow-y-auto mb-8 border border-stone-100">
                {isPredicting ? "미래를 보는 중..." : doljabiResult || "물건을 선택하면 AI가 미래를 점쳐드려요!"}
            </div>

            <div className="mt-auto border-t border-stone-200 pt-6 text-center">
                <p className="text-sm font-bold text-stone-700 mb-4">연락처 안내</p>
                <div className="flex justify-center gap-4">
                    <a href={`tel:${parents.dad.phone}`} className="flex items-center gap-2 px-4 py-2 bg-stone-800 text-white rounded-full text-xs hover:bg-stone-700">
                        <Icons.Phone /> 아빠에게 전화
                    </a>
                    <a href={`tel:${parents.mom.phone}`} className="flex items-center gap-2 px-4 py-2 bg-stone-800 text-white rounded-full text-xs hover:bg-stone-700">
                        <Icons.Phone /> 엄마에게 전화
                    </a>
                </div>
                <div className="text-[10px] text-stone-400 mt-6">
                    Seohan's 1st Birthday Invitation
                </div>
            </div>
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#f0eee6] flex items-center justify-center font-sans overflow-hidden">
      {/* 배경 텍스처 효과 */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }}></div>

      {/* Booklet Container */}
      <div className="relative w-full max-w-md h-[85vh] max-h-[700px] perspective-1000 mx-4">
        
        {/* Book Body */}
        <div 
            className="w-full h-full bg-[#faf9f6] shadow-2xl rounded-r-2xl rounded-l-md overflow-hidden relative border-r-8 border-stone-200 flex flex-col"
            style={{ 
                boxShadow: "20px 20px 60px #bebebe, -20px -20px 60px #ffffff",
                transformStyle: "preserve-3d"
            }}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
        >
            {/* Spine Effect (Left Shadow) */}
            <div className="absolute top-0 left-0 w-8 h-full bg-gradient-to-r from-stone-300/50 to-transparent z-20 pointer-events-none"></div>

            {/* Page Content */}
            <div className="flex-1 relative overflow-hidden">
                {renderPage()}
            </div>

            {/* Page Indicator & Navigation */}
            <div className="h-14 bg-[#faf9f6] border-t border-stone-100 flex items-center justify-between px-6 z-30">
                <button 
                    onClick={prevPage} 
                    disabled={currentPage === 0}
                    className={`p-2 rounded-full transition-colors ${currentPage === 0 ? 'text-stone-300' : 'text-stone-600 hover:bg-stone-200'}`}
                >
                    <Icons.ChevronLeft />
                </button>
                
                <div className="flex gap-1.5">
                    {Array.from({ length: totalPages }).map((_, i) => (
                        <div 
                            key={i} 
                            className={`h-1.5 rounded-full transition-all duration-300 ${i === currentPage ? 'w-6 bg-stone-600' : 'w-1.5 bg-stone-300'}`}
                        />
                    ))}
                </div>

                <button 
                    onClick={nextPage} 
                    disabled={currentPage === totalPages - 1}
                    className={`p-2 rounded-full transition-colors ${currentPage === totalPages - 1 ? 'text-stone-300' : 'text-stone-600 hover:bg-stone-200'}`}
                >
                    <Icons.ChevronRight />
                </button>
            </div>
        </div>
      </div>
    </div>
  );
}