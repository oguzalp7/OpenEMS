
from datetime import datetime
import pytz
import time

def convert_date_to_timestamp_and_gmt3(date_str):
    # Parse the input date string into a datetime object
    date = datetime.strptime(date_str, '%Y-%m-%d %H:%M:%S')
    
    # Convert to timestamp in milliseconds
    timestamp_ms = int(date.timestamp() * 1000)
    
    # Define the GMT+3 timezone
    gmt3 = pytz.timezone('Etc/GMT-3')
    
    # Convert the datetime to GMT+3
    date_gmt3 = date.astimezone(gmt3)
    # print(date_gmt3.date())
    # print(type(date_gmt3))
    
    # Format the date in GMT+3
    date_gmt3_str = date_gmt3.strftime('%Y-%m-%d %H:%M:%S %Z%z')
    
    return str(timestamp_ms)[0:-2], date_gmt3_str


def convert_timestamp_to_date_gmt3(timestamp_str):
    timestamp_int = int(timestamp_str)
    dt_utc = datetime.utcfromtimestamp(timestamp_int)
    tz_gmt_plus_3 = pytz.timezone('Etc/GMT-3')
    dt_gmt_plus_3 = dt_utc.astimezone(tz_gmt_plus_3)
    date_gmt_plus_3 = dt_gmt_plus_3.date()
    return date_gmt_plus_3


date_str = '2024-03-19 00:00:00'
print(type(convert_date_to_timestamp_and_gmt3(date_str=date_str)[1]))
print(convert_date_to_timestamp_and_gmt3(date_str=date_str))

t = time.time()
print(time.time())
print(type(convert_timestamp_to_date_gmt3(t)))