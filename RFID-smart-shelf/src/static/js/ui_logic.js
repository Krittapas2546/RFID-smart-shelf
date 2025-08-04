// --- Column Layout Controller: ปรับขนาด 2 columns แบบ real-time ---
/**
 * เปลี่ยนสัดส่วนของ columns
 * @param {number} shelfPercent - เปอร์เซ็นต์ของ shelf (0-100)
 * @param {number} previewPercent - เปอร์เซ็นต์ของ preview (0-100) 
 * @param {number} gap - ระยะห่างระหว่าง columns (px)
 */
function setColumnLayout(shelfPercent = 70, previewPercent = 30, gap = 40) {
    // ตรวจสอบให้รวมกันเป็น 100%
    const total = shelfPercent + previewPercent;
    if (total !== 100) {
        console.warn(`⚠️ Column percentages should total 100%, got ${total}%. Auto-adjusting...`);
        const ratio = 100 / total;
        shelfPercent = Math.round(shelfPercent * ratio);
        previewPercent = 100 - shelfPercent;
    }
    
    // ตั้งค่า CSS variables
    const root = document.documentElement;
    root.style.setProperty('--shelf-width', `${shelfPercent}%`);
    root.style.setProperty('--preview-width', `${previewPercent}%`);
    root.style.setProperty('--column-gap', `${gap}px`);
    
    console.log(`📐 Column layout updated: Shelf ${shelfPercent}%, Preview ${previewPercent}%, Gap ${gap}px`);
    
    // Force reflow เพื่อให้การเปลี่ยนแปลงมีผลทันที
    const shelfPanel = document.querySelector('.shelf-panel');
    const previewContainer = document.querySelector('.cell-preview-container');
    if (shelfPanel && previewContainer) {
        shelfPanel.style.flexBasis = `${shelfPercent}%`;
        previewContainer.style.flexBasis = `${previewPercent}%`;
        
        // ตรวจสอบการเปลี่ยนแปลง
        console.log(`✅ Applied styles - Shelf: ${shelfPanel.style.flexBasis}, Preview: ${previewContainer.style.flexBasis}`);
    }
    
    // บันทึกการตั้งค่าใน localStorage
    localStorage.setItem('columnLayout', JSON.stringify({
        shelf: shelfPercent,
        preview: previewPercent,
        gap: gap
    }));
}

/**
 * โหลดการตั้งค่า column layout จาก localStorage
 */
function loadColumnLayout() {
    const saved = localStorage.getItem('columnLayout');
    if (saved) {
        try {
            const layout = JSON.parse(saved);
            setColumnLayout(layout.shelf, layout.preview, layout.gap);
            
            // อัปเดต slider ให้สอดคล้อง
            setTimeout(() => {
                const slider = document.getElementById('shelfSlider');
                const sliderValue = document.getElementById('sliderValue');
                if (slider && sliderValue) {
                    slider.value = layout.shelf;
                    sliderValue.textContent = `${layout.shelf}%`;
                }
            }, 100); // รอให้ DOM โหลดเสร็จ
            
            console.log(`🔄 Restored column layout:`, layout);
        } catch (error) {
            console.warn('⚠️ Invalid saved column layout, using defaults');
            setColumnLayout(); // ใช้ค่าเริ่มต้น
        }
    }
}

/**
 * ใช้ layout preset ที่กำหนดไว้
 */
function applyLayoutPreset(presetName) {
    const presets = {
        'default': { shelf: 65, preview: 35, gap: 30 }, // 65-35
        'equal': { shelf: 50, preview: 50, gap: 30 },   // 50-50
        'shelf-focus': { shelf: 75, preview: 25, gap: 30 }, // 75-25
        'preview-focus': { shelf: 55, preview: 45, gap: 30 }, // 55-45
        'compact': { shelf: 70, preview: 30, gap: 20 },  // 70-30 แคบ
        'wide': { shelf: 60, preview: 40, gap: 40 }      // 60-40 กว้าง
    };
    
    const preset = presets[presetName];
    if (preset) {
        setColumnLayout(preset.shelf, preset.preview, preset.gap);
        
        // อัปเดต slider ให้สอดคล้อง
        const slider = document.getElementById('shelfSlider');
        const sliderValue = document.getElementById('sliderValue');
        if (slider && sliderValue) {
            slider.value = preset.shelf;
            sliderValue.textContent = `${preset.shelf}%`;
        }
        
        console.log(`🎨 Applied preset "${presetName}":`, preset);
    } else {
        console.error(`❌ Unknown preset: ${presetName}. Available: ${Object.keys(presets).join(', ')}`);
    }
}

