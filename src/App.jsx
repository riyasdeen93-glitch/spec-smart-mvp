<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SpecSmart | Door Hardware Builder</title>
    
    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    
    <!-- Icons (Phosphor) -->
    <script src="https://unpkg.com/@phosphor-icons/web"></script>

    <!-- SheetJS for Excel Export -->
    <script src="https://cdn.sheetjs.com/xlsx-latest/package/dist/xlsx.full.min.js"></script>

    <style>
        :root {
            /* Palette - Indigo/Blue Theme */
            --primary: #4338ca; 
            --primary-hover: #3730a3;
            --primary-light: #e0e7ff;
            
            --bg-body: #f3f4f6; 
            --bg-surface: #ffffff;
            
            --text-main: #111827;
            --text-muted: #6b7280;
            
            --border: #e5e7eb;
            --danger: #ef4444;
            --success: #10b981;
            --warning: #f59e0b;
            
            --radius-sm: 0.375rem;
            --radius-md: 0.5rem;
            --header-height: 64px;
        }

        * { box-sizing: border-box; }

        body {
            font-family: 'Inter', sans-serif;
            background-color: var(--bg-body);
            color: var(--text-main);
            margin: 0;
            line-height: 1.5;
        }

        /* --- Components --- */
        .btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            padding: 0.5rem 1rem;
            font-size: 0.875rem;
            font-weight: 500;
            border-radius: var(--radius-sm);
            cursor: pointer;
            transition: all 0.2s;
            border: 1px solid transparent;
            white-space: nowrap;
        }
        .btn-primary { background-color: var(--primary); color: white; box-shadow: 0 1px 2px rgba(0,0,0,0.1); }
        .btn-primary:hover { background-color: var(--primary-hover); }
        
        .btn-secondary { background-color: white; border-color: var(--border); color: var(--text-main); box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
        .btn-secondary:hover { background-color: #f9fafb; border-color: #d1d5db; }
        
        .btn-danger { color: #b91c1c; background: #fee2e2; }
        .btn-ghost { background: transparent; color: var(--text-muted); }
        .btn-ghost:hover { background: rgba(0,0,0,0.05); color: var(--text-main); }
        .btn-sm { padding: 0.25rem 0.6rem; font-size: 0.75rem; }
        .btn-lg { padding: 0.75rem 1.5rem; font-size: 1rem; font-weight: 600; }

        .input-group { display: flex; flex-direction: column; gap: 0.35rem; margin-bottom: 1rem; }
        .input-group label { font-size: 0.8rem; font-weight: 600; color: var(--text-main); text-transform: uppercase; letter-spacing: 0.03em; }
        .input-group .hint { font-size: 0.75rem; color: var(--text-muted); }
        .error-msg { font-size: 0.75rem; color: var(--danger); display: flex; align-items: center; gap: 0.25rem; margin-top: 0.25rem; background: #fef2f2; padding: 0.25rem 0.5rem; border-radius: 4px; border: 1px solid #fecaca;}
        
        input, select, textarea {
            padding: 0.6rem 0.85rem;
            border: 1px solid var(--border);
            border-radius: var(--radius-sm);
            font-size: 0.9rem;
            font-family: inherit;
            width: 100%;
            background: #fff;
            transition: all 0.2s;
        }
        input:focus, select:focus, textarea:focus {
            outline: none;
            border-color: var(--primary);
            box-shadow: 0 0 0 3px var(--primary-light);
        }
        input.invalid, select.invalid { border-color: var(--danger); background-color: #fff8f8; }

        .card {
            background: var(--bg-surface);
            border: 1px solid var(--border);
            border-radius: var(--radius-md);
            padding: 1.5rem;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        .badge {
            display: inline-flex;
            align-items: center;
            padding: 0.25rem 0.65rem;
            border-radius: 999px;
            font-size: 0.75rem;
            font-weight: 600;
        }
        .badge-blue { background: #eff6ff; color: #1d4ed8; }
        .badge-gray { background: #f3f4f6; color: #4b5563; }
        .badge-orange { background: #fff7ed; color: #c2410c; }
        .badge-outline { border: 1px solid var(--border); color: var(--text-muted); background: white; }

        /* --- Layout --- */
        #app { display: flex; flex-direction: column; min-height: 100vh; }
        
        .global-header {
            height: var(--header-height);
            background: var(--bg-surface);
            border-bottom: 1px solid var(--border);
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 2rem;
            position: sticky; top: 0; z-index: 100;
        }
        .logo { font-weight: 800; font-size: 1.25rem; color: #111827; display: flex; align-items: center; gap: 0.5rem; }
        .logo i { color: var(--primary); font-size: 1.5rem; }

        .project-context-bar {
            background: white; border-bottom: 1px solid var(--border);
            padding: 0.75rem 2rem; display: flex; align-items: center; justify-content: space-between;
            position: sticky; top: var(--header-height); z-index: 90;
        }
        .project-title { font-weight: 700; font-size: 1.1rem; margin-right: 1rem; }

        main { flex: 1; padding: 2rem; max-width: 1200px; margin: 0 auto; width: 100%; }

        /* --- LANDING PAGE STYLES --- */
        #view-landing {
            position: absolute; top:0; left:0; width:100%; height:100vh; 
            background: linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%);
            z-index: 200; overflow-y: auto; display: flex; flex-direction: column;
        }
        .landing-nav {
            padding: 1.5rem 3rem; display: flex; justify-content: space-between; align-items: center;
        }
        .landing-hero {
            flex: 1; display: flex; align-items: center; justify-content: space-between;
            padding: 2rem 4rem; max-width: 1400px; margin: 0 auto; width: 100%;
            gap: 4rem;
        }
        .hero-content { max-width: 600px; animation: slideUp 0.8s ease-out; }
        .hero-title {
            font-size: 3.5rem; line-height: 1.1; font-weight: 800; letter-spacing: -0.02em;
            background: linear-gradient(to right, #1e1b4b, #4338ca); -webkit-background-clip: text; -webkit-text-fill-color: transparent;
            margin-bottom: 1.5rem;
        }
        .hero-subtitle {
            font-size: 1.25rem; color: var(--text-muted); margin-bottom: 2.5rem; line-height: 1.6;
        }
        .hero-visual {
            flex: 1; position: relative;
            perspective: 1500px;
        }
        .mockup-card {
            background: white; border-radius: 12px; box-shadow: 0 20px 50px -12px rgba(0,0,0,0.15);
            padding: 1.5rem; border: 1px solid rgba(255,255,255,0.8);
            transform: rotateY(-10deg) rotateX(5deg);
            transition: transform 0.5s ease;
            animation: float 6s ease-in-out infinite;
        }
        .mockup-card:hover { transform: rotateY(0deg) rotateX(0deg); }
        
        .feature-grid {
            display: grid; grid-template-columns: repeat(3, 1fr); gap: 2rem;
            padding: 4rem; background: white; margin-top: auto;
        }
        .feature-item { display: flex; gap: 1rem; align-items: flex-start; }
        .feature-icon { 
            width: 48px; height: 48px; background: var(--primary-light); color: var(--primary);
            border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem;
            flex-shrink: 0;
        }
        
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes float { 0% { transform: rotateY(-10deg) rotateX(5deg) translateY(0px); } 50% { transform: rotateY(-10deg) rotateX(5deg) translateY(-15px); } 100% { transform: rotateY(-10deg) rotateX(5deg) translateY(0px); } }


        /* Dashboard */
        .dashboard-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.5rem; }
        .project-card { cursor: pointer; transition: transform 0.2s; border: 1px solid var(--border); }
        .project-card:hover { transform: translateY(-4px); border-color: var(--primary); }

        /* Wizard Stepper */
        .stepper { display: flex; align-items: center; justify-content: center; gap: 3rem; margin-bottom: 2rem; position: relative; }
        .step-item { position: relative; display: flex; flex-direction: column; align-items: center; gap: 0.5rem; cursor: pointer; z-index: 2; }
        .step-circle {
            width: 36px; height: 36px; border-radius: 50%; background: white; border: 2px solid var(--border);
            display: flex; align-items: center; justify-content: center; font-weight: 600; color: var(--text-muted);
            transition: all 0.2s;
        }
        .step-label { font-size: 0.75rem; font-weight: 600; color: var(--text-muted); text-transform: uppercase; }
        
        .step-item.active .step-circle { border-color: var(--primary); background: var(--primary); color: white; }
        .step-item.active .step-label { color: var(--primary); }
        .step-item.completed .step-circle { background: var(--success); border-color: var(--success); color: white; }

        /* Table Styles (Clean List View) */
        .table-clean { width: 100%; border-collapse: separate; border-spacing: 0; }
        .table-clean th { 
            text-align: left; padding: 1rem; color: var(--text-muted); font-size: 0.75rem; font-weight: 700; 
            text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid var(--border);
        }
        .table-clean td { 
            padding: 1rem; border-bottom: 1px solid var(--border); vertical-align: top;
            background: white; transition: background 0.2s;
        }
        .table-clean tr:hover td { background: #f9fafb; }
        .table-clean tr:last-child td { border-bottom: none; }

        /* Step 3 Hardware Table (Updated for Finish Column) */
        .hw-table { width: 100%; border: 1px solid var(--border); border-radius: 8px; overflow: hidden; margin-bottom: 1rem; }
        /* Added Finish (140px) and adjusted Spec (1fr) */
        .hw-table-header { display: grid; grid-template-columns: 60px 200px 140px 1fr 60px 40px; background: #f8fafc; padding: 0.75rem; font-weight: 600; font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; border-bottom: 1px solid var(--border);}
        .hw-table-row { display: grid; grid-template-columns: 60px 200px 140px 1fr 60px 40px; border-bottom: 1px solid var(--border); padding: 0.75rem; align-items: center; background: white; position: relative; }
        .hw-table-row:hover { background: #fafafa; }
        .hw-table-row:last-child { border-bottom: none; }
        
        .warning-icon { position: absolute; left: -25px; top: 50%; transform: translateY(-50%); color: var(--warning); font-size: 1.2rem; }

        /* Visual Selectors */
        .visual-select-container { display: flex; gap: 1rem; }
        .visual-option { 
            flex: 1; border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 0.75rem; 
            display: flex; flex-direction: column; align-items: center; gap: 0.5rem; cursor: pointer; text-align: center;
        }
        .visual-option:hover { border-color: var(--primary); background: var(--primary-light); }
        .visual-option.selected { border-color: var(--primary); background: var(--primary-light); color: var(--primary); font-weight: 600; ring: 2px solid var(--primary); }
        .visual-option i { font-size: 1.5rem; }

        /* Helpers */
        .hidden { display: none !important; }
        .flex-between { display: flex; justify-content: space-between; align-items: center; }
        .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
        .grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1.5rem; }
        .section-title { font-size: 1.1rem; font-weight: 700; margin-bottom: 1rem; color: var(--text-main); }
        .text-right { text-align: right; }
    </style>
</head>
<body>

    <!-- LANDING PAGE VIEW -->
    <div id="view-landing">
        <nav class="landing-nav">
            <div class="logo">
                <i class="ph-fill ph-shield-check"></i>
                <div style="font-size:1.5rem;">SpecSmart</div>
            </div>
            <div id="landing-actions">
                <!-- Injected via JS -->
            </div>
        </nav>

        <section class="landing-hero">
            <div class="hero-content">
                <div class="badge badge-blue" style="margin-bottom:1rem; font-size:0.85rem;"><i class="ph ph-star-fill" style="margin-right:4px"></i> Best-in-Class Specification Tool</div>
                <h1 class="hero-title">The Smarter Way to Specify Door Hardware.</h1>
                <p class="hero-subtitle">
                    Automated standards compliance (ANSI/EN), smart product recommendations, and instant Excel exports. 
                    Built for Architects, Specifiers, and Ironmongers to eliminate errors and save time.
                </p>
                <div style="display:flex; gap:1rem;">
                    <button onclick="App.startJourney()" class="btn btn-primary btn-lg">Start Specification Journey <i class="ph-bold ph-arrow-right"></i></button>
                    <button onclick="alert('Demo Mode: Click Start Journey to begin!')" class="btn btn-secondary btn-lg">Watch Demo</button>
                </div>
            </div>
            
            <div class="hero-visual">
                <!-- CSS-only Mockup of the App interface -->
                <div class="mockup-card">
                    <div style="display:flex; justify-content:space-between; margin-bottom:1rem; border-bottom:1px solid #f1f5f9; padding-bottom:0.5rem;">
                        <div style="font-weight:700; color:#1e293b;">Door Schedule</div>
                        <div class="badge badge-gray">ANSI Mode</div>
                    </div>
                    <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:1rem; margin-bottom:1rem;">
                        <div style="height:8px; background:#e2e8f0; border-radius:4px;"></div>
                        <div style="height:8px; background:#f1f5f9; border-radius:4px;"></div>
                        <div style="height:8px; background:#f1f5f9; border-radius:4px;"></div>
                    </div>
                    <!-- Fake Door Row -->
                    <div style="display:flex; align-items:center; gap:1rem; padding:0.75rem; background:#f8fafc; border-radius:6px; border:1px solid #e2e8f0; margin-bottom:0.5rem;">
                        <div style="width:32px; height:32px; background:#dbeafe; border-radius:4px; display:flex; align-items:center; justify-content:center; color:#2563eb;"><i class="ph-bold ph-door"></i></div>
                        <div style="flex:1;">
                            <div style="height:6px; width:60%; background:#94a3b8; border-radius:3px; margin-bottom:4px;"></div>
                            <div style="height:4px; width:40%; background:#cbd5e1; border-radius:2px;"></div>
                        </div>
                        <div class="badge badge-orange">45 min</div>
                    </div>
                     <!-- Fake Door Row 2 -->
                     <div style="display:flex; align-items:center; gap:1rem; padding:0.75rem; background:white; border-radius:6px; border:1px solid #e2e8f0;">
                        <div style="width:32px; height:32px; background:#f1f5f9; border-radius:4px; display:flex; align-items:center; justify-content:center; color:#64748b;"><i class="ph-bold ph-door-open"></i></div>
                        <div style="flex:1;">
                            <div style="height:6px; width:50%; background:#cbd5e1; border-radius:3px; margin-bottom:4px;"></div>
                            <div style="height:4px; width:30%; background:#e2e8f0; border-radius:2px;"></div>
                        </div>
                        <div class="badge badge-gray">NFR</div>
                    </div>
                </div>
            </div>
        </section>

        <section class="feature-grid">
            <div class="feature-item">
                <div class="feature-icon"><i class="ph ph-brain"></i></div>
                <div>
                    <h3 style="margin:0 0 0.5rem 0; font-size:1.1rem;">Smart Logic Engine</h3>
                    <p style="margin:0; color:var(--text-muted); font-size:0.9rem;">Automatically suggests correct hinges, closers, and locks based on door weight, width, and facility type.</p>
                </div>
            </div>
            <div class="feature-item">
                <div class="feature-icon"><i class="ph ph-globe"></i></div>
                <div>
                    <h3 style="margin:0 0 0.5rem 0; font-size:1.1rem;">Global Standards</h3>
                    <p style="margin:0; color:var(--text-muted); font-size:0.9rem;">Seamlessly switch between ANSI/BHMA (US) and EN/ISO (EU) modes with compliant terminologies.</p>
                </div>
            </div>
            <div class="feature-item">
                <div class="feature-icon"><i class="ph ph-file-xls"></i></div>
                <div>
                    <h3 style="margin:0 0 0.5rem 0; font-size:1.1rem;">Instant Documentation</h3>
                    <p style="margin:0; color:var(--text-muted); font-size:0.9rem;">Generate professional door schedules and detailed hardware set specifications in Excel format instantly.</p>
                </div>
            </div>
        </section>
    </div>

    <div id="app" class="hidden">
        <!-- Global Header -->
        <header class="global-header">
            <div class="logo">
                <i class="ph-fill ph-shield-check"></i>
                <div>SpecSmart</div>
            </div>
            <div>
                 <button onclick="App.showDashboard()" class="btn btn-ghost"><i class="ph ph-squares-four"></i> Dashboard</button>
            </div>
        </header>

        <!-- Project Context Bar -->
        <div id="project-bar" class="project-context-bar hidden">
            <div style="display:flex; align-items:center; gap:1rem;">
                <span class="project-title" id="bar-project-name">Project</span>
                <span class="badge badge-outline" id="bar-standard"></span>
                <span class="badge badge-outline" id="bar-type"></span>
            </div>
            <div style="display:flex; gap:0.5rem;">
                <button onclick="App.saveProject()" class="btn btn-secondary btn-sm"><i class="ph ph-floppy-disk"></i> Save</button>
                <button onclick="App.showDashboard()" class="btn btn-secondary btn-sm"><i class="ph ph-x"></i> Close</button>
            </div>
        </div>

        <main>
            <!-- Dashboard View -->
            <div id="view-dashboard">
                <div class="flex-between" style="margin-bottom:2rem;">
                    <div>
                        <h1 style="margin:0;">Projects</h1>
                        <p class="text-muted">Manage your door specifications.</p>
                    </div>
                    <button onclick="App.createProject()" class="btn btn-primary"><i class="ph ph-plus"></i> New Project</button>
                </div>
                <div id="project-list" class="dashboard-grid"></div>
            </div>

            <!-- Wizard View -->
            <div id="view-wizard" class="hidden">
                <!-- Stepper -->
                <div class="stepper">
                    <div class="step-item" onclick="App.goToStep(0)" id="nav-step-0">
                        <div class="step-circle">1</div>
                        <span class="step-label">Setup</span>
                    </div>
                    <div class="step-item" onclick="App.goToStep(1)" id="nav-step-1">
                        <div class="step-circle">2</div>
                        <span class="step-label">Schedule</span>
                    </div>
                    <div class="step-item" onclick="App.goToStep(2)" id="nav-step-2">
                        <div class="step-circle">3</div>
                        <span class="step-label">Hardware</span>
                    </div>
                    <div class="step-item" onclick="App.goToStep(3)" id="nav-step-3">
                        <div class="step-circle">4</div>
                        <span class="step-label">Review</span>
                    </div>
                </div>

                <!-- Step 0: Setup -->
                <div id="step-0" class="hidden card" style="max-width:800px; margin:0 auto;">
                    <div class="section-title">Project Details</div>
                    <div class="input-group">
                        <label>Project Name</label>
                        <input type="text" id="p-name" placeholder="e.g. City General Hospital - Wing A">
                    </div>
                    <div class="grid-2">
                        <div class="input-group">
                            <label>Facility Type (Application)</label>
                            <select id="p-type">
                                <option value="Commercial Office">Commercial Office</option>
                                <option value="Hospital / Healthcare">Hospital / Healthcare</option>
                                <option value="Education / School">Education / School</option>
                                <option value="Airport / Transport">Airport / Transport</option>
                                <option value="Hospitality / Hotel">Hospitality / Hotel</option>
                                <option value="Residential">Residential</option>
                            </select>
                        </div>
                        <div class="input-group">
                            <label>Standard Mode</label>
                            <select id="p-standard">
                                <option value="ANSI">ANSI / BHMA (US)</option>
                                <option value="EN">EN / ISO (EU)</option>
                            </select>
                        </div>
                    </div>
                    <div class="text-right mt-4">
                        <button onclick="App.saveStep0()" class="btn btn-primary">Save & Continue <i class="ph ph-arrow-right"></i></button>
                    </div>
                </div>

                <!-- Step 1: Door Schedule -->
                <div id="step-1" class="hidden">
                    <div class="card">
                        <div class="flex-between" style="margin-bottom:1.5rem;">
                            <div class="section-title" style="margin:0;">Door Schedule</div>
                            <button onclick="App.addDoor()" class="btn btn-primary"><i class="ph ph-plus"></i> Add Door</button>
                        </div>
                        
                        <div style="overflow-x:auto; border:1px solid var(--border); border-radius:8px;">
                            <table class="table-clean">
                                <thead>
                                    <tr>
                                        <th>Mark</th>
                                        <th>Location</th>
                                        <th>Qty</th>
                                        <th>WxH (mm)</th>
                                        <th>Weight</th>
                                        <th>Fire</th>
                                        <th>Type/Mat</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody id="door-table-body"></tbody>
                            </table>
                            <div id="door-empty" class="hidden" style="padding:3rem; text-align:center; color:var(--text-muted);">
                                No doors defined. Click "Add Door" to start.
                            </div>
                        </div>
                        <div class="text-right" style="margin-top:1.5rem;">
                            <button onclick="App.generateHardwareSets()" class="btn btn-primary">Generate Hardware Sets <i class="ph ph-arrow-right"></i></button>
                        </div>
                    </div>
                </div>

                <!-- Step 2: Hardware Generation & Review -->
                <div id="step-2" class="hidden">
                    <div style="display:flex; gap:1.5rem; align-items:flex-start;">
                        <!-- Sidebar List of Sets -->
                        <div class="card" style="width:280px; padding:0; overflow:hidden; flex-shrink:0;">
                            <div style="padding:1rem; background:#f9fafb; border-bottom:1px solid var(--border); font-weight:700; font-size:0.85rem; text-transform:uppercase; color:var(--text-muted);">
                                Hardware Sets
                            </div>
                            <div id="hw-set-sidebar"></div>
                        </div>

                        <!-- Main Edit Area -->
                        <div class="card" style="flex:1;">
                            <div id="hw-set-editor">
                                <!-- Dynamic Content -->
                            </div>
                        </div>
                    </div>
                    <div class="flex-between" style="margin-top:1.5rem;">
                        <button onclick="App.goToStep(1)" class="btn btn-secondary"><i class="ph ph-arrow-left"></i> Back</button>
                        <button onclick="App.goToStep(3)" class="btn btn-primary">Finish & Review <i class="ph ph-arrow-right"></i></button>
                    </div>
                </div>

                <!-- Step 3: Summary -->
                <div id="step-3" class="hidden card">
                    <div class="flex-between" style="margin-bottom:2rem;">
                        <h2 style="margin:0;">Specification Review</h2>
                        <button onclick="App.exportExcel()" class="btn btn-success"><i class="ph ph-file-xls"></i> Export to Excel</button>
                    </div>

                    <!-- Stats -->
                    <div class="grid-3" style="margin-bottom:2rem;">
                        <div style="background:#f8fafb; padding:1.5rem; border-radius:8px;">
                            <div style="color:var(--text-muted); font-size:0.8rem; font-weight:600; text-transform:uppercase;">Total Doors</div>
                            <div style="font-size:2rem; font-weight:700; color:var(--primary);" id="stat-doors">0</div>
                        </div>
                        <div style="background:#f8fafb; padding:1.5rem; border-radius:8px;">
                            <div style="color:var(--text-muted); font-size:0.8rem; font-weight:600; text-transform:uppercase;">Hardware Sets</div>
                            <div style="font-size:2rem; font-weight:700; color:var(--primary);" id="stat-sets">0</div>
                        </div>
                        <div style="background:#fff1f2; padding:1.5rem; border-radius:8px; border:1px solid #ffe4e6;">
                            <div style="color:#e11d48; font-size:0.8rem; font-weight:600; text-transform:uppercase;">Validation Issues</div>
                            <div style="font-size:2rem; font-weight:700; color:#e11d48;" id="stat-issues">0</div>
                        </div>
                    </div>

                    <!-- Clean Summary Table -->
                    <div style="border:1px solid var(--border); border-radius:8px; overflow:hidden;">
                         <table class="table-clean">
                            <thead>
                                <tr>
                                    <th>Set ID</th>
                                    <th>Set Name</th>
                                    <th>Assigned Doors</th>
                                    <th>Total Items</th>
                                    <th>Fire Rating</th>
                                </tr>
                            </thead>
                            <tbody id="summary-table"></tbody>
                        </table>
                    </div>
                </div>
            </div>
        </main>
    </div>

    <!-- Door Modal -->
    <div id="door-modal" style="position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); display:none; justify-content:center; align-items:center; z-index:200; backdrop-filter:blur(2px);">
        <div class="card" style="width:800px; max-width:95%; max-height:90vh; overflow-y:auto;">
            <div class="flex-between" style="margin-bottom:1.5rem;">
                <h3 style="margin:0;">Edit Door</h3>
                <button onclick="App.closeModal()" class="btn btn-ghost"><i class="ph ph-x" style="font-size:1.25rem;"></i></button>
            </div>
            <form onsubmit="event.preventDefault(); App.saveDoor();">
                <input type="hidden" id="d-id">
                
                <div class="grid-3">
                    <div class="input-group">
                        <label>Door Mark</label>
                        <input type="text" id="d-mark" required>
                    </div>
                    <div class="input-group">
                        <label>Location</label>
                        <input type="text" id="d-loc" list="room-suggestions" placeholder="Type or select...">
                        <datalist id="room-suggestions"></datalist>
                    </div>
                    <div class="input-group">
                        <label>Quantity</label>
                        <input type="number" id="d-qty" value="1" min="1">
                    </div>
                </div>

                <div style="margin: 1.5rem 0 1rem; padding-bottom:0.5rem; border-bottom:1px solid var(--border); font-weight:700; font-size:0.8rem; color:var(--text-muted); text-transform:uppercase;">Physical Dimensions</div>
                
                <div class="grid-3">
                    <div class="input-group">
                        <label>Width (mm)</label>
                        <input type="number" id="d-width" placeholder="900" oninput="App.validatePhysics()">
                        <div id="err-width" class="error-msg hidden"><i class="ph-fill ph-warning-circle"></i> Width must be 600-1300mm</div>
                    </div>
                    <div class="input-group">
                        <label>Height (mm)</label>
                        <input type="number" id="d-height" placeholder="2100" oninput="App.validatePhysics()">
                         <div id="err-height" class="error-msg hidden"><i class="ph-fill ph-warning-circle"></i> Height must be 1900-3000mm</div>
                    </div>
                     <div class="input-group">
                        <label>Weight (kg)</label>
                        <input type="number" id="d-weight" placeholder="40" oninput="App.validatePhysics()">
                        <div id="hint-weight" class="hint"></div>
                    </div>
                </div>

                <div class="grid-2" style="margin-top:1rem;">
                    <!-- Material (Standard Dropdown) -->
                    <div class="input-group">
                        <label>Door Material</label>
                        <select id="d-mat">
                            <option value="Timber">Timber / Wood</option>
                            <option value="Metal">Hollow Metal (Steel)</option>
                            <option value="Glass">Frameless Glass</option>
                            <option value="Aluminum">Aluminum Profile</option>
                        </select>
                    </div>
                    
                    <!-- Configuration (Visual Select) -->
                    <div class="input-group">
                        <label>Configuration</label>
                        <div class="visual-select-container" id="visual-config">
                            <div class="visual-option" onclick="App.selectVisual('config', 'Single')" data-val="Single">
                                <i class="ph ph-door"></i> Single
                            </div>
                            <div class="visual-option" onclick="App.selectVisual('config', 'Double')" data-val="Double">
                                <i class="ph ph-door-open"></i> Double
                            </div>
                        </div>
                        <input type="hidden" id="d-config" value="Single">
                    </div>
                </div>

                <div class="grid-2" style="margin-top:1rem;">
                    <div class="input-group">
                        <label>Fire Rating</label>
                        <select id="d-fire"></select>
                    </div>
                    <div class="input-group">
                        <label>Usage / Function</label>
                        <select id="d-use">
                            <option value="Office">Office / Passage</option>
                            <option value="Classroom">Classroom</option>
                            <option value="Patient">Patient Room</option>
                            <option value="Toilet">Restroom / Toilet</option>
                            <option value="Stair">Stairwell / Exit</option>
                            <option value="Store">Storage / Service</option>
                            <option value="Entrance">Main Entrance</option>
                        </select>
                    </div>
                </div>
                
                <div class="text-right" style="margin-top:1.5rem;">
                     <button type="submit" id="btn-save-door" class="btn btn-primary">Save Door</button>
                </div>
            </form>
        </div>
    </div>

    <script>
        const App = {
            data: { projects: [], currentId: null },
            
            // --- SMART DICTIONARIES ---
            roomTypes: {
                "Hospital / Healthcare": ["Patient Room", "Operating Theatre", "Nurse Station", "Clean Utility", "Dirty Utility", "Waiting Area", "Consultation Room"],
                "Education / School": ["Classroom", "Staff Room", "Library", "Auditorium", "Gymnasium", "Lab", "Cafeteria"],
                "Commercial Office": ["Open Office", "Meeting Room", "Director Cabin", "Server Room", "Reception", "Pantry", "Copy Room"],
                "Airport / Transport": ["Terminal Entry", "Check-in", "Security Check", "Boarding Gate", "Baggage Handling", "Duty Free"],
                "Hospitality / Hotel": ["Guest Room", "Ballroom", "Kitchen", "Back of House", "Lobby", "Spa"],
                "Residential": ["Entrance", "Living", "Bedroom", "Bathroom", "Kitchen", "Balcony"]
            },

            // Mapping Category -> Subtypes + Auto Spec
            productSubTypes: {
                "Hinges": [
                    { name: "Butt Hinge", spec: "4.5x4.5 Ball Bearing, Stainless Steel" },
                    { name: "Concealed Hinge", spec: "3D Adjustable Concealed Hinge, Satin Chrome" },
                    { name: "Pivot Set", spec: "Heavy Duty Floor Pivot & Top Center, Double Action" },
                    { name: "Geared Hinge", spec: "Continuous Geared Hinge, Full Mortise" }
                ],
                "Locks": [
                    { name: "Mortise Lock", spec: "Sashlock case, Cylinder operation, Grade 1/3" },
                    { name: "Deadbolt", spec: "Heavy Duty Deadbolt, Thumbturn internal" },
                    { name: "Cylindrical Lock", spec: "Leverset with integrated cylinder" },
                    { name: "Magnetic Lock", spec: "Electromagnetic Lock, 1200lbs holding force" },
                    { name: "Bathroom Lock", spec: "Privacy function, coin release indicator" },
                    { name: "Panic Bar", spec: "Rim Exit Device, Fire Rated" }
                ],
                "Closers": [
                    { name: "Overhead Closer", spec: "Surface mounted, Size 2-5, Backcheck" },
                    { name: "Cam Action Closer", spec: "Slide arm closer, High efficiency" },
                    { name: "Concealed Closer", spec: "Integrated in door leaf/frame" },
                    { name: "Floor Spring", spec: "Floor mounted closer, Double action" }
                ],
                "Handles": [
                    { name: "Lever Handle", spec: "Return to door safety lever, 19mm dia" },
                    { name: "Pull Handle", spec: "D-Handle, 300mm ctc, Bolt through" },
                    { name: "Push Plate", spec: "Stainless steel push plate 300x75mm" }
                ],
                "Stops": [
                    { name: "Door Stop", spec: "Floor mounted half-dome with rubber buffer" },
                    { name: "Wall Stop", spec: "Wall mounted projection stop" }
                ],
                "Cylinders": [
                    { name: "Cylinder", spec: "Euro Profile, Key/Key or Key/Turn" }
                ]
            },

            // Finishes based on Standard Mode
            standardFinishes: {
                "ANSI": ["SSS (US32D)", "PSS (US32)", "SCP (US26D)", "PVD Brass (US3)", "Oil Rubbed Bronze (US10B)"],
                "EN": ["SSS (Satin Stainless)", "PSS (Polished Stainless)", "SAA (Satin Anodized Alum)", "PVD (Brass Effect)", "RAL Powdercoat"]
            },

            // --- INIT ---
            init() {
                const saved = localStorage.getItem('specSmartDB');
                if(saved) this.data = JSON.parse(saved);
                
                // Show landing if no projects, else dashboard
                if(this.data.projects.length > 0) {
                   document.getElementById('landing-actions').innerHTML = `<button onclick="App.startJourney()" class="btn btn-primary">Continue to Dashboard</button>`;
                } else {
                   document.getElementById('landing-actions').innerHTML = `<button onclick="App.startJourney()" class="btn btn-secondary">Get Started</button>`;
                }
            },
            save() { localStorage.setItem('specSmartDB', JSON.stringify(this.data)); },
            getProj() { return this.data.projects.find(p => p.id === this.data.currentId); },

            // --- NAVIGATION ---
            startJourney() {
                document.getElementById('view-landing').classList.add('hidden');
                document.getElementById('app').classList.remove('hidden');
                this.showDashboard();
            },

            showDashboard() {
                document.getElementById('view-dashboard').classList.remove('hidden');
                document.getElementById('view-wizard').classList.add('hidden');
                document.getElementById('project-bar').classList.add('hidden');
                this.renderDashboard();
            },
            
            renderDashboard() {
                const list = document.getElementById('project-list');
                list.innerHTML = this.data.projects.map(p => `
                    <div class="project-card card" onclick="App.loadProject('${p.id}')">
                        <div style="font-weight:700; font-size:1.1rem; margin-bottom:0.5rem;">${p.name}</div>
                        <div class="badge badge-gray" style="margin-bottom:0.5rem;">${p.type}</div>
                        <div style="font-size:0.8rem; color:var(--text-muted);">${p.standard} Mode &bull; ${p.doors.length} Doors</div>
                    </div>
                `).join('') + `<div class="card" style="border:1px dashed var(--border); display:flex; align-items:center; justify-content:center; cursor:pointer;" onclick="App.createProject()">
                    <div style="text-align:center; color:var(--primary);">
                        <i class="ph ph-plus-circle" style="font-size:2rem;"></i><br>Create New
                    </div>
                </div>`;
            },

            createProject() {
                const id = crypto.randomUUID();
                this.data.projects.push({ 
                    id, name: "New Project", type: "Commercial Office", standard: "ANSI", 
                    doors: [], sets: [] 
                });
                this.loadProject(id);
            },

            loadProject(id) {
                this.data.currentId = id;
                const p = this.getProj();
                
                // UI Set
                document.getElementById('view-dashboard').classList.add('hidden');
                document.getElementById('view-wizard').classList.remove('hidden');
                document.getElementById('project-bar').classList.remove('hidden');
                
                // Bar Info
                document.getElementById('bar-project-name').innerText = p.name;
                document.getElementById('bar-standard').innerText = p.standard;
                document.getElementById('bar-type').innerText = p.type;

                // Load Step 0 Data
                document.getElementById('p-name').value = p.name;
                document.getElementById('p-type').value = p.type;
                document.getElementById('p-standard').value = p.standard;

                this.goToStep(0);
            },

            saveProject() {
                this.save();
                alert("Project Saved!");
            },

            goToStep(n) {
                // Stepper UI
                document.querySelectorAll('.step-item').forEach((el, i) => {
                    el.classList.toggle('active', i === n);
                    el.classList.toggle('completed', i < n);
                });
                
                // Content Switch
                [0,1,2,3].forEach(i => document.getElementById(`step-${i}`).classList.add('hidden'));
                document.getElementById(`step-${n}`).classList.remove('hidden');

                const p = this.getProj();
                if(n===1) this.renderDoorTable();
                if(n===2) {
                    if(p.sets.length === 0) this.generateHardwareSets(); // Auto gen if empty
                    this.renderSetsSidebar();
                    if(p.sets.length > 0) this.renderSetEditor(p.sets[0].id);
                }
                if(n===3) this.renderSummary();
            },

            saveStep0() {
                const p = this.getProj();
                p.name = document.getElementById('p-name').value;
                p.type = document.getElementById('p-type').value;
                p.standard = document.getElementById('p-standard').value;
                
                // Update Bar
                document.getElementById('bar-project-name').innerText = p.name;
                document.getElementById('bar-standard').innerText = p.standard;
                document.getElementById('bar-type').innerText = p.type;
                
                this.save();
                this.goToStep(1);
            },

            // --- STEP 1: DOOR SCHEDULE ---
            renderDoorTable() {
                const p = this.getProj();
                const tbody = document.getElementById('door-table-body');
                tbody.innerHTML = '';
                
                if(p.doors.length === 0) {
                    document.getElementById('door-empty').classList.remove('hidden');
                    return;
                }
                document.getElementById('door-empty').classList.add('hidden');

                p.doors.forEach(d => {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td style="font-weight:600; color:var(--primary);">${d.mark}</td>
                        <td>${d.location}</td>
                        <td>${d.qty || 1}</td>
                        <td>${d.width} x ${d.height}</td>
                        <td>${d.weight} kg</td>
                        <td><span class="badge ${d.fire>0?'badge-orange':'badge-gray'}">${d.fire} min</span></td>
                        <td>${d.use}</td>
                        <td>
                            <button onclick="App.duplicateDoor('${d.id}')" class="btn btn-ghost btn-sm" title="Duplicate"><i class="ph ph-copy"></i></button>
                            <button onclick="App.editDoor('${d.id}')" class="btn btn-ghost btn-sm" title="Edit"><i class="ph ph-pencil"></i></button>
                            <button onclick="App.deleteDoor('${d.id}')" class="btn btn-ghost btn-sm" style="color:var(--danger);" title="Delete"><i class="ph ph-trash"></i></button>
                        </td>
                    `;
                    tbody.appendChild(tr);
                });
            },

            addDoor() {
                const p = this.getProj();
                // Smart Suggestions for Room
                const datalist = document.getElementById('room-suggestions');
                datalist.innerHTML = (this.roomTypes[p.type] || []).map(r => `<option value="${r}">`).join('');

                // Fire Ratings based on Standard
                const fireSel = document.getElementById('d-fire');
                fireSel.innerHTML = p.standard === "ANSI" 
                    ? `<option value="0">Non-Rated</option><option value="20">20 min</option><option value="45">45 min</option><option value="90">90 min</option><option value="180">3 Hour</option>`
                    : `<option value="0">None</option><option value="30">E30</option><option value="60">E60</option><option value="90">E90</option><option value="120">E120</option>`;

                // Clear & Show Modal
                document.getElementById('d-id').value = "";
                document.getElementById('d-mark').value = "D-" + (p.doors.length + 1).toString().padStart(3,'0');
                document.getElementById('d-loc').value = "";
                document.getElementById('d-qty').value = "1";
                document.getElementById('d-width').value = "900";
                document.getElementById('d-height').value = "2100";
                document.getElementById('d-weight').value = "45";
                
                // Reset Selectors
                document.getElementById('d-mat').value = "Timber";
                App.selectVisual('config', 'Single');

                document.getElementById('door-modal').style.display = 'flex';
                this.validatePhysics();
            },

            selectVisual(group, val) {
                document.getElementById('d-' + group).value = val;
                const container = document.getElementById('visual-' + group);
                Array.from(container.children).forEach(child => {
                    child.classList.toggle('selected', child.dataset.val === val);
                });
            },

            validatePhysics() {
                const w = parseInt(document.getElementById('d-weight').value) || 0;
                const width = parseInt(document.getElementById('d-width').value) || 0;
                const height = parseInt(document.getElementById('d-height').value) || 0;
                
                const wErr = document.getElementById('err-width');
                const hErr = document.getElementById('err-height');
                const btn = document.getElementById('btn-save-door');
                
                let valid = true;

                // Width Check (600-1300)
                if (width < 600 || width > 1300) {
                    wErr.classList.remove('hidden');
                    document.getElementById('d-width').classList.add('invalid');
                    valid = false;
                } else {
                    wErr.classList.add('hidden');
                    document.getElementById('d-width').classList.remove('invalid');
                }

                // Height Check (1900-3000)
                if (height < 1900 || height > 3000) {
                    hErr.classList.remove('hidden');
                    document.getElementById('d-height').classList.add('invalid');
                    valid = false;
                } else {
                    hErr.classList.add('hidden');
                    document.getElementById('d-height').classList.remove('invalid');
                }

                // Weight Hint
                const hint = document.getElementById('hint-weight');
                if(w > 150) { hint.innerText = "Info: Heavy (>150kg). Pivot Sets suggested."; hint.style.color = "var(--warning)"; }
                else if(width > 1100) { hint.innerText = "Info: Wide (>1100mm). HD Closers suggested."; hint.style.color = "var(--text-muted)"; }
                else { hint.innerText = ""; }

                btn.disabled = !valid;
                btn.style.opacity = valid ? 1 : 0.5;
            },

            saveDoor() {
                const p = this.getProj();
                const id = document.getElementById('d-id').value || crypto.randomUUID();
                const door = {
                    id,
                    mark: document.getElementById('d-mark').value,
                    location: document.getElementById('d-loc').value,
                    qty: parseInt(document.getElementById('d-qty').value),
                    width: parseInt(document.getElementById('d-width').value),
                    height: parseInt(document.getElementById('d-height').value),
                    weight: parseInt(document.getElementById('d-weight').value),
                    fire: parseInt(document.getElementById('d-fire').value),
                    use: document.getElementById('d-use').value,
                    material: document.getElementById('d-mat').value,
                    config: document.getElementById('d-config').value
                };

                const idx = p.doors.findIndex(d => d.id === id);
                if(idx >= 0) p.doors[idx] = door;
                else p.doors.push(door);

                this.save();
                this.closeModal();
                this.renderDoorTable();
            },

            duplicateDoor(id) {
                const p = this.getProj();
                const original = p.doors.find(d => d.id === id);
                const copy = { ...original, id: crypto.randomUUID(), mark: original.mark + "-COPY" };
                p.doors.push(copy);
                this.save();
                this.renderDoorTable();
            },
            
            deleteDoor(id) {
                const p = this.getProj();
                p.doors = p.doors.filter(d => d.id !== id);
                this.save();
                this.renderDoorTable();
            },
            
            editDoor(id) {
                const p = this.getProj();
                const d = p.doors.find(d => d.id === id);
                
                this.addDoor(); // Setup basic state
                document.getElementById('d-id').value = d.id;
                document.getElementById('d-mark').value = d.mark;
                document.getElementById('d-loc').value = d.location;
                document.getElementById('d-qty').value = d.qty;
                document.getElementById('d-width').value = d.width;
                document.getElementById('d-height').value = d.height;
                document.getElementById('d-weight').value = d.weight;
                document.getElementById('d-fire').value = d.fire;
                document.getElementById('d-use').value = d.use;
                document.getElementById('d-mat').value = d.material || 'Timber';
                
                // Visuals
                App.selectVisual('config', d.config || 'Single');
                
                this.validatePhysics();
            },

            closeModal() { document.getElementById('door-modal').style.display = 'none'; },

            // --- STEP 2: HARDWARE LOGIC ---
            generateHardwareSets() {
                const p = this.getProj();
                const groups = {};
                const defaultFinish = p.standard === "ANSI" ? "SSS (US32D)" : "SSS (Satin Stainless)";
                
                // Group doors
                p.doors.forEach(d => {
                    const key = `${d.use}|${d.fire}|${d.config}`;
                    if(!groups[key]) groups[key] = [];
                    groups[key].push(d);
                });

                p.sets = Object.entries(groups).map(([key, doors], idx) => {
                    const [use, fire] = key.split('|');
                    const rep = doors.reduce((a,b) => a.weight > b.weight ? a : b); // Max weight door
                    
                    const setID = `HW-${String(idx+1).padStart(2,'0')}`;
                    const items = [];

                    // HELPER: Add item with category for better dropdowns
                    const addItem = (cat, ref, type, spec, qty) => items.push({category: cat, ref, type, spec, qty, finish: defaultFinish });

                    // 1. HINGES
                    if(rep.weight > 150) {
                         addItem("Hinges", "P01", "Pivot Set", `Heavy Duty Pivot Set, ${rep.weight}kg Capacity`, "1 Set");
                    } else {
                        const hType = p.standard === "ANSI" ? "4.5x4.5 Ball Bearing" : "102x76x3 Ball Bearing";
                        addItem("Hinges", "H01", "Butt Hinge", `${hType}`, "3");
                    }

                    // 2. LOCKS
                    if(use === "Toilet") {
                        addItem("Locks", "L01", "Bathroom Lock", "Privacy function, coin release", "1");
                    } else if(use === "Stair") {
                        addItem("Locks", "L01", "Panic Bar", "Rim Exit Device, Fire Rated", "1");
                    } else {
                        addItem("Locks", "L01", "Mortise Lock", "Sashlock case, Cylinder operation", "1");
                        addItem("Cylinders", "C01", "Cylinder", "Euro Profile, Key/Turn", "1");
                        addItem("Handles", "H02", "Lever Handle", "Return to door safety lever", "1 Pr");
                    }

                    // 3. CLOSERS
                    if(use !== "Toilet" && use !== "Store") {
                        const cSpec = rep.width > 1100 ? "Size 3-6 Heavy Duty" : "Size 2-4 Adjustable";
                        addItem("Closers", "D01", "Overhead Closer", `Surface, ${cSpec}, Backcheck`, "1");
                    }

                    // 4. PROTECTION
                    addItem("Stops", "S01", "Door Stop", "Floor mounted half-dome", "1");

                    return { 
                        id: setID, 
                        name: `${use} Door - ${fire>0?fire+'min':'NFR'}`, 
                        doors: doors.map(d=>d.id),
                        items: items,
                        operation: "Door is self-closing and latching. Free egress at all times."
                    };
                });

                this.save();
                this.goToStep(2);
            },

            renderSetsSidebar() {
                const p = this.getProj();
                const el = document.getElementById('hw-set-sidebar');
                el.innerHTML = p.sets.map(s => `
                    <div class="list-item" style="padding:1rem; border-bottom:1px solid var(--border); cursor:pointer;" onclick="App.renderSetEditor('${s.id}')">
                        <div style="font-weight:700;">${s.id}</div>
                        <div style="font-size:0.85rem;">${s.name}</div>
                    </div>
                `).join('');
            },

            renderSetEditor(setId) {
                const p = this.getProj();
                const s = p.sets.find(x => x.id === setId);
                
                const container = document.getElementById('hw-set-editor');
                container.innerHTML = `
                    <div style="padding:1.5rem; background:white;">
                        <div class="flex-between" style="margin-bottom:1rem;">
                            <h2 style="margin:0;">${s.id}: ${s.name}</h2>
                            <div class="badge badge-blue">${p.doors.filter(d=>d.id && s.doors.includes(d.id)).length} Doors Assigned</div>
                        </div>

                        <div class="hw-table">
                            <div class="hw-table-header">
                                <div>Ref</div>
                                <div>Product Type</div>
                                <div>Finish</div>
                                <div>Specification</div>
                                <div>Qty</div>
                                <div></div>
                            </div>
                            <div id="hw-items-list"></div>
                        </div>
                        
                        <div style="margin-bottom:1.5rem;">
                             <button class="btn btn-secondary btn-sm" onclick="App.addHWItem('${setId}')"><i class="ph ph-plus"></i> Add Item</button>
                        </div>

                        <div class="input-group">
                            <label>Operational Description</label>
                            <textarea id="op-desc-${setId}" rows="3" onchange="App.updateOp('${setId}', this.value)">${s.operation}</textarea>
                        </div>
                    </div>
                `;
                
                this.renderHWItems(setId);
            },

            renderHWItems(setId) {
                const p = this.getProj();
                const s = p.sets.find(x => x.id === setId);
                const list = document.getElementById('hw-items-list');
                
                const usedTypes = {};
                s.items.forEach(i => { usedTypes[i.type] = (usedTypes[i.type] || 0) + 1; });

                // Get finishes based on standard
                const finishes = this.standardFinishes[p.standard];

                list.innerHTML = s.items.map((item, idx) => {
                    const isDuplicate = usedTypes[item.type] > 1;
                    const cat = item.category || "Hinges";
                    const options = this.productSubTypes[cat] || this.productSubTypes["Hinges"];

                    return `
                    <div class="hw-table-row">
                        ${isDuplicate ? '<i class="ph-fill ph-warning warning-icon" title="Duplicate Item"></i>' : ''}
                        <input type="text" value="${item.ref}" onchange="App.updateItem('${setId}', ${idx}, 'ref', this.value)" style="padding:0.3rem; width:100%;">
                        
                        <select onchange="App.updateItemType('${setId}', ${idx}, this.value)" style="padding:0.3rem; width:100%;">
                            ${options.map(o => `<option value="${o.name}" ${item.type===o.name?'selected':''}>${o.name}</option>`).join('')}
                        </select>

                        <select onchange="App.updateItem('${setId}', ${idx}, 'finish', this.value)" style="padding:0.3rem; width:100%;">
                            ${finishes.map(f => `<option value="${f}" ${item.finish===f?'selected':''}>${f}</option>`).join('')}
                             <option value="N/A">N/A (Mill/Primed)</option>
                        </select>
                        
                        <input type="text" value="${item.spec}" onchange="App.updateItem('${setId}', ${idx}, 'spec', this.value)" style="padding:0.3rem; width:100%;">
                        <input type="text" value="${item.qty}" onchange="App.updateItem('${setId}', ${idx}, 'qty', this.value)" style="padding:0.3rem; width:100%;">
                        <button onclick="App.deleteItem('${setId}', ${idx})" style="color:red; background:none; border:none; cursor:pointer;"><i class="ph ph-trash"></i></button>
                    </div>
                `}).join('');
            },

            updateItem(setId, idx, field, val) {
                const p = this.getProj();
                p.sets.find(s=>s.id===setId).items[idx][field] = val;
                this.save();
                if(field === 'ref') {
                    const refChar = val.charAt(0).toUpperCase();
                    let cat = "Hinges";
                    if(refChar === 'L') cat = "Locks";
                    if(refChar === 'D') cat = "Closers";
                    if(refChar === 'S') cat = "Stops";
                    p.sets.find(s=>s.id===setId).items[idx].category = cat;
                    this.renderHWItems(setId);
                }
            },

            updateItemType(setId, idx, newType) {
                const p = this.getProj();
                const item = p.sets.find(s=>s.id===setId).items[idx];
                item.type = newType;
                
                const cat = item.category || "Hinges";
                const template = this.productSubTypes[cat].find(x => x.name === newType);
                if(template) item.spec = template.spec;

                this.save();
                this.renderHWItems(setId);
            },
            
            addHWItem(setId) {
                const p = this.getProj();
                const defaultFinish = p.standard === "ANSI" ? "SSS (US32D)" : "SSS (Satin Stainless)";
                p.sets.find(s=>s.id===setId).items.push({ category: "Hinges", ref:"New", type:"Butt Hinge", spec:"", qty:"1", finish: defaultFinish });
                this.save();
                this.renderHWItems(setId);
            },

            deleteItem(setId, idx) {
                const p = this.getProj();
                p.sets.find(s=>s.id===setId).items.splice(idx, 1);
                this.save();
                this.renderHWItems(setId);
            },

            updateOp(setId, val) {
                const p = this.getProj();
                p.sets.find(s=>s.id===setId).operation = val;
                this.save();
            },

            // --- STEP 3: SUMMARY ---
            renderSummary() {
                const p = this.getProj();
                document.getElementById('stat-doors').innerText = p.doors.length;
                document.getElementById('stat-sets').innerText = p.sets.length;
                
                // Validate
                const issues = p.doors.filter(d => !p.sets.find(s => s.doors.includes(d.id))).length;
                document.getElementById('stat-issues').innerText = issues;

                const tbody = document.getElementById('summary-table');
                tbody.innerHTML = p.sets.map(s => {
                    const doorCount = p.doors.filter(d => s.doors.includes(d.id)).length;
                    const repDoor = p.doors.find(d => s.doors.includes(d.id));
                    const fire = repDoor ? repDoor.fire : 0;
                    
                    return `
                        <tr>
                            <td style="font-weight:700;">${s.id}</td>
                            <td>${s.name}</td>
                            <td>${doorCount}</td>
                            <td>${s.items.length}</td>
                            <td><span class="badge ${fire>0?'badge-orange':'badge-gray'}">${fire} min</span></td>
                        </tr>
                    `;
                }).join('');
            },

            exportExcel() {
                const p = this.getProj();
                const wb = XLSX.utils.book_new();

                const doorData = p.doors.map(d => ({
                    "Mark": d.mark, "Location": d.location, "Qty": d.qty, 
                    "Width": d.width, "Height": d.height, "Fire": d.fire, "Use": d.use
                }));
                const wsDoors = XLSX.utils.json_to_sheet(doorData);
                XLSX.utils.book_append_sheet(wb, wsDoors, "Door Schedule");
                
                const itemData = [];
                p.sets.forEach(s => {
                    s.items.forEach(i => {
                        itemData.push({ "Set": s.id, "Set Name": s.name, "Ref": i.ref, "Type": i.type, "Finish": i.finish, "Spec": i.spec, "Qty": i.qty });
                    });
                });
                const wsItems = XLSX.utils.json_to_sheet(itemData);
                XLSX.utils.book_append_sheet(wb, wsItems, "Hardware Specs");

                XLSX.writeFile(wb, `${p.name}_Spec.xlsx`);
            }
        };

        document.addEventListener('DOMContentLoaded', () => App.init());
    </script>
</body>
</html>
