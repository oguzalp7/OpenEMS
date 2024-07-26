# OpenEMS

## Instructions

### Backend
(Create Virtual Env - Optional)
* `cd backend`
* `pip install -r requirements.txt`
* `uvicorn main:app --reload`

### Frontend
* `cd frontend`
* `yarn`
* `yarn dev`




### TODOs
* ~~Create Next Project~~
* ~~Apply PWA~~
* ~~Implement Login~~
* ~~Navigation Bar (Responsive) (Tasarım)~~
* ~~Add Footer (Tasarım)~~

* Create Contexts (Frontend)
    - 1-> Read Request,2-> Read, 3-> Read & Write, 4-> Read & Write & Update, 5-> Read & Write & Update & Delete
    - User & Auth & Department Context (Role based routing)
        - If a user has admin rights:
            - Allow to see every branch & departments
        - If a user has supervisor rights (Auth level = 4):
            - Allow to see every departments, which the supervisor's branch
        - Else
            - Allow to see emploee's department and branch only.



* ~~Structure Pages (Zorunlu)~~
    - ~~HEADING~~
    - ~~BODY~~
    - ~~FOOTER~~

* Implement forms for:
    - ~~branch (ignore departments)~~
    - ~~departments~~
    - ~~employment_type~~
    - ~~payment_type~~
    - ~~process~~
    - process price per employee (in a single row)
    - process price for initial excel file (query each employee and process according to the employees department, set initial value = 0)
    - implement change password