/**
 * ปิด/เปิดการแสดงผลของปุ่มควบคุม layout
 */
function toggleLayoutControls() {
    const controls = document.getElementById('layoutControls');
    if (controls) {
        const isVisible = controls.style.display !== 'none';
        controls.style.display = isVisible ? 'none' : 'block';
    }
}

/**
 * อัปเดตขนาด layout จาก slider
 */
function updateLayoutFromSlider() {
    const slider = document.getElementById('shelfSlider');
    const sliderValue = document.getElementById('sliderValue');
    
    if (slider && sliderValue) {
        const shelfPercent = parseInt(slider.value);
        const previewPercent = 100 - shelfPercent;
        
        setColumnLayout(shelfPercent, previewPercent, 40);
        sliderValue.textContent = `${shelfPercent}%`;
    }
}

/**
 * ตั้งค่าขนาด Shelf Frame แบบกำหนดเอง
 */
function setShelfSize(width, height) {
    const root = document.documentElement;
    root.style.setProperty('--shelf-frame-width', `${width}px`);
    root.style.setProperty('--shelf-frame-height', `${height}px`);
    
    // อัปเดต shelf-frame จริง ๆ
    const shelfFrame = document.querySelector('.shelf-frame');
    if (shelfFrame) {
        shelfFrame.style.width = `${width}px`;
        shelfFrame.style.height = `${height}px`;
    }
    
    console.log(`📐 Shelf size updated: ${width}×${height}px`);
    
    // บันทึกการตั้งค่า
    localStorage.setItem('shelfSize', JSON.stringify({ width, height }));
    
    // รีเฟรช shelf grid เพื่อปรับขนาด cell ให้เหมาะสม
    setTimeout(() => {
        if (shelfGrid && typeof createShelfGridStructure === 'function') {
            createShelfGridStructure();
            if (typeof renderShelfGrid === 'function') {
                renderShelfGrid();
            }
            console.log(`🔄 Shelf grid refreshed for new size: ${width}×${height}px`);
        }
    }, 100); // รอให้ CSS มีผลก่อน
}

/**
 * คำนวณขนาด cell ที่เหมาะสมตามขนาด shelf
 */
function calculateOptimalCellSize(shelfWidth, shelfHeight) {
    // ค่าพื้นฐาน
    const containerPadding = 10;
    const levelGaps = (TOTAL_LEVELS - 1) * 5;
    const cellGap = 4;
    
    // คำนวณขนาดที่ใช้ได้จริง
    const usableHeight = shelfHeight - containerPadding - levelGaps;
    const cellHeight = Math.max(Math.floor(usableHeight / TOTAL_LEVELS), 30); // ขั้นต่ำ 30px
    
    // กำหนดขนาดตามความสูงของ shelf
    let optimizedHeight;
    if (shelfHeight <= 250) {
        optimizedHeight = Math.max(cellHeight, 35); // shelf เล็ก
    } else if (shelfHeight <= 350) {
        optimizedHeight = Math.max(cellHeight, 45); // shelf กลาง
    } else if (shelfHeight <= 450) {
        optimizedHeight = Math.max(cellHeight, 60); // shelf ใหญ่
    } else {
        optimizedHeight = Math.max(cellHeight, 75); // shelf ใหญ่มาก (550×475)
    }
    
    return {
        cellHeight: optimizedHeight,
        gap: cellGap,
        totalHeight: (optimizedHeight * TOTAL_LEVELS) + levelGaps + containerPadding
    };
}

