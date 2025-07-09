// 🔽 FIX CONSTANTS 🔽
        const ACTIVE_JOB_KEY = 'activeJob';
        const GLOBAL_SHELF_STATE_KEY = 'globalShelfState';
        const QUEUE_KEY = 'shelfQueue';
        // 🔼 END OF CONSTANTS 🔼

        // 🔽 ADD MISSING DOM ELEMENTS 🔽
        const queueSelectionView = document.getElementById('queueSelectionView');
        const activeJobView = document.getElementById('activeJobView');
        const queueListContainer = document.getElementById('queueListContainer');
        const jobDetailsContainer = document.getElementById('jobDetailsContainer');
        const detailsPanel = document.getElementById('detailsPanel');
        const mainView = document.getElementById('mainView');
        const shelfGrid = document.getElementById('shelfGrid');
        const shelfContainer = document.getElementById('shelfContainer');
        // 🔼 END OF DOM ELEMENTS 🔼

        const ROWS = 4, COLS = 6;

        function initializeShelfState() {
            if (!localStorage.getItem(GLOBAL_SHELF_STATE_KEY)) {
                const defaultState = [];
                for (let r = 1; r <= ROWS; r++) {
                    for (let c = 1; c <= COLS; c++) {
                        defaultState.push([r, c, 0]); // [level, block, hasItem]
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
            if (shelfGrid.children.length > 0) {
                return;
            }
            
            console.log('🏗️ Creating shelf grid structure...');
            shelfGrid.innerHTML = '';
            for (let r = 1; r <= ROWS; r++) {
                for (let c = 1; c <= COLS; c++) {
                    const cell = document.createElement('div');
                    cell.id = `cell-${r}-${c}`;
                    cell.className = 'shelf-cell';
                    shelfGrid.appendChild(cell);
                }
            }
        }

        function getActiveJob() {
            const activeJobData = localStorage.getItem(ACTIVE_JOB_KEY);
            console.log('🔍 getActiveJob() called:', activeJobData);
            
            if (!activeJobData || activeJobData === 'null') {
                console.log('❌ No active job found');
                return null;
            }
            
            try {
                const job = JSON.parse(activeJobData);
                console.log('✅ Active job found:', job);
                return job;
            } catch (error) {
                console.error('❌ Error parsing active job:', error);
                localStorage.removeItem(ACTIVE_JOB_KEY);
                return null;
            }
        }

        function setActiveJob(job) {
            console.log('🔍 setActiveJob() called with:', job);
            localStorage.setItem(ACTIVE_JOB_KEY, JSON.stringify(job));
            console.log('✅ Active job saved to localStorage');
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

            console.log('🔍 DEBUG: renderShelfGrid called');
            console.log('🔍 DEBUG: activeJob =', activeJob);
            console.log('🔍 DEBUG: shelfState =', shelfState);

            shelfState.forEach(([level, block, hasItem]) => {
                const cell = document.getElementById(`cell-${level}-${block}`);
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
                            console.log(`🔴 Error location: [${level},${block}]`);
                        } else {
                            cell.classList.add('selected-task');
                            console.log(`🔵 Target location: [${level},${block}]`);
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
                        console.log(`⚫ Has item (no active job): [${level},${block}]`);
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
                    
                    <!-- 🔽 ADD ACTION BUTTONS 🔽 -->
                    <div class="action-buttons" style="margin-top: 20px;">
                        <button class="complete-btn" onclick="completeCurrentJob()" style="background: #28a745; color: white; padding: 10px 20px; border: none; border-radius: 5px; margin-right: 10px;">
                            ✅ Complete
                        </button>
                        <button class="error-btn" onclick="reportJobError('MANUAL_ERROR', 'Manual error reported')" style="background: #dc3545; color: white; padding: 10px 20px; border: none; border-radius: 5px;">
                            ❌ Report Error
                        </button>
                    </div>
                    <!-- 🔼 END OF BUTTONS 🔼 -->
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

            // --- START: แก้ไข Logic Focus แบบแน่นอน ---
            // ใช้ MutationObserver เพื่อตรวจสอบว่า Input ถูก Render จริงๆ
            ensureLotInputFocus();
            // --- END: แก้ไข Logic Focus ---
        }

        // --- START: เพิ่มฟังก์ชันใหม่ ---
        function ensureLotInputFocus() {
            const lotInput = document.getElementById('lot-no-input');
            
            if (lotInput && lotInput.offsetParent !== null) {
                // Element มีอยู่และมองเห็นได้
                setupLotInputBehavior(lotInput);
            } else {
                // Element ยังไม่พร้อม ให้รอ DOM Update
                const observer = new MutationObserver((mutations) => {
                    const lotInput = document.getElementById('lot-no-input');
                    if (lotInput && lotInput.offsetParent !== null) {
                        setupLotInputBehavior(lotInput);
                        observer.disconnect(); // หยุดการสังเกต
                    }
                });
                
                observer.observe(document.body, {
                    childList: true,
                    subtree: true
                });
                
                // Safety timeout - หยุดการสังเกตหลัง 2 วินาที
                setTimeout(() => {
                    observer.disconnect();
                }, 2000);
            }
        }

        function setupLotInputBehavior(lotInput) {
            // ลบ Event Listener เก่าก่อน
            lotInput.removeEventListener('keyup', handleLotKeyUp);
            lotInput.addEventListener('keyup', handleLotKeyUp);
            
            // เพิ่ม Visual Cue
            lotInput.style.border = '2px solid #007bff';
            lotInput.style.boxShadow = '0 0 5px rgba(0,123,255,0.5)';
            
            // Force Focus หลายครั้ง
            lotInput.focus();
            
            setTimeout(() => {
                lotInput.focus();
                console.log('✅ Second focus attempt');
            }, 100);
            
            setTimeout(() => {
                lotInput.focus();
                console.log('✅ Third focus attempt');
                
                // ตรวจสอบว่า Focus สำเร็จหรือไม่
                if (document.activeElement === lotInput) {
                    console.log('🎯 Focus successful!');
                } else {
                    console.log('❌ Focus failed. Active element:', document.activeElement);
                }
            }, 200);
        }

        function handleLotKeyUp(event) {
            if (event.key === 'Enter') {
                event.preventDefault();
                handleLotSearch();
            }
        }
        // --- END: เพิ่มฟังก์ชันใหม่ ---

        function selectJob(jobId) {
            const queue = getQueue();
            const selectedJob = queue.find(job => job.jobId === jobId);
            
            console.log('🔍 selectJob() called with:', jobId);
            console.log('🔍 Selected job:', selectedJob);
            
            if (selectedJob) {
                setActiveJob(selectedJob);
                console.log('✅ Active job set:', selectedJob);
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

            console.log(`🔍 Searching for Lot No: ${lotNo}`);
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
                
                // --- START: ป้องกันการส่งข้อมูลไปยัง Server ---
                if (lotNoToSearch.length > 0) {
                    // หยุดการแพร่กระจายของ Event เพื่อป้องกันการส่งข้อมูลไปยัง API
                    event?.stopPropagation();
                    event?.preventDefault();
                    
                    console.log(`🔍 Local search for: ${lotNoToSearch}`);
                    findAndSelectJobByLot(lotNoToSearch);
                    lotInput.value = ''; // เคลียร์ค่าในช่อง input
                }
                // --- END: ป้องกันการส่งข้อมูลไปยัง Server ---
            }
        }
        // --- END: คืนค่าฟังก์ชันให้เป็นแบบง่าย ---

        function goBackToQueue() {
            localStorage.removeItem(ACTIVE_JOB_KEY); // ใช้ Key ที่ถูกต้อง
            renderAll();
        }

        function renderAll() {
            const queue = getQueue();
            const activeJob = getActiveJob();

            console.log('🔄 renderAll() - Queue:', queue.length, 'Active:', !!activeJob);

            // *** แก้ไข Logic ใหม่: ต้องเลือกก่อนเสมอ ***
            if (queue.length > 0 && !activeJob) {
                // มีงานในคิว แต่ยังไม่ได้เลือก -> แสดงหน้าเลือกงานเสมอ (ไม่สนใจว่าจะมี 1 หรือหลาย Job)
                mainView.style.display = 'none';
                queueSelectionView.style.display = 'block';
                renderQueueSelectionView(queue);
                
            } else if (activeJob) {
                // มี Active Job อยู่แล้ว -> แสดงหน้าทำงาน
                queueSelectionView.style.display = 'none';
                mainView.style.display = 'flex';
                renderActiveJob();
                renderShelfGrid();
                
            } else {
                // ไม่มีงานเลย -> แสดงหน้าหลัก (Idle)
                queueSelectionView.style.display = 'none';
                mainView.style.display = 'flex';
                renderActiveJob(); // จะแสดง "No active job"
                renderShelfGrid();
            }
        }

        // --- Initial Load ---
        document.addEventListener('DOMContentLoaded', () => {
            createShelfGridStructure();
            initializeShelfState();
            setupWebSocket();
            renderAll();
        });
        
        // ลบ Event Listener ของ 'storage' เก่าออก เพราะเราจะใช้ WebSocket แทน
        window.removeEventListener('storage', renderAll);
        
        // *** START: WebSocket Integration ***
        let websocketConnection = null; // เก็บ WebSocket connection

        function setupWebSocket() {
            console.log("Attempting to connect to WebSocket at ws://localhost:8000/ws");
            const ws = new WebSocket(`ws://${window.location.host}/ws`);
            
            // เก็บ connection ไว้ใช้ส่งข้อมูล
            websocketConnection = ws;

            ws.onopen = function(event) {
                console.log("✅ WebSocket connection established.");
            };

            ws.onmessage = function(event) {
                try {
                    const data = JSON.parse(event.data);
                    console.log("📩 Received message from server:", data);

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
                            localStorage.removeItem(ACTIVE_JOB_KEY); // ใช้ Key ที่ถูกต้อง
                            renderAll();
                            showNotification(`Job completed.`);
                            break;
                        case "job_error":
                            localStorage.setItem(ACTIVE_JOB_KEY, JSON.stringify(data.payload)); // ใช้ Key ที่ถูกต้อง
                            renderAll();
                            showNotification(`Job error reported for Lot ${data.payload.lot_no}`, 'error');
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
                console.log("❌ WebSocket connection closed. Reconnecting in 3 seconds...");
                setTimeout(setupWebSocket, 3000);
            };

            ws.onerror = function(error) {
                console.error("💥 WebSocket error:", error);
            };
        }
