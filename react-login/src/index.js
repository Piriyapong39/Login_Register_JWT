import React from 'react';
import ReactDOM from 'react-dom/client';
import Login from "./Login";
import Sticky from "./Sticky"
import Signup from "./Signup"
import Newpassword from "./Newpassword"
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";


const router = createBrowserRouter([
  {
    path: "/",
    element: <Login />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/sticky",
    element: <Sticky />,
  },
  {
    path: "/signup",
    element: <Signup />,
  },
  {
    path: "/newpassword",
    element: <Newpassword />,
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
