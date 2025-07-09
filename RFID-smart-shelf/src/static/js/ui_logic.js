// --- DOM Elements ---
        const queueSelectionView = document.getElementById('queueSelectionView');
        const queueListContainer = document.getElementById('queueListContainer');
        const mainView = document.getElementById('mainView');
        const detailsPanel = document.getElementById('detailsPanel');
        const shelfGrid = document.getElementById('shelfGrid');
        const shelfContainer = document.getElementById('shelfContainer');

        const ROWS = 4, COLS = 6;
        const GLOBAL_SHELF_STATE_KEY = 'globalShelfState';

        // *** START: เพิ่มฟังก์ชันที่หายไป ***
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
            const queue = JSON.parse(localStorage.getItem('shelfQueue') || '[]');
            const cleanedQueue = queue.filter(job => job && job.lot_no && job.level && job.block);
            if (cleanedQueue.length !== queue.length) {
                console.warn("Removed invalid jobs from the queue.");
                localStorage.setItem('shelfQueue', JSON.stringify(cleanedQueue));
            }
            return cleanedQueue;
        }

        function getQueue() {
            return cleanInvalidJobs();
        }

        function showNotification(message, type = 'success') {
            const notification = document.createElement('div');
            notification.className = `notification ${type}`;
            notification.textContent = message;
            document.body.appendChild(notification);
            setTimeout(() => {
                notification.remove();
            }, 3000);
        }

        // *** START: เพิ่มฟังก์ชันที่หายไป ***
        function getActiveJob() {
            return JSON.parse(localStorage.getItem('activeShelfJob') || 'null');
        }

        function setActiveJob(job) {
            localStorage.setItem('activeShelfJob', JSON.stringify(job));
        }

        function renderShelfGrid() {
            const shelfState = JSON.parse(localStorage.getItem(GLOBAL_SHELF_STATE_KEY) || '[]');
            const activeJob = getActiveJob();
            const isPlacing = activeJob && activeJob.place_flg === '1';

            shelfState.forEach(([level, block, hasItem]) => {
                const cell = document.getElementById(`cell-${level}-${block}`);
                if (!cell) return;

                // --- START: Logic ที่แก้ไขแล้ว ---
                cell.className = 'shelf-cell'; // Reset class ทุกครั้ง เพื่อป้องกันสถานะเก่าค้าง

                const isTaskLocation = activeJob && parseInt(activeJob.level) === level && parseInt(activeJob.block) === block;
                const isError = activeJob && activeJob.error;

                if (isTaskLocation) {
                    // 1. ตรวจสอบก่อนเลยว่าเป็นช่องเป้าหมายหรือไม่
                    if (isError) {
                        // 1a. ถ้าเป็นเป้าหมายและมี Error ให้แสดงเป็นสีแดง (สำคัญสุด)
                        cell.classList.add('wrong-location');
                    } else {
                        // 1b. ถ้าเป็นเป้าหมายและไม่มี Error ให้แสดงเป็นสีน้ำเงินเสมอ
                        cell.classList.add('selected-task');
                    }
                } else if (hasItem) {
                    // 2. ถ้าไม่ใช่ช่องเป้าหมาย ค่อยมาดูว่ามีของหรือไม่
                    cell.classList.add('has-item');
                }
                // ถ้าไม่ใช่ทั้งช่องเป้าหมายและไม่มีของ ก็ไม่ต้องทำอะไร (จะเป็นช่องว่างๆ)
                // --- END: Logic ที่แก้ไขแล้ว ---
            });
        }

        function renderActiveJob() {
            const activeJob = getActiveJob();
            const queue = getQueue();
            detailsPanel.innerHTML = ''; // Clear previous details

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
            renderShelfGrid(); // อัปเดต Shelf Grid ทุกครั้งที่ Active Job เปลี่ยน
        }
        // *** END: เพิ่มฟังก์ชันที่หายไป ***

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

            // ทำให้สามารถกด Enter ในช่องค้นหาได้
            const lotInput = document.getElementById('lot-no-input');
            if (lotInput) {
                lotInput.addEventListener('keyup', function(event) {
                    if (event.key === 'Enter') {
                        event.preventDefault();
                        handleLotSearch();
                    }
                });
                lotInput.focus(); 
            }
        }

        function selectJob(jobId) {
            const queue = getQueue();
            const selectedJob = queue.find(job => job.jobId === jobId);
            if (selectedJob) {
                setActiveJob(selectedJob);
                renderAll();
            }
        }

        // 🔽 ADD THESE TWO NEW FUNCTIONS 🔽
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
                // เรียกใช้ฟังก์ชัน selectJob ที่มีอยู่แล้วเพื่อจัดการที่เหลือ
                selectJob(foundJob.jobId);
            } else {
                showNotification(`❌ Lot No. ${lotNo} not found in queue.`, 'error');
                // ทำให้ช่อง input สั่นเพื่อบอกผู้ใช้ว่าหาไม่เจอ
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
                findAndSelectJobByLot(lotNoToSearch);
                lotInput.value = ''; // เคลียร์ค่าในช่อง input หลังค้นหา
            }
        }
        // 🔼 END OF ADDED FUNCTIONS 🔼

        function goBackToQueue() {
            localStorage.removeItem('activeShelfJob');
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
            // สร้าง grid cell ไว้ล่วงหน้า
            for (let r = 1; r <= ROWS; r++) for (let c = 1; c <= COLS; c++) {
                const cell = document.createElement('div');
                cell.classList.add('shelf-cell');
                cell.id = `cell-${r}-${c}`;
                shelfGrid.appendChild(cell);
            }
            initializeShelfState();
            renderAll();
        });
        
        // ลบ Event Listener ของ 'storage' เก่าออก เพราะเราจะใช้ WebSocket แทน
        window.removeEventListener('storage', renderAll);
        
        // *** START: WebSocket Integration ***
        function setupWebSocket() {
            console.log("Attempting to connect to WebSocket at ws://localhost:8000/ws");
            const ws = new WebSocket(`ws://${window.location.host}/ws`);

            ws.onopen = function(event) {
                console.log("✅ WebSocket connection established.");
            };

            ws.onmessage = function(event) {
                try {
                    const data = JSON.parse(event.data);
                    console.log("📩 Received message from server:", data);

                    switch (data.type) {
                        case "initial_state":
                            localStorage.setItem('shelfQueue', JSON.stringify(data.payload.jobs));
                            localStorage.setItem('globalShelfState', JSON.stringify(data.payload.shelf_state));
                            renderAll();
                            break;
                        case "new_job":
                            const queue = getQueue();
                            if (!queue.some(job => job.jobId === data.payload.jobId)) {
                                queue.push(data.payload);
                                localStorage.setItem('shelfQueue', JSON.stringify(queue));
                                renderAll();
                                showNotification(`New job added: ${data.payload.lot_no}`);
                            }
                            break;
                        case "job_completed":
                            let currentQueue = getQueue();
                            currentQueue = currentQueue.filter(j => j.jobId !== data.payload.completedJobId);
                            localStorage.setItem('shelfQueue', JSON.stringify(currentQueue));
                            localStorage.setItem('globalShelfState', JSON.stringify(data.payload.shelf_state));
                            localStorage.removeItem('activeShelfJob');
                            renderAll();
                            showNotification(`Job completed.`);
                            break;
                        case "job_error":
                            localStorage.setItem('activeShelfJob', JSON.stringify(data.payload));
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
                setTimeout(setupWebSocket, 3000); // ลองเชื่อมต่อใหม่
            };

            ws.onerror = function(error) {
                console.error("💥 WebSocket error:", error);
            };
        }
        
        // เริ่มการเชื่อมต่อ WebSocket หลังจากที่หน้าเว็บโหลดเสร็จ
        setupWebSocket();
        // *** END: WebSocket Integration ***
