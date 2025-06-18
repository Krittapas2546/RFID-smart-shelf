import time

from com.rfid.helper import *
from com.rfid.enumeration import *
from com.rfid.Reader import *
from com.rfid.models import *
from com.rfid.interface import *

class SampleCodeNew(IAsynchronousMessage):

    def OutputTags(self, tag):
        try:
            print("ReaderName:"+tag._ReaderName+",EPC:" + tag._EPC + ",TID:" + tag._TID +  ",SN:" + tag._ReaderSN)
        except Exception as e:
            print("Method OutputTags failed with error message%s" % e)

    def OutputTagsOver(self,connID):
        print('This connection '+connID+' is over for reading tags')

    def main(self):
        log = SampleCodeNew()
        reader = Reader()
        if reader.initReader("TCP:192.168.1.116:9090", log):
            print("Connection created successfully!")
            #  Set the working antenna. If not, antenna 1 will be used by default.
            readerAntPlan = ReaderWorkingAntSet_Model([1])
            print('Setting up the working antenna result:')
            print(reader.paramSet(EReaderEnum.WO_RFIDWorkingAnt, readerAntPlan))
            # Get reader SN
            readerInfo = ReaderInfo_Model()
            readerResult = reader.paramGet(EReaderEnum.RO_ReaderInformation, readerInfo)
            if readerResult == EReaderResult.RT_OK:
                print('Reader SN is: ')
                print(readerInfo.readerSN)
            #   Set Extended Read TID
            # readTID = ReadExtendedArea_Model(EReadBank.TID, 0, 6, "")
            # readExtendedAreaList = []
            # readExtendedAreaList.append(readTID)
            # print('Set Extended Read Result:')
            # print(reader.paramSet(EReaderEnum.WO_RFIDReadExtended, readExtendedAreaList))
            print('Start tag reading result:')
            print(reader.inventory())
            time.sleep(2.0)
            reader.stop()
            reader.closeConnect()
        else:
            print("Failed to create connection!")

if __name__ == '__main__':
    s = SampleCodeNew()
    s.main()

# print(Reader.getDetailError(EReaderResult.RT_OK))