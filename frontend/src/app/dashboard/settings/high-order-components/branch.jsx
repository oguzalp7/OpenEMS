import React from 'react'
import BaseHOC from './base'
import BranchForm from '@/components/forms/branch-form.components';
const Branch = () => {
    const limit = 30;
    const tableTitle = 'ŞUBE'
    const slug = '/branch'
    const fetchUrl = '/branch/?skip=0&limit=30'
  return (
    
    <BaseHOC form={<BranchForm/>}  slug={slug} tableTitle={tableTitle} fetchUrl={fetchUrl}/>
  )
}

export default Branch