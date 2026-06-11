import './App.css'
import { Route, Routes } from "react-router-dom";
import Login from './Auth/Login';
import Signup from './Auth/Signup';
import Home from './home/Home';
import Profile from './profile/Profile';
import UserProfile from './profile/UserProfile';
import EditProfile from './profile/EditProfile';
import CreatePost from './post/CreatePost';
import Search from './search account/Search'
import Reels from './Reels Page/Reels';
import Settings from './home/Settings';
import ResetPass from './Auth/ResetPass';
import Requests from './home/Requests';

function App() {

  return (
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path="/api/login" element={<Login/>}/>
        <Route path="/api/signup" element={<Signup/>}/>
        <Route path="/profile" element={<Profile/>}/>
        <Route path="/profile/:id" element={<UserProfile/>}/>
        <Route path="/profile/edit-profile" element={<EditProfile/>}/>
        <Route path="/post/createpost" element={<CreatePost/>}/>
        <Route path="/search" element={<Search/>}/>
        <Route path="/reels" element={<Reels/>}/>
        <Route path="/settings" element={<Settings />} />
        <Route path="/reset-pass" element={<ResetPass />} />
        <Route path="/requests" element={<Requests />} />
      </Routes>
  );
}

export default App
