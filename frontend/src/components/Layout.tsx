import { Outlet } from "react-router-dom"
import Login from "../pages/Login"
import Movies from "../pages/Movies"
import Navbar from "./Navbar"
import Footer from "./Footer"
import { useDispatch } from "react-redux"
import { useEffect, useState } from "react"
import { getCurrentUser } from "../store/auth.slice"
import { Toaster } from "react-hot-toast";



function Layout() {

   const dispatch = useDispatch();

  useEffect(()=>{
    // @ts-ignore
    dispatch(getCurrentUser());
  },[]);

  return (
    <>
      <Toaster position="top-right" />
        <Navbar/>
        <Outlet/>
        <Footer/>
    </>
  )
}

export default Layout