import React from 'react';
import ReactDOM from 'react-dom';

import Application from './core/Application';
import * as Environment from './core/Environment';
import App from './ui/components/App';

const app = new Application();

export function start() {
    ReactDOM.render(
        <App app={app} />,
        document.getElementById('app')
    );
}

export let env = {};

if (!__PROD__) {
    env = Environment;
}