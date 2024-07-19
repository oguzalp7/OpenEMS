import React from 'react'
import ChakraDataTable from '../../components/data-table.component';

import { getSession } from '@/actions';
// import { apiClient } from '@/apiClient';
import { fetchData } from '@/utils';


const Events = async () => {

  // get session information
  const session = await getSession();

  
  let url = '/event/?'
  let showBranchesDropdown = false;
  let showDepartmentsDropdown = false;

  if(session && session.authLevel && session.authLevel === 5){
    // show branches (dropdown)
    showBranchesDropdown = true;
    // show departments (dropdown)
    showDepartmentsDropdown = true;
  }else if(session && session.authLevel && session.authLevel === 4){
    // show departments
    showDepartmentsDropdown = true;
  }else if(session && session.authLevel && session.authLevel === 3){
    // check if user registered to any department and branch
    if(session.branchId && session.branchId > 0){
      // add branch_id to the query
      url = url + `b=${session.branchId}&`
    }
    if(session.departmentId && session.departmentId > 0){
      // add department to the query
      url = url + `b=${session.departmentId}&`
    }
  }

  

  // configure fetch options
  /*
  * Create Contexts (Frontend)
    - 1-> Read Request,2-> Read, 3-> Read & Write, 4-> Read & Write & Update, 5-> Read & Write & Update & Delete
    - User & Auth & Department Context (Role based routing)
        - If a user has admin rights:
            - Allow to see every branch & departments
        - If a user has supervisor rights (Auth level = 4):
            - Allow to see every departments, which the supervisor's branch
        - Else
            - Allow to see emploee's department and branch only.
  
  */

  

  // define object using the fetchData method
  const data = await fetchData(url)


  return (
    <>
      <ChakraDataTable  obj={data} title={'ETKİNLİKLER'} showButtons={false}/>
    </>
    
  )
}

export default Events