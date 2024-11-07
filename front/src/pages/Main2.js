import React from 'react'
import Navbar from '../components/Navbar/Navbar'
import Brandfilter from '../components/filters/Brandfilter'
import Card from '../components/cards/Card'


const Main2 = () => {
  return (
    <>
    <Navbar/>
    <div style={{ display: "flex" , marginTop:'1em'}}>
        <Brandfilter/>
        <Card/>
          </div>
    </>
  )
}

export default Main2
