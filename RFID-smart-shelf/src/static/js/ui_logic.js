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

                cell.className = 'shelf-cell'; // Reset classes

                const isTaskLocation = activeJob && parseInt(activeJob.level) === level && parseInt(activeJob.block) === block;
                const isError = activeJob && activeJob.error;

                // --- START: Logic ที่แก้ไขแล้ว ---
                if (isError) {
                    // ถ้ามี Error: 
                    if (isTaskLocation) {
                        // ช่องเป้าหมายต้องเป็นสีแดงกระพริบ (เพื่อบอกว่ายังไม่สำเร็จ ต้องลองใหม่)
                        cell.classList.add('wrong-location');
                    } else {
                        // ช่องอื่นๆ (รวมทั้งช่องที่วางผิด) แสดงตามสถานะปกติ
                        if (hasItem) {
                            cell.classList.add('has-item');
                        }
                    }
                } else {
                    // ถ้าไม่มี Error (สถานะปกติ):
                    if (isPlacing) {
                        if (isTaskLocation) cell.classList.add('selected-task');
                    } else {
                        if (hasItem) cell.classList.add('has-item');
                        if (isTaskLocation) cell.classList.add('selected-task');
                    }
                }
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
        }

        function selectJob(jobId) {
            const queue = getQueue();
            const selectedJob = queue.find(job => job.jobId === jobId);
            if (selectedJob) {
                setActiveJob(selectedJob);
                renderAll();
            }
        }

        function goBackToQueue() {
            localStorage.removeItem('activeShelfJob');
            renderAll();
        }

        function renderAll() {
            const queue = getQueue();
            const activeJob = getActiveJob();

            // Logic ในการสลับ View
            if (queue.length > 0 && !activeJob) {
                // State 1: มีงานในคิว แต่ยังไม่ได้เลือก -> แสดงหน้าเลือกงาน
                mainView.style.display = 'none';
                queueSelectionView.style.display = 'block';
                renderQueueSelectionView(queue);
            } else {
                // State 2: มีงานที่กำลังทำอยู่ หรือไม่มีงานเลย -> แสดงหน้าทำงานหลัก
                queueSelectionView.style.display = 'none';
                mainView.style.display = 'flex';
                renderActiveJob(); // ฟังก์ชันนี้จะจัดการทั้งตอนมี activeJob และไม่มี
                renderShelfGrid(); // เพิ่มการเรียกตรงนี้เพื่อให้แน่ใจว่า Grid ถูกวาดเสมอ
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
            const ws = new WebSocket("ws://localhost:8000/ws");

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