/**
 * ตั้งค่าขนาด Shelf พร้อมปรับ cell size อัตโนมัติ
 */
function setOptimizedShelfSize(width, height) {
    console.log(`🎯 Setting optimized shelf size: ${width}×${height}px`);
    
    // ใช้ฟังก์ชันเดิมแต่เพิ่มการแสดงข้อมูล
    setShelfSize(width, height);
    
    // แสดงข้อมูลการปรับขนาด
    setTimeout(() => {
        if (typeof calculateOptimalCellSize === 'function') {
            const sizeConfig = calculateOptimalCellSize(width, height);
            console.log(`📊 Optimized for ${width}×${height}px:`, sizeConfig);
            
            // แสดง notification ที่ถูกต้อง - ตรวจสอบขนาด cell preview จริง
            if (typeof showNotification === 'function') {
                const cellPreview = document.querySelector('.cell-preview-container');
                let previewSize = '350×500px'; // default
                if (cellPreview) {
                    const computedStyle = window.getComputedStyle(cellPreview);
                    const actualWidth = Math.round(parseFloat(computedStyle.width));
                    const actualHeight = Math.round(parseFloat(computedStyle.height));
                    previewSize = `${actualWidth}×${actualHeight}px`;
                }
                showNotification(`Shelf: ${width}×${height}px | Cell: ${sizeConfig.cellHeight}px | Preview: ${previewSize}`, 'info');
            }
        }
    }, 150);
}

function setCustomShelfSize() {
    const widthInput = document.getElementById('customWidth');
    const heightInput = document.getElementById('customHeight');
    
    if (widthInput && heightInput) {
        const width = parseInt(widthInput.value);
        const height = parseInt(heightInput.value);
        
        if (width > 0 && height > 0) {
            setShelfSize(width, height);
            // เคลียร์ input
            widthInput.value = '';
            heightInput.value = '';
        } else {
            alert('กรุณาใส่ค่าขนาดที่ถูกต้อง');
        }
    }
}

/**
 * ตั้งค่าขนาด Cell Preview Container แบบครบถ้วน (ความกว้าง × ความสูง)
 */
function setCellPreviewSize(minHeight, maxHeight, width = null) {
    console.log(`📱 Setting Cell Preview size: ${width ? width + '×' : ''}${minHeight}-${maxHeight}px`);
    
    const root = document.documentElement;
    root.style.setProperty('--cell-preview-min-height', `${minHeight}px`);
    root.style.setProperty('--cell-preview-max-height', `${maxHeight}px`);
    
    if (width) {
        root.style.setProperty('--cell-preview-width', `${width}px`);
    }
    
    // อัปเดต cell preview จริง ๆ - บังคับตั้งค่า
    const cellPreview = document.querySelector('.cell-preview-container');
    if (cellPreview) {
        cellPreview.style.height = `${maxHeight}px`; // บังคับตั้งค่าความสูง
        cellPreview.style.minHeight = `${minHeight}px`;
        cellPreview.style.maxHeight = `${maxHeight}px`;
        if (width) {
            cellPreview.style.width = `${width}px`; // บังคับตั้งค่าความกว้าง
            cellPreview.style.minWidth = `${width}px`;
            cellPreview.style.maxWidth = `${width}px`;
        }
        console.log(`📱 Cell Preview DOM updated: ${cellPreview.style.width} × ${cellPreview.style.height}`);
    }
    
    const blockPreview = document.querySelector('.block-preview');
    if (blockPreview) {
        // ลดขนาด block preview ตามสัดส่วน
        const blockWidth = width ? Math.max(width - 30, 280) : 320;
        const blockMinHeight = Math.max(minHeight - 80, 200); // เหลือพื้นที่สำหรับ header
        const blockMaxHeight = Math.max(maxHeight - 80, 250);
        
        blockPreview.style.width = `${blockWidth}px`; // บังคับตั้งค่า block preview width
        blockPreview.style.height = `${blockMaxHeight}px`; // บังคับตั้งค่า block preview height
        blockPreview.style.minHeight = `${blockMinHeight}px`;
        blockPreview.style.maxHeight = `${blockMaxHeight}px`;
        
        console.log(`🔲 Block Preview updated: ${blockWidth}×${blockMaxHeight}px`);
    }
    
    console.log(`✅ Cell Preview size updated: ${width ? width + '×' : ''}${minHeight}-${maxHeight}px`);
    
    // บันทึกการตั้งค่า
    localStorage.setItem('cellPreviewSize', JSON.stringify({ 
        minHeight, 
        maxHeight,
        width: width || null
    }));
}

