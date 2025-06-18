import sys
import threading
import time
import configparser

from PyQt5.QtCore import pyqtSignal, QTranslator
from PyQt5.QtWidgets import QMainWindow, QHeaderView, QTableWidgetItem
from pyqt5_plugins.examplebutton import QtWidgets

from RFIDDemo.ui.demo import Ui_Form
from RFIDDemo.utils import commonUtil, messageUtil
from RFIDDemo.utils.commonUtil import warn_box, accept_box, info_box
from RFIDDemo.view.connect import TcpConnect, UsbConnect, RS232Connect, RS485Connect
from RFIDDemo.view.menu import Menu, ReadHigh, WriteHigh
from com.rfid.Reader import Reader
from com.rfid.enumeration.ELanguage import ELanguage
from com.rfid.enumeration.EReadBank import EReadBank
from com.rfid.enumeration.EReaderEnum import EReaderEnum
from com.rfid.enumeration.EReaderResult import EReaderResult
from com.rfid.interface.IAsynchronousMessage import IAsynchronousMessage
from com.rfid.models.ReadExtendedArea_Model import ReadExtendedArea_Model
from com.rfid.models.ReaderInfo_Model import ReaderInfo_Model
from com.rfid.models.ReaderString_Model import ReaderString_Model
from com.rfid.models.ReaderWorkingAntSet_Model import ReaderWorkingAntSet_Model

