// --- Cell Preview: แสดงรายละเอียดช่องที่เลือก (IMPROVED DESIGN) ---
function renderCellPreview({ level, block, lots, targetLotNo, isPlaceJob = false, newLotTrayCount = 0 }) {
    const container = document.getElementById('cellPreviewContainer');
    if (!container) return;

    // lots: array of {lot_no, tray_count}
    if (!Array.isArray(lots)) lots = [];

    // ถ้าเป็น Place job ให้จำลองการวางของใหม่
    let previewLots = [...lots];
    if (isPlaceJob && targetLotNo && newLotTrayCount > 0) {
        // เพิ่ม lot ใหม่ที่จะวางลงไปด้านบน (LIFO)
        previewLots.push({
            lot_no: targetLotNo,
            tray_count: newLotTrayCount
        });
    }

    let html = '';
    html += `<h3>Level ${level} Block ${block}</h3>`;
    
    // แสดงข้อความแตกต่างกันตาม action
    if (isPlaceJob) {
        html += `<p class="preview-action">Preview after placing:</p>`;
    }
    
    // เพิ่มหัวข้อ Lot No.
    html += `<h4 class="lot-header">Lot No.</h4>`;
    html += `<div class="block-preview">`;

    if (previewLots.length > 0) {
        // สร้างรายการ lot แนวตั้ง (จากล่างขึ้นบน)
        for (let i = previewLots.length - 1; i >= 0; i--) {
            const lot = previewLots[i];
            const trayCount = parseInt(lot.tray_count) || 0;
            const isTarget = lot.lot_no === targetLotNo;
            const isNewLot = isPlaceJob && i === previewLots.length - 1 && isTarget;

            // คำนวณความสูงตามสัดส่วน tray_count เทียบกับความจุจริงของ cell
            const maxCapacity = getCellCapacity(level, block); // ใช้ความจุจริงของ cell แทนค่าคงที่ 24
            const maxContainerHeight = 300; // ความสูงที่ใช้ได้ของ container (350px - padding)
            const heightRatio = trayCount / maxCapacity;
            const height = Math.max(heightRatio * maxContainerHeight, 8); // ลดความสูงขั้นต่ำเป็น 8px เพื่อให้แสดงสัดส่วนที่ถูกต้อง

            // ตัดชื่อ lot ถ้ายาวเกินไป (สำหรับ desktop ใช้ 15 ตัวอักษร)
            const displayName = lot.lot_no.length > 15 ?
                lot.lot_no.substring(0, 15) + '...' :
                lot.lot_no;

            let itemClass = 'lot-item';
            if (isTarget) itemClass += ' target-lot';
            if (isNewLot) itemClass += ' new-lot';

            html += `<div class="${itemClass}" style="height: ${height}px;" title="${lot.lot_no} - ${trayCount} trays">`;
            html += `<span class="lot-name">${displayName}</span>`;
            if (isNewLot) {
                html += `<span class="new-badge"> NEW</span>`;
            }
            html += `</div>`;
        }
    } else {
        html += `<div class="lot-item empty-slot">`;
        html += `<span class="lot-name">(empty)</span>`;
        html += `</div>`;
    }

    html += `</div>`;
    container.innerHTML = html;
}
// Utility: Get lots in a specific cell (level, block)
function getLotsInCell(level, block) {
    const shelfState = JSON.parse(localStorage.getItem(GLOBAL_SHELF_STATE_KEY) || '[]');
    for (const cellData of shelfState) {
        let cellLevel, cellBlock, cellLots;
        if (Array.isArray(cellData)) {
            cellLevel = cellData[0];
            cellBlock = cellData[1];
            cellLots = cellData[2];
        } else if (cellData && typeof cellData === 'object') {
            ({ level: cellLevel, block: cellBlock, lots: cellLots } = cellData);
        }
        if (String(cellLevel) === String(level) && String(cellBlock) === String(block)) {
            return Array.isArray(cellLots) ? cellLots : [];
        }
    }
    return [];
}

// Utility: Get cell capacity (actual max trays for a specific cell)
function getCellCapacity(level, block) {
    // ค่าความจุเริ่มต้นสำหรับแต่ละ cell (สามารถปรับแก้ได้ตามความต้องการ)
    const cellCapacities = {
        '1-1': 22, // Level 1 Block 1 = 22 trays
        '1-2': 24, // Level 1 Block 2 = 24 trays  
        '1-3': 24, // Level 1 Block 3 = 24 trays
        '1-4': 24, // Level 1 Block 4 = 24 trays
        '1-5': 24, // Level 1 Block 5 = 24 trays
        // เพิ่มข้อมูลความจุของ cell อื่นๆ ตามความต้องการ
    };
    
    const cellKey = `${level}-${block}`;
    return cellCapacities[cellKey] || 24; // ถ้าไม่มีข้อมูล ใช้ 24 เป็นค่าเริ่มต้น
}

// Example usage: log lots in Level 1, Block 2
// console.log(getLotsInCell(1, 2));
        /**
         * แสดงไฟฟ้าทุกช่องที่มี job ใน queue (queueSelectionView)
         */
        function controlLEDByQueue() {
            const queue = getQueue();
            if (!queue || queue.length === 0) {
                fetch('/api/led/clear', { method: 'POST' });
                return;
            }
            // เตรียม batch สำหรับทุก job ใน queue
            const leds = queue.map(job => ({
                level: Number(job.level),
                block: Number(job.block),
                r: 0, g: 0, b: 255 // ฟ้า
            }));
            fetch('/api/led/clear', { method: 'POST' })
                .then(() => fetch('/api/led/batch', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ leds })
                }));
        }