/**
 * ตั้งค่าขนาด Cell Preview จากการป้อนค่าเอง
 */
function setCustomCellPreviewSize() {
    const widthInput = document.getElementById('customPreviewWidth');
    const heightInput = document.getElementById('customPreviewHeight');
    
    if (widthInput && heightInput) {
        const width = parseInt(widthInput.value);
        const height = parseInt(heightInput.value);
        
        if (width > 0 && height > 0) {
            setCellPreviewSize(height - 50, height, width); // min/max height และ width
            // เคลียร์ input
            widthInput.value = '';
            heightInput.value = '';
        } else {
            alert('กรุณาใส่ค่าขนาดที่ถูกต้อง');
        }
    }
}

/**
 * โหลดการตั้งค่าขนาดที่บันทึกไว้
 */
function loadSavedSizes() {
    // โหลดขนาด shelf (ถ้าไม่มีจะใช้ค่าที่ตั้งไว้แล้วใน DOMContentLoaded)
    const savedShelfSize = localStorage.getItem('shelfSize');
    if (savedShelfSize) {
        try {
            const size = JSON.parse(savedShelfSize);
            setOptimizedShelfSize(size.width, size.height);
            console.log('🏢 Loaded saved shelf size:', size);
        } catch (error) {
            console.warn('⚠️ Invalid saved shelf size, keeping default 550×475');
        }
    } else {
        console.log('🏢 Using default shelf size: 550×475px (already applied)');
    }
    
    // โหลดขนาด cell preview (ถ้าไม่มีจะใช้ค่าที่ตั้งไว้แล้วใน DOMContentLoaded)
    const savedPreviewSize = localStorage.getItem('cellPreviewSize');
    if (savedPreviewSize) {
        try {
            const size = JSON.parse(savedPreviewSize);
            setCellPreviewSize(size.minHeight, size.maxHeight, size.width);
            console.log('📱 Loaded saved cell preview size:', size);
        } catch (error) {
            console.warn('⚠️ Invalid saved cell preview size, keeping default 350×500');
        }
    } else {
        console.log('📱 Using default cell preview size: 350×500px (already applied)');
    }
}

/**
 * ฟังก์ชันทดสอบแบบง่าย - ใช้ในคอนโซล
 */
function testLayout(shelf = 50, preview = 50) {
    console.log(`🧪 Testing layout: ${shelf}%-${preview}%`);
    setColumnLayout(shelf, preview, 40);
}

// เพิ่มฟังก์ชันลงใน window object เพื่อให้เรียกจากคอนโซลได้
window.testLayout = testLayout;
window.setColumnLayout = setColumnLayout;
window.applyLayoutPreset = applyLayoutPreset;
window.toggleLayoutControls = toggleLayoutControls;
window.updateLayoutFromSlider = updateLayoutFromSlider;
window.setShelfSize = setShelfSize;
window.setOptimizedShelfSize = setOptimizedShelfSize;
window.setCustomShelfSize = setCustomShelfSize;
window.setCellPreviewSize = setCellPreviewSize;
window.setCustomCellPreviewSize = setCustomCellPreviewSize;
window.loadSavedSizes = loadSavedSizes;

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
    
    // คำนวณข้อมูลสรุป
    const totalLots = previewLots.length;
    const totalTrays = previewLots.reduce((sum, lot) => sum + (parseInt(lot.tray_count) || 0), 0);
    const isEmpty = totalLots === 0;
    
    html += `<h3>Level ${level} Block ${block}</h3>`;
    html += `<div class="cell-summary" style="background: #e9ecef; padding: 8px; border-radius: 6px; margin-bottom: 10px; text-align: center;">`;
    if (isEmpty) {
        html += `<span style="color: #6c757d; font-weight: bold;">📦 Empty Cell</span>`;
    } else {
        html += `<span style="color: #495057; font-weight: bold;">📦 ${totalLots} Lot${totalLots > 1 ? 's' : ''} | ${totalTrays} Tray${totalTrays > 1 ? 's' : ''}</span>`;
    }
