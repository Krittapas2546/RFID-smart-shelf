
        const ACTIVE_JOB_KEY = 'activeJob';
        const GLOBAL_SHELF_STATE_KEY = 'globalShelfState';
        const QUEUE_KEY = 'shelfQueue';

        const queueSelectionView = document.getElementById('queueSelectionView');
        const activeJobView = document.getElementById('activeJobView');
        const queueListContainer = document.getElementById('queueListContainer');
        const jobDetailsContainer = document.getElementById('jobDetailsContainer');
        const detailsPanel = document.getElementById('detailsPanel');
        const mainView = document.getElementById('mainView');
        const shelfGrid = document.getElementById('shelfGrid');
        const shelfContainer = document.getElementById('shelfContainer');

        localStorage.removeItem(ACTIVE_JOB_KEY);

        let SHELF_CONFIG = {
            1: 8,  // Level 1: 6 blocks
            2: 8,  // Level 2: 4 blocks  
            3: 8,  // Level 3: 5 blocks
            4: 8   
        };
        let TOTAL_LEVELS = 4;
        let MAX_BLOCKS = 8;
        
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
            shelfGrid.style.gap = '8px';
            shelfGrid.style.padding = '12px';
            shelfGrid.style.background = '#f8f9fa';
            shelfGrid.style.border = '1px solid #dee2e6';
            shelfGrid.style.width = '100%';
            shelfGrid.style.height = '100%';
            
            // กำหนดขนาด cell ตาม viewport และ full-shelf mode
            const isFullShelfMode = document.querySelector('.shelf-container').classList.contains('full-shelf-mode');
            let cellHeight = 60; // default height
            
            if (window.innerWidth <= 1300) {
                cellHeight = isFullShelfMode ? 100 : 50;
            } else {
                cellHeight = isFullShelfMode ? 130 : 60;
            }
            
            // สร้างแต่ละ Level เป็น flexbox แยกกัน
            for (let level = 1; level <= TOTAL_LEVELS; level++) {
                const blocksInThisLevel = SHELF_CONFIG[level];
                
                // สร้าง container สำหรับแต่ละ level
                const levelContainer = document.createElement('div');
                levelContainer.className = 'shelf-level';
                levelContainer.style.display = 'flex';
                levelContainer.style.gap = '7px';
                levelContainer.style.height = `${cellHeight}px`;
                levelContainer.style.width = '100%';
                
                // สร้าง cells สำหรับ level นี้
                for (let block = 1; block <= blocksInThisLevel; block++) {
                    const cell = document.createElement('div');
                    cell.id = `cell-${level}-${block}`;
                    cell.className = 'shelf-cell';
                    cell.style.flex = '1'; // ให้แต่ละ cell ขยายเต็มพื้นที่
                    cell.style.height = '100%';
                    cell.style.minWidth = '40px'; // ขนาดขั้นต่ำ
                    
                    levelContainer.appendChild(cell);
                }
                
                shelfGrid.appendChild(levelContainer);
            }
            
            console.log(`📐 Created flexible shelf grid: ${TOTAL_LEVELS} levels with configuration:`, SHELF_CONFIG);
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
            localStorage.removeItem(ACTIVE_JOB_KEY); // ใช้ Key ที่ถูกต้อง
            renderAll();
        }
        // 🔼 END OF FIX 🔼

        function renderShelfGrid() {
            const shelfState = JSON.parse(localStorage.getItem(GLOBAL_SHELF_STATE_KEY) || '[]');
            const activeJob = getActiveJob();

            shelfState.forEach(([level, block, hasItem]) => {
                const cellId = `cell-${level}-${block}`;
                const cell = document.getElementById(cellId);
                
                if (!cell) return;

                // Reset class ทุกครั้ง
                cell.className = 'shelf-cell';

                // --- START: แก้ไข Logic การแสดงผล ---
                if (activeJob) {
                    // เมื่อมี Active Job ให้แสดงเฉพาะช่องเป้าหมาย
                    const isTaskLocation = Number(activeJob.level) === Number(level) && 
                                           Number(activeJob.block) === Number(block);
                    const isError = activeJob.error;

                    if (isTaskLocation) {
                        if (isError) {
                            cell.classList.add('wrong-location');
                        } else {
                            cell.classList.add('selected-task');
                        }
                    }
                    // 🔽 ลบส่วนนี้ออก - ไม่แสดงช่องสีเทาเมื่อมี Active Job 🔽
                    // else if (hasItem) {
                    //     cell.classList.add('has-item');
                    //     console.log(`⚫ Has item: [${level},${block}]`);
                    // }
                    // 🔼 END OF REMOVAL 🔼
                } else {
                    // เมื่อไม่มี Active Job ให้แสดงช่องที่มีของ
                    if (hasItem) {
                        cell.classList.add('has-item');
                    }
                }
                // --- END: แก้ไข Logic การแสดงผล ---
            });
        }

        function renderActiveJob() {
            const activeJob = getActiveJob();
            const queue = getQueue();
            
            if (!detailsPanel) {
                console.error('❌ detailsPanel element not found');
                return;
            }

            detailsPanel.innerHTML = '';

            if (activeJob) {
                const statusText = activeJob.error ? 'Error' : 'Waiting';
                const statusClass = activeJob.error ? 'Error' : 'Waiting';
                const actionText = activeJob.place_flg === '1' ? 'Place To' : 'Pick From';
                
                detailsPanel.innerHTML = `
                    <div>
                        <div class="label">Status</div>
                        <div class="status-badge ${statusClass}">${statusText}</div>
                    </div>
                    <div>
                        <div class="label">Lot No.</div>
                        <div class="value lot-no">${activeJob.lot_no}</div>
                    </div>
                    <div>
                        <div class="label">${actionText}</div>
                        <div class="value">Level: ${activeJob.level}, Block: ${activeJob.block}</div>
                    </div>
                    
                    <!-- 🔽 ใส่ Comment ปิดปุ่มเหล่านี้ 🔽 -->
                    <!--
                    <div class="action-buttons" style="margin-top: 20px;">
                        <button class="complete-btn" onclick="completeCurrentJob()">✅ Complete</button>
                        <button class="error-btn" onclick="reportJobError('MANUAL_ERROR', 'Manual error reported')">❌ Report Error</button>
                    </div>
                    -->
                `;
                
                if (queue.length > 0) {
                    detailsPanel.innerHTML += `<button class="back-to-queue-btn" onclick="goBackToQueue()">← Back to Queue</button>`;
                }
            } else {
                detailsPanel.innerHTML = `
                    <div>
                        <div class="label">Status</div>
                        <div class="status-badge">Idle</div>
                    </div>
                    <div class="value" style="font-size: 1.5rem; color: #6c757d;">No active job.</div>
                `;
            }
            renderShelfGrid();
        }

        function renderQueueSelectionView(queue) {
            queueListContainer.innerHTML = '';
            queue.forEach(job => {
                const li = document.createElement('li');
                li.className = 'queue-list-item';
                li.innerHTML = `
                    <div class="info">
                        <div class="lot">Lot: ${job.lot_no}</div>
                        <div class="action">Action: ${job.place_flg === '1' ? 'Place' : 'Pick'} at L:${job.level}, B:${job.block}</div>
                    </div>
                    <button class="select-btn" onclick="selectJob('${job.jobId}')">Select</button>
                `;
                queueListContainer.appendChild(li);
            });

            // --- START: ลบ Logic Focus ที่ไม่จำเป็นออก ---
            const lotInput = document.getElementById('lot-no-input');
            if (lotInput) {
                lotInput.focus();
                lotInput.onkeyup = function(event) {
                    if (event.key === 'Enter') {
                        handleLotSearch();
                    }
                };
            }
            // --- END: แก้ไข Logic Focus ---
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
                setActiveJob(selectedJob);
                renderAll();
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
            
            if (Number(level) === Number(activeJob.level) && Number(block) === Number(activeJob.block)) {
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
                showNotification(`❌ Wrong location! Expected: L${activeJob.level}-B${activeJob.block}, Got: L${level}-B${block}`, 'error');
                reportJobError('WRONG_LOCATION', `Scanned wrong location: L${level}-B${block}, Expected: L${activeJob.level}-B${activeJob.block}`);
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

            console.log('🚀 Completing job:', activeJob.jobId);
            
            // ส่งข้อมูลผ่าน WebSocket
            if (websocketConnection && websocketConnection.readyState === WebSocket.OPEN) {
                const message = {
                    type: 'complete_job',
                    payload: {
                        jobId: activeJob.jobId,
                        lot_no: activeJob.lot_no,
                        level: activeJob.level,
                        block: activeJob.block
                    }
                };
                websocketConnection.send(JSON.stringify(message));
                console.log('📤 Complete job message sent via WebSocket');
            } else {
                console.warn('⚠️ WebSocket not available, using HTTP fallback');
                
                fetch('/api/jobs/complete', {
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

        function goBackToQueue() {
            localStorage.removeItem(ACTIVE_JOB_KEY); // ใช้ Key ที่ถูกต้อง
            renderAll();
        }

        function renderAll() {
            const queue = getQueue();
            const activeJob = getActiveJob();

            if (queue.length > 0 && !activeJob) {
                mainView.style.display = 'none';
                queueSelectionView.style.display = 'block';
                renderQueueSelectionView(queue);
                
            } else if (activeJob) {
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
            // ปิดการโหลด config จาก server ชั่วคราว เพื่อใช้ค่าท้องถิ่น
            // await loadShelfConfig(); // Comment ออกเพื่อใช้ SHELF_CONFIG ท้องถิ่น
            
            // ใช้ค่า config ท้องถิ่นแทน
            console.log('📐 Using local shelf configuration:', SHELF_CONFIG);
            refreshShelfGrid(); // สร้าง grid ตาม config ท้องถิ่น
            
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
                            let currentQueue = getQueue();
                            currentQueue = currentQueue.filter(j => j.jobId !== data.payload.completedJobId);
                            localStorage.setItem(QUEUE_KEY, JSON.stringify(currentQueue));
                            localStorage.setItem(GLOBAL_SHELF_STATE_KEY, JSON.stringify(data.payload.shelf_state));
                            localStorage.removeItem(ACTIVE_JOB_KEY);
                            renderAll();
                            showNotification(`Job completed for Lot ${data.payload.lot_no || 'Unknown'}!`, 'success');
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
            const isFullShelfMode = document.querySelector('.shelf-container').classList.contains('full-shelf-mode');
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
        
        // เฝ้าดู shelf-container สำหรับการเปลี่ยนแปลง class
        const shelfContainerElement = document.querySelector('.shelf-container');
        if (shelfContainerElement) {
            observer.observe(shelfContainerElement, { attributes: true, attributeFilter: ['class'] });
        }
