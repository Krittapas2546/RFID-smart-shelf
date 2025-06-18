import time

from PyQt5.QtCore import pyqtSignal, QTranslator
from PyQt5.QtWidgets import QMainWindow
from pyqt5_plugins.examplebutton import QtWidgets

from RFIDDemo.ui.menu.menu import Ui_MainWindow
from RFIDDemo.utils import messageUtil
from RFIDDemo.utils.commonUtil import info_box, warn_box, accept_box
from RFIDDemo.view import Demo
from com.rfid.enumeration.EASTSwitchMode import EASTSwitchMode
from com.rfid.enumeration.EAntennaNo import EAntennaNo
from com.rfid.enumeration.EBasebandRate import EBasebandRate
from com.rfid.enumeration.EBaudrate import EBaudrate
from com.rfid.enumeration.EBuzzerControl import EBuzzerControl
from com.rfid.enumeration.ELBTWorkMode import ELBTWorkMode
from com.rfid.enumeration.ELanguage import ELanguage
from com.rfid.enumeration.ERF_Range import ERF_Range
from com.rfid.enumeration.EReaderEnum import EReaderEnum
from com.rfid.enumeration.EReaderResult import EReaderResult
from com.rfid.enumeration.ESearchType import ESearchType
from com.rfid.enumeration.EWF_Mode import EWF_Mode
from com.rfid.enumeration.EWorkMode import EWorkMode
from com.rfid.models.ASTExtendedParam2_Model import ASTExtendedParam2_Model
from com.rfid.models.ASTExtendedParam_Model import ASTExtendedParam_Model
from com.rfid.models.AntennaStandingWave_Model import AntennaStandingWave_Model
from com.rfid.models.DNQExtendedParam_Model import DNQExtendedParam_Model
from com.rfid.models.EPCExtendedParam_Model import EPCExtendedParam_Model
from com.rfid.models.EpcBaseband_Model import EpcBaseband_Model
from com.rfid.models.LBTExtendedParam_Model import LBTExtendedParam_Model
from com.rfid.models.ReaderAntPower_Model import ReaderAntPower_Model
from com.rfid.models.ReaderAutoSleep_Model import ReaderAutoSleep_Model
from com.rfid.models.ReaderBuzzer_Model import ReaderBuzzer_Model
from com.rfid.models.ReaderLED_Model import ReaderLED_Model
from com.rfid.models.ReaderNetwork_Model import ReaderNetwork_Model
from com.rfid.models.ReaderRF_Model import ReaderRF_Model
from com.rfid.models.ReaderSerial_Model import ReaderSerial_Model
from com.rfid.models.ReaderTagUpdate_Model import ReaderTagUpdate_Model
from com.rfid.models.ReaderTime_Model import ReaderTime_Model
from com.rfid.models.ReaderWorkMode_Model import ReaderWorkMode_Model
from com.rfid.models.TagExtendedParam_Model import TagExtendedParam_Model

