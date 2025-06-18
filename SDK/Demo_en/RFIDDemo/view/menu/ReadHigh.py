from PyQt5.QtCore import pyqtSignal, QTranslator
from PyQt5.QtWidgets import QMainWindow
from pyqt5_plugins.examplebutton import QtWidgets

from RFIDDemo.ui.menu.readHigh import Ui_MainWindow
from RFIDDemo.utils import messageUtil
from RFIDDemo.utils.commonUtil import warn_box
from RFIDDemo.view import Demo
from com.rfid.enumeration.ELanguage import ELanguage
from com.rfid.enumeration.EReadBank import EReadBank
from com.rfid.enumeration.EReaderEnum import EReaderEnum
from com.rfid.models.ReadExtendedArea_Model import ReadExtendedArea_Model
from com.rfid.models.TagFilter_Model import TagFilter_Model

#   高级读
class ReadHigh(Ui_MainWindow, QMainWindow):
    insert_ask_info_done_signal = pyqtSignal(int)

    def __init__(self, data=None):
        super(ReadHigh, self).__init__()
        self.setupUi(self)
        self.trans = QTranslator()
        self.init_ui()
        self.parentForm = data

    def init_ui(self):
        self.setFixedSize(self.width(), self.height())
        self.btn_save.clicked.connect(self.save)
        if Demo.Demo.demoLanguage == ELanguage.English:
            self.trans.load('RFIDDemo/ui/menu/readHighEnglish')
            _app = QtWidgets.QApplication.instance()
            _app.installTranslator(self.trans)
            self.retranslateUi(self)

    #   确认
    def save(self):
        try:
            #   匹配条件
            tagFilterList = []
            if self.cb_match.isChecked():
                tagFilter = None
                matchIndex = self.cb_matchArea.currentIndex()
                #   匹配区域
                if matchIndex == 0:
                    tagFilter = TagFilter_Model(EReadBank.EPC, self.lb_matchStart.text(), self.lb_matchData.text())
                elif matchIndex == 1:
                    tagFilter = TagFilter_Model(EReadBank.TID, self.lb_matchStart.text(), self.lb_matchData.text())
                elif matchIndex == 2:
                    tagFilter = TagFilter_Model(EReadBank.UserData, self.lb_matchStart.text(), self.lb_matchData.text())
                tagFilterList.append(tagFilter)
            Demo.Demo.reader.paramSet(EReaderEnum.WO_RFIDReadTagFilter, tagFilterList)

            password = ""
            if self.cb_pass.isChecked():
                password = self.lb_pass.text()
            #   扩展读
            readExtendedAreaList = []
            if self.cb_TID.isChecked():
                tidIndex = self.cb_tidType.currentIndex()
                tidLength = self.lb_tidLength.text()
                readExtendedArea = ReadExtendedArea_Model(EReadBank.TID, tidIndex, int(tidLength), password)
                readExtendedAreaList.append(readExtendedArea)
            if self.cb_User.isChecked():
                userStart = self.lb_userStart.text()
                userLength = self.lb_userLength.text()
                readExtendedArea = ReadExtendedArea_Model(EReadBank.UserData, int(userStart), int(userLength), password)
                readExtendedAreaList.append(readExtendedArea)
            if self.cb_Reserve.isChecked():
                resStart = self.lb_resStart.text()
                resLength = self.lb_resLength.text()
                readExtendedArea = ReadExtendedArea_Model(EReadBank.Reserved, int(resStart), int(resLength), password)
                readExtendedAreaList.append(readExtendedArea)
            Demo.Demo.reader.paramSet(EReaderEnum.WO_RFIDReadExtended, readExtendedAreaList)

            self.parentForm.clearClick()
            self.parentForm.setWorkAnt()
            self.parentForm.startInventory()
            self.close()
        except Exception as e:
            print(e)
            warn_box(self, messageUtil.getMessage("tips"), "Error")