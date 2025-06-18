import sys
# sys.path.append("../ui/")
sys.path.append("RFIDReaderAPI/")



from PyQt5.QtWidgets import QApplication, QMainWindow

from RFIDDemo.view.Demo import Demo

if __name__ == '__main__':
    try:
        app = QApplication(sys.argv)
        ui = Demo()
        ui.show()
        sys.exit(app.exec_())
    except Exception as e:
        print(str(e))