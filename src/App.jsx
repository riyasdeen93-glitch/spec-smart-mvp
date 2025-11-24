import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Download, Shield, ArrowRight, ArrowLeft, Plus, Trash2, Edit, FileText, Sparkles, Loader, Layout, Save, Copy, Settings, Ruler, Globe, AlertTriangle, ChevronDown, Building2, FolderOpen, LogOut, Grid } from 'lucide-react';

// --- GEMINI API UTILITIES ---
const apiKey = ""; // API Key injected at runtime

const callGemini = async (prompt) => {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;
  const payload = {
    contents: [{ parts: [{ text: prompt }] }]
  };

  const delays = [1000, 2000, 4000, 8000, 16000];
  
  for (let i = 0; i <= delays.length; i++) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        if (response.status === 429 && i < delays.length) {
          await new Promise(r => setTimeout(r, delays[i]));
          continue;
        }
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || "No response generated.";
    } catch (error) {
      if (i === delays.length) throw error;
      await new Promise(r => setTimeout(r, delays[i]));
    }
  }
};

// --- DATA & CONSTANTS ---

const PROJECT_TYPES = {
  'Commercial Office': ['Open Office', 'Private Office', 'Conference Room', 'Server Room', 'Main Entry', 'Stairwell', 'Restroom'],
  'Hospital / Healthcare': ['Patient Room', 'Surgery / OR', 'Clean Utility', 'Soiled Utility', 'Exam Room', 'Nurses Station', 'Waiting Area', 'Corridor Cross Door'],
  'Education / School': ['Classroom', 'Auditorium', 'Cafeteria', 'Library', 'Gymnasium', 'Staff Lounge', 'Science Lab', 'Main Entrance'],
  'Airport / Transport': ['Terminal Entry', 'Security Checkpoint', 'Baggage Handling', 'Retail', 'Gate Holdroom', 'Runway Access', 'Restroom'],
  'Hospitality / Hotel': ['Guest Room Entry', 'Ballroom', 'Kitchen Service', 'Pool Access', 'Lobby Main', 'Back of House'],
  'Residential': ['Unit Entry', 'Bedroom', 'Bathroom', 'Balcony', 'Utility Closet']
};

const STANDARDS = {
  ANSI: {
    label: 'ANSI / BHMA (American)',
    units: 'Imperial (Inches)',
    fireRatings: [0, 20, 45, 60, 90, 180],
    hingeStd: 'ANSI A156.1',
    lockStd: 'ANSI A156.13',
    exitStd: 'ANSI A156.3',
    closerStd: 'ANSI A156.4',
    dimUnit: 'in',
    defaultWidth: 36,
    defaultHeight: 84,
    limits: {
      Single: { minW: 24, maxW: 48, minH: 80, maxH: 120 },
      Pair: { minW: 48, maxW: 96, minH: 80, maxH: 120 },
      'Leaf & half': { minW: 36, maxW: 72, minH: 80, maxH: 120 }
    }
  },
  EN: {
    label: 'EN / CE (European)',
    units: 'Metric (mm)',
    fireRatings: ['N/A', 'FD30', 'FD60', 'FD90', 'FD120', 'FD240'],
    hingeStd: 'EN 1935',
    lockStd: 'EN 12209',
    exitStd: 'EN 1125 / EN 179',
    closerStd: 'EN 1154',
    dimUnit: 'mm',
    defaultWidth: 900,
    defaultHeight: 2100,
    limits: {
      Single: { minW: 600, maxW: 1300, minH: 1900, maxH: 3000 },
      Pair: { minW: 1200, maxW: 2600, minH: 1900, maxH: 3000 },
      'Leaf & half': { minW: 1000, maxW: 1900, minH: 1900, maxH: 3000 }
    }
  }
};

const GENERIC_DATA = {
  functions: [
    { id: 'passage', label: 'Passage', desc: 'Non-locking. Latch retracted by lever either side.' },
    { id: 'privacy', label: 'Privacy', desc: 'Locked by thumbturn inside. Emergency release outside.' },
    { id: 'office', label: 'Office / Entry', desc: 'Key outside locks lever. Inside always free.' },
    { id: 'storeroom', label: 'Storeroom / Secure', desc: 'Outside lever rigid. Key retracts latch. Inside always free.' },
    { id: 'classroom', label: 'Classroom', desc: 'Key outside locks/unlocks lever. Free egress. Cannot be locked by accident.' },
    { id: 'exit_only', label: 'Exit Only', desc: 'No hardware outside. Panic device or handle inside.' }
  ]
};

const PRODUCT_VARIANTS = {
  Hinge: ['Butt Hinge', 'Continuous Geared Hinge', 'Pivot Set', 'Concealed Hinge'],
  Lock: ['Mortise Lock', 'Cylindrical Lock', 'Deadbolt', 'Magnetic Lock'],
  Exit: ['Panic Bar (Rim)', 'Panic Bar (Vert Rod)', 'Panic Bar (Mortise)'],
  Closer: ['Overhead Closer', 'Floor Spring', 'Concealed Overhead Closer', 'Cam Action Closer'],
  Stop: ['Wall Stop', 'Floor Stop', 'Overhead Stop'],
  Bolt: ['Flush Bolt (Manual)', 'Flush Bolt (Automatic)', 'Surface Bolt']
};

