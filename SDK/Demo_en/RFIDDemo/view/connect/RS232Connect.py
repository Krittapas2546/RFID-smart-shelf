from PyQt5.QtCore import pyqtSignal, QTranslator
from PyQt5.QtWidgets import QMainWindow
import serial
import serial.tools.list_ports
from pyqt5_plugins.examplebutton import QtWidgets

from RFIDDemo.ui.connect.rs232Connect import Ui_Form
from RFIDDemo.utils import messageUtil
from RFIDDemo.utils.commonUtil import info_box, warn_box
from RFIDDemo.view import Demo
from com.rfid.enumeration.ELanguage import ELanguage

#   RS232连接界面
class RS232Connect(Ui_Form, QMainWindow):
    insert_ask_info_done_signal = pyqtSignal(int)

    def __init__(self, data=None):
        super(RS232Connect, self).__init__()
        self.setupUi(self)
        self.parentForm = data
        self.trans = QTranslator()
        self.init_ui()
        self.init_getSerial()

    def init_ui(self):
        self.setFixedSize(self.width(), self.height())
        self.btn_ok.clicked.connect(self.connect)
        self.btn_canel.clicked.connect(self.goBack)
        #   英文选择英文翻译文档
        if Demo.Demo.demoLanguage == ELanguage.English:
            self.trans.load('RFIDDemo/ui/connect/rs232ConnectEnglish')
            _app = QtWidgets.QApplication.instance()
            _app.installTranslator(self.trans)
            self.retranslateUi(self)

    #   获取串口信息，添加至下拉框
    def init_getSerial(self):
        port_list = list(serial.tools.list_ports.comports())
        port_list_name = []
        if len(port_list) <= 0:
            print("The Serial port can't find!")
        else:
            for each_port in port_list:
                port_list_name.append(each_port[0])
                self.cb_com.addItem(each_port[0])
    #   连接
    def connect(self):
        try:
            Demo.Demo.reader.closeConnect()
            Demo.Demo.connectParam = ""
            self.parentForm.lb_connName.setText("")

            param = "RS232:"+ self.cb_com.currentText() + ":" + self.cb_baudrate.currentText()
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
