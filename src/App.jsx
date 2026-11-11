import { Route, Routes } from 'react-router'
import AlbumCatalog from "./components/AlbumCatalog"
import Header from "./components/Header"
import Login from "./components/Login"
import Register from "./components/Register"
import MyCollection from "./components/MyCollection"
import AlbumDetails from "./components/AlbumDetails"



function App() {
  

  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<AlbumCatalog />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/my-collection" element={<MyCollection />} />
        <Route path="/albums/:albumId" element={<AlbumDetails />} />
      </Routes>
    </>
  )
}

export default App
