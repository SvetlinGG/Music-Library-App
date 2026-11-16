import { Route, Routes } from 'react-router'
import AlbumCatalog from "./components/AlbumCatalog"
import Header from "./components/Header"
import Login from "./components/Login"
import Register from "./components/Register"
import MyCollection from "./components/MyCollection"
import MyFavorites from "./components/MyFavorites"
import AlbumDetails from "./components/AlbumDetails"
import NotFound from "./components/NotFound"
import BandHistory from "./components/BandHistory"
import { GuestRoute, PrivateRoute } from './components/RouteGuards'



function App() {
  

  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<AlbumCatalog />} />

        {/* only for guests */}
        <Route element={<GuestRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        {/* only for logged-in users */}
        <Route element={<PrivateRoute />}>
          <Route path="/my-collection" element={<MyCollection />} />
          <Route path="/my-favorites" element={<MyFavori