<<<<<<< HEAD
    html += `</div>`;
=======
    
    // เพิ่มหัวข้อ Lot No.
    html += `<h4 class="lot-header">Lot No.</h4>`;
>>>>>>> parent of d06007d (Update ui_logic.js)
    html += `<div class="block-preview">`;

    if (previewLots.length > 0) {
        // สร้างรายการ lot แนวตั้ง (จากล่างขึ้นบน) - ใช้ระบบเดียวกับ shelf grid
        for (let i = previewLots.length - 1; i >= 0; i--) {
            const lot = previewLots[i];
            const trayCount = parseInt(lot.tray_count) || 0;
            const isTarget = lot.lot_no === targetLotNo;
            const isNewLot = isPlaceJob && i === previewLots.length - 1 && isTarget;

            // ใช้ระบบการคำนวณขนาดเดียวกันกับ shelf grid
            let calculatedHeight;
            if (trayCount <= 4) {
                calculatedHeight = 20; // น้อย = 20px (ขยายจาก 4px ใน grid)
            } else if (trayCount <= 8) {
                calculatedHeight = 40; // ปานกลาง = 40px (ขยายจาก 8px ใน grid)
            } else if (trayCount <= 16) {
                calculatedHeight = 80; // เยอะ = 80px (ขยายจาก 16px ใน grid)
            } else {
                calculatedHeight = 120; // เยอะมาก = 120px (ขยายจาก 24px ใน grid)
            }

            // ตัดชื่อ lot ถ้ายาวเกินไป (สำหรับ desktop ใช้ 15 ตัวอักษร)
            const displayName = lot.lot_no.length > 15 ?
                lot.lot_no.substring(0, 15) + '...' :
                lot.lot_no;

            let itemClass = 'lot-item';
            if (isTarget) itemClass += ' target-lot';
            if (isNewLot) itemClass += ' new-lot';

            html += `<div class="${itemClass}" style="height: ${calculatedHeight}px;" title="${lot.lot_no} (${trayCount} tray)">`;
            html += `<span class="lot-name">${displayName}</span>`;
            if (isNewLot) {
                html += `<span class="new-badge"> NEW</span>`;
            }
            html += `</div>`;
        }
    } else {
        html += `<div class="lot-item empty-slot" style="height: 80px; display: flex; align-items: center; justify-content: center; background: #f8f9fa; border: 2px dashed #dee2e6;">`;
        html += `<span class="lot-name" style="color: #6c757d; font-style: italic;">(empty cell)</span>`;
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
            shelfGrid.style.gap = '5px'; // เพิ่ม gap ระหว่างชั้น
            shelfGrid.style.padding = '5px';
            shelfGrid.style.background = '#f8f9fa';
            shelfGrid.style.border = '1px solid #dee2e6';
            shelfGrid.style.width = '100%';
            shelfGrid.style.height = '100%';
            
            // คำนวณขนาด cell แบบ dynamic ตามขนาด shelf
            const shelfFrame = document.querySelector('.shelf-frame');
            let currentWidth = 550, currentHeight = 475; // ค่า default ใหม่
            
            if (shelfFrame) {
                const computedStyle = window.getComputedStyle(shelfFrame);
                currentWidth = parseFloat(computedStyle.width) || currentWidth;
                currentHeight = parseFloat(computedStyle.height) || currentHeight;
            }
            
            // ใช้ฟังก์ชันคำนวณขนาดที่เหมาะสม
            const sizeConfig = calculateOptimalCellSize(currentWidth, currentHeight);
            const cellHeight = sizeConfig.cellHeight;
            const gapSize = sizeConfig.gap;
            
            console.log(`📐 Dynamic sizing for ${currentWidth}×${currentHeight}px → Cell height ${cellHeight}px`);
            console.log(`📊 Size config:`, sizeConfig);
            
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
                levelContainer.style.justifyContent = 'stretch'; // ให้ช่องยืดเต็มความกว้าง
                levelContainer.style.alignItems = 'stretch'; // ให้ช่องยืดเต็มความสูง
                
                // สร้าง cells สำหรับ level นี้
                for (let block = 1; block <= blocksInThisLevel; block++) {
                    const cell = document.createElement('div');
                    cell.id = `cell-${level}-${block}`;
                    cell.className = 'shelf-cell';
                    
                    // ให้ทุก cell มีขนาดเท่ากัน โดยใช้ flex-grow
                    cell.style.flex = '1 1 0'; // flex-grow: 1, flex-shrink: 1, flex-basis: 0
                    cell.style.height = '100%';
                    cell.style.minWidth = '0'; // ให้ cell สามารถเล็กได้ตามต้องการ
                    cell.style.maxWidth = 'none'; // ไม่จำกัดขนาดสูงสุด
                    cell.style.cursor = 'pointer';
                    
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
            
            console.log(`📐 Created balanced shelf grid: ${TOTAL_LEVELS} levels with dynamic cell height ${cellHeight}px`);
            console.log(`📏 Cell configuration: Height ${cellHeight}px, Gap ${gapSize}px, Flex: 1 1 0`);
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
            const maxCellHeight = 44; // ความสูงสูงสุดของ cell (50px - padding 6px)
            const maxCapacity = 24; // ความจุสูงสุด
            
            // Render lots in CORRECT order (first to last) เพื่อให้แสดงผลถูกต้อง
            // index 0 = bottom (วางก่อน), last index = top (วางทีหลัง)
            for (let idx = 0; idx < safeLots.length; idx++) {
                const lot = safeLots[idx];
                const lotDiv = document.createElement('div');
                let isTarget = false;
                if (activeJob && String(activeJob.level) === String(level) && String(activeJob.block) === String(block)) {
                    isTarget = (String(lot.lot_no) === String(activeJob.lot_no));
                }
                lotDiv.className = 'stacked-lot' + (isTarget ? ' target-lot' : '');
                
                // คำนวณความสูงตาม tray_count ให้สมดุลกับขนาด cell
                const trayCount = parseInt(lot.tray_count) || 1;
                
                // วิธีคำนวณแบบใหม่: ให้ขนาดชัดเจนขึ้น
                let calculatedHeight;
                if (trayCount <= 4) {
                    calculatedHeight = 4; // น้อย = 4px
                } else if (trayCount <= 8) {
                    calculatedHeight = 8; // ปานกลาง = 8px
                } else if (trayCount <= 16) {
                    calculatedHeight = 16; // เยอะ = 16px
                } else {
                    calculatedHeight = Math.min(24, maxCellHeight - 4); // เยอะมาก = 24px หรือเต็ม cell
                }
                
                lotDiv.style.height = calculatedHeight + 'px';
                
                // เก็บข้อมูลใน title สำหรับ tooltip
                lotDiv.title = `Lot: ${lot.lot_no}, Tray: ${lot.tray_count}`;
                
                // ไม่ใส่ข้อความ (แสดงเป็นกล่องสีเท่านั้น)
                
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
        renderCellPreview({
            level: activeJob.level,
            block: activeJob.block,
            lots: lotsInCell,
            targetLotNo: activeJob.lot_no,
            isPlaceJob: isPlaceJob,
            newLotTrayCount: isPlaceJob ? 12 : 0 // ใช้ 12 เป็นค่าเริ่มต้น สำหรับ Place job
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
                
                // ลบ job ที่เลือกออกจาก queue
                const updatedQueue = queue.filter(job => job.jobId !== jobId);
                localStorage.setItem(QUEUE_KEY, JSON.stringify(updatedQueue));
                
                // ตั้งเป็น active job
                setActiveJob(selectedJob);
                renderAll();
                
                console.log(`✅ Job ${selectedJob.lot_no} activated. Remaining queue size: ${updatedQueue.length}`);
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

            console.log('🚀 Completing job:', activeJob.jobId);

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
                        block: activeJob.block
                    }
                };
                websocketConnection.send(JSON.stringify(message));
                console.log('📤 Complete job message sent via WebSocket');
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
            // เคลียร์การตั้งค่าทั้งหมดเพื่อใช้ค่า default ใหม่
            localStorage.removeItem('shelfSize'); // บังคับให้ใช้ default 550×475
            localStorage.removeItem('cellPreviewSize'); // บังคับให้ใช้ default 350×500
            localStorage.removeItem('columnLayout'); // เคลียร์ layout เก่า
            
            await loadShelfConfig();
            loadColumnLayout(); // โหลดการตั้งค่าขนาด columns
            
            // ตั้งค่า default หลักเสมอ ก่อนโหลดค่าที่บันทึกไว้
            console.log('🚀 Applying default sizes: Shelf 550×475px, Cell Preview 350×500px');
            setOptimizedShelfSize(550, 475); // ตั้งค่า default shelf ก่อน
            setCellPreviewSize(500, 500, 350); // ตั้งค่า default cell preview ก่อน
            
            loadSavedSizes(); // โหลดการตั้งค่าที่บันทึกไว้ (ถ้ามี) มาทับ default
            initializeShelfState();
            setupWebSocket();
            renderAll();
            
            // เพิ่มคีย์บอร์ดช็อตคัทสำหรับ layout
            setupLayoutKeyboardShortcuts();
        });
        
        /**
         * ตั้งค่าคีย์บอร์ดช็อตคัทสำหรับเปลี่ยน layout
         */
        function setupLayoutKeyboardShortcuts() {
            document.addEventListener('keydown', (event) => {
                // ใช้ Ctrl + ตัวเลข เพื่อเปลี่ยน layout
                if (event.ctrlKey && !event.altKey && !event.shiftKey) {
                    switch (event.key) {
                        case '1': applyLayoutPreset('default'); event.preventDefault(); break;     // Ctrl+1: 70-30
                        case '2': applyLayoutPreset('equal'); event.preventDefault(); break;       // Ctrl+2: 50-50
                        case '3': applyLayoutPreset('shelf-focus'); event.preventDefault(); break; // Ctrl+3: 80-20
                        case '4': applyLayoutPreset('preview-focus'); event.preventDefault(); break; // Ctrl+4: 60-40
                        case '5': applyLayoutPreset('compact'); event.preventDefault(); break;     // Ctrl+5: แคบ
                        case '6': applyLayoutPreset('wide'); event.preventDefault(); break;        // Ctrl+6: กว้าง
                        case '0': toggleLayoutControls(); event.preventDefault(); break;           // Ctrl+0: แสดง/ซ่อนปุ่มควบคุม
                    }
                }
            });
            
            console.log('⌨️ Layout keyboard shortcuts enabled: Ctrl+1-6 for presets, Ctrl+0 to toggle controls');
        }
        
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
                            showNotification(`Job completed for Lot ${data.payload.lot_no || 'Unknown'}!`, 'success');

                            fetch('/api/led/clear', { method: 'POST' });
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

// ฟังก์ชันเริ่มต้นระบบเมื่อ DOM โหลดเสร็จ
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Initializing RFID Smart Shelf System...');
    
    // โหลดการตั้งค่าต่างๆ
    loadColumnLayout();
    loadSavedSizes();
    
    // รอให้ DOM ปรับตัวแล้วค่อยสร้าง grid
    setTimeout(() => {
        if (typeof loadShelfConfig === 'function') {
            loadShelfConfig();
        }
    }, 200);
    
    console.log('✅ RFID Smart Shelf System initialized');
});

// เพิ่มฟังก์ชันใหม่เข้าใน window object
window.calculateOptimalCellSize = calculateOptimalCellSize;
