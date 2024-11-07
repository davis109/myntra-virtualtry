import React, { useState } from "react";
import { Route,Routes, BrowserRouter } from 'react-router-dom';
import './App.css';
import { FileUploader } from "react-drag-drop-files";
import Upload from "./pages/Upload";
import Main from "./pages/Main";
import Visualise from "./pages/Visualise";
import { ImageProvider } from "./context/ImageContext";
import Main2 from "./pages/Main2";
import Details from "./components/Details/Details";

const fileTypes = ["JPG", "PNG"];

function App() {

   return (
    <ImageProvider>
    <BrowserRouter>
    <Routes>
      <Route path="/visualise" element={<Visualise/>}/>
      <Route path="/catalog" element={<Main2/>}/>
      {/* <Route path="/" element={<Main2/>}/> */}
      <Route extact path="/catalog/single/:id" element={<Details/>} />

      <Route path="/" element={<Upload/>}/>
      
    </Routes>
 </BrowserRouter>
    </ImageProvider>
     
  );
}

export default App;
