from RFIDDemo.view.resource import Resource_CN, Resource_EN
from com.rfid.enumeration.ELanguage import ELanguage

Language = ELanguage.Chinese

#   获取信息
def getMessage(key):
    if Language == ELanguage.Chinese:
        return Resource_CN.CHINESE_PACK.get(key)
    elif Language == ELanguage.English:
        return Resource_EN.ENGLISH_PACK.get(key)
    else:
        return ""
