import {SetStateAction, useState} from 'react';
import './App.css';

import { Button } from "@/components/ui/button"


import {GetNamespaces} from "../wailsjs/go/main/App";

function App() {
    const [errorText, setErrorText] = useState('');
    const [namespaces, setNamespaces] = useState<string[]>([])

    function loadNamespaces() {
        GetNamespaces().then(setNamespaces).catch((err: SetStateAction<string>) => setErrorText(err))
    }

    return (
        <div id="App">
            <ul>{namespaces.map(ns => <li key={ns}>{ns}</li>)}</ul>
            <Button className="btn" onClick={loadNamespaces}>Get Namespaces</Button>
            <div id="error">
                {errorText}
            </div>
        </div>
    )
}

export default App
