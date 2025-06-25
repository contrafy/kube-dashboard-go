import {useState} from 'react';
import logo from './assets/images/logo-universal.png';
import './App.css';


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
            <img src={logo} id="logo" alt="logo"/>
            <ul>{namespaces.map(ns => <li key={ns}>{ns}</li>)}</ul>
            <div id="input" className="input-box">
                <input id="name" className="input" onChange={updateName} autoComplete="off" name="input" type="text"/>
                <button className="btn" onClick={loadNamespaces}>Get Namespaces</button>
            </div>
        </div>
    )
}

export default App
