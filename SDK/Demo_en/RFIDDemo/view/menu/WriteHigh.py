from PyQt5.QtCore import pyqtSignal, QTranslator
from PyQt5.QtWidgets import QMainWindow
from pyqt5_plugins.examplebutton import QtWidgets
from RFIDDemo.ui.menu.writeHigh import Ui_MainWindow

from RFIDDemo.utils import messageUtil
from RFIDDemo.utils.commonUtil import warn_box, info_box
from RFIDDemo.view import Demo
from com.rfid.enumeration.ELanguage import ELanguage
from com.rfid.enumeration.ELockArea import ELockArea
from com.rfid.enumeration.ELockType import ELockType
from com.rfid.enumeration.EReadBank import EReadBank
from com.rfid.models.TagFilter_Model import TagFilter_Model


#   高级写
class WriteHigh(Ui_MainWindow, QMainWindow):
    insert_ask_info_done_signal = pyqtSignal(int)

    def __init__(self, data=None, epc="", tid=""):
        super(WriteHigh, self).__init__()
        self.setupUi(self)
        self.trans = QTranslator()
        self.parentForm = data
        self.epc = epc
        self.tid = tid
        self.init_ui()
        self.cb_writeArea.currentIndexChanged.connect(
            lambda: self.WrittingNotOfOther(self.cb_writeArea.currentIndex()))  # 点击下拉列表，触发对应事件

    def WrittingNotOfOther(self, tag):
        if tag == 0:
            self.lb_writeStart.setText("2")
        else:
            self.lb_writeStart.setText("0")

    def init_ui(self):
        self.setFixedSize(self.width(), self.height())
        self.btn_write.clicked.connect(self.writeTag)
        self.btn_lock.clicked.connect(self.lockTag)
        self.btn_destory.clicked.connect(self.destoryTag)
        self.lb_matchEPC.setText(self.epc)
        self.lb_matchTID.setText(self.tid)
        self.cb_other.setVisible(False)
        if Demo.Demo.demoLanguage == ELanguage.English:
            self.trans.load('RFIDDemo/ui/menu/writeHighEnglish')
            _app = QtWidgets.QApplication.instance()
            _app.installTranslator(self.trans)
            self.retranslateUi(self)

    #   获取匹配信息，返回匹配的过滤对象TagFilter_Model
    def getMatch(self):
        matchFilter = None
        if self.cb_matchArea.currentIndex() == 1:
            matchFilter = TagFilter_Model(EReadBank.EPC, 32, self.lb_matchEPC.text())
        elif self.cb_matchArea.currentIndex() == 2:
            matchFilter = TagFilter_Model(EReadBank.TID, 0, self.lb_matchTID.text())
        return matchFilter

    #   写
    def writeTag(self):
        try:
            password = self.lb_password.text()
            matchFilter = self.getMatch()
            if self.cb_writeArea.currentIndex() == 0:
                #   EPC 这里是2
                setFilter = TagFilter_Model(EReadBank.EPC, self.lb_writeStart.text(), self.lb_writeData.toPlainText())
            elif self.cb_writeArea.currentIndex() == 1:
                setFilter = TagFilter_Model(EReadBank.TID, self.lb_writeStart.text(), self.lb_writeData.toPlainText())
            elif self.cb_writeArea.currentIndex() == 2:
                setFilter = TagFilter_Model(EReadBank.UserData, self.lb_writeStart.text(),
                                            self.lb_writeData.toPlainText())
            elif self.cb_writeArea.currentIndex() == 3:
                setFilter = TagFilter_Model(EReadBank.Reserved, self.lb_writeStart.text(),
                                            self.lb_writeData.toPlainText())
            else:
                return
            result = Demo.Demo.reader.writeTag(setFilter, matchFilter, password)
            info_box(self, messageUtil.getMessage("tips"), Demo.Demo.reader.getDetailError(result))
        except Exception as e:
            print(str(e))

    #   锁
    def lockTag(self):
        try:
            password = self.lb_password.text()
            matchFilter = self.getMatch()
            #   锁的时候，EPC起始字节是16进制的
            if matchFilter.Bank == EReadBank.EPC:
                matchFilter.tagStart = 20
            lockArea = None
            lockType = None
            #   锁区域
            if self.cb_lockArea.currentIndex() == 0:
                lockArea = ELockArea.epc
            elif self.cb_lockArea.currentIndex() == 1:
                lockArea = ELockArea.tid
            elif self.cb_lockArea.currentIndex() == 2:
                lockArea = ELockArea.userdata
            elif self.cb_lockArea.currentIndex() == 3:
                lockArea = ELockArea.AccessPassword
            elif self.cb_lockArea.currentIndex() == 4:
                lockArea = ELockArea.DestroyPassword
            #   锁类型
            if self.cb_lockType.currentIndex() == 0:
                lockType = ELockType.Unlock
            elif self.cb_lockType.currentIndex() == 1:
                lockType = ELockType.Lock
            elif self.cb_lockType.currentIndex() == 2:
                lockType = ELockType.PermanentUnlock
            elif self.cb_lockType.currentIndex() == 3:
                lockType = ELockType.PermanentLock
            result = Demo.Demo.reader.lockTag(lockArea, lockType, matchFilter, password)
            info_box(self, messageUtil.getMessage("tips"), Demo.Demo.reader.getDetailError(result))
        except Exception as e:
            print(str(e))

    #   毁
    def destoryTag(self):
        try:
            password = self.lb_destoryPassword.text()
            matchFilter = self.getMatch()
            #   锁的时候，EPC起始字节是16进制的
            if matchFilter.Bank == EReadBank.EPC:
                matchFilter.tagStart = 20
            result = Demo.Demo.reader.destroyTag(matchFilter, password)
            info_box(self, messageUtil.getMessage("tips"), Demo.Demo.reader.getDetailError(result))
        except Exception as e:
            print(str(e))