export default function SpecSmartMVP() {
  // GLOBAL STATE: ALL PROJECTS
  const [savedProjects, setSavedProjects] = useState([]);
  const [currentProjectId, setCurrentProjectId] = useState(null);

  // APP VIEW STATE: 'project_list' | 'setup' | 'dashboard' | 'wizard'
  const [view, setView] = useState('project_list');
  
  // CURRENT ACTIVE PROJECT SETTINGS
  const [projectSettings, setProjectSettings] = useState({
    name: '',
    type: 'Commercial Office',
    standard: 'EN',
    units: 'Metric'
  });

  // CURRENT ACTIVE PROJECT DOORS
  const [projectDoors, setProjectDoors] = useState([]);

  // WIZARD STATE
  const [editingId, setEditingId] = useState(null);
  const [step, setStep] = useState(1);
  const [warnings, setWarnings] = useState([]);
  
  // Validation States
  const [doorNoErr, setDoorNoErr] = useState('');
  const [dimErr, setDimErr] = useState('');

  // AI States
  const [aiAnalysis, setAiAnalysis] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiNarrative, setAiNarrative] = useState("");
  const [isWritingNarrative, setIsWritingNarrative] = useState(false);

  // CURRENT DOOR DATA
  const [doorData, setDoorData] = useState({}); 
  const [funcSelect, setFuncSelect] = useState('');
  const [hwItems, setHwItems] = useState([]);

  // --- PERSISTENCE EFFECT ---
  // Automatically sync current project data to savedProjects list whenever it changes
  useEffect(() => {
    if (currentProjectId && view !== 'project_list' && view !== 'setup') {
      setSavedProjects(prev => prev.map(p => 
        p.id === currentProjectId 
          ? { ...p, settings: projectSettings, doors: projectDoors, lastModified: Date.now() } 
          : p
      ));
    }
  }, [projectDoors, projectSettings]);

  // --- ACTIONS: PROJECT MANAGEMENT ---

  const initNewProject = () => {
    setProjectSettings({
      name: 'New Project',
      type: 'Commercial Office',
      standard: 'EN',
      units: 'Metric'
    });
    setProjectDoors([]);
    setCurrentProjectId(null);
    setView('setup');
  };

  const deleteProject = (id, e) => {
    e.stopPropagation();
    if(window.confirm("Are you sure you want to delete this project?")) {
      setSavedProjects(prev => prev.filter(p => p.id !== id));
    }
  };

  const openProject = (project) => {
    setProjectSettings(project.settings);
    setProjectDoors(project.doors);
    setCurrentProjectId(project.id);
    setView('dashboard');
  };

  const handleSetupComplete = () => {
    const newId = Date.now();
    const newProject = {
      id: newId,
      settings: projectSettings,
      doors: [],
      lastModified: Date.now()
    };
    setSavedProjects(prev => [...prev, newProject]);
    setCurrentProjectId(newId);
    setProjectDoors([]);
    setView('dashboard');
  };

  const exitToProjects = () => {
    setView('project_list');
    setCurrentProjectId(null);
  };

  // --- ACTIONS: DOOR MANAGEMENT ---

  const generateNextDoorNo = () => {
    let nextNum = projectDoors.length + 1;
    let potentialNo = `D-${100 + nextNum}`;
    while (projectDoors.some(d => d.doorNo === potentialNo)) {
      nextNum++;
      potentialNo = `D-${100 + nextNum}`;
    }
    return potentialNo;
  };

  const startNewDoor = () => {
    setEditingId(null);
    const std = STANDARDS[projectSettings.standard] || STANDARDS.EN;
    
    setDoorData({
      doorNo: generateNextDoorNo(),
      location: '', 
      type: 'Timber Solid Core',
      config: 'Single',
      width: std.defaultWidth,
      height: std.defaultHeight,
      thickness: projectSettings.units === 'Imperial' ? 1.75 : 44,
      handing: 'RH',
      fireRating: std.fireRatings[0], 
      security: 'Standard',
      traffic: 'Low',
      accessControl: false,
      specialReq: [],
      narrative: '' 
    });
    setFuncSelect('');
    setHwItems([]);
    setStep(1);
    setWarnings([]);
    setDoorNoErr('');
    setDimErr('');
    setAiNarrative("");
    setView('wizard');
  };

  const editDoor = (door) => {
    setEditingId(door.id);
    setDoorData({ ...door }); 
    setFuncSelect(door.func);
    setHwItems([...door.hwItems]);
    setAiNarrative(door.narrative || "");
    setStep(3); 
    setView('wizard');
  };

  const deleteDoor = (id) => {
    setProjectDoors(prev => prev.filter(d => d.id !== id));
  };

  const saveDoorToProject = () => {
    if (doorNoErr || dimErr) return;

    const doorPayload = { id: editingId || Date.now(), ...doorData, func: funcSelect, hwItems, narrative: aiNarrative };
    if (editingId) {
      setProjectDoors(prev => prev.map(d => d.id === editingId ? doorPayload : d));
    } else {
      setProjectDoors(prev => [...prev, doorPayload]);
    }
    setView('dashboard');
  };

  const exportToCSV = () => {
    let csvContent = `Door No,Location,Type,Config,Size (${projectSettings.units}),Fire Rating,Function,Item Ref,Product Type,Specification,Qty,Standard,Operation Narrative\n`;

    projectDoors.forEach(door => {
      const narrativeClean = (door.narrative || "").replace(/(\r\n|\n|\r)/gm, " ").replace(/,/g, ";");
      if (door.hwItems.length === 0) {
        csvContent += `${door.doorNo},${door.location},${door.type},${door.config},${door.width}x${door.height},${door.fireRating},${door.func},,,,${projectSettings.standard},"${narrativeClean}"\n`;
      } else {
        door.hwItems.forEach(item => {
           csvContent += `${door.doorNo},${door.location},${door.type},${door.config},${door.width}x${door.height},${door.fireRating},${door.func},${item.ref},"${item.type}","${item.spec}",${item.qty},${projectSettings.standard},"${narrativeClean}"\n`;
        });
      }
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${projectSettings.name.replace(/\s+/g, '_')}_Schedule.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- VALIDATION EFFECTS ---
  useEffect(() => {
    if (view !== 'wizard') return;
    const isDuplicate = projectDoors.some(d => d.doorNo === doorData.doorNo && d.id !== editingId);
    setDoorNoErr(isDuplicate ? 'Door Number already exists in project.' : '');
  }, [doorData.doorNo, projectDoors, editingId, view]);

  useEffect(() => {
    if (view !== 'wizard') return;
    const std = STANDARDS[projectSettings.standard];
    const limits = std.limits[doorData.config]; 
    if (!limits) return;
    const w = parseFloat(doorData.width);
    const h = parseFloat(doorData.height);
    let error = '';
    if (w < limits.minW || w > limits.maxW) error = `Width must be ${limits.minW}-${limits.maxW}${std.dimUnit}`;
    else if (h < limits.minH || h > limits.maxH) error = `Height must be ${limits.minH}-${limits.maxH}${std.dimUnit}`;
    setDimErr(error);
  }, [doorData.width, doorData.height, doorData.config, projectSettings.standard, view]);

  // --- HARDWARE LOGIC ---
  useEffect(() => {
    if (!funcSelect || view !== 'wizard') return;
    if (hwItems.length > 0 && editingId) return; 

    let items = [];
    const isANSI = projectSettings.standard === 'ANSI';
    const std = STANDARDS[isANSI ? 'ANSI' : 'EN'];
    const isPair = doorData.config === 'Pair';
    const leafQty = isPair ? 2 : 1;
    const isFire = isANSI ? doorData.fireRating > 0 : doorData.fireRating !== 'N/A';

    let hingeQty = 3;
    if (isANSI && doorData.height > 90) hingeQty = 4;
    else if (!isANSI && doorData.height > 2400) hingeQty = 4;
    hingeQty *= leafQty;

    const hingeType = "Butt Hinge";
    const hingeSpec = isANSI ? `4.5" x 4.5", 5-Knuckle, BB, ${std.hingeStd}` : `100x75mm, Grade 13, Ball Bearing, ${std.hingeStd}`;
    items.push({ ref: 'H01', type: hingeType, spec: hingeSpec, qty: hingeQty, category: 'Hinge' });

    if (isPair && funcSelect !== 'exit_only') {
       const boltType = isANSI ? "Flush Bolt (Manual)" : "Flush Bolt (Lever Action)";
       items.push({ ref: 'FB01', type: boltType, spec: 'Top & Bottom Set, Dust Proof Strike', qty: 1, category: 'Bolt' });
    }

    if (funcSelect === 'exit_only') {
      const panicType = isPair ? "Panic Bar (Vert Rod)" : "Panic Bar (Rim)";
      items.push({ ref: 'ED01', type: panicType, spec: `${std.exitStd}, Touch Bar Type`, qty: leafQty, category: 'Exit' });
    } else {
      items.push({ ref: 'LS01', type: 'Lever Set', spec: isANSI ? 'Cylindrical, Grade 1' : 'Lever on Rose, EN 1906 Cl.4', qty: isPair ? '2 Pr' : '1 Pr', category: 'Lock' });
      const lockType = funcSelect === 'passage' ? 'Latch Body' : 'Mortise Lock';
      const lockSpec = isANSI ? `${std.lockStd} Grade 1, ${GENERIC_DATA.functions.find(f => f.id === funcSelect)?.label}` : `${std.lockStd} DIN Case, ${GENERIC_DATA.functions.find(f => f.id === funcSelect)?.label}`;
      items.push({ ref: 'L01', type: lockType, spec: lockSpec, qty: 1, category: 'Lock' });
      if (!['passage', 'privacy'].includes(funcSelect)) {
        items.push({ ref: 'C01', type: isANSI ? 'Mortise Cylinder' : 'Euro Profile Cylinder', spec: 'Keyed Random, 6-Pin', qty: 1, category: 'Lock' });
      }
    }

    if (isFire || doorData.accessControl || isPair) {
       items.push({ ref: 'DC01', type: 'Overhead Closer', spec: isANSI ? `Heavy Duty, Surface Mounted` : `EN 3-6, Rack & Pinion`, qty: leafQty, category: 'Closer' });
    }

    if (!items.some(i => i.ref === 'DC01')) {
        items.push({ ref: 'DS01', type: 'Wall Stop', spec: 'Rubber Bumper, Concealed Fix', qty: leafQty, category: 'Stop' });
    } else {
        items.push({ ref: 'DS01', type: 'Wall Stop', spec: 'Auxiliary Protection', qty: leafQty, category: 'Stop' });
    }

    if (isFire) {
      items.push({ ref: 'GS01', type: 'Intumescent Seal', spec: isANSI ? 'Smoke Seal (S88)' : '15mm Fire & Smoke Seal', qty: isPair ? '2 Sets' : '1 Set', category: 'Seal' });
    }
    setHwItems(items);
  }, [funcSelect, step]);

  // --- AI ---
  const handleAiDeepScan = async () => {
    setIsAnalyzing(true);
    setAiAnalysis("");
    const isANSI = projectSettings.standard === 'ANSI';
    const context = `Standard: ${projectSettings.standard}, Project: ${projectSettings.type}, Door: ${doorData.doorNo}, Fire: ${doorData.fireRating}, Items: ${hwItems.map(i => i.type).join(', ')}`;
    const prompt = `Review architectural hardware set for ${projectSettings.standard} compliance in ${projectSettings.type}. Context: ${context}`;
    try { const response = await callGemini(prompt); setAiAnalysis(response); } catch(e) { setAiAnalysis("AI unavailable."); } finally { setIsAnalyzing(false); }
  };
  const handleGenerateNarrative = async () => {
    setIsWritingNarrative(true);
    const context = `Function: ${funcSelect}, Project: ${projectSettings.type}, Hardware: ${hwItems.map(i => i.type).join(', ')}`;
    const prompt = `Write concise door operation description. Context: ${context}`;
    try { const response = await callGemini(prompt); setAiNarrative(response); } catch(e) { setAiNarrative("Error."); } finally { setIsWritingNarrative(false); }
  };


  // --- VIEW: PROJECT LIST (HOME) ---
  if (view === 'project_list') {
    return (
      <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
         <header className="bg-white border-b border-slate-200">
            <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
               <div className="flex items-center gap-2">
                  <div className="bg-indigo-700 text-white p-1.5 rounded-lg"><Shield size={20} /></div>
                  <span className="font-bold text-lg">SpecSmart <span className="font-normal text-slate-400">| Dashboard</span></span>
               </div>
               <button onClick={initNewProject} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 text-sm shadow-sm transition-all">
                  <Plus size={16} /> New Project
               </button>
            </div>
         </header>

         <main className="max-w-6xl mx-auto p-8">
            <h1 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2"><FolderOpen className="text-slate-400"/> My Projects</h1>
            
            {savedProjects.length === 0 ? (
               <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-slate-200">
                  <div className="w-16 h-16 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4"><Shield size={32}/></div>
                  <h3 className="text-lg font-bold text-slate-700">No Projects Yet</h3>
                  <p className="text-slate-500 mb-6 max-w-sm mx-auto">Start your first door hardware schedule by clicking below.</p>
                  <button onClick={initNewProject} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg inline-flex items-center gap-2">
                     <Plus size={20} /> Create Project
                  </button>
               </div>
            ) : (
               <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* New Project Card */}
                  <button onClick={initNewProject} className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl p-6 flex flex-col items-center justify-center text-slate-400 hover:border-indigo-500 hover:text-indigo-600 hover:bg-indigo-50 transition-all group min-h-[200px]">
                     <div className="w-12 h-12 rounded-full bg-slate-200 group-hover:bg-indigo-200 flex items-center justify-center mb-3 transition-colors"><Plus size={24}/></div>
                     <span className="font-bold">Create New Project</span>
                  </button>

                  {/* Existing Project Cards */}
                  {savedProjects.map(proj => (
                     <div key={proj.id} onClick={() => openProject(proj)} className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-lg hover:border-indigo-300 transition-all cursor-pointer relative group">
                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                           <button onClick={(e) => deleteProject(proj.id, e)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full"><Trash2 size={16}/></button>
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 mb-1 truncate pr-8">{proj.settings.name}</h3>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mb-4">
                           <span className="bg-slate-100 px-2 py-0.5 rounded">{proj.settings.type}</span>
                           <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-bold">{proj.settings.standard}</span>
                        </div>
                        <div className="flex justify-between items-end mt-4 pt-4 border-t border-slate-50">
                           <div>
                              <div className="text-2xl font-bold text-slate-700">{proj.doors.length}</div>
                              <div className="text-xs text-slate-400 font-bold uppercase">Doors Spec'd</div>
                           </div>
                           <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center group-hover:translate-x-1 transition-transform"><ArrowRight size={16}/></div>
                        </div>
                     </div>
                  ))}
               </div>
            )}
         </main>
      </div>
    );
  }

  // --- VIEW: STEP 0 - SETUP ---
  if (view === 'setup') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4 font-sans">
         <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col md:flex-row">
            <div className="bg-indigo-600 p-8 flex flex-col justify-center text-white md:w-1/3">
               <Shield size={48} className="mb-4" />
               <h1 className="text-3xl font-bold mb-2">SpecSmart</h1>
               <p className="text-indigo-200 text-sm">Professional Door Hardware Specification Platform.</p>
               <button onClick={() => setView('project_list')} className="mt-8 text-xs text-indigo-200 hover:text-white flex items-center gap-1 underline"><ArrowLeft size={12}/> Cancel</button>
            </div>
            
            <div className="p-8 md:w-2/3">
               <h2 className="text-2xl font-bold text-slate-800 mb-6">Create New Project</h2>
               <div className="space-y-5">
                  <div>
                     <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Project Name</label>
                     <input type="text" value={projectSettings.name} onChange={(e) => setProjectSettings({...projectSettings, name: e.target.value})} className="w-full p-3 border rounded-lg text-slate-800 font-medium focus:ring-2 focus:ring-indigo-500 outline-none"/>
                  </div>
                  <div>
                     <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Facility Type</label>
                     <div className="relative">
                       <select value={projectSettings.type} onChange={(e) => setProjectSettings({...projectSettings, type: e.target.value})} className="w-full p-3 border rounded-lg text-slate-800 font-medium appearance-none focus:ring-2 focus:ring-indigo-500 bg-white">
                          {Object.keys(PROJECT_TYPES).map(t => <option key={t} value={t}>{t}</option>)}
                       </select>
                       <Building2 size={16} className="absolute right-3 top-3.5 text-slate-400 pointer-events-none"/>
                     </div>
                  </div>
                  <div>
                     <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Industry Standard</label>
                     <div className="grid grid-cols-2 gap-4">
                        {['ANSI', 'EN'].map((std) => (
                           <button key={std} onClick={() => setProjectSettings({...projectSettings, standard: std, units: std === 'ANSI' ? 'Imperial' : 'Metric'})} className={`p-4 rounded-xl border-2 text-left transition-all ${projectSettings.standard === std ? 'border-indigo-600 bg-indigo-50 ring-1 ring-indigo-600' : 'border-slate-100 hover:border-slate-300'}`}>
                              <div className="font-bold text-slate-800 flex items-center gap-2">{std === 'ANSI' ? '🇺🇸' : '🇪🇺'} {std}</div>
                              <div className="text-xs text-slate-500 mt-1">{std === 'ANSI' ? 'NFPA' : 'EN 1634'}</div>
                           </button>
                        ))}
                     </div>
                  </div>
                  <button onClick={handleSetupComplete} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all mt-4">Initialize Project <ArrowRight size={18} /></button>
               </div>
            </div>
         </div>
      </div>
    );
  }

  // --- VIEW: DASHBOARD ---
  if (view === 'dashboard') {
     const std = STANDARDS[projectSettings.standard];
     return (
      <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
         <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
            <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
               <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 cursor-pointer" onClick={exitToProjects}>
                     <div className="bg-indigo-700 text-white p-1.5 rounded-lg"><Shield size={20} /></div>
                     <span className="font-bold text-lg tracking-tight hidden md:block">SpecSmart <span className="font-normal text-slate-400">| {projectSettings.name}</span></span>
                  </div>
                  <button onClick={exitToProjects} className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors">
                     <Grid size={14} /> My Projects
                  </button>
               </div>
               <div className="flex items-center gap-3">
                  <div className="hidden md:flex items-center gap-2 text-xs font-bold bg-slate-100 px-3 py-1.5 rounded text-slate-600"><Globe size={14} /> {projectSettings.standard}</div>
                  <div className="hidden md:flex items-center gap-2 text-xs font-bold bg-slate-100 px-3 py-1.5 rounded text-slate-600"><Building2 size={14} /> {projectSettings.type}</div>
                  <button onClick={exportToCSV} className="bg-green-600 hover:bg-green-700 text-white text-sm font-bold px-4 py-2 rounded flex items-center gap-2"><Download size={16} /> Export</button>
               </div>
            </div>
         </header>
         <main className="max-w-7xl mx-auto p-6">
            <div className="flex justify-between items-end mb-6">
               <div><h1 className="text-2xl font-bold text-slate-800">Door Schedule</h1><p className="text-slate-500 text-sm">Standard: <strong>{std.label}</strong></p></div>
               <button onClick={startNewDoor} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-5 rounded shadow-lg flex items-center gap-2"><Plus size={18} /> Add New Door</button>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
               {projectDoors.length === 0 ? (
                  <div className="p-12 text-center text-slate-400"><div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4"><Layout size={32}/></div><p>No doors defined. Click "Add New Door" to begin.</p></div>
               ) : (
                  <table className="w-full text-left border-collapse">
                     <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                        <tr>
                           <th className="p-4 w-24">No</th>
                           <th className="p-4">Location</th>
                           <th className="p-4">Type</th>
                           <th className="p-4">Rating</th>
                           <th className="p-4">Function</th>
                           <th className="p-4 text-center">Items</th>
                           <th className="p-4 text-right">Actions</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-100 text-sm">
                        {projectDoors.map(door => (
                           <tr key={door.id} className="hover:bg-slate-50 transition-colors">
                              <td className="p-4 font-bold font-mono text-indigo-600">{door.doorNo}</td>
                              <td className="p-4 text-slate-700">{door.location || '-'}</td>
                              <td className="p-4 text-slate-500">{door.type} <span className="text-[10px] bg-slate-200 px-1 rounded">{door.config}</span></td>
                              <td className="p-4">{door.fireRating && door.fireRating !== 'N/A' && door.fireRating !== 0 ? (<span className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-xs font-bold">{door.fireRating}</span>) : <span className="text-slate-400">-</span>}</td>
                              <td className="p-4 capitalize">{door.func?.replace('_', ' ')}</td>
                              <td className="p-4 text-center text-slate-400">{door.hwItems.length}</td>
                              <td className="p-4 text-right flex justify-end gap-2">
                                 <button onClick={() => editDoor(door)} className="p-1.5 hover:text-indigo-600"><Edit size={16}/></button>
                                 <button onClick={() => deleteDoor(door.id)} className="p-1.5 hover:text-red-600"><Trash2 size={16}/></button>
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               )}
            </div>
         </main>
      </div>
     );
  }

  // --- VIEW: WIZARD ---
  const std = STANDARDS[projectSettings.standard];
  const isANSI = projectSettings.standard === 'ANSI';

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col">
       <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <button onClick={() => setView('dashboard')} className="text-slate-500 hover:text-slate-800 flex items-center gap-2 text-sm font-bold"><ArrowLeft size={16} /> Cancel</button>
          <div className="text-sm font-bold text-slate-800">{editingId ? `Editing ${doorData.doorNo}` : 'New Door Spec'}</div>
          <div className="w-20"></div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-8 grid md:grid-cols-[1fr_320px] gap-8">
         <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden min-h-[500px] flex flex-col">
               
               {/* STEP 1: DATA */}
               {step === 1 && (
                 <div className="p-8">
                    <div className="flex justify-between items-center mb-6">
                       <h2 className="text-xl font-bold text-slate-800">Step 1: Configuration</h2>
                       <span className="text-xs font-bold bg-indigo-50 text-indigo-700 px-2 py-1 rounded border border-indigo-100">{std.label}</span>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6 mb-4">
                       <div><label className="label-sm">Door Number</label><input type="text" value={doorData.doorNo} onChange={e => setDoorData({...doorData, doorNo: e.target.value})} className={`input-field font-mono ${doorNoErr ? 'border-red-500 bg-red-50 focus:ring-red-500' : ''}`} />{doorNoErr && <div className="text-xs text-red-600 mt-1 flex items-center gap-1"><AlertCircle size={10}/> {doorNoErr}</div>}</div>
                       <div><label className="label-sm">Location</label><div className="relative"><select value={doorData.location} onChange={e => setDoorData({...doorData, location: e.target.value})} className="input-field appearance-none bg-white"><option value="">Select Location...</option>{PROJECT_TYPES[projectSettings.type].map(loc => <option key={loc} value={loc}>{loc}</option>)}<option value="Other">Other (Custom)</option></select><ChevronDown size={14} className="absolute right-3 top-3 text-slate-400 pointer-events-none"/></div></div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6 mb-4">
                       <div><label className="label-sm">Door Material</label><select value={doorData.type} onChange={e => setDoorData({...doorData, type: e.target.value})} className="input-field"><option>Timber Solid Core</option><option>Hollow Metal</option><option>Aluminum Glass</option></select></div>
                       <div><label className="label-sm">Type</label><select value={doorData.config} onChange={e => setDoorData({...doorData, config: e.target.value})} className="input-field"><option value="Single">Single Leaf</option><option value="Pair">Double / Pair</option><option value="Leaf & half">Leaf & 1/2</option></select></div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                       <div><label className="label-sm">Fire Rating ({isANSI ? 'Mins' : 'Class'})</label><select value={doorData.fireRating} onChange={e => setDoorData({...doorData, fireRating: isANSI ? Number(e.target.value) : e.target.value})} className={`input-field font-bold ${isANSI ? doorData.fireRating > 0 : doorData.fireRating !== 'N/A' ? 'text-red-600 bg-red-50' : ''}`}>{std.fireRatings.map(r => <option key={r} value={r}>{r} {isANSI && r!==0 ? 'min' : ''}</option>)}</select></div>
                       <div className="grid grid-cols-2 gap-4">
                          <div><label className="label-sm">Width ({std.dimUnit})</label><input type="number" value={doorData.width} onChange={e => setDoorData({...doorData, width: e.target.value})} className={`input-field ${dimErr ? 'border-red-500 bg-red-50' : ''}`} /></div>
                          <div><label className="label-sm">Height ({std.dimUnit})</label><input type="number" value={doorData.height} onChange={e => setDoorData({...doorData, height: e.target.value})} className={`input-field ${dimErr ? 'border-red-500 bg-red-50' : ''}`} /></div>
                       </div>
                    </div>
                    {dimErr && <div className="text-xs text-red-600 mt-2 p-2 bg-red-50 rounded border border-red-100 flex items-start gap-2"><AlertTriangle size={14} className="shrink-0 mt-0.5"/> {dimErr}</div>}
                 </div>
               )}

               {/* STEP 2: FUNCTION */}
               {step === 2 && (
                 <div className="p-8">
                    <h2 className="text-xl font-bold text-slate-800 mb-6">Step 2: Operation</h2>
                    <div className="space-y-4">
                       {GENERIC_DATA.functions.map(f => (
                         <button key={f.id} onClick={() => setFuncSelect(f.id)} className={`w-full text-left p-4 rounded-lg border transition-all ${funcSelect === f.id ? 'border-indigo-600 bg-indigo-50 ring-1 ring-indigo-600' : 'hover:border-indigo-300'}`}>
                            <div className="font-bold text-slate-800">{f.label}</div>
                            <div className="text-sm text-slate-500">{f.desc}</div>
                         </button>
                       ))}
                    </div>
                 </div>
               )}

               {/* STEP 3: CONFIG */}
               {step === 3 && (
                 <div className="p-6 flex-1 flex flex-col">
                    <h2 className="text-xl font-bold text-slate-800 mb-4">Step 3: Hardware Review</h2>
                    <div className="flex-1 overflow-auto border rounded-lg bg-slate-50">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-slate-100 text-xs font-bold text-slate-500 uppercase">
                          <tr>
                             <th className="p-3 w-16">Ref</th>
                             <th className="p-3">Product Type</th>
                             <th className="p-3">Product Specification</th>
                             <th className="p-3 w-16 text-center">Qty</th>
                             <th className="p-3 w-10"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 bg-white">
                           {hwItems.map((item, idx) => (
                             <tr key={idx} className="group hover:bg-slate-50">
                               <td className="p-2"><input value={item.ref} onChange={e => {const n=[...hwItems];n[idx].ref=e.target.value;setHwItems(n)}} className="w-full font-mono text-xs font-bold text-slate-400" /></td>
                               <td className="p-2">
                                  {PRODUCT_VARIANTS[item.category] ? (
                                    <select value={item.type} onChange={e => {const n=[...hwItems];n[idx].type=e.target.value;setHwItems(n)}} className="w-full bg-transparent focus:bg-white rounded border-0 cursor-pointer font-medium">
                                       <option value={item.type}>{item.type} (Default)</option>
                                       {PRODUCT_VARIANTS[item.category].filter(v => v !== item.type).map(v => (<option key={v} value={v}>{v}</option>))}
                                    </select>
                                  ) : (
                                    <input value={item.type} onChange={e => {const n=[...hwItems];n[idx].type=e.target.value;setHwItems(n)}} className="w-full bg-transparent focus:bg-white rounded" />
                                  )}
                               </td>
                               <td className="p-2"><input value={item.spec} onChange={e => {const n=[...hwItems];n[idx].spec=e.target.value;setHwItems(n)}} className="w-full bg-transparent focus:bg-white rounded text-slate-600" /></td>
                               <td className="p-2 text-center"><input value={item.qty} onChange={e => {const n=[...hwItems];n[idx].qty=e.target.value;setHwItems(n)}} className="w-full text-center bg-transparent" /></td>
                               <td className="p-2 text-center"><button onClick={() => {const n=[...hwItems];n.splice(idx,1);setHwItems(n)}} className="text-slate-300 hover:text-red-500"><Trash2 size={14}/></button></td>
                             </tr>
                           ))}
                        </tbody>
                      </table>
                      <button onClick={() => setHwItems([...hwItems, {ref:'NEW', type:'Generic Item', spec:'Description', qty:1, category:'Misc'}])} className="w-full py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 flex items-center justify-center gap-1"><Plus size={14}/> Add Item</button>
                    </div>
                 </div>
               )}

               {/* STEP 4: REVIEW */}
               {step === 4 && (
                 <div className="p-8">
                    <div className="text-center mb-6">
                       <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4"><CheckCircle size={32}/></div>
                       <h2 className="text-xl font-bold text-slate-800 mb-1">Door Complete</h2>
                       <p className="text-slate-500 text-sm">Review final details before saving.</p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6">
                       <div className="flex justify-between items-center mb-2">
                          <label className="label-sm flex items-center gap-2"><FileText size={14}/> Operation Narrative (Optional)</label>
                          <button onClick={handleGenerateNarrative} disabled={isWritingNarrative} className="text-xs bg-indigo-100 text-indigo-700 px-3 py-1 rounded hover:bg-indigo-200 flex items-center gap-1 font-bold">
                             {isWritingNarrative ? <Loader size={12} className="animate-spin"/> : <Sparkles size={12}/>} {aiNarrative ? 'Regenerate' : 'Auto-Generate'}
                          </button>
                       </div>
                       <textarea value={aiNarrative} onChange={(e) => setAiNarrative(e.target.value)} placeholder="e.g. Latchbolt retracted by..." className="w-full p-3 border rounded text-sm text-slate-700 h-24 focus:ring-2 focus:ring-indigo-500 outline-none"/>
                    </div>
                    <div className="flex justify-center">
                       <button onClick={saveDoorToProject} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded shadow-lg flex items-center justify-center gap-2">
                          <Save size={18} /> Save to Schedule
                       </button>
                    </div>
                 </div>
               )}

               <div className="p-4 bg-slate-50 border-t flex justify-between mt-auto">
                 <button onClick={() => setStep(s => Math.max(1, s-1))} disabled={step===1} className="px-4 py-2 text-slate-500 font-bold disabled:opacity-30">Back</button>
                 {step < 4 && (
                   <button onClick={() => setStep(s => s+1)} disabled={(step===2 && !funcSelect) || (step===1 && (doorNoErr || dimErr))} className="bg-slate-800 text-white px-6 py-2 rounded font-bold flex items-center gap-2 hover:bg-black disabled:opacity-50">
                     Next <ArrowRight size={16}/>
                   </button>
                 )}
               </div>
            </div>
         </div>

         {/* SIDEBAR */}
         <div className="space-y-4">
            {warnings.length > 0 && (
               <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 animate-in fade-in slide-in-from-right-4">
                  <h3 className="label-sm text-amber-800 mb-2 flex items-center gap-1"><AlertTriangle size={14}/> Standard Alerts</h3>
                  {warnings.map((w, i) => (
                     <div key={i} className={`text-xs p-2 rounded mb-2 border ${w.severity === 'critical' ? 'bg-red-100 text-red-800 border-red-200' : 'bg-white text-amber-800 border-amber-100'}`}>
                        <strong>{w.title}:</strong> {w.msg}
                     </div>
                  ))}
               </div>
            )}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
               <h3 className="label-sm mb-3">Current Config</h3>
               <div className="text-xs space-y-2">
                  <div className="flex justify-between"><span className="text-slate-500">Standard:</span> <strong>{projectSettings.standard}</strong></div>
                  <div className="flex justify-between"><span className="text-slate-500">Facility:</span> <strong>{projectSettings.type}</strong></div>
                  <div className="flex justify-between"><span className="text-slate-500">Size:</span> <strong>{doorData.width} x {doorData.height}</strong></div>
                  <div className="flex justify-between"><span className="text-slate-500">Rating:</span> <strong className={isANSI ? (doorData.fireRating > 0 ? 'text-red-600':'') : (doorData.fireRating !== 'N/A' ? 'text-red-600':'')}>{doorData.fireRating}</strong></div>
               </div>
            </div>
            <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4">
               <div className="flex justify-between items-center mb-2"><h3 className="label-sm text-indigo-800 flex items-center gap-1"><Sparkles size={12}/> {std.label} AI</h3></div>
               {isAnalyzing ? <div className="text-xs text-indigo-500 flex items-center gap-2"><Loader size={12} className="animate-spin"/> Checking Codes...</div> : !aiAnalysis ? <button onClick={handleAiDeepScan} disabled={step<3} className="w-full bg-white text-indigo-600 text-xs font-bold py-2 rounded border border-indigo-200 hover:bg-indigo-50 disabled:opacity-50">Verify Compliance</button> : <div className="text-xs text-slate-700 bg-white p-2 rounded border border-indigo-100">{aiAnalysis}</div>}
            </div>
         </div>
      </main>

      <style>{`
        .input-field { width: 100%; padding: 0.5rem; border: 1px solid #e2e8f0; border-radius: 0.375rem; font-size: 0.875rem; transition: all 0.2s; }
        .input-field:focus { outline: none; border-color: #4f46e5; ring: 1px solid #4f46e5; }
        .label-sm { display: block; font-size: 0.75rem; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 0.25rem; }
      `}</style>
    </div>
  );
}
