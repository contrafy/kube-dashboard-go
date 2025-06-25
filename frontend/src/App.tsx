import {useState} from 'react';
import './App.css';

import { Button } from "@/components/ui/button"


import {Greet, GetNamespaces} from "../wailsjs/go/main/App";

function App() {
    const [resultText, setResultText] = useState("Please enter your name below 👇");
    const [name, setName] = useState('');
    const [namespaces, setNamespaces] = useState<string[]>([])

    const updateName = (e: any) => setName(e.target.value);
    const updateResultText = (result: string) => setResultText(result);

    function greet() {
        Greet(name).then(updateResultText);
    }

    function loadNamespaces() {
        GetNamespaces().then(setNamespaces).catch(err => setResultText(err))
    }

    return (
        <div id="App">
            <ul>{namespaces.map(ns => <li key={ns}>{ns}</li>)}</ul>
            <Button className="btn" onClick={loadNamespaces}>Get Namespaces</Button>
        </div>
    )
}

export default App