#   Demo主界面
class Demo(Ui_Form, QMainWindow,IAsynchronousMessage):
    #   读写器对象
    reader = Reader()
    #   读写器信息
    readerInfo = ReaderInfo_Model()
    #   读写器连接字符串
    connectParam = ""
    #   包涵所有天线复选框
    antCheckBoxList = []
    #   读EPC的锁
    sendLock = threading.Lock()
    #   标签总数和读取总数
    tagCount = 0
    readCount = 0
    #   标签集合
    tagList = {}
    #   获取标签在表中显示的行号，避免每次循环遍历获取，提高效率
    renewRowIndex = {}
    #   语言
    demoLanguage = ELanguage.Chinese
    # insert_ask_info_done_signal = pyqtSignal(int)

    def __init__(self, data=None):
        super(Demo, self).__init__()
        self.setupUi(self)
        self.init_ui()
        self.trans = QTranslator()
        self.antCheckBoxAppend()    # 天线组件装载
        self.closeAntEnable()   # 所有天线复选框 关闭使用(连接后查询再添加可用)
        self.startFlush()   # 开线程更新视图
        self.data = data
        try:
            config = configparser.ConfigParser()
            config.read('config.ini')
            language = config['user']['language']
            if language == "Chinese":
                self.setChinese()
            elif language == "English":
                self.setEnglish()
        except Exception as e:
            self.setChinese()
    # 所有标签灰
    def lightBtnNo(self):
        self.btn_readEPC.setStyleSheet("QPushButton{background-image: url(RFIDDemo/resource/100101.png);background-repeat:no-repeat;}")
        self.btn_readTID.setStyleSheet("QPushButton{background-image: url(RFIDDemo/resource/100111.png);background-repeat:no-repeat;}")
        self.btn_readHigh.setStyleSheet("QPushButton{background-image: url(RFIDDemo/resource/100121.png);background-repeat:no-repeat;}")
        self.btn_stop.setStyleSheet("QPushButton{background-image: url(RFIDDemo/resource/100131.png);background-repeat:no-repeat;}")
        self.btn_writeEPC.setStyleSheet("QPushButton{background-image: url(RFIDDemo/resource/100151.png);background-repeat:no-repeat;}")
        self.btn_writeUser.setStyleSheet("QPushButton{background-image: url(RFIDDemo/resource/100161.png);background-repeat:no-repeat;}")
        self.btn_writeHigh.setStyleSheet("QPushButton{background-image: url(RFIDDemo/resource/100141.png);background-repeat:no-repeat;}")
        self.btn_clear.setStyleSheet("QPushButton{background-image: url(RFIDDemo/resource/100181.png);background-repeat:no-repeat;}")
        self.btn_restart.setStyleSheet("QPushButton{background-image: url(RFIDDemo/resource/100201.png);background-repeat:no-repeat;}")
        self.btn_closeConn.setStyleSheet("QPushButton{background-image: url(RFIDDemo/resource/100221.png);background-repeat:no-repeat;}")
        self.btn_readEPC.setEnabled(False)
        self.btn_readTID.setEnabled(False)
        self.btn_readHigh.setEnabled(False)
        self.btn_stop.setEnabled(False)
        self.btn_writeEPC.setEnabled(False)
        self.btn_writeUser.setEnabled(False)
        self.btn_writeHigh.setEnabled(False)
        self.btn_clear.setEnabled(False)
        self.btn_restart.setEnabled(False)
        self.btn_closeConn.setEnabled(False)
    # 所有标签亮
    def lightBtn(self):
        self.btn_readEPC.setStyleSheet("QPushButton{background-image: url(RFIDDemo/resource/10010.png);background-repeat:no-repeat;}")
        self.btn_readTID.setStyleSheet("QPushButton{background-image: url(RFIDDemo/resource/10011.png);background-repeat:no-repeat;}")
        self.btn_readHigh.setStyleSheet("QPushButton{background-image: url(RFIDDemo/resource/10012.png);background-repeat:no-repeat;}")
        self.btn_stop.setStyleSheet("QPushButton{background-image: url(RFIDDemo/resource/10013.png);background-repeat:no-repeat;}")
        self.btn_writeEPC.setStyleSheet("QPushButton{background-image: url(RFIDDemo/resource/10015.png);background-repeat:no-repeat;}")
        self.btn_writeUser.setStyleSheet("QPushButton{background-image: url(RFIDDemo/resource/10016.png);background-repeat:no-repeat;}")
        self.btn_writeHigh.setStyleSheet("QPushButton{background-image: url(RFIDDemo/resource/10014.png);background-repeat:no-repeat;}")
        self.btn_clear.setStyleSheet("QPushButton{background-image: url(RFIDDemo/resource/10018.png);background-repeat:no-repeat;}")
        self.btn_restart.setStyleSheet("QPushButton{background-image: url(RFIDDemo/resource/10020.png);background-repeat:no-repeat;}")
        self.btn_closeConn.setStyleSheet("QPushButton{background-image: url(RFIDDemo/resource/10022.png);background-repeat:no-repeat;}")
        self.btn_readEPC.setEnabled(True)
        self.btn_readTID.setEnabled(True)
        self.btn_readHigh.setEnabled(True)
        self.btn_stop.setEnabled(True)
        self.btn_writeEPC.setEnabled(True)
        self.btn_writeUser.setEnabled(True)
        self.btn_writeHigh.setEnabled(True)
        self.btn_clear.setEnabled(True)
        self.btn_restart.setEnabled(True)
        self.btn_closeConn.setEnabled(True)
    # 没读的时候亮的标签
    def lightReadNo(self):
        self.lightBtn()

    # 读的时候亮的标签
    def lightRead(self):
        self.lightBtnNo()
        self.btn_stop.setStyleSheet("QPushButton{background-image: url(RFIDDemo/resource/10013.png);background-repeat:no-repeat;}")
        self.btn_stop.setEnabled(True)
        self.btn_restart.setStyleSheet("QPushButton{background-image: url(RFIDDemo/resource/10020.png);background-repeat:no-repeat;}")
        self.btn_restart.setEnabled(True)
    #   初始化主界面
    def init_ui(self):
        self.setFixedSize(self.width(), self.height())
        self.setWindowTitle('RFID Reader Demo V' + commonUtil.Version)
        self.lightBtnNo()
        self.btn_readEPC.clicked.connect(self.readEPCClick)
        self.btn_readTID.clicked.connect(self.readTIDClick)
        self.btn_readHigh.clicked.connect(self.readHighClick)
        self.btn_stop.clicked.connect(self.readStopClick)
        self.btn_writeEPC.clicked.connect(self.writeEPCClick)
        self.btn_writeUser.clicked.connect(self.writeUserClick)
        self.btn_writeEPC.hide()
        self.btn_writeUser.hide()
        self.btn_writeHigh.clicked.connect(self.writeHighClick)
        self.btn_clear.clicked.connect(self.reStartClick)
        self.btn_restart.clicked.connect(self.clearClick)
        self.btn_closeConn.clicked.connect(self.closeConnClick)
        self.btn_selectAll.clicked.connect(self.selectAllClick)
        self.btn_unSelectAll.clicked.connect(self.unSelectAllClick)
        self.btn_chinese.clicked.connect(self.setChinese)
        self.btn_english.clicked.connect(self.setEnglish)

        self.m_TCP.triggered.connect(lambda: self.tcpConnectClick())
        self.m_USB.triggered.connect(lambda: self.usbConnectClick())
        self.m_RS232.triggered.connect(lambda: self.rs232ConnectClick())
        self.m_RS485.triggered.connect(lambda: self.rs485ConnectClick())

        self.m_Set.triggered.connect(lambda: self.deviceSetView())

        self.m_readerInfo.triggered.connect(lambda: self.readerInfoShow())
        self.m_deviceSN.triggered.connect(lambda: self.getDeviceSN())
        self.m_basebandInfo.triggered.connect(lambda: self.getBasebandInfo())
        self.m_deviceTemperature.triggered.connect(lambda: self.getDeviceTemp())

        self.tableWidget.setEditTriggers(QtWidgets.QAbstractItemView.NoEditTriggers)
        self.tableWidget.horizontalHeader().setSectionResizeMode(QHeaderView.Stretch)

    #   开始刷新线程
    def startFlush(self):
        myrec = threading.Thread(target = self.flushThread)
        myrec.start()

    #   刷新线程
    def flushThread(self):
        while True:
            if Demo.connectParam == "":
                time.sleep(0.5)
                continue
            time.sleep(0.5)
            with Demo.sendLock:
                for key in Demo.tagList:
                    index = self.tableWidget.rowCount() - 1
                    tag = Demo.tagList[key]
                    if key in Demo.renewRowIndex:
                        index = Demo.renewRowIndex[key]
                    else:
                        self.tableWidget.insertRow(self.tableWidget.rowCount())
                        Demo.renewRowIndex[key] = self.tableWidget.rowCount() - 1
                    item = QTableWidgetItem(str(tag._EPC))
                    self.tableWidget.setItem(index, 0, item)
                    item = QTableWidgetItem(str(tag._TID))
                    self.tableWidget.setItem(index, 1, item)
                    item = QTableWidgetItem(str(tag._UserData))
                    self.tableWidget.setItem(index, 2, item)
                    item = QTableWidgetItem(str(tag._RsvdData))
                    self.tableWidget.setItem(index, 3, item)
                    item = QTableWidgetItem(str(tag._TotalCount))
                    self.tableWidget.setItem(index, 4, item)
                    item = QTableWidgetItem(str(tag._ANT1_COUNT))
                    self.tableWidget.setItem(index, 5, item)
                    item = QTableWidgetItem(str(tag._ANT2_COUNT))
                    self.tableWidget.setItem(index, 6, item)
                    item = QTableWidgetItem(str(tag._ANT3_COUNT))
                    self.tableWidget.setItem(index, 7, item)
                    item = QTableWidgetItem(str(tag._ANT4_COUNT))
                    self.tableWidget.setItem(index, 8, item)
                    item = QTableWidgetItem(str(tag.RSSI()))
                    self.tableWidget.setItem(index, 9, item)
                if len(Demo.tagList) != 0:
                    self.tableWidget.viewport().update()
                    self.tableWidget.resizeColumnsToContents()
            self.lb_readCount.setText(str(Demo.readCount))
            self.lb_tagCount.setText(str(Demo.tagCount))

    #   设置中文
    def setChinese(self):
        try:
            config = configparser.ConfigParser()
            config['user'] = {'language': "Chinese"}
            with open('config.ini', 'w') as configfile:
                config.write(configfile)
            self.trans.load('RFIDDemo/ui/zh_CN')
            _app = QtWidgets.QApplication.instance()
            _app.installTranslator(self.trans)
            self.retranslateUi(self)
            Demo.reader.setLanguage(ELanguage.Chinese)
            Demo.demoLanguage = ELanguage.Chinese
            messageUtil.Language = ELanguage.Chinese
            self.lb_connName.setText(Demo.connectParam)
        except Exception as e:
            print(str(e))

    #   设置英文
    def setEnglish(self):
        try:
            config = configparser.ConfigParser()
            config['user'] = {'language': "English"}
            with open('config.ini', 'w') as configfile:
                config.write(configfile)
            self.trans.load('RFIDDemo/ui/demoEnglish')
            _app = QtWidgets.QApplication.instance()
            _app.installTranslator(self.trans)
            self.retranslateUi(self)
            Demo.reader.setLanguage(ELanguage.English)
            Demo.demoLanguage = ELanguage.English
            messageUtil.Language = ELanguage.English
            self.lb_connName.setText(Demo.connectParam)
        except Exception as e:
            print(str(e))

    # region 连接
    def tcpConnectClick(self):
        try:
            self.renew_win = TcpConnect.TCPConnect(self)
            self.renew_win.show()
        except Exception as e:
            print(e)
    def usbConnectClick(self):
        try:
            self.renew_win = UsbConnect.USBConnect(self)
            self.renew_win.show()
        except Exception as e:
            print(e)
    def rs232ConnectClick(self):
        try:
            self.renew_win = RS232Connect.RS232Connect(self)
            self.renew_win.show()
        except Exception as e:
            print(e)
    def rs485ConnectClick(self):
        try:
            self.renew_win = RS485Connect.RS485Connect(self)
            self.renew_win.show()
        except Exception as e:
            print(e)
    #   是否已连接
    def checkConnect(self):
        if Demo.connectParam == "":
            warn_box(self, messageUtil.getMessage("tips"), messageUtil.getMessage("noConnect"))
            return False
        return True
    # endregion

    #   进入设置界面
    def deviceSetView(self):
        if self.checkConnect() == False:
            return
        try:
            self.renew_win = Menu.Menu(self)
            self.renew_win.show()
        except Exception as e:
            print(e)


    #   读EPC
    def readEPCClick(self):
        if self.checkConnect() == False:
            return
        self.clearClick()
        Demo.reader.paramSet(EReaderEnum.WO_RFIDReadTagFilter, [])
        Demo.reader.paramSet(EReaderEnum.WO_RFIDReadExtended, [])
        self.setWorkAnt()
        self.startInventory()

    #   读TID
    def readTIDClick(self):
        if self.checkConnect() == False:
            return
        self.clearClick()
        Demo.reader.paramSet(EReaderEnum.WO_RFIDReadTagFilter, [])

        self.setWorkAnt()
        #   扩展读TID
        readExtendedAreaList = [ReadExtendedArea_Model(EReadBank.TID, 0, 6, "")]
        Demo.reader.paramSet(EReaderEnum.WO_RFIDReadExtended, readExtendedAreaList)
        self.startInventory()

    #   高级读
    def readHighClick(self):
        if self.checkConnect() == False:
            return
        try:
            self.renew_win = ReadHigh.ReadHigh(self)
            self.renew_win.show()
        except Exception as e:
            print(e)

    #   设置工作天线
    def setWorkAnt(self):
        workAnt = []
        i = 1
        for item in self.antCheckBoxList:
            if item.isEnabled() and item.isChecked():
                workAnt.append(i)
            i += 1
        readerAntPlan = ReaderWorkingAntSet_Model(workAnt)
        Demo.reader.paramSet(EReaderEnum.WO_RFIDWorkingAnt, readerAntPlan)

    #   盘点
    def startInventory(self):
        result = Demo.reader.inventory()
        if result != EReaderResult.RT_OK:
            warn_box(self, messageUtil.getMessage("tips"),Demo.reader.getDetailError(result))
        else:
            self.lightRead()


    #   停止读
    def readStopClick(self):
        if self.checkConnect() == False:
            return
        Demo.reader.stop()
        self.lightReadNo()

    #   写epc
    def writeEPCClick(self):
        if self.checkConnect() == False:
            return
        warn_box(self, messageUtil.getMessage("tips"), '点击了读writeEPC！')

    #   写user
    def writeUserClick(self):
        if self.checkConnect() == False:
            return
        warn_box(self, messageUtil.getMessage("tips"), '点击了读writeUser！')

    #   高级写
    def writeHighClick(self):
        if self.checkConnect() == False:
            return
        try:
            row_index = self.tableWidget.currentIndex().row()  # 获取当前行Index
            epc = ""
            tid = ""
            if row_index != -1:
                epc = self.tableWidget.item(row_index, 0).text()
                tid = self.tableWidget.item(row_index, 1).text()
            self.renew_win = WriteHigh.WriteHigh(self,epc,tid)
            self.renew_win.show()
        except Exception as e:
            print(e)

    #   清空列表
    def clearClick(self):
        if self.checkConnect() == False:
            return
        with Demo.sendLock:
            Demo.renewRowIndex.clear()
            Demo.tagList.clear()
            Demo.tagCount = 0
            Demo.readCount = 0
            self.tableWidget.setRowCount(0)
            self.tableWidget.clearContents()

    #   重启设备
    def reStartClick(self):
        if self.checkConnect() == False:
            return
        with Demo.sendLock:
            Demo.reader.restartReader()

    #   断开设备
    def closeConnClick(self):
        if self.checkConnect() == False:
            return
        with Demo.sendLock:
            self.lightBtnNo()
            Demo.reader.closeConnect()
            Demo.connectParam = ""
            self.lb_connName.setText("")

    #   获取读写器信息
    def getReaderInfo(self):
        if self.checkConnect() == False:
            return
        self.readerInfo = ReaderInfo_Model()
        Demo.reader.paramGet(EReaderEnum.RO_ReaderInformation, self.readerInfo)
        #   先取消所有天线可选
        self.closeAntEnable()
        for i in range(0,self.readerInfo.antCount):
            self.antCheckBoxList[i].setEnabled(True)

    # 界面点击获取读写器信息
    def readerInfoShow(self):
        try:
            showParam = messageUtil.getMessage("deviceName") + self.readerInfo.name
            showParam += "\n"+ messageUtil.getMessage("softVersion") + self.readerInfo.softVersion
            showParam += "\n"+ messageUtil.getMessage("openTime") + str(self.readerInfo.powerTime) + " s"
            info_box(self, messageUtil.getMessage("tips"), showParam)
        except Exception as e:
            print(e)

    #   获取基带信息
    def getBasebandInfo(self):
        try:
            showParam = messageUtil.getMessage("basebandVersion")  + self.readerInfo.basebandVersion
            info_box(self, messageUtil.getMessage("tips"), showParam)
        except Exception as e:
            print(e)

    #   获取设备SN
    def getDeviceSN(self):
        try:
            showParam = messageUtil.getMessage("deviceSN") + self.readerInfo.readerSN
            info_box(self, messageUtil.getMessage("tips"), showParam)
        except Exception as e:
            print(e)

    #   获取读写器温度
    def getDeviceTemp(self):
        try:
            readerStr = ReaderString_Model()
            Demo.reader.paramGet(EReaderEnum.RO_ReaderTemperature, readerStr)
            info_box(self, messageUtil.getMessage("tips"), messageUtil.getMessage("deivceTemperature") + readerStr.data)
        except Exception as e:
            print(e)

    # region 接口
    def OutputTags(self, tag):
        try:
            if tag == None or tag._Result != 0x00:
                return
            with Demo.sendLock:
                Demo.readCount += 1
                key = tag._EPC + "|" + tag._TID
                if key not in Demo.tagList.keys():
                    Demo.tagCount += 1
                    Demo.tagList[key] = tag
                else:
                    oldTag = Demo.tagList[key]
                    oldTag._TotalCount += tag._TotalCount
                    oldTag._ANT1_COUNT += tag._ANT1_COUNT
                    oldTag._ANT2_COUNT += tag._ANT2_COUNT
                    oldTag._ANT3_COUNT += tag._ANT3_COUNT
                    oldTag._ANT4_COUNT += tag._ANT4_COUNT
                    oldTag._ANT5_COUNT += tag._ANT5_COUNT
                    oldTag._ANT6_COUNT += tag._ANT6_COUNT
                    oldTag._ANT7_COUNT += tag._ANT7_COUNT
                    oldTag._ANT8_COUNT += tag._ANT8_COUNT
                    oldTag._ANT9_COUNT += tag._ANT9_COUNT
                    oldTag._ANT10_COUNT += tag._ANT10_COUNT
                    oldTag._ANT11_COUNT += tag._ANT11_COUNT
                    oldTag._ANT12_COUNT += tag._ANT12_COUNT
                    oldTag._ANT13_COUNT += tag._ANT13_COUNT
                    oldTag._ANT14_COUNT += tag._ANT14_COUNT
                    oldTag._ANT15_COUNT += tag._ANT15_COUNT
                    oldTag._ANT16_COUNT += tag._ANT16_COUNT
                    oldTag._ANT17_COUNT += tag._ANT17_COUNT
                    oldTag._ANT18_COUNT += tag._ANT18_COUNT
                    oldTag._ANT19_COUNT += tag._ANT19_COUNT
                    oldTag._ANT20_COUNT += tag._ANT20_COUNT
                    oldTag._ANT21_COUNT += tag._ANT21_COUNT
                    oldTag._ANT22_COUNT += tag._ANT22_COUNT
                    oldTag._ANT23_COUNT += tag._ANT23_COUNT
                    oldTag._ANT24_COUNT += tag._ANT24_COUNT
            print("EPC:" + tag._EPC + ",TID:" + tag._TID + ",_EpcData:" + tag._EpcData + ",_UserData:" + tag._UserData + ",_RsvdData:" + tag._RsvdData)
        except Exception as e:
            print("方法OutputTags失败，错误信息%s" % e)

    def PortClosing(self,connID):
        print("断开连接："+connID)
        self.closeConnClick()
        while(True):
            time.sleep(2)
            if Demo.reader.initReader("TCP:"+connID, self):
                Demo.connectParam = connID
                self.lb_connName.setText(connID)
                print("重新连接：" + connID)
                self.lightBtn()
                return

    # endregion

    #   天线全选
    def selectAllClick(self):
        for item in self.antCheckBoxList:
            if item.isEnabled():
                item.setChecked(True)
            else:
                item.setChecked(False)

    #    天线全不选
    def unSelectAllClick(self):
        for item in self.antCheckBoxList:
            item.setChecked(False)

    #   天线装进容器中
    def antCheckBoxAppend(self):
        self.antCheckBoxList.append(self.cb_Ant1)
        self.antCheckBoxList.append(self.cb_Ant2)
        self.antCheckBoxList.append(self.cb_Ant3)
        self.antCheckBoxList.append(self.cb_Ant4)
        self.antCheckBoxList.append(self.cb_Ant5)
        self.antCheckBoxList.append(self.cb_Ant6)
        self.antCheckBoxList.append(self.cb_Ant7)
        self.antCheckBoxList.append(self.cb_Ant8)
        self.antCheckBoxList.append(self.cb_Ant9)
        self.antCheckBoxList.append(self.cb_Ant10)
        self.antCheckBoxList.append(self.cb_Ant11)
        self.antCheckBoxList.append(self.cb_Ant12)
        self.antCheckBoxList.append(self.cb_Ant13)
        self.antCheckBoxList.append(self.cb_Ant14)
        self.antCheckBoxList.append(self.cb_Ant15)
        self.antCheckBoxList.append(self.cb_Ant16)
        self.antCheckBoxList.append(self.cb_Ant17)
        self.antCheckBoxList.append(self.cb_Ant18)
        self.antCheckBoxList.append(self.cb_Ant19)
        self.antCheckBoxList.append(self.cb_Ant20)
        self.antCheckBoxList.append(self.cb_Ant21)
        self.antCheckBoxList.append(self.cb_Ant22)
        self.antCheckBoxList.append(self.cb_Ant23)
        self.antCheckBoxList.append(self.cb_Ant24)

    #   取消所有天线可选
    def closeAntEnable(self):
        self.cb_Ant1.setEnabled(False)
        self.cb_Ant2.setEnabled(False)
        self.cb_Ant3.setEnabled(False)
        self.cb_Ant4.setEnabled(False)
        self.cb_Ant5.setEnabled(False)
        self.cb_Ant6.setEnabled(False)
        self.cb_Ant7.setEnabled(False)
        self.cb_Ant8.setEnabled(False)
        self.cb_Ant9.setEnabled(False)
        self.cb_Ant10.setEnabled(False)
        self.cb_Ant11.setEnabled(False)
        self.cb_Ant12.setEnabled(False)
        self.cb_Ant13.setEnabled(False)
        self.cb_Ant14.setEnabled(False)
        self.cb_Ant15.setEnabled(False)
        self.cb_Ant16.setEnabled(False)
        self.cb_Ant17.setEnabled(False)
        self.cb_Ant18.setEnabled(False)
        self.cb_Ant19.setEnabled(False)
        self.cb_Ant20.setEnabled(False)
        self.cb_Ant21.setEnabled(False)
        self.cb_Ant22.setEnabled(False)
        self.cb_Ant23.setEnabled(False)
        self.cb_Ant24.setEnabled(False)








