import React from "react";
import ReactDOM from "react-dom/client";

import { createBrowserRouter, RouterProvider } from "react-router-dom";

import App from "./App";
import Error from "./components/Error";
import GraphTraversals from "./components/GraphTraversals";
import Searching from "./components/Searching";
import TreeTraversals from "./components/TreeTraversals";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "searching-algorithms",
    element: <Searching />
  },
  {
    path: "tree-traversals",
    element: <TreeTraversals />
  },
  {
    path: "graph-traversals",
    element: <GraphTraversals />
  },
  {
    path: "*",
    element: <Error />
  }
])

const root = ReactDOM.createRoot(document.getElementById("root"))
root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)
