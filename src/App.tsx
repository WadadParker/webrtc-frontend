import { Route , Routes } from "react-router-dom"
import Sender from "./components/Sender"
import Receiver from "./components/Receiver"

function App() {

  return (
    <div>
      <h1 className="text-3xl text-red-300">Hello World</h1>
      <Routes>
        <Route path="/sender" element={<Sender />} />
        <Route path="/receiver" element={<Receiver />} />
      </Routes>
    </div>
  )
}

export default App
