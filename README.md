<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Smart Shelf UI</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
        
        html, body {
            height: 100%;
            width: 100%;
            margin: 0;
            padding: 0;
            overflow: hidden;
        }
        body { 
            font-family: 'Inter', sans-serif; 
            background-color: #fff;
        }
        .main-content {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100%;
            width: 100%;
        }
        .shelf-container {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 60px;
            width: 100%;
            height: 100%;
            padding: 24px;
            box-sizing: border-box;
            transition: background-color 0.3s, flex-direction 0.3s;
        }

        .queue-drawer { position: fixed; top: 0; left: 0; width: 410px; max-width: 100vw; height: 100vh; background: #fff; box-shadow: 4px 0 24px rgba(0,0,0,0.13); z-index: 100; padding: 32px; transition: transform 0.33s cubic-bezier(.55,0,.32,1); transform: translateX(-100%); display: flex; flex-direction: column; }
        .queue-drawer.open { transform: translateX(0); }
        .queue-header { font-size: 2em; font-weight: 700; margin-bottom: 16px; margin-top: 0; }
        .queue-list { flex: 1; overflow-y: auto; margin: 0; padding: 0; list-style: none; }
        .queue-item { display: flex; justify-content: space-between; align-items: center; padding: 18px 0 12px 0; border-bottom: 1px solid #eee; gap: 8px; }
        .queue-item-details { display: flex; flex-direction: column; line-height: 1.3; }
        .queue-lot-no { font-weight: 600; font-size: 1.1em; }
        .queue-emp-id { font-size: 14px; color: #6c757d; }
        .queue-item button { font-size: 15px; padding: 6px 22px; cursor: pointer; background-color: #198754; color: white; border: none; border-radius: 6px; font-weight: 600; }
        .queue-placeholder { color: #6c757d; font-style: italic; margin-top: 20px; }
        .drawer-backdrop { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.07); z-index: 50; display: none; }
        .drawer-backdrop.open { display: block; }
        .main-content.blurred { filter: blur(2px) grayscale(0.3); }
        .details-panel { display: flex; flex-direction: column; gap: 16px; min-width: 270px; }
        .details-panel .label { font-size: 21px; color: #6c757d; }
        .details-panel .value { font-size: 26px; font-weight: 600; color: #343a40; }
        .details-panel .lot-no { font-size: 62px; font-weight: 800; }
        .status-badge { background-color: #6c757d; color: white; padding: 8px 28px; border-radius: 24px; font-weight: 700; font-size: 1.45em; display: inline-block; }
        .status-badge.Waiting { background-color: #0d6efd; }
        .status-badge.Error { background-color: #dc3545; }
        .shelf-panel h2 { font-size: 2em; color: #343a40; margin: 0 0 20px 0; text-align: center; }
        .shelf-grid { display: grid; grid-template-rows: repeat(4, 60px); grid-template-columns: repeat(6, 60px); gap: 7px; padding: 12px; background-color: #f8f9fa; border: 1px solid #dee2e6; }
        .shelf-frame { border: 10px solid #adb5bd; border-radius: 10px; padding: 6px; }
        .shelf-cell { background-color: #fff; border: 1.8px solid #e9ecef; border-radius: 4px; transition: background .18s; }
        .shelf-cell.has-item { background-color: #a7f3d0; border-color: #34d399; }
        .shelf-cell.selected-task { background-color: #dc3545 !important; border-color: #b02a37 !important; }
        .back-to-queue-btn { background: none; border: none; color: #0d6efd; cursor: pointer; font-size: 16px; padding: 8px; margin-top: 20px; text-align: center; width: 100%; }
        .back-to-queue-btn:hover { text-decoration: underline; }
        .shelf-container.error-state { background-color: #fff1f2; }
        .shelf-cell.highlight-error { animation: blink-error 1.2s infinite ease-in-out; }
        @keyframes blink-error { 0%   { background-color: #ffc107; } 50%  { background-color: #dc3545; } 100% { background-color: #ffc107; } }
        
        .shelf-container.full-shelf-mode {
            justify-content: center;
            align-items: center;
        }
        .shelf-container.full-shelf-mode .shelf-panel h2 {
            font-size: 2.5em;
        }
        .shelf-container.full-shelf-mode .shelf-grid {
            grid-template-rows: repeat(4, 130px);
            grid-template-columns: repeat(6, 130px);
            gap: 15px;
        }
        .shelf-container.full-shelf-mode .shelf-frame {
            border-width: 15px;
        }

        @media (max-width: 1300px) {
            body { font-size: 14px; }
            .shelf-container { gap: 30px; }
            .details-panel { gap: 12px; min-width: 230px; }
            .details-panel .label { font-size: 18px; }
            .details-panel .value { font-size: 20px; }
            .details-panel .lot-no { font-size: 48px; }
            .status-badge { font-size: 1.25em; padding: 6px 20px; }
            .shelf-panel h2 { font-size: 1.6em; margin-bottom: 15px; }
            .shelf-grid {
                grid-template-rows: repeat(4, 50px);
                grid-template-columns: repeat(6, 50px);
                gap: 5px;
            }
            .shelf-frame { border-width: 8px; padding: 5px; }
            .queue-drawer { width: 350px; padding: 24px; }
            .queue-header { font-size: 1.8em; }
            .queue-item { padding: 14px 0 10px 0; }
            .queue-item button { font-size: 14px; padding: 5px 18px; }

            .shelf-container.full-shelf-mode .shelf-panel h2 {
                font-size: 2.2em;
            }
            .shelf-container.full-shelf-mode .shelf-grid {
                grid-template-rows: repeat(4, 100px);
                grid-template-columns: repeat(6, 100px);
                gap: 10px;
            }
            .shelf-container.full-shelf-mode .shelf-frame {
                border-width: 12px;
            }
        }
    </style>
</head>
<body>
    <div class="drawer-backdrop" id="drawerBackdrop"></div>
    <aside class="queue-drawer" id="queueDrawer">
        <div class="queue-header">Job Queue</div>
        <ul class="queue-list" id="queueList"></ul>
    </aside>

    <main class="main-content" id="mainContent">
        <div class="shelf-container" id="shelfContainer" style="display:none;">
            <div class="details-panel" id="detailsPanel"></div>
            <div class="shelf-panel" id="shelfPanel">
                <h2>Shelf</h2>
                <div class="shelf-frame"><div class="shelf-grid" id="shelfGrid"></div></div>
            </div>
        </div>
    </main>

    <script>
        // ========= START: WEBSOCKET CODE ==========
        function connectWebSocket() {
            // ใช้ `window.location.hostname` เพื่อเอา IP ของ Pi อัตโนมัติ
            // เพิ่ม '/browser' เพื่อให้ server รู้ว่าเป็นหน้า UI
            const ws = new WebSocket(`ws://${window.location.hostname}:8765/browser`);

            ws.onopen = () => console.log('WebSocket connection established.');
            ws.onclose = () => {
                console.log('WebSocket connection closed. Reconnecting in 2 seconds...');
                setTimeout(connectWebSocket, 2000); // พยายามเชื่อมต่อใหม่
            };
            ws.onerror = (error) => console.error('WebSocket Error:', error);

            // ฟังก์ชันที่สำคัญที่สุด: เมื่อได้รับข้อมูลจาก Server
            ws.onmessage = (event) => {
                console.log('Message from server:', event.data);
                const newJob = JSON.parse(event.data);

                // นำ Job ใหม่ที่ได้รับมาเพิ่มในคิว (ที่เก็บใน localStorage)
                const queue = JSON.parse(localStorage.getItem('shelfQueue') || '[]');
                queue.push(newJob);
                localStorage.setItem('shelfQueue', JSON.stringify(queue));
                
                // เรียก render ใหม่ทั้งหมดเพื่ออัปเดตหน้าจอ
                renderAll();
            };
        }
        // ========= END: WEBSOCKET CODE ==========


        const drawerBackdrop = document.getElementById('drawerBackdrop');
        const queueDrawer = document.getElementById('queueDrawer');
        const queueListEl = document.getElementById('queueList');
        const detailsPanel = document.getElementById('detailsPanel');
        const shelfGrid = document.getElementById('shelfGrid');
        const shelfContainer = document.getElementById('shelfContainer');

        const ROWS = 4, COLS = 6;

        function openDrawer() { queueDrawer.classList.add('open'); drawerBackdrop.classList.add('open'); document.getElementById('mainContent').classList.add('blurred'); }
        function closeDrawer() { queueDrawer.classList.remove('open'); drawerBackdrop.classList.remove('open'); document.getElementById('mainContent').classList.remove('blurred'); }
        drawerBackdrop.onclick = closeDrawer;

        for (let r = 1; r <= ROWS; r++) for (let c = 1; c <= COLS; c++) {
            const cell = document.createElement('div');
            cell.classList.add('shelf-cell');
            cell.id = `cell-${r}-${c}`;
            shelfGrid.appendChild(cell);
        }

        function getActiveJob() { return JSON.parse(localStorage.getItem('activeShelfJob') || 'null'); }
        function setActiveJob(job) { localStorage.setItem('activeShelfJob', JSON.stringify(job)); }
        
        function renderShelfFromState(shelfState) {
            document.querySelectorAll('.shelf-cell').forEach(c => c.className = 'shelf-cell');
            // This function is for a different feature, we can ignore it for now.
        }

        function renderQueueList() {
            const queue = JSON.parse(localStorage.getItem('shelfQueue') || '[]');
            queueListEl.innerHTML = '';
            
            if (queue.length === 0) {
                queueListEl.innerHTML = '<li class="queue-placeholder">No jobs in queue...</li>';
                closeDrawer();
                return;
            }

            queue.forEach((job, index) => {
                const item = document.createElement('li');
                item.className = 'queue-item';
                item.innerHTML = `
                    <div class="queue-item-details">
                        <span class="queue-lot-no">Lot: ${job.lotNo}</span>
                        <span class="queue-emp-id">Emp: ${job.employeeId}</span>
                    </div>
                    <button data-job-index="${index}">Select</button>
                `;
                queueListEl.appendChild(item);
            });

            if (queue.length > 1 && !getActiveJob()) {
                openDrawer();
            } else {
                closeDrawer();
            }
        }

        function goBackToQueue() {
            localStorage.removeItem('activeShelfJob');
            renderAll();
        }

        function renderActiveJob() {
            const activeJob = getActiveJob();
            
            shelfContainer.classList.remove('error-state', 'full-shelf-mode');
            detailsPanel.style.display = 'flex';
            document.querySelectorAll('.shelf-cell').forEach(c => c.className = 'shelf-cell');

            if (!activeJob) {
                shelfContainer.classList.add('full-shelf-mode');
                detailsPanel.style.display = 'none';
                return;
            }
            
            detailsPanel.innerHTML = `
                <div><span class="label">Status  </span><span class="value"><span class="status-badge ${activeJob.status}">${activeJob.status}</span></span></div>
                <div><span class="label">Lot No.</span><span class="value lot-no">${activeJob.lotNo}</span></div>
                <div><span class="label">Form To </span><span class="value">${activeJob.from}</span></div>
                <div><span class="label">Employee ID </span><span class="value">${activeJob.employeeId}</span></div>
                <div><span class="label">Time Stamp </span><span class="value">${activeJob.timestamp}</span></div>
                <button class="back-to-queue-btn" onclick="goBackToQueue()">← Back to Queue</button>
            `;
            
            if (activeJob.error) shelfContainer.classList.add('error-state');
            
            if (activeJob.location) {
                const { row, col } = activeJob.location;
                const targetCell = document.getElementById(`cell-${row}-${col}`);
                if (targetCell) {
                    targetCell.classList.add(activeJob.error ? 'highlight-error' : 'selected-task');
                }
            }
        }

        queueListEl.addEventListener('click', function(event) {
            if (event.target.tagName === 'BUTTON' && event.target.dataset.jobIndex) {
                const jobIndex = parseInt(event.target.dataset.jobIndex, 10);
                const queue = JSON.parse(localStorage.getItem('shelfQueue') || '[]');
                const selectedJob = queue[jobIndex];
                if (selectedJob) {
                    setActiveJob(selectedJob);
                    renderAll(); 
                    closeDrawer();
                }
            }
        });

        function renderAll() {
            shelfContainer.style.display = 'flex';
            const queue = JSON.parse(localStorage.getItem('shelfQueue') || '[]');

            // ถ้ามี 1 job ในคิว และยังไม่มี active job ให้ตั้ง job นั้นเป็น active อัตโนมัติ
            if (queue.length === 1 && !getActiveJob()) {
                setActiveJob(queue[0]);
            }

            renderQueueList();
            renderActiveJob();
        }
        
        // --- Initial Load ---
        document.addEventListener('DOMContentLoaded', (event) => {
            // ล้างข้อมูลเก่าเมื่อเปิดหน้าเว็บใหม่
            localStorage.removeItem('shelfQueue');
            localStorage.removeItem('activeShelfJob');
            
            renderAll(); // แสดงผลหน้าจอเริ่มต้น
            connectWebSocket(); // เริ่มการเชื่อมต่อ WebSocket
        });
    </script>
</body>
</html>
