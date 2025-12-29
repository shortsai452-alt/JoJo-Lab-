
import React, { useState, useEffect, useRef } from 'react';
import Layout from './components/Layout';
import { TabType, Vaccine } from './types';
import { 
  calculateEDD, 
  calculateGestationalAge, 
  getVaccineSchedule, 
  calculateLMPFromEDD, 
  getPreciseDuration, 
  addDurationToDate,
  daysToYMD
} from './utils/calculations';
import { format, parseISO, isValid, isAfter, isBefore, startOfToday, addDays } from 'date-fns';
import { getGeminiResponse } from './services/geminiService';

// Updated Logo URL to the new provided branding
const LOGO_URL = "https://raw.githubusercontent.com/fede-navas/test-images/main/jyoti-new-branding.png";
const USER_IMAGE_KEY = "jyoti_app_user_profile_pic";

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>(TabType.PREGNANCY);
  const [userProfileImage, setUserProfileImage] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(USER_IMAGE_KEY);
    if (saved) setUserProfileImage(saved);
    else setUserProfileImage(LOGO_URL);
  }, []);

  const handleUserImageUpload = (base64: string) => {
    setUserProfileImage(base64);
    localStorage.setItem(USER_IMAGE_KEY, base64);
  };

  // Pregnancy State
  const [lmpInput, setLmpInput] = useState<string>('');
  const [eddInput, setEddInput] = useState<string>('');
  const [pregResult, setPregResult] = useState<{ edd?: Date, lmp?: Date, weeks?: number, days?: number } | null>(null);
  const [pregError, setPregError] = useState<string | null>(null);

  // Vaccination State
  const [birthDate, setBirthDate] = useState<string>('');
  const [schedule, setSchedule] = useState<Vaccine[]>([]);
  const [birthError, setBirthError] = useState<string | null>(null);

  // Tools State
  const [toolMode, setToolMode] = useState<'DIFF' | 'OFFSET' | 'DAYS'>('DIFF');
  const [date1, setDate1] = useState<string>('');
  const [date2, setDate2] = useState<string>('');
  const [offsetY, setOffsetY] = useState<number>(0);
  const [offsetM, setOffsetM] = useState<number>(0);
  const [offsetD, setOffsetD] = useState<number>(0);
  const [totalDaysInput, setTotalDaysInput] = useState<number>(0);

  // AI Assistant State
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'bot', text: string }[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  const today = startOfToday();

  // Voice Logic
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.lang = 'hi-IN';
      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setUserInput(prev => (prev ? prev + ' ' + transcript : transcript));
        setIsListening(false);
      };
      recognitionRef.current.onend = () => setIsListening(false);
    }
  }, []);

  const toggleListening = () => {
    if (isListening) recognitionRef.current?.stop();
    else { recognitionRef.current?.start(); setIsListening(true); }
  };

  // Pregnancy Handlers
  const handleLMPChange = (dateStr: string) => {
    setLmpInput(dateStr); setEddInput(''); setPregError(null);
    if (!dateStr) { setPregResult(null); return; }
    const date = parseISO(dateStr);
    if (!isValid(date)) { setPregError('तारीख गलत है।'); return; }
    if (isAfter(date, today)) { setPregError('LMP भविष्य की नहीं हो सकती।'); return; }
    const edd = calculateEDD(date);
    const { weeks, days } = calculateGestationalAge(date);
    setPregResult({ edd, weeks, days, lmp: date });
  };

  const handleEDDChange = (dateStr: string) => {
    setEddInput(dateStr); setLmpInput(''); setPregError(null);
    if (!dateStr) { setPregResult(null); return; }
    const date = parseISO(dateStr);
    if (!isValid(date)) { setPregError('तारीख गलत है।'); return; }
    const lmp = calculateLMPFromEDD(date);
    const { weeks, days } = calculateGestationalAge(lmp);
    setPregResult({ lmp, weeks, days, edd: date });
  };

  const handleBirthDateChange = (dateStr: string) => {
    setBirthDate(dateStr); setBirthError(null);
    if (!dateStr) { setSchedule([]); return; }
    const date = parseISO(dateStr);
    if (!isValid(date) || isAfter(date, today)) { setBirthError('जन्म तिथि गलत है।'); return; }
    setSchedule(getVaccineSchedule(date));
  };

  const sendMessage = async () => {
    if (!userInput.trim()) return;
    const msg = userInput; setUserInput('');
    setChatHistory(prev => [...prev, { role: 'user', text: msg }]);
    setIsLoading(true);
    const response = await getGeminiResponse(msg);
    setChatHistory(prev => [...prev, { role: 'bot', text: response }]);
    setIsLoading(false);
  };

  return (
    <Layout 
      activeTab={activeTab} 
      setActiveTab={setActiveTab} 
      userImage={userProfileImage} 
      onImageUpload={handleUserImageUpload}
      logoImage={LOGO_URL}
    >
      {activeTab === TabType.PREGNANCY && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <section className="bg-white border border-slate-200 p-6 rounded-[2rem] shadow-sm">
            <h2 className="text-xl font-black text-slate-900 mb-1">ANC कैलकुलेटर</h2>
            <p className="text-sm text-slate-500 mb-6 font-medium">प्रसव तिथि (EDD) या गर्भ की आयु जानें।</p>
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-black text-indigo-600 uppercase tracking-widest mb-2 ml-1">अंतिम माहवारी (LMP)</label>
                <input type="date" value={lmpInput} onChange={(e) => handleLMPChange(e.target.value)} className="w-full p-4 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:outline-none bg-slate-50 shadow-inner" />
              </div>
              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200/50"></div></div>
                <div className="relative flex justify-center text-[10px] uppercase font-black"><span className="bg-white px-4 text-slate-300 tracking-[0.3em]">OR / या फिर</span></div>
              </div>
              <div>
                <label className="block text-xs font-black text-indigo-600 uppercase tracking-widest mb-2 ml-1">प्रसव की अपेक्षित तिथि (EDD)</label>
                <input type="date" value={eddInput} onChange={(e) => handleEDDChange(e.target.value)} className="w-full p-4 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:outline-none bg-slate-50 shadow-inner" />
              </div>
            </div>
            {pregError && <div className="mt-5 text-red-700 bg-red-50 p-4 rounded-2xl border border-red-100 text-sm font-bold">{pregError}</div>}
          </section>

          {pregResult && (
            <div className="grid grid-cols-2 gap-4 animate-in zoom-in-95 duration-500">
              <div className="bg-white border border-slate-200 p-5 rounded-3xl shadow-sm text-center">
                <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest block mb-2">EDD तिथि</span>
                <p className="text-xl font-black text-indigo-700">{pregResult.edd ? format(pregResult.edd, 'dd MMM yyyy') : '---'}</p>
              </div>
              <div className="bg-white border border-slate-200 p-5 rounded-3xl shadow-sm text-center">
                <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest block mb-2">LMP तिथि</span>
                <p className="text-xl font-black text-indigo-700">{pregResult.lmp ? format(pregResult.lmp, 'dd MMM yyyy') : '---'}</p>
              </div>
              <div className="col-span-2 bg-indigo-700 p-8 rounded-[2.5rem] shadow-2xl text-white">
                <span className="text-xs text-indigo-200 uppercase font-black tracking-[0.3em]">गर्भ की वर्तमान आयु</span>
                <div className="flex items-baseline gap-8 mt-6">
                  <div className="flex flex-col"><span className="text-6xl font-black">{pregResult.weeks}</span><span className="text-xs font-black text-indigo-300 uppercase tracking-widest">सप्ताह</span></div>
                  <div className="flex flex-col border-l border-indigo-500/50 pl-8"><span className="text-6xl font-black">{pregResult.days}</span><span className="text-xs font-black text-indigo-300 uppercase tracking-widest">दिन</span></div>
                </div>
              </div>
            </div>
          )}

          <div className="bg-red-50 border-2 border-red-200 p-6 rounded-[2.5rem] shadow-md">
            <h3 className="text-lg font-black text-red-900 uppercase tracking-tighter mb-4 flex gap-2">🚨 खतरे के लक्षण</h3>
            <div className="space-y-2">
              {['योनि से रक्तस्राव', 'हाथ-पांव में सूजन', 'तेज सिरदर्द', 'शिशु की हलचल कम होना'].map((s, i) => (
                <div key={i} className="bg-white/60 p-3 rounded-2xl border border-red-100 text-sm font-black text-red-950 flex items-center gap-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full" /> {s}
                </div>
              ))}
            </div>
            <div className="mt-6 bg-red-600 text-white p-4 rounded-2xl font-black text-sm text-center">तुरंत PHC/FRU में रेफर करें!</div>
          </div>
        </div>
      )}

      {activeTab === TabType.VACCINATION && (
        <div className="space-y-6 animate-in fade-in duration-500">
          <section className="bg-sky-50 border border-sky-100 p-6 rounded-[2rem] shadow-sm">
            <h2 className="text-xl font-black text-sky-950 mb-1">टीकाकरण ट्रैकर</h2>
            <p className="text-sm text-sky-700 mb-6 font-medium">जन्म तिथि के अनुसार टीका सूची।</p>
            <input type="date" value={birthDate} onChange={(e) => handleBirthDateChange(e.target.value)} className="w-full p-4 border border-slate-200 rounded-2xl focus:outline-none bg-white shadow-sm" />
            {birthError && <div className="mt-4 text-red-700 bg-red-50 p-4 rounded-2xl text-sm font-bold">{birthError}</div>}
          </section>

          {schedule.length > 0 && (
            <div className="space-y-4">
              {schedule.map((v, idx) => (
                <div key={idx} className="bg-white border border-slate-200 p-5 rounded-3xl shadow-sm flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-[10px] text-sky-600 font-black mb-1 uppercase bg-sky-50 w-fit px-3 py-1 rounded-full">{v.age}</p>
                    <h4 className="font-black text-slate-900">{v.name}</h4>
                    <p className="text-xs text-slate-500 font-bold">{v.hindiName}</p>
                  </div>
                  <div className="bg-slate-50 px-4 py-3 rounded-2xl border border-slate-100 text-center">
                    <p className="text-base font-black text-slate-800">{format(v.dueDate, 'dd MMM')}</p>
                    <p className="text-[10px] text-slate-400 font-black uppercase">{format(v.dueDate, 'yyyy')}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === TabType.TOOLS && (
        <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-500">
          <section className="bg-amber-50 border border-amber-200 p-6 rounded-[2rem] shadow-sm">
            <h2 className="text-xl font-black text-amber-950 mb-1 uppercase tracking-tighter">त्वरित गणना (Insta Calc)</h2>
            <p className="text-sm text-amber-700 mb-6 font-medium leading-tight">साल, महीना और दिन की गणना तुरंत करें।</p>
            
            <div className="flex gap-2 p-1 bg-amber-200/50 rounded-2xl mb-6">
              {[
                { id: 'DIFF', label: 'अंतर' },
                { id: 'OFFSET', label: 'जोड़ें/घटाएं' },
                { id: 'DAYS', label: 'कुल दिन' }
              ].map(m => (
                <button key={m.id} onClick={() => setToolMode(m.id as any)} className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition-all ${toolMode === m.id ? 'bg-amber-600 text-white shadow-md' : 'text-amber-800'}`}>{m.label}</button>
              ))}
            </div>

            {toolMode === 'DIFF' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-amber-600 uppercase mb-1 ml-1">पहली तिथि (Start Date)</label>
                  <input type="date" value={date1} onChange={(e) => setDate1(e.target.value)} className="w-full p-4 border border-amber-200 rounded-2xl bg-white focus:outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-amber-600 uppercase mb-1 ml-1">दूसरी तिथि (End Date)</label>
                  <input type="date" value={date2} onChange={(e) => setDate2(e.target.value)} className="w-full p-4 border border-amber-200 rounded-2xl bg-white focus:outline-none" />
                </div>
              </div>
            )}

            {toolMode === 'OFFSET' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-amber-600 uppercase mb-1 ml-1">प्रारंभिक तिथि (Base Date)</label>
                  <input type="date" value={date1} onChange={(e) => setDate1(e.target.value)} className="w-full p-4 border border-amber-200 rounded-2xl bg-white focus:outline-none" />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[9px] font-black text-amber-600 uppercase mb-1 text-center">साल (Y)</label>
                    <input type="number" value={offsetY} onChange={(e) => setOffsetY(parseInt(e.target.value) || 0)} className="w-full p-3 border border-amber-200 rounded-2xl text-center font-black" />
                  </div>
                  <div>
                    <label className="block text-[9px] font-black text-amber-600 uppercase mb-1 text-center">महीने (M)</label>
                    <input type="number" value={offsetM} onChange={(e) => setOffsetM(parseInt(e.target.value) || 0)} className="w-full p-3 border border-amber-200 rounded-2xl text-center font-black" />
                  </div>
                  <div>
                    <label className="block text-[9px] font-black text-amber-600 uppercase mb-1 text-center">दिन (D)</label>
                    <input type="number" value={offsetD} onChange={(e) => setOffsetD(parseInt(e.target.value) || 0)} className="w-full p-3 border border-amber-200 rounded-2xl text-center font-black" />
                  </div>
                </div>
              </div>
            )}

            {toolMode === 'DAYS' && (
              <div>
                <label className="block text-[10px] font-black text-amber-600 uppercase mb-1 ml-1">कुल दिनों की संख्या (Total Days)</label>
                <input type="number" value={totalDaysInput} onChange={(e) => setTotalDaysInput(parseInt(e.target.value) || 0)} className="w-full p-5 border border-amber-200 rounded-2xl bg-white focus:outline-none font-black text-xl text-center" />
              </div>
            )}
          </section>

          <div className="bg-white border-2 border-slate-100 p-8 rounded-[3rem] shadow-xl">
            <h4 className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em] text-center mb-6">गणना परिणाम (Result)</h4>
            
            {toolMode === 'DIFF' && date1 && date2 && (
              <div className="flex justify-between items-center text-center">
                {Object.entries(getPreciseDuration(parseISO(date1), parseISO(date2))).map(([key, val]) => (
                  <div key={key} className="flex-1">
                    <span className="text-4xl font-black text-slate-900">{val}</span>
                    <p className="text-[10px] font-black text-indigo-600 uppercase mt-1">{key === 'years' ? 'साल' : key === 'months' ? 'महीने' : 'दिन'}</p>
                  </div>
                ))}
              </div>
            )}

            {toolMode === 'OFFSET' && date1 && (
              <div className="text-center py-4">
                <p className="text-4xl font-black text-indigo-700">{format(addDurationToDate(parseISO(date1), offsetY, offsetM, offsetD), 'dd MMM yyyy')}</p>
                <p className="text-[10px] font-black text-slate-400 uppercase mt-2 tracking-widest">आने वाली तिथि (Target Date)</p>
              </div>
            )}

            {toolMode === 'DAYS' && (
              <div className="flex justify-between items-center text-center">
                {Object.entries(daysToYMD(totalDaysInput)).map(([key, val]) => (
                  <div key={key} className="flex-1">
                    <span className="text-4xl font-black text-slate-900">{val}</span>
                    <p className="text-[10px] font-black text-amber-600 uppercase mt-1">{key === 'years' ? 'साल' : key === 'months' ? 'महीने' : 'दिन'}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === TabType.ASSISTANT && (
        <div className="flex flex-col h-[calc(100vh-160px)] animate-in slide-in-from-right-4 duration-500">
          <div className="flex-1 overflow-y-auto p-2 space-y-6 scroll-smooth scrollbar-hide">
            {chatHistory.length === 0 && (
              <div className="text-center py-10 px-6">
                <div className="w-36 h-36 rounded-full border-8 border-white overflow-hidden shadow-2xl mx-auto mb-10 ring-4 ring-indigo-100">
                  <img src={LOGO_URL} alt="Jyoti" className="w-full h-full object-cover" style={{ objectPosition: 'center 20%' }} />
                </div>
                <h3 className="text-slate-900 font-black text-3xl mb-3 tracking-tighter">नमस्ते! मैं ज्योति हूँ।</h3>
                <p className="text-slate-500 text-sm italic font-bold max-w-xs mx-auto mb-10">"बिहार की एएनएम बहनों की सहायता के लिए तैयार हूँ।"</p>
                <div className="grid gap-3">
                  {["गर्भावस्था के खतरे?", "शिशु के टीके?", "LMP-EDD गणना?"].map((q, i) => (
                    <button key={i} onClick={() => setUserInput(q)} className="text-sm bg-white border-2 border-slate-100 p-5 rounded-3xl text-indigo-700 font-black hover:bg-indigo-50 flex items-center justify-between group">
                      <span>{q}</span> <svg className="w-4 h-4 text-indigo-200 group-hover:text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 5l7 7-7 7" /></svg>
                    </button>
                  ))}
                </div>
              </div>
            )}
            {chatHistory.map((chat, idx) => (
              <div key={idx} className={`flex ${chat.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in`}>
                <div className={`p-4 rounded-[2rem] text-sm max-w-[85%] shadow-sm ${chat.role === 'user' ? 'bg-indigo-700 text-white rounded-br-none font-bold' : 'bg-white text-slate-800 rounded-tl-none border border-slate-200'}`}>{chat.text}</div>
              </div>
            ))}
            {isLoading && <div className="flex justify-start pl-4"><div className="bg-white p-3 px-5 rounded-full border border-slate-200 flex gap-2 animate-pulse"><div className="w-2 h-2 bg-indigo-400 rounded-full" /><div className="w-2 h-2 bg-indigo-400 rounded-full" /><div className="w-2 h-2 bg-indigo-400 rounded-full" /></div></div>}
          </div>
          <div className="p-4 bg-white/80 backdrop-blur-xl border-t border-slate-100 sticky bottom-0 z-10 flex gap-3 items-center">
            <div className="flex-1 relative">
              <input type="text" value={userInput} onChange={(e) => setUserInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && sendMessage()} placeholder="सवाल लिखें..." className="w-full p-5 pr-14 border-2 border-slate-100 rounded-[2rem] text-sm focus:outline-none bg-slate-50 shadow-inner font-bold" />
              <button onClick={toggleListening} className={`absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full transition-all ${isListening ? 'bg-red-500 text-white animate-pulse' : 'text-slate-400'}`}><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg></button>
            </div>
            <button onClick={sendMessage} disabled={isLoading} className="bg-indigo-700 text-white p-5 rounded-full shadow-lg active:scale-95 disabled:bg-slate-300"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg></button>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default App;
