import datetime
import hashlib

from PyQt5.QtCore import QRegExp
from PyQt5.QtGui import QRegExpValidator
from PyQt5.QtWidgets import QMessageBox
import uuid
import yaml

Version = "1.0"


def get_md5(data):
    """
    获取md5加密密文
    :param data: 明文
    :return: 加密后的密文
    """
    m = hashlib.md5()
    b = data.encode(encoding='utf-8')
    m.update(b)
    return m.hexdigest()


def read_yaml(path):
    with open(path, encoding='utf-8') as f:
        stm = f.read()
    content = yaml.load(stm, Loader=yaml.FullLoader)
    return content


def get_uuid():
    return str(uuid.uuid1()).replace('-', '')


def warn_box(widget, title, msg):
    QMessageBox.warning(widget, title, msg, QMessageBox.Yes)

def info_box(widget, title, msg):
    QMessageBox.information(widget, title, msg, QMessageBox.Yes)

def accept_box(widget, title, msg):
    if QMessageBox.warning(widget, title, msg, QMessageBox.Yes|QMessageBox.No, QMessageBox.No) == 16384:
        return True
    else:
        return False


def get_current_time():
    dt = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    return dt


def read_qss(qss_file):
    with open(qss_file, 'r', encoding='utf-8') as f:
        return f.read()


def get_return_day(day):
    return (datetime.datetime.now() + datetime.timedelta(days=day)).strftime('%Y-%m-%d %H:%M:%S')


def set_le_reg(widget, le, pattern):
    rx = QRegExp()
    rx.setPattern(pattern)
    qrx = QRegExpValidator(rx, widget)
    le.setValidator(qrx)

