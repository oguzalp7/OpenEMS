import React from 'react'
import LogoutForm from '../../../components/forms/logout-form.component'
import ProtectedRoute from "../../../components/ProtectedRoute"

const Logout = async () => {
  return (
    <ProtectedRoute>
      <LogoutForm/>
    </ProtectedRoute>
    
  )
}

export default Logout