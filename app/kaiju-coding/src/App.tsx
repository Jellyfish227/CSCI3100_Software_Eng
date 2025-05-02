// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
import './App.css'
import { SignIn } from './pages/auth/sign-in'
import { SignUp } from './pages/auth/sign-up'
import { PasswordReset } from './pages/auth/password-reset'
import CourseOverview from './pages/course-overview'


function App() {

  return (
    <>
      <SignIn />
      <SignUp />
      <PasswordReset />
      <CourseOverview />

    </>
  )
}

export default App
