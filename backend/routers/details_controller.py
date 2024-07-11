from models import Process
from fastapi import HTTPException

class DetailController:
    def __init__(self, db, process_id, details):
        self.db = db
        self.process_id = process_id
        self.details = details

        self.process_query = self.db.query(Process).filter(Process.id == process_id).first()

        if self.process_query is None:
            raise HTTPException(status_code=404, detail='İşlem Bulunamadı.')
        
        self.method_mapping = {
            'GELİN': 'process_studio_bride',
            'KINA': 'process_studio_exceptionals',
            'DIŞ ÇEKİM': 'process_studio_exceptionals',
            'NİŞAN': 'process_makeup_studio_default',
            'ÖZEL GÜN': 'process_makeup_studio_default',
            'OTEL': '',
            'ŞEHİRDIŞI': '',
            'YURTDIŞI': '',
            'JEL TIRNAK': '',
            'KALICI OJE': '',
            'DOLGU': '',
            'MANİKÜR': '',
            'PEDİKÜR': '',
            'SAÇ BAKIM': '',
        }

    def process_makeup_studio_default(self):
        print('default studio')
        # query data from Process Price tables and make calculations
        # customer_query = self.db.query()
        pass

    def process_studio_bride(self):
        print('studio bride')
        # check customer history

        # if kina or dis cekim within range in the past

        # then apply discount
        pass

    def process_studio_exceptionals(self):
        print('studio kina - dis cekim')
        # check customer history

        # if bride process is in the history in near past

        # then query the price from the table

        # else query bride price from table
        pass

    def process_hotel(self):
        print('hotel')
        # query price from the table

        # for the extra guests, query price from branch as hotel extra guest
        pass

    def process_outside(self):
        print('sehir disi')
        # query price from the table as outside

        # for extra guests calculate the price from branch table, as outside extra guest
        pass

    def process_training(self):
        print('Eğitim')
        pass

    def process_nailart(self):
        print('Nail Art')
        # query the process price except the nail art

        # calculate the nail art price according to number of fingers

        pass

    def process_hair(self):
        print('hair processing')
        pass

    def execute(self):
        method_name = self.method_mapping.get(self.process_query.name)
        if method_name:
            method = getattr(self, method_name, None)
            if method:
                method()
            else:
                raise HTTPException(status_code=500, detail='Method not found.')
        else:
            raise HTTPException(status_code=400, detail='Invalid process name.')
