from PyQt5.QtCore import pyqtSignal, QTranslator
from PyQt5.QtWidgets import QMainWindow
from pyqt5_plugins.examplebutton import QtWidgets

from RFIDDemo.ui.connect.usbConnect import Ui_Form
from RFIDDemo.utils import messageUtil
from RFIDDemo.utils.commonUtil import info_box, warn_box
from RFIDDemo.view import Demo
from com.rfid import Reader
from com.rfid.enumeration.ELanguage import ELanguage

#   USB连接
class USBConnect(Ui_Form, QMainWindow):
    insert_ask_info_done_signal = pyqtSignal(int)

    def __init__(self, data=None):
        super(USBConnect, self).__init__()
        self.setupUi(self)
        self.parentForm = data
        self.trans = QTranslator()
        self.init_ui()
        self.getUSB()

    def init_ui(self):
        self.setFixedSize(self.width(), self.height())
        self.btn_ok.clicked.connect(self.connect)
        self.btn_canel.clicked.connect(self.goBack)
        if Demo.Demo.demoLanguage == ELanguage.English:
            self.trans.load('RFIDDemo/ui/connect/usbConnectEnglish')
            _app = QtWidgets.QApplication.instance()
            _app.installTranslator(self.trans)
            self.retranslateUi(self)
    #   获取USB设备信息
    def getUSB(self):
        usbList = Reader.getUsbHidDeviceList()
        for item in usbList:
            self.cb_connectParam.addItem(item)
    #   连接
    def connect(self):
        try:
            Demo.Demo.reader.closeConnect()
            Demo.Demo.connectParam = ""
            self.parentForm.lb_connName.setText("")

            param = "USB:"+ self.cb_connectParam.currentText()
            if Demo.Demo.reader.initReader(param, self.parentForm):
                Demo.Demo.connectParam = param
                self.parentForm.lb_connName.setText(param)
                self.parentForm.getReaderInfo()
                Demo.Demo.lightBtn(self.parentForm)
                info_box(self, messageUtil.getMessage("tips"), messageUtil.getMessage("connectSuccess"))
                self.goBack()
            else:
                warn_box(self, messageUtil.getMessage("tips"), messageUtil.getMessage("connectFail"))
        except Exception as e:
            print(str(e))
    def goBack(self):
        self.close()