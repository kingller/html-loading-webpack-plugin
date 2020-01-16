import '../../css/index.css';

import React from 'react';
import ReactDOM from 'react-dom';

const App = (
    <div>
        Example
    </div>
);
// In order to demonstrate the skeleton screen, the display is delayed here, you should not do this.
setTimeout(function () {
    ReactDOM.render(App, document.getElementById('app'));
}, 3000);