#   设置菜单界面
class Menu(Ui_MainWindow, QMainWindow):
    #   天线功率 所有天线复选框
    antCheckBoxList = []
    #   天线功率 所有天线下拉框
    antComboBoxList = []
    #   天线使能 所有天线复选框
    antPowerCheckBoxList = []
    #   天线功率大小存储备份
    antPowerBackUp = []

    def __init__(self, data = None):
        super(Menu, self).__init__()
        self.setupUi(self)
        self.trans = QTranslator()
        self.parentForm = data
        self.init_ui()
    #   UI初始化
    def init_ui(self):
        self.setFixedSize(self.width(), self.height())
        self.dataClear()
        self.btn_antGet.clicked.connect(self.antGet)
        self.btn_antSet.clicked.connect(self.antSet)
        self.btn_detection.clicked.connect(self.antDection)
        self.btn_freRangeGet.clicked.connect(self.freRangeGet)
        self.btn_freRangeSet.clicked.connect(self.freRangeSet)
        self.btn_workModeGet.clicked.connect(self.workModeGet)
        self.btn_workModeSet.clicked.connect(self.workModeSet)
        self.btn_filterGet.clicked.connect(self.filterGet)
        self.btn_filterSet.clicked.connect(self.filterSet)
        self.btn_232Get.clicked.connect(self.rs232Get)
        self.btn_232Set.clicked.connect(self.rs232Set)
        self.btn_ipGet.clicked.connect(self.ipGet)
        self.btn_ipSet.clicked.connect(self.ipSet)
        self.btn_485Get.clicked.connect(self.rs485Get)
        self.btn_485Set.clicked.connect(self.rs485Set)
        self.btn_timeGet.clicked.connect(self.timeGet)
        self.btn_timeSet.clicked.connect(self.timeSet)
        self.btn_ipModeGet.clicked.connect(self.ipModeGet)
        self.btn_ipModeSet.clicked.connect(self.ipModeSet)
        self.btn_buzzerModeGet.clicked.connect(self.buzzerModeGet)
        self.btn_buzzerModeSet.clicked.connect(self.buzzerModeSet)
        self.btn_buzzerSet.clicked.connect(self.buzzerSet)
        self.btn_LEDGet.clicked.connect(self.LEDGet)
        self.btn_LEDSet.clicked.connect(self.LEDSet)
        self.btn_BasebandGet.clicked.connect(self.baseBandGet)
        self.btn_BasebandSet.clicked.connect(self.baseBandSet)
        self.btn_baseBandEGet.clicked.connect(self.baseBandEGet)
        self.btn_baseBandESet.clicked.connect(self.baseBandESet)
        self.btn_selectAll.clicked.connect(self.selectAll)
        self.btn_unSelectAll.clicked.connect(self.unSelectAll)
        self.btn_antPowerGet.clicked.connect(self.antPowerGet)
        self.btn_antPowerSet.clicked.connect(self.antPowerSet)
        self.btn_freeGet.clicked.connect(self.freeGet)
        self.btn_freeSet.clicked.connect(self.freeSet)
        self.btn_ntpGet.clicked.connect(self.ntpGet)
        self.btn_ntpSet.clicked.connect(self.ntpSet)
        self.btn_restoreFactory.clicked.connect(self.restoreFactory)
        self.antCheckBoxAppend()
        self.closeAntEnable()
        #   驻波天线
        self.cbb_detectAnt.clear()
        for i in range(0, int(self.parentForm.readerInfo.antCount)):
            print(str(1 + i))
            self.cbb_detectAnt.addItem(str(1 + i))
            self.antCheckBoxList[i].setEnabled(True)
            self.antPowerCheckBoxList[i].setEnabled(True)
        #   进行所有初始查询，部分加注释的，是因为有的机型没有这个功能，查询会弹框报错。
        self.antGet()
        self.freRangeGet()
        self.workModeGet()
        self.filterGet()
        self.rs232Get()
        self.ipGet()
        self.rs485Get()
        # self.timeGet() 不查询时间，有的机型不支持
        self.ipModeGet()
        # self.buzzerModeGet()
        self.baseBandGet()
        self.baseBandEGet()
        self.antPowerGet()
        # self.freeGet()
        # self.LEDGet()
        # self.ntpGet()
        if Demo.Demo.demoLanguage == ELanguage.English:
            self.trans.load('RFIDDemo/ui/menu/menuEnglish')
            _app = QtWidgets.QApplication.instance()
            _app.installTranslator(self.trans)
            self.retranslateUi(self)

    #   获取天线功率
    def antGet(self):
        try:
            readerAntPowerList = []
            readerResult = Demo.Demo.reader.paramGet(EReaderEnum.RW_RFIDAntPower, readerAntPowerList)
            if readerResult == EReaderResult.RT_OK:
                for readerAntPower in readerAntPowerList:
                    if readerAntPower.enable:
                        antNum = EAntennaNo.getIndex(readerAntPower.antennaNo) -1
                        self.antCheckBoxList[antNum].setChecked(True)
                        self.antComboBoxList[antNum].setCurrentIndex(readerAntPower.power)
                self.antPowerBackUp = readerAntPowerList
            else:
                warn_box(self, messageUtil.getMessage("tips"), Demo.Demo.reader.getDetailError(readerResult))
        except Exception as e:
            print(str(e))

    #   设置天线功率
    def antSet(self):
        try:
            readerAntPowerList = []
            antIndex = 0
            for item in self.antCheckBoxList:
                if item.isEnabled():
                    if item.isChecked():
                        readerAntPower_Model = ReaderAntPower_Model(EAntennaNo.getValue(antIndex + 1),self.antComboBoxList[antIndex].currentIndex(),True)
                        readerAntPowerList.append(readerAntPower_Model )
                    else:
                        # 如果没有选中，就用备份的，上一次的天线功率赋值。
                        readerAntPower_Model = ReaderAntPower_Model(EAntennaNo.getValue(antIndex + 1),self.antPowerBackUp[antIndex].power, True)
                        readerAntPowerList.append(readerAntPower_Model)
                antIndex += 1
            readerResult = Demo.Demo.reader.paramSet(EReaderEnum.RW_RFIDAntPower, readerAntPowerList)
            if readerResult == EReaderResult.RT_OK:
                self.antPowerBackUp = readerAntPowerList
                info_box(self, messageUtil.getMessage("tips"), messageUtil.getMessage("success"))
            else:
                warn_box(self, messageUtil.getMessage("tips"), Demo.Demo.reader.getDetailError(readerResult))
        except Exception as e:
            print(str(e))

    #   驻波探测
    def antDection(self):
        try:
            antNum = self.cbb_detectAnt.currentIndex() + 1
            antEnum = EAntennaNo.getValue(antNum)
            antennaStandingWave = AntennaStandingWave_Model(antEnum)
            readerResult = Demo.Demo.reader.paramGet(EReaderEnum.RO_ReaderAntennaStandingWaveRatio, antennaStandingWave)
            if readerResult == EReaderResult.RT_OK:
                mess =  messageUtil.getMessage("forwardPower") +str(antennaStandingWave.forwardPower)+"\n" + messageUtil.getMessage("backwardPower") + str(antennaStandingWave.backwardPower )\
                        + "\n"+ messageUtil.getMessage("returnLoss") + str(antennaStandingWave.returnLoss ) +"\n" + messageUtil.getMessage("standingWaveRatio")  +str(antennaStandingWave.standingWaveRatio)
                info_box(self, messageUtil.getMessage("tips"),mess)
            else:
                warn_box(self, messageUtil.getMessage("tips"), Demo.Demo.reader.getDetailError(readerResult))
        except Exception as e:
            print(str(e))

    #   频段查询
    def freRangeGet(self):
        try:
            readerAntPowerList = ReaderRF_Model()
            readerResult = Demo.Demo.reader.paramGet(EReaderEnum.RW_RFIDRF, readerAntPowerList)
            if readerResult == EReaderResult.RT_OK:
                self.cbb_freRange.setCurrentIndex(readerAntPowerList.readerWorkFrequency.value)
            else:
                warn_box(self, messageUtil.getMessage("tips"), Demo.Demo.reader.getDetailError(readerResult))
        except Exception as e:
            print(str(e))

    #   频段设置
    def freRangeSet(self):
        try:
            freIndex = self.cbb_freRange.currentIndex()
            readerRF_model = ReaderRF_Model()
            readerRF_model.readerWorkFrequency = ERF_Range(freIndex)
            readerResult = Demo.Demo.reader.paramSet(EReaderEnum.RW_RFIDRF, readerRF_model)
            if readerResult == EReaderResult.RT_OK:
                info_box(self, messageUtil.getMessage("tips"), messageUtil.getMessage("success"))
            else:
                warn_box(self, messageUtil.getMessage("tips"), Demo.Demo.reader.getDetailError(readerResult))
        except Exception as e:
            print(str(e))

    #   工作频段查询
    def workModeGet(self):
        try:
            readerAntPowerList = ReaderRF_Model()
            readerResult = Demo.Demo.reader.paramGet(EReaderEnum.RW_RFIDRF, readerAntPowerList)
            if readerResult == EReaderResult.RT_OK:
                self.cbb_workMode.setCurrentIndex(readerAntPowerList.RFHoppingMode.value)
                mess = ""
                for item in readerAntPowerList.readerWorkPoint:
                    mess += "," + str(item)
                mess = mess[1:]
                self.lb_frePointList.setText(mess)
            else:
                warn_box(self, messageUtil.getMessage("tips"), Demo.Demo.reader.getDetailError(readerResult))
        except Exception as e:
            print(str(e))

    #   工作频段设置
    def workModeSet(self):
        try:
            readerRF_model = ReaderRF_Model()
            readerRF_model.RFHoppingMode = EWF_Mode(self.cbb_workMode.currentIndex())
            rfList = []
            pointList = self.lb_frePointList.text().split(",")
            for item in pointList:
                rfList.append(int(item))
            readerRF_model.readerWorkPoint = rfList
            readerResult = Demo.Demo.reader.paramSet(EReaderEnum.RW_RFIDRF, readerRF_model)
            if readerResult == EReaderResult.RT_OK:
                info_box(self, messageUtil.getMessage("tips"), messageUtil.getMessage("success"))
            else:
                warn_box(self, messageUtil.getMessage("tips"), Demo.Demo.reader.getDetailError(readerResult))
        except Exception as e:
            print(str(e))

    #   过滤查询
    def filterGet(self):
        try:
            readerTagUpdate = ReaderTagUpdate_Model()
            readerResult = Demo.Demo.reader.paramGet(EReaderEnum.RW_RFIDTagUploadParam, readerTagUpdate)
            if readerResult == EReaderResult.RT_OK:
                self.lb_filterTime.setText(str(readerTagUpdate.repeatTimeFilter))
                self.lb_filterRSSI.setText(str(readerTagUpdate.rssiFilter))
            else:
                warn_box(self, messageUtil.getMessage("tips"), Demo.Demo.reader.getDetailError(readerResult))
        except Exception as e:
            print(str(e))

    #   过滤设置
    def filterSet(self):
        try:
            readerTagUpdate = ReaderTagUpdate_Model(self.lb_filterTime.text(),self.lb_filterRSSI.text())
            readerResult = Demo.Demo.reader.paramSet(EReaderEnum.RW_RFIDTagUploadParam, readerTagUpdate)
            if readerResult == EReaderResult.RT_OK:
                info_box(self, messageUtil.getMessage("tips"), messageUtil.getMessage("success"))
            else:
                warn_box(self, messageUtil.getMessage("tips"), Demo.Demo.reader.getDetailError(readerResult))
        except Exception as e:
            print(str(e))

    #   RS232查询
    def rs232Get(self):
        try:
            readerSerial = ReaderSerial_Model()
            readerResult = Demo.Demo.reader.paramGet(EReaderEnum.RW_ReaderSerialPortParam, readerSerial)
            if readerResult == EReaderResult.RT_OK:
                self.cbb_232Baudrate.setCurrentIndex(readerSerial.baudrate.value)
            else:
                warn_box(self, messageUtil.getMessage("tips"), Demo.Demo.reader.getDetailError(readerResult))
        except Exception as e:
            print(str(e))

    #   RS232设置
    def rs232Set(self):
        try:
            readerSerial = ReaderSerial_Model(EBaudrate(self.cbb_232Baudrate.currentIndex()))
            readerResult = Demo.Demo.reader.paramSet(EReaderEnum.RW_ReaderSerialPortParam, readerSerial)
            if readerResult == EReaderResult.RT_OK:
                info_box(self, messageUtil.getMessage("tips"), messageUtil.getMessage("success"))
            else:
                warn_box(self, messageUtil.getMessage("tips"), Demo.Demo.reader.getDetailError(readerResult))
        except Exception as e:
            print(str(e))

    #   IP查询
    def ipGet(self):
        try:
            readerNetWork = ReaderNetwork_Model()
            readerResult = Demo.Demo.reader.paramGet(EReaderEnum.RW_ReaderNetwork, readerNetWork)
            if readerResult == EReaderResult.RT_OK:
                self.lb_mac.setText(str(readerNetWork.Mac))
                self.lb_ip.setText(str(readerNetWork.Ipv4Address))
                self.lb_mask.setText(str(readerNetWork.Ipv4Mask))
                self.lb_gateway.setText(str(readerNetWork.Ipv4GateWay))
                if readerNetWork.Ipv4Dns != None:
                    self.cb_dns.setChecked(True)
                    self.lb_dns.setText(str(readerNetWork.Ipv4Dns))
                else:
                    self.cb_dns.setChecked(False)
                    self.lb_dns.setText("")
                if readerNetWork.DhcpSwitch != None and readerNetWork.DhcpSwitch:
                    self.cb_dhcp.setChecked(True)
                else:
                    self.cb_dhcp.setChecked(False)
            else:
                warn_box(self, messageUtil.getMessage("tips"), Demo.Demo.reader.getDetailError(readerResult))
        except Exception as e:
            print(str(e))

    #   IP设置
    def ipSet(self):
        try:
            readerNetWork = ReaderNetwork_Model(self.lb_ip.text(),self.lb_mask.text(), self.lb_gateway.text(), "")
            if self.cb_dns.isChecked():
                readerNetWork.Ipv4Dns = self.lb_dns.text()
            if self.cb_dhcp.isChecked():
                readerNetWork.DhcpSwitch = True
            readerResult = Demo.Demo.reader.paramSet(EReaderEnum.RW_ReaderNetwork, readerNetWork)
            if readerResult == EReaderResult.RT_OK:
                info_box(self, messageUtil.getMessage("tips"), messageUtil.getMessage("success"))
            else:
                warn_box(self, messageUtil.getMessage("tips"), Demo.Demo.reader.getDetailError(readerResult))
        except Exception as e:
            print(str(e))

    #   RS485查询
    def rs485Get(self):
        try:
            readerSerial = ReaderSerial_Model()
            readerResult = Demo.Demo.reader.paramGet(EReaderEnum.RW_Reader485Param, readerSerial)
            if readerResult == EReaderResult.RT_OK:
                self.lb_485Address.setText(str(readerSerial.address))
                self.cbb_485baudrate.setCurrentIndex(readerSerial.baudrate.value)
            else:
                warn_box(self, messageUtil.getMessage("tips"), Demo.Demo.reader.getDetailError(readerResult))
        except Exception as e:
            print(str(e))

    #   RS485设置
    def rs485Set(self):
        try:
            readerSerial = ReaderSerial_Model(self.lb_485Address.text(), EBaudrate(self.cbb_485baudrate.currentIndex()))
            readerResult = Demo.Demo.reader.paramSet(EReaderEnum.RW_Reader485Param, readerSerial)
            if readerResult == EReaderResult.RT_OK:
                info_box(self, messageUtil.getMessage("tips"), messageUtil.getMessage("success"))
            else:
                warn_box(self, messageUtil.getMessage("tips"), Demo.Demo.reader.getDetailError(readerResult))
        except Exception as e:
            print(str(e))

    #   时间查询
    def timeGet(self):
        try:
            readerTime = ReaderTime_Model()
            readerResult = Demo.Demo.reader.paramGet(EReaderEnum.RW_ReaderTime, readerTime)
            if readerResult == EReaderResult.RT_OK:
                self.lb_time.setText(readerTime.UTC)
            else:
                warn_box(self, messageUtil.getMessage("tips"), Demo.Demo.reader.getDetailError(readerResult))
        except Exception as e:
            print(str(e))

    #   时间设置
    def timeSet(self):
        try:
            readerTime = ReaderTime_Model(self.lb_time.text())
            readerResult = Demo.Demo.reader.paramSet(EReaderEnum.RW_ReaderTime, readerTime)
            if readerResult == EReaderResult.RT_OK:
                info_box(self, messageUtil.getMessage("tips"), messageUtil.getMessage("success"))
            else:
                warn_box(self, messageUtil.getMessage("tips"), Demo.Demo.reader.getDetailError(readerResult))
        except Exception as e:
            print(str(e))

    #   服务端/客户端查询
    def ipModeGet(self):
        try:
            readerWorkMode = ReaderWorkMode_Model()
            readerResult = Demo.Demo.reader.paramGet(EReaderEnum.RW_ReaderWorkMode, readerWorkMode)
            self.rb_server.setChecked(False)
            self.rb_click.setChecked(False)
            if readerResult == EReaderResult.RT_OK:
                if readerWorkMode.workMode == EWorkMode.Server:
                    self.rb_server.setChecked(True)
                    self.lb_serverPort.setText(str(readerWorkMode.port))
                elif readerWorkMode.workMode == EWorkMode.Client:
                    self.rb_click.setChecked(True)
                    self.lb_clickPort.setText(str(readerWorkMode.port))
                    self.lb_clickIP.setText(readerWorkMode.ip)
            else:
                warn_box(self, messageUtil.getMessage("tips"), Demo.Demo.reader.getDetailError(readerResult))
        except Exception as e:
            print(str(e))

    #   服务端/客户端设置
    def ipModeSet(self):
        try:
            readerWorkMode = ReaderWorkMode_Model()
            if self.rb_server.isChecked():
                readerWorkMode = ReaderWorkMode_Model(self.lb_serverPort.text())
            elif self.rb_click.isChecked():
                readerWorkMode = ReaderWorkMode_Model(self.lb_clickIP.text(), self.lb_clickPort.text())
            else:
                return
            readerResult = Demo.Demo.reader.paramSet(EReaderEnum.RW_ReaderWorkMode, readerWorkMode)
            if readerResult == EReaderResult.RT_OK:
                info_box(self, messageUtil.getMessage("tips"), messageUtil.getMessage("success"))
            else:
                warn_box(self, messageUtil.getMessage("tips"), Demo.Demo.reader.getDetailError(readerResult))
        except Exception as e:
            print(str(e))

    #   蜂鸣器开关 查询
    def buzzerModeGet(self):
        try:
            buzzer = ReaderBuzzer_Model()
            readerResult = Demo.Demo.reader.paramGet(EReaderEnum.RW_ReaderBuzzerSwitch, buzzer)
            if readerResult == EReaderResult.RT_OK:
                self.cbb_buzzerMode.setCurrentIndex(buzzer.buzzerControl.value)
            else:
                warn_box(self, messageUtil.getMessage("tips"), Demo.Demo.reader.getDetailError(readerResult))
        except Exception as e:
            print(str(e))

    #   蜂鸣器开关 设置
    def buzzerModeSet(self):
        try:
            buzzer = ReaderBuzzer_Model()
            buzzer.buzzerControl = EBuzzerControl(self.cbb_buzzerMode.currentIndex())
            readerResult = Demo.Demo.reader.paramSet(EReaderEnum.RW_ReaderBuzzerSwitch, buzzer)
            if readerResult == EReaderResult.RT_OK:
                info_box(self, messageUtil.getMessage("tips"), messageUtil.getMessage("success"))
            else:
                warn_box(self, messageUtil.getMessage("tips"), Demo.Demo.reader.getDetailError(readerResult))
        except Exception as e:
            print(str(e))

    #   蜂鸣器控制
    def buzzerSet(self):
        try:
            buzzer = ReaderBuzzer_Model()
            if self.cbb_buzzer.currentIndex() == 1:
                if self.cbb_buzzerSize.currentIndex() == 0:
                    buzzer.buzzerOnlyOne()
                else:
                    buzzer.buzzerAlways()
            else:
                buzzer.buzzerStop()
            readerResult = Demo.Demo.reader.paramSet(EReaderEnum.RW_ReaderBuzzerSwitch, buzzer)
            if readerResult == EReaderResult.RT_OK:
                info_box(self, messageUtil.getMessage("tips"), messageUtil.getMessage("success"))
            else:
                warn_box(self, messageUtil.getMessage("tips"), Demo.Demo.reader.getDetailError(readerResult))
        except Exception as e:
            print(str(e))

    #   LED灯 查询
    def LEDGet(self):
        try:
            readerLED = ReaderLED_Model()
            readerResult = Demo.Demo.reader.paramGet(EReaderEnum.RW_ReaderStateLED, readerLED)
            if readerResult == EReaderResult.RT_OK:
                if readerLED.LEDSwitch:
                    self.cbb_LED.setCurrentIndex(1)
                else:
                    self.cbb_LED.setCurrentIndex(0)
                self.lb_LEDTime.setText(str(readerLED.LEDTime))
            else:
                warn_box(self, messageUtil.getMessage("tips"), Demo.Demo.reader.getDetailError(readerResult))
        except Exception as e:
            print(str(e))

    #   LED灯 设置
    def LEDSet(self):
        try:
            readerLED = ReaderLED_Model()
            if self.cbb_LED.currentIndex() == 1:
                readerLED.LEDSwitch = True
            else:
                readerLED.LEDSwitch = False
            readerLED.LEDTime = self.lb_LEDTime.text()
            readerResult = Demo.Demo.reader.paramSet(EReaderEnum.RW_ReaderStateLED, readerLED)
            if readerResult == EReaderResult.RT_OK:
                info_box(self, messageUtil.getMessage("tips"), messageUtil.getMessage("success"))
            else:
                warn_box(self, messageUtil.getMessage("tips"), Demo.Demo.reader.getDetailError(readerResult))
        except Exception as e:
            print(str(e))

    #   基带查询
    def baseBandGet(self):
        try:
            epcBaseband = EpcBaseband_Model()
            readerResult = Demo.Demo.reader.paramGet(EReaderEnum.RW_RFIDEpcBasebandParam, epcBaseband)
            if readerResult == EReaderResult.RT_OK:
                self.cbb_EPCSpeed.setCurrentIndex(epcBaseband.eBasebandRate.value)
                self.cbb_session.setCurrentIndex(int(epcBaseband.session))
                self.cbb_qv.setCurrentIndex(int(epcBaseband.qValue))
                self.cbb_searchType.setCurrentIndex(int(epcBaseband.searchType.value))
            else:
                warn_box(self, messageUtil.getMessage("tips"), Demo.Demo.reader.getDetailError(readerResult))
        except Exception as e:
            print(str(e))

    #   基带设置
    def baseBandSet(self):
        try:
            epcBaseband = EpcBaseband_Model()
            epcBaseband.eBasebandRate = EBasebandRate(self.cbb_EPCSpeed.currentIndex())
            epcBaseband.session = self.cbb_session.currentIndex()
            epcBaseband.qValue = self.cbb_qv.currentIndex()
            epcBaseband.searchType = ESearchType(self.cbb_searchType.currentIndex())
            readerResult = Demo.Demo.reader.paramSet(EReaderEnum.RW_RFIDEpcBasebandParam, epcBaseband)
            if readerResult == EReaderResult.RT_OK:
                info_box(self, messageUtil.getMessage("tips"), messageUtil.getMessage("success"))
            else:
                warn_box(self, messageUtil.getMessage("tips"), Demo.Demo.reader.getDetailError(readerResult))
        except Exception as e:
            print(str(e))

    #   基带扩展查询
    def baseBandEGet(self):
        try:
            extendParam = EPCExtendedParam_Model()
            readerResult = Demo.Demo.reader.paramGet(EReaderEnum.RW_RFIDEpcBaseExpandBandParam, extendParam)
            if readerResult == EReaderResult.RT_OK:
                TagExtendedParam = extendParam.TagExtendedParam
                # DNQ扩展参数
                DNQExtendedParam = extendParam.DNQExtendedParam
                # AST扩展参数
                ASTExtendedParam = extendParam.ASTExtendedParam
                # AST2扩展参数
                ASTExtendedParam2 = extendParam.ASTExtendedParam2
                # LBT扩展参数
                LBTExtendedParam = extendParam.LBTExtendedParam

                self.cbb_maxQ.setCurrentIndex(int(DNQExtendedParam.maxQ))
                self.cbb_minQ.setCurrentIndex(int(DNQExtendedParam.minQ))
                self.cbb_tmult.setCurrentIndex(int(DNQExtendedParam.tmult))
                if DNQExtendedParam.autoQ:
                    self.cb_autoQ.setChecked(True)
                else:
                    self.cb_autoQ.setChecked(False)
                self.cbb_antSwitchMode.setCurrentIndex(ASTExtendedParam.antSwitchMode.value)
                self.lb_rsidenceTime.setText(str(ASTExtendedParam.residenceTime))
                self.lb_retries.setText(str(ASTExtendedParam.retry))

                self.lb_waitTime.setText(str(ASTExtendedParam2.waitingTime))
                self.lb_antStep.setText(str(ASTExtendedParam2.antStep))
                self.lb_maxRSSI.setText(str(LBTExtendedParam.maxRSSI))
                self.cb_LBT.setCurrentIndex(LBTExtendedParam.workMode.value)
                self.lb_antThreshold.setText(str(ASTExtendedParam2.antThreshold))

                if TagExtendedParam.NXP_Fast_ID:
                    self.cb_NXPFastID.setChecked(True)
                else:
                    self.cb_NXPFastID.setChecked(False)
                if TagExtendedParam.IMJ_Tag_Focus:
                    self.cb_IMJTagFocus.setChecked(True)
                else:
                    self.cb_IMJTagFocus.setChecked(False)
                if TagExtendedParam.IMJ_Fast_Id:
                    self.cb_IMJFastID.setChecked(True)
                else:
                    self.cb_IMJFastID.setChecked(False)
                if DNQExtendedParam.forceQ:
                    self.cb_ForceLoop.setChecked(True)
                else:
                    self.cb_ForceLoop.setChecked(False)
            else:
                warn_box(self, messageUtil.getMessage("tips"), Demo.Demo.reader.getDetailError(readerResult))
        except Exception as e:
            print(str(e))

    #   基带扩展设置
    def baseBandESet(self):
        try:
            extendParam = EPCExtendedParam_Model()
            # 配置TAG扩展参数
            TagExtendedParam = TagExtendedParam_Model()
            if self.cb_IMJFastID.isChecked():
                TagExtendedParam.IMJ_Fast_Id = True
            else:
                TagExtendedParam.IMJ_Fast_Id = False
            if self.cb_IMJTagFocus.isChecked():
                TagExtendedParam.IMJ_Tag_Focus = True
            else:
                TagExtendedParam.IMJ_Tag_Focus = False
            if self.cb_NXPFastID.isChecked():
                TagExtendedParam.NXP_Fast_ID = True
            else:
                TagExtendedParam.NXP_Fast_ID = False
            extendParam.TagExtendedParam = TagExtendedParam
            # 配置DNQ扩展参数\
            DNQExtendedParam = DNQExtendedParam_Model()
            DNQExtendedParam.maxQ = self.cbb_maxQ.currentIndex()
            DNQExtendedParam.minQ = self.cbb_minQ.currentIndex()
            DNQExtendedParam.tmult = self.cbb_tmult.currentIndex()
            if self.cb_autoQ.isChecked():
                DNQExtendedParam.autoQ = True
            else:
                DNQExtendedParam.autoQ = False
            if self.cb_ForceLoop.isChecked():
                DNQExtendedParam.forceQ = True
            else:
                DNQExtendedParam.forceQ = False
            extendParam.DNQExtendedParam = DNQExtendedParam
            # 配置AST扩展参数
            ASTExtendedParam = ASTExtendedParam_Model()
            ASTExtendedParam.antSwitchMode = EASTSwitchMode(self.cbb_antSwitchMode.currentIndex())
            ASTExtendedParam.retry = self.lb_retries.text()
            ASTExtendedParam.residenceTime = self.lb_rsidenceTime.text()
            extendParam.ASTExtendedParam = ASTExtendedParam
            # 配置AST2扩展参数
            ASTExtendedParam2 = ASTExtendedParam2_Model()
            ASTExtendedParam2.waitingTime = self.lb_waitTime.text()
            ASTExtendedParam2.antStep = self.lb_antStep.text()
            ASTExtendedParam2.antThreshold = self.lb_antThreshold.text()
            extendParam.ASTExtendedParam2 = ASTExtendedParam2
            # 配置LBT扩展参数
            LBTExtendedParam = LBTExtendedParam_Model()
            LBTExtendedParam.workMode = ELBTWorkMode(self.cb_LBT.currentIndex())
            LBTExtendedParam.maxRSSI = self.lb_maxRSSI.text()
            extendParam.LBTExtendedParam = LBTExtendedParam
            readerResult = Demo.Demo.reader.paramSet(EReaderEnum.RW_RFIDEpcBaseExpandBandParam, extendParam)
            if readerResult == EReaderResult.RT_OK:
                info_box(self, messageUtil.getMessage("tips"), messageUtil.getMessage("success"))
            else:
                warn_box(self, messageUtil.getMessage("tips"), Demo.Demo.reader.getDetailError(readerResult))
        except Exception as e:
            print(str(e))

    #   天线使能全选
    def selectAll(self):
        for item in self.antPowerCheckBoxList:
            if item.isEnabled():
                item.setChecked(True)
            else:
                item.setChecked(False)

    #   天线使能全不选
    def unSelectAll(self):
        for item in self.antPowerCheckBoxList:
            item.setChecked(False)

    #   天线使能查询
    def antPowerGet(self):
        try:
            readerAntPowerList = []
            readerResult = Demo.Demo.reader.paramGet(EReaderEnum.RW_RFIDAntPower, readerAntPowerList)
            if readerResult == EReaderResult.RT_OK:
                for readerAntPower in readerAntPowerList:
                    antNum = EAntennaNo.getIndex(readerAntPower.antennaNo) - 1
                    if readerAntPower.enable:
                        self.antPowerCheckBoxList[antNum].setChecked(True)
                    else:
                        self.antPowerCheckBoxList[antNum].setChecked(False)
            else:
                warn_box(self, messageUtil.getMessage("tips"), Demo.Demo.reader.getDetailError(readerResult))
        except Exception as e:
            print(str(e))

    #   天线使能设置
    def antPowerSet(self):
        try:
            readerAntPowerList = []
            antIndex = 0
            for item in self.antPowerCheckBoxList:
                if item.isEnabled():
                    if item.isChecked():
                        readerAntPower_Model = ReaderAntPower_Model(EAntennaNo.getValue(antIndex + 1),None, True)
                        readerAntPowerList.append(readerAntPower_Model)
                    else:
                        readerAntPower_Model = ReaderAntPower_Model(EAntennaNo.getValue(antIndex + 1), None, False)
                        readerAntPowerList.append(readerAntPower_Model)
                antIndex += 1
            readerResult = Demo.Demo.reader.paramSet(EReaderEnum.RW_RFIDAntPower, readerAntPowerList)
            if readerResult == EReaderResult.RT_OK:
                self.antPowerBackUp = readerAntPowerList
                info_box(self, messageUtil.getMessage("tips"), messageUtil.getMessage("success"))
            else:
                warn_box(self, messageUtil.getMessage("tips"), Demo.Demo.reader.getDetailError(readerResult))
        except Exception as e:
            print(str(e))

    #   自动空闲查询
    def freeGet(self):
        try:
            readerAutoSleep = ReaderAutoSleep_Model()
            readerResult = Demo.Demo.reader.paramGet(EReaderEnum.RW_RFIDAutoIdleParam, readerAutoSleep)
            if readerResult == EReaderResult.RT_OK:
                if readerAutoSleep.autoIdleSwitch:
                    self.ccb_freeSwitch.setCurrentIndex(1)
                else:
                    self.ccb_freeSwitch.setCurrentIndex(0)
                self.lb_freeTime.setText(str(readerAutoSleep.time))
            else:
                warn_box(self, messageUtil.getMessage("tips"), Demo.Demo.reader.getDetailError(readerResult))
        except Exception as e:
            print(str(e))

    #   自动空闲设置
    def freeSet(self):
        try:
            readerAutoSleep = ReaderAutoSleep_Model()
            if self.ccb_freeSwitch.currentIndex() == 1:
                readerAutoSleep.autoIdleSwitch = True
            else:
                readerAutoSleep.autoIdleSwitch = False
            readerAutoSleep.time = self.lb_freeTime.text()
            readerResult = Demo.Demo.reader.paramSet(EReaderEnum.RW_RFIDAutoIdleParam, readerAutoSleep)
            if readerResult == EReaderResult.RT_OK:
                info_box(self, messageUtil.getMessage("tips"), messageUtil.getMessage("success"))
            else:
                warn_box(self, messageUtil.getMessage("tips"), Demo.Demo.reader.getDetailError(readerResult))
        except Exception as e:
            print(str(e))

    #   NTP查询
    def ntpGet(self):
        try:
            readerTime = ReaderTime_Model()
            readerResult = Demo.Demo.reader.paramGet(EReaderEnum.RW_ReaderTime, readerTime)
            if readerResult == EReaderResult.RT_OK:
                if readerTime.NTP_Switch:
                    self.cbb_ntpSwitch.setCurrentIndex(1)
                else:
                    self.cbb_ntpSwitch.setCurrentIndex(0)
                self.lb_ntpIP.setText(str(readerTime.IP))
            else:
                warn_box(self, messageUtil.getMessage("tips"), Demo.Demo.reader.getDetailError(readerResult))
        except Exception as e:
            print(str(e))
            
    #   NTP设置
    def ntpSet(self):
        try:
            readerTime = ReaderTime_Model()
            if self.cbb_ntpSwitch.currentIndex() == 1:
                readerTime.NTP_Switch = True
            else:
                readerTime.NTP_Switch = False
            readerTime.IP = self.lb_ntpIP.text()
            readerResult = Demo.Demo.reader.paramSet(EReaderEnum.RW_ReaderTime, readerTime)
            if readerResult == EReaderResult.RT_OK:
                info_box(self, messageUtil.getMessage("tips"), messageUtil.getMessage("success"))
            else:
                warn_box(self, messageUtil.getMessage("tips"), Demo.Demo.reader.getDetailError(readerResult))
        except Exception as e:
            print(str(e))

    #   恢复出厂设置
    def restoreFactory(self):
        try:
            accept = accept_box(self, messageUtil.getMessage("tips"), messageUtil.getMessage("restoreFactory"))
            if not accept:
                return
            readerResult = Demo.Demo.reader.setReaderRestoreFactory()
            if readerResult == EReaderResult.RT_OK:
                info_box(self, messageUtil.getMessage("tips"), messageUtil.getMessage("success"))
            else:
                warn_box(self, messageUtil.getMessage("tips"), Demo.Demo.reader.getDetailError(readerResult))
        except Exception as e:
            print(str(e))

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

        self.antPowerCheckBoxList.append(self.cb_ant1)
        self.antPowerCheckBoxList.append(self.cb_ant2)
        self.antPowerCheckBoxList.append(self.cb_ant3)
        self.antPowerCheckBoxList.append(self.cb_ant4)
        self.antPowerCheckBoxList.append(self.cb_ant5)
        self.antPowerCheckBoxList.append(self.cb_ant6)
        self.antPowerCheckBoxList.append(self.cb_ant7)
        self.antPowerCheckBoxList.append(self.cb_ant8)
        self.antPowerCheckBoxList.append(self.cb_ant9)
        self.antPowerCheckBoxList.append(self.cb_ant10)
        self.antPowerCheckBoxList.append(self.cb_ant11)
        self.antPowerCheckBoxList.append(self.cb_ant12)
        self.antPowerCheckBoxList.append(self.cb_ant13)
        self.antPowerCheckBoxList.append(self.cb_ant14)
        self.antPowerCheckBoxList.append(self.cb_ant15)
        self.antPowerCheckBoxList.append(self.cb_ant16)
        self.antPowerCheckBoxList.append(self.cb_ant17)
        self.antPowerCheckBoxList.append(self.cb_ant18)
        self.antPowerCheckBoxList.append(self.cb_ant19)
        self.antPowerCheckBoxList.append(self.cb_ant20)
        self.antPowerCheckBoxList.append(self.cb_ant21)
        self.antPowerCheckBoxList.append(self.cb_ant22)
        self.antPowerCheckBoxList.append(self.cb_ant23)
        self.antPowerCheckBoxList.append(self.cb_ant24)

        self.antComboBoxList.append(self.cbb_Ant1)
        self.antComboBoxList.append(self.cbb_Ant2)
        self.antComboBoxList.append(self.cbb_Ant3)
        self.antComboBoxList.append(self.cbb_Ant4)
        self.antComboBoxList.append(self.cbb_Ant5)
        self.antComboBoxList.append(self.cbb_Ant6)
        self.antComboBoxList.append(self.cbb_Ant7)
        self.antComboBoxList.append(self.cbb_Ant8)
        self.antComboBoxList.append(self.cbb_Ant9)
        self.antComboBoxList.append(self.cbb_Ant10)
        self.antComboBoxList.append(self.cbb_Ant11)
        self.antComboBoxList.append(self.cbb_Ant12)
        self.antComboBoxList.append(self.cbb_Ant13)
        self.antComboBoxList.append(self.cbb_Ant14)
        self.antComboBoxList.append(self.cbb_Ant15)
        self.antComboBoxList.append(self.cbb_Ant16)
        self.antComboBoxList.append(self.cbb_Ant17)
        self.antComboBoxList.append(self.cbb_Ant18)
        self.antComboBoxList.append(self.cbb_Ant19)
        self.antComboBoxList.append(self.cbb_Ant20)
        self.antComboBoxList.append(self.cbb_Ant21)
        self.antComboBoxList.append(self.cbb_Ant22)
        self.antComboBoxList.append(self.cbb_Ant23)
        self.antComboBoxList.append(self.cbb_Ant24)

    #   取消所有天线使能
    def closeAntEnable(self):
        for item in self.antCheckBoxList:
            item.setEnabled(False)
        for item in self.antPowerCheckBoxList:
            item.setEnabled(False)
    #   数据清空
    def dataClear(self):
        self.antCheckBoxList.clear()
        self.antComboBoxList.clear()
        self.antPowerCheckBoxList.clear()
        self.antPowerBackUp.clear()