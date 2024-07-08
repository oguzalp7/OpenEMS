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
        
        self.execution_mapping = {
            'GELİN': 'process_studio_bride',
            
        }

    def process_makeup_studio(self):
        print('default studio')
        pass

    def process_studio_bride(self):
        print('studio bride')
        pass

    def process_studio_kina(self):
        print('studio kina')
        pass

    def process_dis_cekim(self):
        print('studio dis cekim')
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