const ACTIVE_JOB_KEY = 'activeJob';
        const GLOBAL_SHELF_STATE_KEY = 'globalShelfState';
        const QUEUE_KEY = 'shelfQueue';

        const queueSelectionView = document.getElementById('queueSelectionView');
        const activeJobView = document.getElementById('activeJobView');
        const queueListContainer = document.getElementById('queueListContainer');
        const mainView = document.getElementById('mainView');
        const shelfGrid = document.getElementById('shelfGrid');
        const mainContainer = document.getElementById('mainContainer');

        localStorage.removeItem(ACTIVE_JOB_KEY);

        let SHELF_CONFIG = {};
        let TOTAL_LEVELS = 0;
        let MAX_BLOCKS = 0;

        // ฟังก์ชันสำหรับ Force Refresh Shelf Grid Structure
        function refreshShelfGrid() {
            console.log('🔄 Force refreshing shelf grid with config:', SHELF_CONFIG);
            
            // เคลียร์ localStorage เพื่อให้สร้าง state ใหม่
            localStorage.removeItem(GLOBAL_SHELF_STATE_KEY);
            
            if (shelfGrid) {
                createShelfGridStructure();
                initializeShelfState(); // สร้าง state ใหม่ตาม config ปัจจุบัน
                renderShelfGrid();
                console.log('✅ Shelf grid refreshed successfully');
            }
        }

        // ฟังก์ชันโหลดการกำหนดค่าจาก Server
        async function loadShelfConfig() {
            try {
                const response = await fetch('/api/shelf/config');
                const data = await response.json();
                SHELF_CONFIG = data.config;
                TOTAL_LEVELS = data.total_levels;
                MAX_BLOCKS = data.max_blocks;
                console.log('📐 Shelf configuration loaded from server:', SHELF_CONFIG);
                
                // สร้าง grid structure ใหม่หลังจากโหลด config
                if (shelfGrid) {
                    refreshShelfGrid(); // ใช้ refreshShelfGrid แทน
                }
            } catch (error) {
                console.warn('⚠️ Failed to load shelf config from server, using local config:', SHELF_CONFIG);
                // ใช้ config ท้องถิ่นแทน และสร้าง grid
                if (shelfGrid) {
                    refreshShelfGrid();
                }
            }
        }
        // 🔼 END OF FLEXIBLE CONFIGURATION 🔼

        // 🔽 ADD THIS FUNCTION 🔽
        function showNotification(message, type = 'info') {
            console.log(`📢 ${type.toUpperCase()}: ${message}`);
            
            // ลบ notification เก่าทั้งหมดก่อน
            const existingNotifications = document.querySelectorAll('.notification');
            existingNotifications.forEach(notification => {
                notification.remove();
            });
            
            const notification = document.createElement('div');
            notification.className = `notification ${type}`;
            notification.textContent = message;
            
            // Basic styling
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 15px 20px;
                border-radius: 8px;
                color: white;
                font-weight: bold;
                z-index: 1000;
                opacity: 0;
                transition: all 0.3s ease-in-out;
                transform: translateX(100%);
                box-shadow: 0 4px 8px rgba(0,0,0,0.1);
                max-width: 350px;
                word-wrap: break-word;
            `;
            
            // Colors based on type
            switch (type) {
                case 'success':
                    notification.style.backgroundColor = '#28a745';
                    break;
                case 'error':
                    notification.style.backgroundColor = '#dc3545';
                    break;
                case 'warning':
                    notification.style.backgroundColor = '#ffc107';
                    notification.style.color = '#212529';
                    break;
                default: // info
                    notification.style.backgroundColor = '#17a2b8';
                    break;
            }
            
            document.body.appendChild(notification);
            
            // Animate in
            setTimeout(() => {
                notification.style.opacity = '1';
                notification.style.transform = 'translateX(0)';
            }, 100);
            
            // Animate out and remove
            setTimeout(() => {
                notification.style.opacity = '0';
                notification.style.transform = 'translateX(100%)';
                setTimeout(() => {
                    if (document.body.contains(notification)) {
                        document.body.removeChild(notification);
                    }
                }, 300);
            }, 3000);
        }
        // 🔼 END OF ADDED FUNCTION 🔼

        function initializeShelfState() {
            if (!localStorage.getItem(GLOBAL_SHELF_STATE_KEY)) {
                const defaultState = [];
                // สร้างสถานะเริ่มต้นตาม SHELF_CONFIG
                for (let level = 1; level <= TOTAL_LEVELS; level++) {
                    const blocksInThisLevel = SHELF_CONFIG[level];
                    for (let block = 1; block <= blocksInThisLevel; block++) {
                        defaultState.push([level, block, 0]); // [level, block, hasItem]
                    }
                }
                localStorage.setItem(GLOBAL_SHELF_STATE_KEY, JSON.stringify(defaultState));
            }
        }

        function cleanInvalidJobs() {
            const queue = JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
            const cleanedQueue = queue.filter(job => job && job.lot_no && job.level && job.block);
            if (cleanedQueue.length !== queue.length) {
                console.warn("Removed invalid jobs from the queue.");
                localStorage.setItem(QUEUE_KEY, JSON.stringify(cleanedQueue));
            }
            return cleanedQueue;
        }

        function getQueue() {
            return cleanInvalidJobs();
        }

        function createShelfGridStructure() {
            // เคลียร์ grid เก่าทิ้งเสมอ เพื่อให้สามารถสร้างใหม่ได้ตาม config ปัจจุบัน
            shelfGrid.innerHTML = '';
            
            // สร้าง Grid container หลัก
            shelfGrid.style.display = 'flex';
            shelfGrid.style.flexDirection = 'column';
            shelfGrid.style.gap = '14px'; // ลด gap ระหว่างชั้นเพื่อให้พอดีกับความสูง 475px
            shelfGrid.style.padding = '10px'; // ลด padding จาก 12px เป็น 10px
            shelfGrid.style.background = '#f8f9fa';
            shelfGrid.style.border = '1px solid #dee2e6';
            shelfGrid.style.width = '100%';
            shelfGrid.style.height = '100%';
            
            // กำหนดขนาด cell ให้เหมาะสมกับ shelf configuration ที่มีจำนวน blocks แตกต่างกัน
            let cellHeight = 90; // เพิ่มความสูงเล็กน้อยเพื่อให้ดูสมส่วน
            
            // คำนวณขนาดให้เหมาะสมกับ shelf-frame 550px
            const shelfFrameWidth = 550; // ความกว้างของ shelf-frame
            const shelfFrameBorder = 16; // border รวม (8px × 2) 
            const shelfPadding = 20; // padding รวม (10px × 2)
            const availableWidth = shelfFrameWidth - shelfFrameBorder - shelfPadding; // 550 - 16 - 20 = 514px
            const gapSize = 4; // gap ระหว่าง cells
            
            // สร้างแต่ละ Level เป็น flexbox แยกกัน
            for (let level = 1; level <= TOTAL_LEVELS; level++) {
                const blocksInThisLevel = SHELF_CONFIG[level];
                
                // สร้าง container สำหรับแต่ละ level
                const levelContainer = document.createElement('div');
                levelContainer.className = 'shelf-level';
                levelContainer.style.display = 'flex';
                levelContainer.style.gap = `${gapSize}px`;
                levelContainer.style.height = `${cellHeight}px`;
                levelContainer.style.width = '100%';
                levelContainer.style.justifyContent = 'stretch'; // กระจายพื้นที่เต็มความกว้าง
                
                // สร้าง cells สำหรับ level นี้
                for (let block = 1; block <= blocksInThisLevel; block++) {
                    const cell = document.createElement('div');
                    cell.id = `cell-${level}-${block}`;
                    cell.className = 'shelf-cell';
                    cell.style.flex = '1'; // ให้ทุก cell มีขนาดเท่ากันและเต็มพื้นที่
                    cell.style.height = '100%';
                    cell.style.cursor = 'pointer';
                    cell.style.borderRadius = '4px';
                    cell.style.boxShadow = '0 1px 2px rgba(0,0,0,0.1)';
                    
                    // ไม่ใส่ minWidth หรือ maxWidth เพื่อให้ flex ทำงานเต็มที่
                    
                    // เพิ่ม click event สำหรับแสดง cell preview
                    cell.addEventListener('click', () => {
                        const lots = getLotsInCell(level, block);
                        const activeJob = getActiveJob();
                        const targetLotNo = activeJob ? activeJob.lot_no : null;
                        renderCellPreview({ level, block, lots, targetLotNo });
                    });
                    
                    levelContainer.appendChild(cell);
                }
                
                shelfGrid.appendChild(levelContainer);
            }
            
            console.log(`📐 Created flexible shelf grid: ${TOTAL_LEVELS} levels with configuration:`, SHELF_CONFIG);
            console.log(`📏 Shelf frame: ${shelfFrameWidth}×475px | Available width: ${availableWidth}px | Cell height: ${cellHeight}px | Gap: ${gapSize}px`);
            console.log(`📏 All cells use flex: 1 to fill entire width evenly per level`);
        }

        function getActiveJob() {
            const activeJobData = localStorage.getItem(ACTIVE_JOB_KEY);
            
            if (!activeJobData || activeJobData === 'null') {
                return null;
            }
            
            try {
                const job = JSON.parse(activeJobData);
                return job;
            } catch (error) {
                console.error('❌ Error parsing active job:', error);
                localStorage.removeItem(ACTIVE_JOB_KEY);
                return null;
            }
        }

        function setActiveJob(job) {
            localStorage.setItem(ACTIVE_JOB_KEY, JSON.stringify(job));
        }

        // 🔽 FIX goBackToQueue FUNCTION 🔽
        function goBackToQueue() {
            const activeJob = getActiveJob();
            if (activeJob) {
                console.log(`📋 Returning job to queue: ${activeJob.lot_no} (ID: ${activeJob.jobId})`);
                
                // ใส่ job กลับเข้า queue
                const queue = getQueue();
                // ตรวจสอบว่า job ไม่ได้อยู่ใน queue แล้ว
                if (!queue.some(job => job.jobId === activeJob.jobId)) {
                    queue.push(activeJob);
                    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
                    console.log(`✅ Job ${activeJob.lot_no} returned to queue. Queue size: ${queue.length}`);
                }
            }
            
            localStorage.removeItem(ACTIVE_JOB_KEY);
            renderAll();
        }
        // 🔼 END OF FIX 🔼

        // --- Global: Track which cells have been logged for lots (persist across renderShelfGrid calls) ---
        if (!window.__rfid_loggedCells) window.__rfid_loggedCells = new Set();
        function renderShelfGrid() {
            // Expect shelfState as array of {level, block, lots}
            const shelfState = JSON.parse(localStorage.getItem(GLOBAL_SHELF_STATE_KEY) || '[]');
            const activeJob = getActiveJob();

            // เตรียมตำแหน่ง error (ถ้ามี)
            let wrongLevel = null, wrongBlock = null;
            if (activeJob && activeJob.error && activeJob.errorType === 'WRONG_LOCATION' && activeJob.errorMessage) {
                const match = activeJob.errorMessage.match(/L(\d+)-B(\d+)/);
                if (match) {
                    wrongLevel = Number(match[1]);
                    wrongBlock = Number(match[2]);
                }
            }

            // Clear all cells first
            for (let level = 1; level <= TOTAL_LEVELS; level++) {
                const blocksInThisLevel = SHELF_CONFIG[level];
                for (let block = 1; block <= blocksInThisLevel; block++) {
                    const cellId = `cell-${level}-${block}`;
                    const cell = document.getElementById(cellId);
                    if (!cell) continue;
                    cell.className = 'shelf-cell';
                    cell.innerHTML = '';
                }
            }

            // Render stacked lots in each cell (bottom-to-top: index 0 = bottom)
            const loggedCells = window.__rfid_loggedCells;
            if (Array.isArray(shelfState)) {
                shelfState.forEach(cellData => {
                    let level, block, lots;
                    if (Array.isArray(cellData)) {
                        level = cellData[0];
                        block = cellData[1];
                        lots = cellData[2];
                    } else if (cellData && typeof cellData === 'object') {
                        ({ level, block, lots } = cellData);
                    } else {
                        console.warn('⚠️ Invalid cellData in shelfState:', cellData);
                        return;
                    }
                    if (!Array.isArray(lots)) lots = [];
                    // Debug: log lots in every cell (index 0 = bottom, last = top) แบบละเอียด
                    if (lots.length > 0) {
                        // คำนวณเปอร์เซ็นต์การใช้งานของ cell
                        const totalTrayInCell = lots.reduce((sum, lot) => sum + (parseInt(lot.tray_count) || 1), 0);
                        const maxCapacity = 24; // ความจุสูงสุดของ cell
                        const usagePercentage = Math.round((totalTrayInCell / maxCapacity) * 100);
                        
                        console.log(`🟫 [Grid] Lots in cell (Level: ${level}, Block: ${block}) [index 0 = bottom, last = top] - Usage: ${usagePercentage}% (${totalTrayInCell}/${maxCapacity}):`);
                        lots.forEach((lot, idx) => {
                            const lotTrayCount = parseInt(lot.tray_count) || 1;
                            const lotPercentage = Math.round((lotTrayCount / maxCapacity) * 100);
                            console.log(`   [${idx}] LotNo: ${lot.lot_no}, Tray: ${lot.tray_count}, ${lotPercentage}%`);
                        });
                        console.log(`   All lots:`, JSON.stringify(lots));
                    }
                    const cellId = `cell-${level}-${block}`;
                    const cell = document.getElementById(cellId);
                    if (!cell) return;

            // --- Visual stacked lots (FIFO bottom-to-top: index 0 = bottom, last = top) ---
            const safeLots = Array.isArray(lots) ? lots : [];
            let totalTray = safeLots.reduce((sum, lot) => sum + (parseInt(lot.tray_count) || 1), 0);
            totalTray = Math.max(totalTray, 1);
            
            // ปรับการคำนวณขนาดให้เหมาะสมกับ cell ที่เล็กลง
            const maxCellHeight = 66; // ความสูงสูงสุดของ cell (70px - padding 4px)
            
            // Render lots in REVERSE order (last to first) เพื่อให้แสดงผลถูกต้อง
            // เนื่องจาก flex-end จะแสดงจากล่างขึ้นบน การใส่จากท้ายไปหน้าจะทำให้ลำดับถูกต้อง
            for (let idx = safeLots.length - 1; idx >= 0; idx--) {
                const lot = safeLots[idx];
                const lotDiv = document.createElement('div');
                let isTarget = false;
                if (activeJob && String(activeJob.level) === String(level) && String(activeJob.block) === String(block)) {
                    isTarget = (String(lot.lot_no) === String(activeJob.lot_no));
                }
                lotDiv.className = 'stacked-lot' + (isTarget ? ' target-lot' : '');
                
                // คำนวณความสูงตาม tray_count แบบสัดส่วนที่ชัดเจน
                const trayCount = parseInt(lot.tray_count) || 1;
                const maxCapacity = 24;
                const maxCellHeight = 85; // ใช้ความสูงสูงสุดที่เหมาะสมกับ cell height 90px
                const heightRatio = trayCount / maxCapacity;
                const trayHeight = Math.max(heightRatio * maxCellHeight, 2); // ขั้นต่ำ 2px เพื่อให้เห็น
                lotDiv.style.height = Math.round(trayHeight) + 'px';
                
                // เก็บข้อมูลใน title สำหรับ tooltip เท่านั้น
                lotDiv.title = `Lot: ${lot.lot_no}, Tray: ${trayCount}, Height: ${Math.round(trayHeight)}px`;
                
                // ไม่ใส่ข้อความ (แสดงเป็นกล่องสีเทาเท่านั้น)
                
                cell.appendChild(lotDiv);
            }

                    // --- State classes for selection/error ---
                    let isSelected = false;
                    if (activeJob) {
                        const isTargetCell = (String(activeJob.level) === String(level) && String(activeJob.block) === String(block));
                        if (isTargetCell) {
                            cell.classList.add('selected-task');
                            isSelected = true;
                        }
                        if (wrongLevel === Number(level) && wrongBlock === Number(block)) {
                            cell.classList.add('wrong-location');
                            cell.classList.remove('selected-task');
                            isSelected = false;
                        }
                    }
                    if (!isSelected && !(wrongLevel === Number(level) && wrongBlock === Number(block)) && Array.isArray(lots) && lots.length > 0) {
                        cell.classList.add('has-item');
                    }
                });
            } else {
                console.error('❌ shelfState is not an array:', shelfState);
            }
        }

        function renderActiveJob() {
    const activeJob = getActiveJob();
    const queue = getQueue();
    const cellPreviewContainer = document.getElementById('cellPreviewContainer');
    const mainContainer = document.querySelector('.main-container');

    if (activeJob) {
        // ถ้ามี active job, แสดง cell preview
        cellPreviewContainer.style.display = 'flex';
        mainContainer.classList.remove('full-shelf-mode');
    } else {
        // ถ้าไม่มี active job, ซ่อน cell preview และแสดง shelf ตรงกลาง
        cellPreviewContainer.style.display = 'none';
        mainContainer.classList.add('full-shelf-mode');
    }

    // Log clearly which lot is currently selected as active job, and lots in that cell
    if (activeJob) {
        const lotsInCell = getLotsInCell(activeJob.level, activeJob.block);
        console.log(`ActiveJobLot: ${activeJob.lot_no} (Level: ${activeJob.level}, Block: ${activeJob.block})`);
        console.log(`Lots in cell (${activeJob.level}, ${activeJob.block}):`, lotsInCell);

        // แสดง Cell Preview สำหรับ active job
        const isPlaceJob = activeJob.place_flg === '1';
        const actualTrayCount = parseInt(activeJob.tray_count) || 1; // ใช้ค่าจริงจาก activeJob
        renderCellPreview({
            level: activeJob.level,
            block: activeJob.block,
            lots: lotsInCell,
            targetLotNo: activeJob.lot_no,
            isPlaceJob: isPlaceJob,
            newLotTrayCount: isPlaceJob ? actualTrayCount : 0 // ใช้ค่าจริงแทนค่าคงที่ 12
        });
    } else {
        // ถ้าไม่มี active job ให้แสดงข้อความเริ่มต้น (ตอนนี้ถูกซ่อนอยู่ แต่เผื่อกลับมาใช้)
        const cellPreviewContent = document.getElementById('cellPreviewContent');
        if (cellPreviewContent) {
            cellPreviewContent.innerHTML = '<p>No active job. Select a job from the queue.</p>';
        }
    }

    renderShelfGrid();
}

        function renderQueueSelectionView(queue) {
    queueListContainer.innerHTML = '';
    queue.forEach(job => {
        const li = document.createElement('li');
        li.className = 'queue-list-item';
        // เลือก icon ตาม action
        let arrowHtml = '';
        if (job.place_flg === '0') {
            arrowHtml = `<span class="arrow up"></span>`;
        } else {
            arrowHtml = `<span class="arrow down"></span>`;
        }
        li.innerHTML = `
            <div class="info">
                <div class="lot">${arrowHtml}Lot: ${job.lot_no}</div>
                <div class="action">Action: ${job.place_flg === '1' ? 'Place' : 'Pick'} at L:${job.level}, B:${job.block}</div>
            </div>
            <button class="select-btn" onclick="selectJob('${job.jobId}')">Select</button>
        `;
        queueListContainer.appendChild(li);
    });

    // Logic focus เดิม
    const lotInput = document.getElementById('lot-no-input');
    if (lotInput) {
        lotInput.focus();
        lotInput.onkeyup = function(event) {
            if (event.key === 'Enter') {
                handleLotSearch();
            }
        };
    }
}

        // --- START: ลบฟังก์ชันที่ไม่จำเป็นออก ---
        /*
        function ensureLotInputFocus() { ... }
        function setupLotInputBehavior(lotInput) { ... }
        function handleLotKeyUp(event) { ... }
        */
        // --- END: ลบฟังก์ชันที่ไม่จำเป็นออก ---

        function selectJob(jobId) {
            const queue = getQueue();
            const selectedJob = queue.find(job => job.jobId === jobId);
            
            if (selectedJob) {
                console.log(`📋 Selecting job: ${selectedJob.lot_no} (ID: ${jobId})`);
                
                // เพิ่ม UUID และ timestamp สำหรับการติดตาม
                const jobWithMeta = {
                    ...selectedJob,
                    selectedAt: new Date().toISOString(),
                    uuid: crypto.randomUUID ? crypto.randomUUID() : 'uuid-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9)
                };
                
                console.log(`🔍 Job metadata added - UUID: ${jobWithMeta.uuid}, Selected at: ${jobWithMeta.selectedAt}`);
                
                // ลบ job ที่เลือกออกจาก queue
                const updatedQueue = queue.filter(job => job.jobId !== jobId);
                localStorage.setItem(QUEUE_KEY, JSON.stringify(updatedQueue));
                
                // ตั้งเป็น active job พร้อม metadata
                setActiveJob(jobWithMeta);
                renderAll();
                
                console.log(`✅ Job ${selectedJob.lot_no} activated. Remaining queue size: ${updatedQueue.length}`);
                console.log(`📌 Active job stored with UUID: ${jobWithMeta.uuid}`);
            } else {
                console.error('❌ Job not found:', jobId);
            }
        }

        // --- START: คืนค่าฟังก์ชันให้เป็นแบบง่าย ---
        /**
         * ค้นหา Job จาก Lot No. แล้วทำการเลือกโดยอัตโนมัติ
         * @param {string} lotNo - The Lot No. to search for.
         */
        function findAndSelectJobByLot(lotNo) {
            if (!lotNo) return;

            const queue = getQueue();
            const foundJob = queue.find(job => job.lot_no === lotNo);

            if (foundJob) {
                showNotification(`✅ Lot No. ${lotNo} found. Selecting job...`, 'success');
                selectJob(foundJob.jobId);
            } else {
                showNotification(`❌ Lot No. ${lotNo} not found in queue.`, 'error');
                const lotInput = document.getElementById('lot-no-input');
                if (lotInput) {
                    lotInput.classList.add('shake');
                    setTimeout(() => lotInput.classList.remove('shake'), 500);
                }
            }
        }

        /**
         * ดึงค่าจากช่อง input แล้วส่งไปให้ฟังก์ชันค้นหา
         */
        function handleLotSearch() {
            const lotInput = document.getElementById('lot-no-input');
            if (lotInput) {
                const lotNoToSearch = lotInput.value.trim();
                
                if (lotNoToSearch.length > 0) {
                    event?.stopPropagation();
                    event?.preventDefault();
                    
                    findAndSelectJobByLot(lotNoToSearch);
                    lotInput.value = '';
                }
            }
        }
        // --- END: คืนค่าฟังก์ชันให้เป็นแบบง่าย ---

        // 🔽 ADD BARCODE SCANNING FUNCTIONALITY 🔽
        /**
         * ตั้งค่าการทำงานของช่องสแกนบาร์โค้ดในหน้า Active Job
         */
        function setupBarcodeScanner() {
            const barcodeInput = document.getElementById('barcode-scanner-input');
            if (!barcodeInput) return;

            // ให้ focus ที่ช่องสแกนบาร์โค้ดเมื่อแสดงหน้า Active Job
            barcodeInput.focus();

            // จัดการเมื่อมีการสแกนบาร์โค้ด (Enter key)
            barcodeInput.onkeyup = function(event) {
                if (event.key === 'Enter') {
                    handleBarcodeScanned();
                }
            };

            // ให้ focus กลับมาที่ช่องสแกนเสมอ
            barcodeInput.onblur = function() {
                setTimeout(() => {
                    if (document.getElementById('mainView').style.display !== 'none') {
                        barcodeInput.focus();
                    }
                }, 100);
            };
        }

        /**
         * จัดการเมื่อมีการสแกนบาร์โค้ด
         */
        function handleBarcodeScanned() {
            const barcodeInput = document.getElementById('barcode-scanner-input');
            if (!barcodeInput) return;

            const scannedData = barcodeInput.value.trim();
            barcodeInput.value = '';

            if (!scannedData) return;

            console.log(`📱 Barcode scanned: ${scannedData}`);
            
            const activeJob = getActiveJob();
            if (!activeJob) {
                showNotification('❌ No active job to process barcode.', 'error');
                return;
            }

            const locationMatch = parseLocationFromBarcode(scannedData);
            
            if (!locationMatch) {
                showNotification(`❌ Invalid barcode format: ${scannedData}`, 'error');
                return;
            }

            const { level, block } = locationMatch;
            const correctLevel = Number(activeJob.level);
            const correctBlock = Number(activeJob.block);

            // ก่อนอัปเดต UI ให้ลบ class error เดิมออกจากทุก cell
            const allCells = document.querySelectorAll('.shelf-cell');
            allCells.forEach(cell => {
                cell.classList.remove('wrong-location');
                // ไม่ลบ selected-task ที่ cell เป้าหมาย
                const cellId = cell.id;
                if (cellId !== `cell-${correctLevel}-${correctBlock}`) {
                    cell.classList.remove('selected-task');
                }
            });

            if (Number(level) === correctLevel && Number(block) === correctBlock) {
                if (activeJob.error) {
                    const cleanJob = { ...activeJob };
                    delete cleanJob.error;
                    delete cleanJob.errorType;
                    delete cleanJob.errorMessage;
                    setActiveJob(cleanJob);
                    renderAll();
                }
                showNotification(`✅ Correct location! Completing job for Lot ${activeJob.lot_no}...`, 'success');
                completeCurrentJob();
            } else {
                // แสดง error UI ให้เหมือน LED: ช่องถูกต้อง (selected-task, ฟ้า), ช่องที่ผิด (wrong-location, แดง)
                //showNotification(`❌ Wrong location! Expected: L${correctLevel}-B${correctBlock}, Got: L${level}-B${block}`, 'error');

                // อัปเดต UI: ช่องถูกต้อง (selected-task)
                const correctCell = document.getElementById(`cell-${correctLevel}-${correctBlock}`);
                if (correctCell) {
                    correctCell.classList.add('selected-task');
                }
                // ช่องผิด (wrong-location)
                const wrongCell = document.getElementById(`cell-${level}-${block}`);
                if (wrongCell) {
                    wrongCell.classList.add('wrong-location');
                    wrongCell.classList.remove('selected-task');
                }
                // อัปเดต state error ใน activeJob
                reportJobError('WRONG_LOCATION', `Scanned wrong location: L${level}-B${block}, Expected: L${correctLevel}-B${correctBlock}`);
            }
        }

        /**
         * แยกข้อมูลตำแหน่งจากบาร์โค้ด
         * รูปแบบที่รองรับ: L1-B2, 1-2, L1B2, 1,2 เป็นต้น
         */
        function parseLocationFromBarcode(barcode) {
            // ลบช่องว่างและแปลงเป็นตัวพิมพ์ใหญ่
            const cleaned = barcode.replace(/\s+/g, '').toUpperCase();
            
            // รูปแบบต่างๆ ที่รองรับ
            const patterns = [
                /^L(\d+)-?B(\d+)$/,  // L1-B2 หรือ L1B2
                /^(\d+)-(\d+)$/,     // 1-2
                /^(\d+),(\d+)$/,     // 1,2
                /^(\d+)_(\d+)$/,     // 1_2
                /^L(\d+)B(\d+)$/     // L1B2
            ];

            for (const pattern of patterns) {
                const match = cleaned.match(pattern);
                if (match) {
                    const level = parseInt(match[1]);
                    const block = parseInt(match[2]);
                    
                    // ตรวจสอบว่า Level และ Block ที่สแกนมาอยู่ในช่วงที่ถูกต้องหรือไม่
                    if (level >= 1 && level <= TOTAL_LEVELS && 
                        block >= 1 && block <= SHELF_CONFIG[level]) {
                        return { level, block };
                    }
                }
            }

            return null;
        }

        /**
         * ส่งคำสั่ง Complete Job ไปยัง Server
         */
        function completeCurrentJob() {
            let activeJob = getActiveJob();
            if (!activeJob) {
                showNotification('❌ No active job to complete.', 'error');
                return;
            }

            // ตรวจสอบและเคลียร์ error state ถ้ามี
            if (activeJob.error) {
                activeJob = { ...activeJob };
                delete activeJob.error;
                delete activeJob.errorType;  
                delete activeJob.errorMessage;
                setActiveJob(activeJob);
            }

            console.log('🚀 Completing job:', activeJob.jobId, 'Lot:', activeJob.lot_no);
            console.log(`📝 Job metadata:`, {
                uuid: activeJob.uuid || 'N/A',
                selectedAt: activeJob.selectedAt || 'N/A',
                level: activeJob.level,
                block: activeJob.block
            });

            // Clear loggedCells so next render logs new state
            if (window.__rfid_loggedCells) window.__rfid_loggedCells.clear();

            // ส่งข้อมูลผ่าน WebSocket
            if (websocketConnection && websocketConnection.readyState === WebSocket.OPEN) {
                const message = {
                    type: 'complete_job',
                    payload: {
                        jobId: activeJob.jobId,
                        lot_no: activeJob.lot_no,
                        level: activeJob.level,
                        block: activeJob.block,
                        uuid: activeJob.uuid || null,
                        completedAt: new Date().toISOString()
                    }
                };
                websocketConnection.send(JSON.stringify(message));
                console.log('📤 Complete job message sent via WebSocket:', message.payload);
            } else {
                console.warn('⚠️ WebSocket not available, using HTTP fallback');
                
                fetch('/command/complete', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        job_id: activeJob.jobId,
                        lot_no: activeJob.lot_no
                    })
                })
                .then(response => {
                    return response.json();
                })
                .then(data => {
                    console.log('✅ Job completed via HTTP API:', data);
                    showNotification(`✅ Job completed successfully!`, 'success');
                    localStorage.removeItem(ACTIVE_JOB_KEY);
                    renderAll();

                    // ดับไฟ LED หลังงานเสร็จ
                    fetch('/api/led/clear', { method: 'POST' });
                })
                .catch(error => {
                    console.error('❌ Error completing job:', error);
                    showNotification('❌ Error completing job. Please try again.', 'error');
                });
            }
        }

        /**
         * รายงานข้อผิดพลาดของงาน
         */
        function reportJobError(errorType, errorMessage) {
            const activeJob = getActiveJob();
            if (!activeJob) return;

            console.log(`🚨 Reporting job error: ${errorType}`);
            
            const errorJob = { ...activeJob, error: true, errorType, errorMessage };
            setActiveJob(errorJob);
            renderAll();

            if (websocketConnection && websocketConnection.readyState === WebSocket.OPEN) {
                const message = {
                    type: 'job_error',
                    payload: {
                        jobId: activeJob.jobId,
                        errorType,
                        errorMessage,
                        lot_no: activeJob.lot_no
                    }
                };
                websocketConnection.send(JSON.stringify(message));
            }
        }
        // 🔼 END OF BARCODE SCANNING FUNCTIONALITY 🔼

        function renderAll() {
            const queue = getQueue();
            const activeJob = getActiveJob();

            if (queue.length > 0 && !activeJob) {
                mainView.style.display = 'none';
                queueSelectionView.style.display = 'block';
                renderQueueSelectionView(queue);
                controlLEDByQueue();
            } else if (activeJob) {
                // เรียกควบคุมไฟที่นี่ (ไม่ต้องส่ง wrongLocation)
                controlLEDByActiveJob();
                queueSelectionView.style.display = 'none';
                mainView.style.display = 'flex';
                renderActiveJob();
                renderShelfGrid();
                setupBarcodeScanner();
            } else {
                queueSelectionView.style.display = 'none';
                mainView.style.display = 'flex';
                renderActiveJob();
                renderShelfGrid();
            }
        }

        // --- Initial Load ---
        document.addEventListener('DOMContentLoaded', async () => {
            await loadShelfConfig();
            initializeShelfState();
            setupWebSocket();
            renderAll();
        });
        
        // ลบ Event Listener ของ 'storage' เก่าออก เพราะเราจะใช้ WebSocket แทน
        window.removeEventListener('storage', renderAll);
        
        // *** START: WebSocket Integration ***
        let websocketConnection = null; // เก็บ WebSocket connection

        function setupWebSocket() {
            const ws = new WebSocket(`ws://${window.location.host}/ws`);
            
            websocketConnection = ws;

            ws.onopen = function(event) {
                console.log("✅ WebSocket connected");
            };

            ws.onmessage = function(event) {
                try {
                    const data = JSON.parse(event.data);

                    switch (data.type) {
                        case "initial_state":
                            localStorage.setItem(QUEUE_KEY, JSON.stringify(data.payload.jobs));
                            localStorage.setItem(GLOBAL_SHELF_STATE_KEY, JSON.stringify(data.payload.shelf_state));
                            renderAll();
                            break;
                        case "new_job":
                            const queue = getQueue();
                            if (!queue.some(job => job.jobId === data.payload.jobId)) {
                                queue.push(data.payload);
                                localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
                                renderAll();
                                showNotification(`New job added: ${data.payload.lot_no}`);
                            }
                            break;
                        case "job_completed":
                            console.log('📦 Received job_completed message:', data.payload);
                            
                            // ตรวจสอบว่า job ที่เสร็จสิ้นตรงกับ active job ปัจจุบันหรือไม่
                            const currentActiveJob = getActiveJob();
                            if (currentActiveJob && currentActiveJob.jobId !== data.payload.completedJobId) {
                                console.warn(`⚠️ Job ID mismatch! Current active: ${currentActiveJob.jobId}, Completed: ${data.payload.completedJobId}`);
                                console.warn(`⚠️ Current active lot: ${currentActiveJob.lot_no}, Completed lot: ${data.payload.lot_no}`);
                                console.warn(`🔍 UUID check - Active UUID: ${currentActiveJob.uuid || 'N/A'}, Completed UUID: ${data.payload.uuid || 'N/A'}`);
                                
                                // ตรวจสอบ UUID ถ้ามี
                                if (currentActiveJob.uuid && data.payload.uuid && currentActiveJob.uuid !== data.payload.uuid) {
                                    console.error(`❌ UUID mismatch detected! This is a different job completion.`);
                                }
                                
                                // ถ้าไม่ตรงกัน อาจเป็นการ complete job อื่นที่ไม่ใช่ active job
                                // แค่อัปเดต queue และ shelf state โดยไม่ลบ active job
                                let currentQueue = getQueue();
                                currentQueue = currentQueue.filter(j => j.jobId !== data.payload.completedJobId);
                                localStorage.setItem(QUEUE_KEY, JSON.stringify(currentQueue));
                                localStorage.setItem(GLOBAL_SHELF_STATE_KEY, JSON.stringify(data.payload.shelf_state));
                                renderAll();
                                showNotification(`⚠️ Job ${data.payload.lot_no} completed by another process!`, 'warning');
                                return; // ไม่ลบ active job
                            }
                            
                            let currentQueue = getQueue();
                            console.log(`📋 Queue before removal (size: ${currentQueue.length}):`, currentQueue.map(j => `${j.lot_no}(${j.jobId})`));
                            
                            currentQueue = currentQueue.filter(j => j.jobId !== data.payload.completedJobId);
                            console.log(`📋 Queue after removal (size: ${currentQueue.length}):`, currentQueue.map(j => `${j.lot_no}(${j.jobId})`));
                            
                            localStorage.setItem(QUEUE_KEY, JSON.stringify(currentQueue));
                            
                            // ตรวจสอบ shelf state ก่อนและหลังการอัปเดต
                            const oldShelfState = JSON.parse(localStorage.getItem(GLOBAL_SHELF_STATE_KEY) || '[]');
                            console.log('📦 Shelf state before update:', oldShelfState);
                            console.log('📦 New shelf state from server:', data.payload.shelf_state);
                            
                            localStorage.setItem(GLOBAL_SHELF_STATE_KEY, JSON.stringify(data.payload.shelf_state));
                            localStorage.removeItem(ACTIVE_JOB_KEY);
                            renderAll();
                            showNotification(`✅ Job completed for Lot ${data.payload.lot_no || 'Unknown'}!`, 'success');

                            fetch('/api/led/clear', { method: 'POST' });
                            break;
                        case "job_warning":
                            console.log('⚠️ Received job warning:', data.payload);
                            showNotification(`⚠️ ${data.payload.message}`, 'warning');
                            
                            // ถ้า warning เป็น JOB_ALREADY_COMPLETED ให้ลบ active job และ render ใหม่
                            if (data.payload.warning === 'JOB_ALREADY_COMPLETED') {
                                localStorage.removeItem(ACTIVE_JOB_KEY);
                                renderAll();
                            }
                            break;
                        case "job_error":
                            localStorage.setItem(ACTIVE_JOB_KEY, JSON.stringify(data.payload)); // ใช้ Key ที่ถูกต้อง
                            renderAll();
                            showNotification(`❌ Lot ${data.payload.lot_no} Must place at L${data.payload.level}-B${data.payload.block}`, 'error');
                            break;
                        case "system_reset":
                            localStorage.clear();
                            initializeShelfState();
                            renderAll();
                            showNotification('System has been reset.', 'warning');
                            break;
                    }
                } catch (e) {
                    console.error("Error parsing message from server:", e);
                }
            };

            ws.onclose = function(event) {
                console.log("❌ WebSocket disconnected. Reconnecting in 3 seconds...");
                setTimeout(setupWebSocket, 3000);
            };

            ws.onerror = function(error) {
                console.error("💥 WebSocket error:", error);
            };
        }

        // ฟังก์ชันสำหรับอัปเดตขนาด cell ตาม viewport และ full-shelf mode
        function updateCellSizes() {
            const mainContainer = document.querySelector('.main-container');
            const isFullShelfMode = mainContainer && mainContainer.classList.contains('full-shelf-mode');
            let cellHeight = 60; // default height
            
            if (window.innerWidth <= 1300) {
                cellHeight = isFullShelfMode ? 100 : 50;
            } else {
                cellHeight = isFullShelfMode ? 130 : 60;
            }
            
            // อัปเดต level containers
            const levelContainers = document.querySelectorAll('.shelf-level');
            levelContainers.forEach(container => {
                container.style.height = `${cellHeight}px`;
            });
            
            // อัปเดตขนาดของ cell ทั้งหมด แต่เก็บ state classes ไว้
            const allCells = document.querySelectorAll('.shelf-cell');
            allCells.forEach(cell => {
                // เก็บ state classes ที่สำคัญไว้
                const hasItem = cell.classList.contains('has-item');
                const isSelectedTask = cell.classList.contains('selected-task');
                const isWrongLocation = cell.classList.contains('wrong-location');
                const hasHighlightError = cell.classList.contains('highlight-error');
                
                // cells ใช้ flex: 1 แล้ว ไม่ต้องกำหนดขนาดเฉพาะ
                
                // เพิ่ม state classes กลับคืน
                if (hasItem) cell.classList.add('has-item');
                if (isSelectedTask) cell.classList.add('selected-task');
                if (isWrongLocation) cell.classList.add('wrong-location');
                if (hasHighlightError) cell.classList.add('highlight-error');
            });
        }

        // เพิ่ม event listeners สำหรับ window resize และ full-shelf mode toggle
        window.addEventListener('resize', updateCellSizes);
        
        // ฟังการเปลี่ยนแปลง full-shelf mode
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    updateCellSizes();
                }
            });
        });
        
        // เฝ้าดู main-container สำหรับการเปลี่ยนแปลง class
        const mainContainerElement = document.querySelector('.main-container');
        if (mainContainerElement) {
            observer.observe(mainContainerElement, { attributes: true, attributeFilter: ['class'] });
        }

        /**
         * ฟังก์ชันควบคุม LED ตามสถานะ active job (logic อยู่ฝั่ง frontend)
         * สามารถปรับ mapping สี/สถานะได้ที่นี่
         */
        function controlLEDByActiveJob(wrongLocation = null) {
            const activeJob = getActiveJob();
            if (!activeJob) return;

            const level = Number(activeJob.level);
            const block = Number(activeJob.block);
            // ช่องเป้าหมาย: ฟ้า (place) หรือ ฟ้า (pick)
            let color = { r: 0, g: 0, b: 255 }; // default: ฟ้า (place)
            if (activeJob.place_flg === '0') {
                color = { r: 0, g: 0, b: 22 }; // ฟ้า (pick)
            }

            // ดับไฟทั้งหมดก่อน (เพื่อป้องกัน ghost LED)
            fetch('/api/led/clear', { method: 'POST' });

            // ถ้าอยู่ใน error และ errorType เป็น WRONG_LOCATION ให้โชว์ไฟแดงที่ตำแหน่งผิด
            if (activeJob.error && activeJob.errorType === 'WRONG_LOCATION' && activeJob.errorMessage) {
                // parse wrong location from errorMessage
                const match = activeJob.errorMessage.match(/L(\d+)-B(\d+)/);
                if (match) {
                    const wrongLevel = Number(match[1]);
                    const wrongBlock = Number(match[2]);
                    // ช่องเป้าหมาย (ฟ้า/เหลือง)
                    fetch('/api/led', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ level, block, ...color })
                    });
                    // ช่องผิด (แดง)
                    fetch('/api/led', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ level: wrongLevel, block: wrongBlock, r: 255, g: 0, b: 0 })
                    });
                    return;
                }
            }
            // ถ้าไม่ error หรือ error อื่น ให้โชว์เฉพาะช่องเป้าหมาย
            fetch('/api/led', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ level, block, ...color })
            });
        }
