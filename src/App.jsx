import { Route, Routes } from 'react-router'
import AlbumCatalog from "./components/AlbumCatalog"



function App() {
  

  return (
    <>
      <Routes>
        <Route path="/" element={<AlbumCatalog />} />
      </Routes>
    </>
  )
}

export default App
