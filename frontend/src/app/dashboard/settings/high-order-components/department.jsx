import React from 'react'
import BaseHOC from './base'
import DepartmentForm from '@/components/forms/department-form.component'

const Department = () => {
    const tableTitle = 'DEPARTMANLAR'
    const slug = '/departments'
    const fetchUrl = '/departments/?skip=0&limit=30'
  return (
    <BaseHOC  slug={slug} tableTitle={tableTitle} fetchUrl={fetchUrl}/>
  )
}

export default Department