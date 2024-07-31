from models import Process, Customer, Event, ProcessPrice, Branch, Employee
from fastapi import HTTPException

class DetailController:
    def __init__(self, db, process_id, details, schema):
        self.db = db
        self.process_id = process_id
        self.details = details
        self.schema = schema

        self.process_query = self.db.query(Process).filter(Process.id == process_id).first()

        if self.process_query is None:
            raise HTTPException(status_code=404, detail='İşlem Bulunamadı.')
        # process_query.name == 'GELİN'
        self.method_mapping = {
            'GELİN': 'process_studio_bride',
            'KINA': 'process_studio_exceptionals',
            'DIŞ ÇEKİM': 'process_studio_exceptionals',
            'NİŞAN': 'process_makeup_studio_default',
            'ÖZEL GÜN': 'process_makeup_studio_default',
            'OTEL': 'process_hotel',
            'ŞEHİRDIŞI': 'process_outside',
            'YURTDIŞI': 'process_abroad',
            'JEL TIRNAK': 'process_nailart',
            'KALICI OJE': 'process_nailart',
            'DOLGU': 'process_nailart',
            'MANİKÜR': 'process_nailart',
            'PEDİKÜR': 'process_nailart',
            'SAÇ BAKIM': 'process_hair',
            'GELİN+': '',
        }

    def process_makeup_studio_default(self):
        print('default studio')
        # query data from Process Price tables and make calculations
        process_price_query = self.db.query(ProcessPrice).filter(ProcessPrice.process_id == self.schema.process_id).filter(ProcessPrice.employee_id == self.schema.employee_id).first()
        plus_price = self.db.query(Branch.studio_extra_guest_price).filter(Branch.id == self.schema.branch_id).first()[0]
        
        self.details['remaining_payment'] = (self.details['plus'] * plus_price) + process_price_query.price - self.details['downpayment']

        return self.details
        

    def process_studio_bride(self):
        print('studio bride')
        # print(self.details)
        # check customer history
        customer_query = self.db.query(Customer).filter(Customer.id == self.details['customer_id']).first()

        if customer_query is None:
            raise HTTPException(status_code=404, detail='Müşteri Bulunamadı.')

        # if kina or dis cekim within range in the past
        #print(customer_query.events['past_events'])
        if not customer_query.events['past_events']:
            process_price_query = self.db.query(ProcessPrice).filter(ProcessPrice.process_id == self.schema.process_id).filter(ProcessPrice.employee_id == self.schema.employee_id).first()
        else:
            for event_id in customer_query.events['past_events']:
                event_query = self.db.query(Event).filter(Event.id == event_id).first()
                if event_query is None:
                    raise HTTPException(status_code=400, detail='Bir şeyler ters gitti. Lütfen yetkililerle iletişime geçiniz.(Event)')
                
                process_query = self.db.query(Process).filter(Process.id == event_query.process_id).first()
                if process_query is None:
                    raise HTTPException(status_code=400, detail='Bir şeyler ters gitti. Lütfen yetkililerle iletişime geçiniz.(Process)')
                
                if process_query.name == 'KINA' or process_query.name == 'DIŞ ÇEKİM':
                    #print(process_query.name, process_query.id)
                    process_price_query = self.db.query(ProcessPrice).filter(ProcessPrice.process_id == process_query.id).filter(ProcessPrice.employee_id == self.schema.employee_id).first()
                else:
                    process_price_query = self.db.query(ProcessPrice).filter(ProcessPrice.process_id == self.schema.process_id).filter(ProcessPrice.employee_id == self.schema.employee_id).first()
                
        
        plus_price = self.db.query(Branch.studio_extra_guest_price).filter(Branch.id == self.schema.branch_id).first()
        if plus_price is None:
            raise HTTPException(status_code=404, detail='Fiyat Bulunamadı.')

        self.details['remaining_payment'] = (int(self.details['plus']) * plus_price[0]) + int(process_price_query.price) - int(self.details['downpayment'])

        return self.details

    def process_studio_exceptionals(self):
        print('studio kina - dis cekim')
        
        # check customer history
        customer_query = self.db.query(Customer).filter(Customer.id == self.details['customer_id']).first()

        if customer_query is None:
            raise HTTPException(status_code=404, detail='Müşteri Bulunamadı.')

        # if kina or dis cekim within range in the past
        print(customer_query.events['past_events'])
        if len(customer_query.events['past_events']) == 0:
            bride_price_query = self.db.query(Process).filter(Process.name == 'GELİN').first()
            process_price_query = self.db.query(ProcessPrice).filter(ProcessPrice.process_id == bride_price_query.id).filter(ProcessPrice.employee_id == self.schema.employee_id).first()
        else:
            for event_id in customer_query.events['past_events']:
                event_query = self.db.query(Event).filter(Event.id == event_id).first()
                if event_query is None:
                    raise HTTPException(status_code=400, detail='Bir şeyler ters gitti. Lütfen yetkililerle iletişime geçiniz.(Event)')
                
                process_query = self.db.query(Process).filter(Process.id == event_query.process_id).first()
                if process_query is None:
                    raise HTTPException(status_code=400, detail='Bir şeyler ters gitti. Lütfen yetkililerle iletişime geçiniz.(Process)')
                
                if process_query.name == 'GELİN':
                    process_price_query = self.db.query(ProcessPrice).filter(ProcessPrice.process_id == self.schema.process_id).filter(ProcessPrice.employee_id == self.schema.employee_id).first()
                else:
                    bride_price_query = self.db.query(Process).filter(Process.name == 'GELİN').first()
                    process_price_query = self.db.query(ProcessPrice).filter(ProcessPrice.process_id == bride_price_query.id).filter(ProcessPrice.employee_id == self.schema.employee_id).first()

        
        plus_price = self.db.query(Branch.studio_extra_guest_price).filter(Branch.id == self.schema.branch_id).first()
        if plus_price is None:
            raise HTTPException(status_code=404, detail='Fiyat Bulunamadı.')

        self.details['remaining_payment'] = (int(self.details['plus']) * plus_price[0]) + int(process_price_query.price) - int(self.details['downpayment'])

        return self.details
        

    def process_hotel(self):
        print('hotel')
        # query price from the table
        process_price_query = self.db.query(ProcessPrice).filter(ProcessPrice.process_id == self.schema.process_id).filter(ProcessPrice.employee_id == self.schema.employee_id).first()
        
        # for the extra guests, query price from branch as hotel extra guest
       

        plus_price = self.db.query(Branch.hotel_extra_guest_price).filter(Branch.id == self.schema.branch_id).first()
        if plus_price is None:
            raise HTTPException(status_code=404, detail='Fiyat Bulunamadı.')

        self.details['remaining_payment'] = (int(self.details['plus']) * plus_price[0]) + int(process_price_query.price) - int(self.details['downpayment'])

        return self.details


    def process_outside(self):
        print('sehir disi')
        # query price from the table as outside
        process_price_query = self.db.query(ProcessPrice).filter(ProcessPrice.process_id == self.schema.process_id).filter(ProcessPrice.employee_id == self.schema.employee_id).first()

        # for extra guests calculate the price from branch table, as outside extra guest
        
        plus_price = self.db.query(Branch.outside_extra_guest_price).filter(Branch.id == self.schema.branch_id).first()
        if plus_price is None:
            raise HTTPException(status_code=404, detail='Fiyat Bulunamadı.')

        self.details['remaining_payment'] = (int(self.details['plus']) * plus_price[0]) + int(process_price_query.price) - int(self.details['downpayment'])

        return self.details
        

    def process_abroad(self):
        print('yurt disi')
        # query price from the table as outside
        process_price_query = self.db.query(ProcessPrice).filter(ProcessPrice.process_id == self.schema.process_id).filter(ProcessPrice.employee_id == self.schema.employee_id).first()
        
        # for extra guests calculate the price from branch table, as outside extra guest
        plus_price = 30000

        self.details['remaining_payment'] = (int(self.details['plus']) * plus_price) + int(process_price_query.price) - int(self.details['downpayment'])

        return self.details

    def process_training(self):
        print('Eğitim')
        return self.details

    def process_nailart(self):
        print('Nail Art')
        # query the process price except the nail art
        process_price_query = self.db.query(ProcessPrice).filter(ProcessPrice.process_id == self.schema.process_id).filter(ProcessPrice.employee_id == self.schema.employee_id).first()

        # calculate the nail art price according to number of fingers
        num_nail_arts = self.details['num_nail_arts']
        nail_art_price_query = self.db.query(ProcessPrice.price).join(Process, Process.id == ProcessPrice.process_id).filter(Process.name == "NAIL-ART").filter(ProcessPrice.employee_id == self.schema.employee_id).first()
        print(nail_art_price_query)
        self.details['remaining_payment'] = (num_nail_arts * nail_art_price_query[0]) + process_price_query.price

        return self.details
    
    def process_bridesmaid(self):
        print("GELİN+")
        return self.details
        

    def process_hair(self):
        print('hair processing')
        process_price_query = self.db.query(ProcessPrice).filter(ProcessPrice.process_id == self.schema.process_id).filter(ProcessPrice.employee_id == self.schema.employee_id).first()

        self.details['remaining_payment'] = process_price_query.price
        return self.details

    def execute(self):
        method_name = self.method_mapping.get(self.process_query.name)
        if method_name:
            method = getattr(self, method_name, None)
            if method:
                return method()
            else:
                raise HTTPException(status_code=500, detail='Method not found.')
        else:
            raise HTTPException(status_code=400, detail='Invalid process name.')
